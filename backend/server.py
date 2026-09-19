from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

IG_TOKEN = os.environ.get("IG_ACCESS_TOKEN")
IG_USER_ID = os.environ.get("IG_USER_ID")
IG_FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
_ig_cache = {"data": None, "fetched_at": None}

@api_router.get("/instagram/posts")
async def instagram_posts():
    if not IG_TOKEN or not IG_USER_ID:
        return {"configured": False, "data": []}
    now = datetime.now(timezone.utc)
    if _ig_cache["data"] is not None and _ig_cache["fetched_at"] and (now - _ig_cache["fetched_at"]).total_seconds() < 600:
        return {"configured": True, "data": _ig_cache["data"], "cached": True}
    try:
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.get(
                f"https://graph.instagram.com/v21.0/{IG_USER_ID}/media",
                params={"fields": IG_FIELDS, "limit": 9, "access_token": IG_TOKEN},
            )
        resp.raise_for_status()
        data = resp.json().get("data", [])
        _ig_cache.update(data=data, fetched_at=now)
        return {"configured": True, "data": data}
    except Exception:
        logger.exception("Instagram fetch failed")
        if _ig_cache["data"]:
            return {"configured": True, "data": _ig_cache["data"], "stale": True}
        return {"configured": True, "data": [], "error": "Instagram feed temporarily unavailable"}

GF_URL = os.environ.get("GOOGLE_FORM_RESPONSE_URL")
GF_ENTRIES = {
    "name": os.environ.get("GOOGLE_FORM_ENTRY_NAME"),
    "phone": os.environ.get("GOOGLE_FORM_ENTRY_PHONE"),
    "address": os.environ.get("GOOGLE_FORM_ENTRY_ADDRESS"),
    "city": os.environ.get("GOOGLE_FORM_ENTRY_CITY"),
    "pin": os.environ.get("GOOGLE_FORM_ENTRY_PIN"),
    "items": os.environ.get("GOOGLE_FORM_ENTRY_ITEMS"),
    "total": os.environ.get("GOOGLE_FORM_ENTRY_TOTAL"),
    "code": os.environ.get("GOOGLE_FORM_ENTRY_CODE"),
}
GF_CONFIGURED = bool(GF_URL) and all(GF_ENTRIES.values())

async def submit_to_google_form(doc):
    try:
        items_summary = "; ".join(f"{i['name']} {i['size']}g x{i['quantity']} @ ₹{i['price']}" for i in doc["items"])
        payload = {
            GF_ENTRIES["name"]: doc["name"],
            GF_ENTRIES["phone"]: doc["phone"],
            GF_ENTRIES["address"]: doc["address"],
            GF_ENTRIES["city"]: doc["city"],
            GF_ENTRIES["pin"]: doc["pin"],
            GF_ENTRIES["items"]: items_summary,
            GF_ENTRIES["total"]: str(doc["subtotal"]),
            GF_ENTRIES["code"]: doc["code"],
        }
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as http:
            resp = await http.post(GF_URL, data=payload)
            resp.raise_for_status()
        await db.orders.update_one({"id": doc["id"]}, {"$set": {"google_form_status": "submitted"}})
    except Exception as exc:
        logger.exception("Google Form submission failed for %s", doc["code"])
        await db.orders.update_one({"id": doc["id"]}, {"$set": {"google_form_status": "failed", "google_form_error": type(exc).__name__}})

class OrderItem(BaseModel):
    name: str
    size: int
    price: int
    quantity: int

class OrderCreate(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    pin: str
    items: List[OrderItem]
    subtotal: int

@api_router.post("/orders")
async def create_order(order: OrderCreate):
    doc = order.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["code"] = "MILLO-" + uuid.uuid4().hex[:6].upper()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    if GF_CONFIGURED:
        doc["google_form_status"] = "pending"
    await db.orders.insert_one(doc)
    if GF_CONFIGURED:
        await submit_to_google_form(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/orders")
async def list_orders():
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()