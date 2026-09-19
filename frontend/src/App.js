import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { ArrowRight, ChevronDown, Leaf, Menu, Minus, Plus, ShoppingBag, X, Zap } from "lucide-react";
import { toast, Toaster } from "sonner";
import "@/App.css";

const ASSETS = {
  crisps: "https://customer-assets-jai6qajn.emergentagent.net/job_millo-crunch/artifacts/qr7krfcy_ChatGPT%20Image%20Sep%2020%2C%202026%2C%2003_19_32%20AM.png",
  crunch: "https://customer-assets-jai6qajn.emergentagent.net/job_millo-crunch/artifacts/f1gajnzo_ChatGPT%20Image%20Sep%2020%2C%202026%2C%2003_22_01%20AM.png",
  logo: "https://customer-assets-jai6qajn.emergentagent.net/job_millo-crunch/artifacts/q9xa9rl2_ChatGPT%20Image%20Sep%2020%2C%202026%2C%2003_16_55%20AM.png",
  pops: "https://customer-assets-jai6qajn.emergentagent.net/job_millo-crunch/artifacts/1n6cq14d_ChatGPT%20Image%20Sep%2020%2C%202026%2C%2003_20_55%20AM.png",
};

const INSTAGRAM_URL = "https://www.instagram.com/millo.snacks";
const EASE = [0.16, 1, 0.3, 1];

const PRODUCTS = [
  { id: "crunch", name: "MILLO CRUNCH", flavor: "Peri Peri", desc: "A bold, baked crunch with a little extra kick.", color: "coral", image: ASSETS.crunch },
  { id: "pops", name: "MILLO POPS", flavor: "Masala", desc: "Light, air-popped bites with big Indian flavour.", color: "yellow", image: ASSETS.pops },
  { id: "crisps", name: "MILLO CRISPS", flavor: "Herbs & Salt", desc: "Thin, crisp, and full of herby goodness.", color: "green", image: ASSETS.crisps },
];

const HERO_SLIDES = [
  { src: ASSETS.crunch, alt: "MILLO Crunch Peri Peri package", label: "THE BOLD ONE →" },
  { src: ASSETS.pops, alt: "MILLO Pops Masala package", label: "THE CHATPATA ONE →" },
  { src: ASSETS.crisps, alt: "MILLO Crisps Herbs & Salt package", label: "THE FRESH ONE →" },
];

function Reveal({ children, className = "", delay = 0 }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.85, delay, ease: EASE }}>{children}</motion.div>;
}

function InstagramIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" /></svg>;
}

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const packY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf;
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const addToCart = (product, size = 30) => {
    const price = size === 30 ? 29 : 59;
    const key = `${product.id}-${size}`;
    setCart((items) => {
      const existing = items.find((item) => item.key === key);
      return existing ? items.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, key, size, price, quantity: 1 }];
    });
    toast.success(`${product.name} added to your crunch`, { description: `${size} g pack · ₹${price}` });
  };

  const updateQuantity = (key, delta) => setCart((items) => items.flatMap((item) => item.key === key ? [{ ...item, quantity: item.quantity + delta }].filter((x) => x.quantity > 0) : [item]));
  const showShop = () => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });

  return <div className="site-shell">
    <Toaster position="bottom-right" richColors />
    <div className="top-strip"><span>GOOD GRAINS. BIG CRAVINGS.</span><span className="strip-dot">●</span><span>3 × 30 g COMBO AT ₹79</span><ArrowRight size={14} /></div>
    <header className="nav" data-testid="site-navigation">
      <a href="#top" className="brand-mark" data-testid="brand-home"><img src={ASSETS.logo} alt="MILLO — A new way to snack" style={{ width: 116, marginLeft: 0 }} /></a>
      <nav className="nav-links"><a href="#shop" data-testid="nav-shop-link">Shop</a><a href="#combos" data-testid="nav-combos-link">Combos</a><a href="#story" data-testid="nav-story-link">Our story</a></nav>
      <div className="nav-actions"><button className="nav-shop" onClick={showShop} data-testid="nav-shop-button">Shop now <ArrowRight size={16} /></button><button className="cart-trigger" onClick={() => setCartOpen(true)} data-testid="cart-open-button"><ShoppingBag size={20} /><span>Cart</span><b data-testid="cart-count">{count}</b></button><button className="menu-button" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)} data-testid="mobile-menu-button"><Menu /></button></div>
    </header>
    <AnimatePresence>{mobileMenu && <motion.div className="mobile-menu" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease: EASE }} style={{ position: "fixed", top: 97, left: 0, right: 0, zIndex: 19, display: "flex", background: "var(--ink)", padding: "18px 6vw", gap: 10, boxShadow: "0 12px 25px rgba(0,0,0,.15)" }} data-testid="mobile-menu"><a style={{ color: "var(--cream)", display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1, padding: "13px 10px", border: "1px solid #3d514c", font: "10px 'DM Mono'", textTransform: "uppercase" }} href="#shop" onClick={() => setMobileMenu(false)} data-testid="mobile-shop-link">Shop <ArrowRight size={15} /></a><a style={{ color: "var(--cream)", display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1, padding: "13px 10px", border: "1px solid #3d514c", font: "10px 'DM Mono'", textTransform: "uppercase" }} href="#combos" onClick={() => setMobileMenu(false)} data-testid="mobile-combos-link">Combos <ArrowRight size={15} /></a><a style={{ color: "var(--cream)", display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1, padding: "13px 10px", border: "1px solid #3d514c", font: "10px 'DM Mono'", textTransform: "uppercase" }} href="#story" onClick={() => setMobileMenu(false)} data-testid="mobile-story-link">Our story <ArrowRight size={15} /></a></motion.div>}</AnimatePresence>

    <main id="top">
      <section className="hero section-pad" ref={heroRef}>
        <motion.div className="hero-copy" style={{ y: copyY }}>
          <motion.div className="eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: EASE }}><span className="eyebrow-dot" /> THE EVERYDAY CRUNCH</motion.div>
          <h1>
            <span className="mask-line"><motion.span initial={{ y: "115%" }} animate={{ y: "0%" }} transition={{ duration: 0.95, delay: 0.2, ease: EASE }}>CRUNCH</motion.span></span>
            <span className="mask-line"><motion.span initial={{ y: "115%" }} animate={{ y: "0%" }} transition={{ duration: 0.95, delay: 0.32, ease: EASE }}><em>DIFFERENT.</em></motion.span></span>
            <span className="mask-line"><motion.span initial={{ y: "115%" }} animate={{ y: "0%" }} transition={{ duration: 0.95, delay: 0.44, ease: EASE }}>SNACK BETTER.</motion.span></span>
          </h1>
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.66, ease: EASE }}>Meet MILLO — your new everyday snack made for bold cravings, good vibes, and a whole lot of crunch.</motion.p>
          <motion.div className="hero-ctas" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8, ease: EASE }}><motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.94 }} className="button button-primary" onClick={showShop} data-testid="hero-shop-button">Shop now <ArrowRight size={18} /></motion.button><a href="#shop" className="text-link" data-testid="hero-explore-link">Explore our snacks <ChevronDown size={16} /></a></motion.div>
          <motion.div className="hero-notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1 }}><span><Leaf size={15} /> Made with millet</span><span><Zap size={15} /> Baked, not fried</span><span>₹29 to start</span></motion.div>
        </motion.div>
        <motion.div className="hero-visual" style={{ y: packY }} initial={{ opacity: 0, scale: 0.92, rotate: 4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.35, ease: EASE }}>
          <motion.div className="hero-sticker" animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>NEW<br /><strong>SNACK<br />OBSESSION</strong></motion.div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>
            <div className="hero-image-frame">
              <AnimatePresence mode="sync">
                <motion.img key={HERO_SLIDES[heroIndex].alt} src={HERO_SLIDES[heroIndex].src} alt={HERO_SLIDES[heroIndex].alt} data-testid="hero-product-image" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.7, ease: EASE }} />
              </AnimatePresence>
            </div>
          </motion.div>
          <div className="hero-caption"><span data-testid="hero-slide-counter">0{heroIndex + 1} / 03</span><AnimatePresence mode="wait"><motion.span key={heroIndex} data-testid="hero-slide-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>{HERO_SLIDES[heroIndex].label}</motion.span></AnimatePresence></div>
        </motion.div>
      </section>

      <section className="marquee"><div className="marquee-track">{[0, 1].map((n) => <span className="marquee-chunk" key={n}>MIX &amp; MATCH YOUR CRAVINGS <b>✳</b> 3 × 30 G COMBO AT ₹79 <b>✳</b> BAKED, NOT FRIED <b>✳</b> MADE WITH MILLET <b>✳</b> MIX &amp; MATCH YOUR CRAVINGS <b>✳</b> 3 × 30 G COMBO AT ₹79 <b>✳</b> BAKED, NOT FRIED <b>✳</b> MADE WITH MILLET <b>✳</b> </span>)}</div></section>

      <section className="shop-section section-pad" id="shop"><Reveal className="section-heading"><div><div className="eyebrow">THE MILLO LINE-UP</div><h2>MEET YOUR<br /><span>NEW CRAVINGS.</span></h2></div><p>Three bold ways to snack.<br />Pick your crunch.</p></Reveal><div className="product-grid">{PRODUCTS.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={addToCart} onView={setSelectedProduct} />)}</div></section>

      <section className="manifesto section-pad" id="story"><Reveal className="manifesto-copy"><div className="eyebrow light">WHY MILLO</div><h2>GOOD GRAINS.<br /><span>BIG CRAVINGS.</span></h2><p>We bring millet into modern snack formats with big flavour, bright energy, and a fresh perspective on everyday munching.</p><a className="text-link light-link" href="#faq" data-testid="manifesto-story-link">Our snack manifesto <ArrowRight size={17} /></a></Reveal><div className="benefit-list">{[["01", "Made with millet", "Ingredient-focused snacking for your everyday."], ["02", "Baked, not fried", "All the crisp. None of the compromise in the format."], ["03", "No maida", "A simple, thoughtful base for bold flavours."], ["04", "Snack anywhere", "Office, college, couch — crunch follows."]].map(([num, title, text], i) => <Reveal key={num} delay={i * 0.08}><Benefit icon={num} title={title} text={text} /></Reveal>)}</div></section>

      <ComboSection onAdd={() => { PRODUCTS.forEach((p) => addToCart(p, 30)); }} />

      <InstagramSection />

      <section className="faq-section section-pad" id="faq"><Reveal className="section-heading"><div><div className="eyebrow">GOOD TO KNOW</div><h2>NO WEIRD<br /><span>SMALL PRINT.</span></h2></div><p>Everything you need to<br />know before the first crunch.</p></Reveal><div className="faq-grid"><Faq q="What makes MILLO different?" a="MILLO brings millet into modern, flavour-forward snack formats — made for the way you actually snack today." /><Faq q="What pack sizes are available?" a="Every flavour comes in 30 g (₹29) and 60 g (₹59) packs. Mix and match your favourites in our combo packs too." /><Faq q="How does checkout work?" a="This prototype collects your order intent and delivery details. You'll see a confirmation summary — no payment is taken here." /></div></section>
    </main>
    <footer className="footer"><div className="footer-brand"><img src={ASSETS.logo} alt="MILLO" /><p>A new way to snack.</p><motion.a className="social-icon" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="MILLO on Instagram" data-testid="instagram-link" whileHover={{ rotate: -10, scale: 1.14 }} whileTap={{ scale: 0.88 }}><InstagramIcon size={19} /></motion.a></div><div className="footer-links"><div><strong>Explore</strong><a href="#shop">Shop all</a><a href="#combos">Combos</a><a href="#story">Our story</a><a href="#community">Community</a></div><div><strong>Need help?</strong><a href="#faq">FAQs</a><a href="#top">Shipping & returns</a><a href="mailto:hello@millo.snacks">Contact us</a><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-testid="footer-instagram-link">Instagram</a></div></div><div className="footer-bottom"><span>© 2025 MILLO SNACKS</span><span>PROPOSED POSITIONING · ACADEMIC PROTOTYPE</span><button className="order-log-link" onClick={() => setOrdersOpen(true)} data-testid="order-log-button">Owner · Order log</button><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-testid="instagram-bottom-link">Instagram ↗</a></div></footer>

    <AnimatePresence>{selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}</AnimatePresence>
    <AnimatePresence>{cartOpen && <CartDrawer cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onCheckout={() => { setCartOpen(false); setCheckout(true); }} />}</AnimatePresence>
    <AnimatePresence>{checkout && <CheckoutModal cart={cart} subtotal={orderTotal || subtotal} ordered={ordered} onClose={() => setCheckout(false)} onComplete={() => { setOrderTotal(subtotal); setOrdered(true); setCart([]); }} />}</AnimatePresence>
    <AnimatePresence>{ordersOpen && <OrderLogModal onClose={() => setOrdersOpen(false)} />}</AnimatePresence>
  </div>;
}

function ProductCard({ product, index, onAdd, onView }) { const [size, setSize] = useState(30); return <motion.article className={`product-card ${product.color}`} data-testid={`product-card-${product.id}`} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: index * 0.1, ease: EASE }}><button className="product-image" onClick={() => onView(product)} data-testid={`product-view-${product.id}`}><span className="product-index">0{index + 1}</span><img src={product.image} alt={`${product.name} ${product.flavor}`} /><span className="view-pill">View product <ArrowRight size={14} /></span></button><div className="product-info"><div><h3>{product.name}</h3><p>{product.flavor} · {product.desc}</p></div><div className="size-row"><div className="size-switch">{[30, 60].map((s) => <button className={size === s ? "active" : ""} onClick={() => setSize(s)} key={s} data-testid={`${product.id}-${s}g-selector`}>{s} g</button>)}</div><strong>₹{size === 30 ? 29 : 59}</strong></div><motion.button className="add-button" whileTap={{ scale: 0.95 }} onClick={() => onAdd(product, size)} data-testid={`add-${product.id}-button`}>Add to cart <Plus size={17} /></motion.button></div></motion.article>; }
function Benefit({ icon, title, text }) { return <div className="benefit"><span>{icon}</span><div><h3>{title}</h3><p>{text}</p></div></div>; }
function Faq({ q, a }) { const [open, setOpen] = useState(false); return <button className={`faq ${open ? "open" : ""}`} onClick={() => setOpen(!open)} data-testid={`faq-${q.toLowerCase().replaceAll(" ", "-")}`}><span><b>{q}</b>{open && <small>{a}</small>}</span>{open ? <X size={19} /> : <Plus size={19} />}</button>; }

function InstagramSection() {
  const [state, setState] = useState({ loading: true, configured: false, posts: [] });
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/instagram/posts`)
      .then((r) => r.json())
      .then((body) => setState({ loading: false, configured: !!body.configured, posts: body.data || [] }))
      .catch(() => setState({ loading: false, configured: false, posts: [] }));
  }, []);
  const live = state.configured && state.posts.length > 0;
  const fallbackTiles = [
    { img: ASSETS.crunch, label: "Crunch · Peri Peri" },
    { img: ASSETS.pops, label: "Pops · Masala" },
    { img: ASSETS.crisps, label: "Crisps · Herbs & Salt" },
  ];
  return <section className="ig-section section-pad" id="community">
    <Reveal className="section-heading"><div><div className="eyebrow light">@MILLO.SNACKS ON INSTAGRAM</div><h2>JOIN THE<br /><span>MILLO COMMUNITY.</span></h2></div><p>Fresh drops, flavour polls<br />and behind-the-crunch moments.</p></Reveal>
    {state.loading ? <div className="ig-grid" data-testid="ig-loading">{[0, 1, 2, 3].map((i) => <div className="ig-skel" key={i} />)}</div> : <div className="ig-grid" data-testid="ig-grid">
      {(live ? state.posts.slice(0, 3) : fallbackTiles).map((tile, i) => live ?
        <motion.a key={tile.id} className="ig-tile" href={tile.permalink} target="_blank" rel="noopener noreferrer" data-testid={`ig-post-${i}`} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.09, ease: EASE }}>{(tile.media_url || tile.thumbnail_url) && <img src={tile.media_url || tile.thumbnail_url} alt={(tile.caption || "MILLO on Instagram").slice(0, 120)} loading="lazy" />}<span className="ig-hover"><InstagramIcon size={26} /></span></motion.a> :
        <motion.a key={tile.label} className="ig-tile" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-testid={`ig-tile-${i}`} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.09, ease: EASE }}><img src={tile.img} alt={`MILLO ${tile.label}`} loading="lazy" /><span className="ig-hover"><InstagramIcon size={26} /></span><span className="ig-label">{tile.label}</span></motion.a>
      )}
      <motion.a className="ig-tile ig-follow" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-testid="instagram-follow-card" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3, ease: EASE }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <InstagramIcon size={30} />
        <div><strong>Follow<br />@millo.snacks</strong><small>{live ? "See the latest on Instagram" : "New posts dropping soon — be there first"}</small></div>
        <span className="ig-follow-cta">Follow <ArrowRight size={15} /></span>
      </motion.a>
    </div>}
  </section>;
}

function ComboSection({ onAdd }) { return <section className="combo-section section-pad" id="combos"><div className="combo-art"><motion.div className="combo-circle" animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}><span>TRY<br /><strong>THE<br />TRIO</strong></span></motion.div><div className="mini-pack pack-one"><img src={ASSETS.crisps} alt="MILLO Crisps" /></div><div className="mini-pack pack-two"><img src={ASSETS.pops} alt="MILLO Pops" /></div><div className="mini-pack pack-three"><img src={ASSETS.crunch} alt="MILLO Crunch" /></div></div><Reveal className="combo-copy"><div className="eyebrow">THE DISCOVERY COMBO</div><h2>MORE CRUNCH.<br /><span>MORE TO SHARE.</span></h2><p>Try all three MILLO flavours in one convenient, very snackable combo.</p><div className="combo-price"><strong>₹79</strong><span>3 × 30 g<br />packs</span></div><motion.button className="button button-dark" whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} onClick={onAdd} data-testid="add-combo-button">Add the trio <ArrowRight size={18} /></motion.button><small>Regular ₹87 · Save ₹8</small></Reveal></section>; }
function ProductModal({ product, onClose, onAdd }) { const [size, setSize] = useState(30); return <motion.div className="overlay" role="dialog" aria-modal="true" data-testid="product-detail-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><motion.div className="modal product-modal" initial={{ y: 46, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.97, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}><button className="close-button" onClick={onClose} data-testid="product-modal-close"><X /></button><div className="modal-product-image"><img src={product.image} alt={product.name} /></div><div className="modal-content"><div className="eyebrow">MILLO / 0{PRODUCTS.findIndex((p) => p.id === product.id) + 1}</div><h2>{product.name}</h2><div className="modal-flavor">{product.flavor} · baked snack</div><p>{product.desc} Made with millet, bold flavour, and a format that fits right into your day.</p><div className="claim-pills"><span>Made with millet</span><span>Baked not fried</span><span>No maida</span></div><label>Choose your pack</label><div className="modal-sizes">{[30, 60].map((s) => <button className={size === s ? "active" : ""} onClick={() => setSize(s)} key={s} data-testid={`modal-${product.id}-${s}g`}>{s} g <b>₹{s === 30 ? 29 : 59}</b></button>)}</div><motion.button className="button button-primary full" whileTap={{ scale: 0.97 }} onClick={() => { onAdd(product, size); onClose(); }} data-testid="product-modal-add-button">Add to cart <ArrowRight size={18} /></motion.button><small className="proposed-note">Claims shown are proposed positioning pending final product validation.</small></div></motion.div></motion.div>; }
function CartDrawer({ cart, subtotal, onClose, onUpdate, onCheckout }) { return <motion.div className="overlay drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><motion.aside className="cart-drawer" data-testid="cart-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.45, ease: EASE }}><div className="drawer-head"><div><div className="eyebrow">YOUR CRUNCH</div><h2>Cart <span>({cart.reduce((s, i) => s + i.quantity, 0)})</span></h2></div><button className="close-button" onClick={onClose} data-testid="cart-close-button"><X /></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={38} /><h3>Your cart is waiting.</h3><p>Add a flavour and let the crunch begin.</p></div> : <><div className="cart-items">{cart.map((item) => <motion.div layout className="cart-item" key={item.key} data-testid={`cart-item-${item.key}`}><img src={item.image} alt={item.name} /><div><b>{item.name}</b><small>{item.size} g · ₹{item.price}</small><div className="quantity"><button onClick={() => onUpdate(item.key, -1)} data-testid={`decrease-${item.key}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => onUpdate(item.key, 1)} data-testid={`increase-${item.key}`}><Plus size={13} /></button></div></div><strong>₹{item.price * item.quantity}</strong></motion.div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>₹{subtotal}</strong></div><p>Delivery charges, if applicable, will be confirmed before fulfilment.</p><motion.button className="button button-primary full" whileTap={{ scale: 0.97 }} onClick={onCheckout} data-testid="proceed-checkout-button">Proceed to checkout <ArrowRight size={18} /></motion.button></div></>}</motion.aside></motion.div>; }
function CheckoutModal({ cart, subtotal, ordered, onClose, onComplete }) { const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", pin: "", payment: "Cash on delivery" }); const [submitted, setSubmitted] = useState(false); const [orderCode, setOrderCode] = useState(""); const [placing, setPlacing] = useState(false); const submit = async (e) => { e.preventDefault(); if (Object.values(form).some((v) => !v)) return toast.error("Please fill in all delivery details"); setPlacing(true); try { const resp = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, payment_method: form.payment, subtotal, items: cart.map((i) => ({ name: i.name, size: i.size, price: i.price, quantity: i.quantity })) }) }); if (!resp.ok) throw new Error("save failed"); const saved = await resp.json(); setOrderCode(saved.code); setSubmitted(true); onComplete(); if (saved.sheet_status === "submitted") { toast.success("Order saved to the MILLO sheet"); } else if (saved.sheet_status === "failed") { toast.warning("Order saved — sheet sync failed, but your details are safe in our order log"); } } catch { toast.error("Could not save your order intent — please try again"); } finally { setPlacing(false); } }; return <motion.div className="overlay" data-testid="checkout-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><motion.div className="modal checkout-modal" initial={{ y: 46, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.97, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}><button className="close-button" onClick={onClose} data-testid="checkout-close-button"><X /></button>{submitted || ordered ? <div className="confirmation" data-testid="order-confirmation"><motion.div className="success-mark" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>✓</motion.div><div className="eyebrow">ORDER INTENT RECEIVED</div><h2>Let the crunch<br /><span>come to you.</span></h2><p>Thanks, {form.name || "snacker"}. We've saved your request for ₹{subtotal} and will confirm delivery details with you shortly.</p><div className="confirmation-code" data-testid="order-code">{orderCode}</div><button className="button button-dark" onClick={onClose} data-testid="confirmation-done-button">Back to MILLO <ArrowRight size={18} /></button></div> : <><div className="eyebrow">ALMOST THERE</div><h2>Where should<br /><span>we send it?</span></h2><p className="checkout-note">This is an order-intent prototype. No payment is taken.</p><form onSubmit={submit} data-testid="checkout-form"><div className="form-grid"><label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="checkout-name-input" /></label><label>Phone number<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="checkout-phone-input" /></label></div><label>Address<input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="checkout-address-input" /></label><label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="checkout-email-input" /></label><div className="form-grid"><label>City<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} data-testid="checkout-city-input" /></label><label>PIN code<input required value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} data-testid="checkout-pin-input" /></label></div><label>Payment method</label><div className="modal-sizes pay-methods">{["Cash on delivery", "UPI on delivery"].map((m) => <button type="button" key={m} className={form.payment === m ? "active" : ""} onClick={() => setForm({ ...form, payment: m })} data-testid={`pay-${m === "Cash on delivery" ? "cod" : "upi"}-button`}>{m}</button>)}</div><div className="checkout-total"><span>Order total</span><strong>₹{subtotal}</strong></div><motion.button className="button button-primary full" whileTap={{ scale: 0.97 }} type="submit" disabled={placing} data-testid="place-order-intent-button">{placing ? "Saving your order…" : "Place order intent"} <ArrowRight size={18} /></motion.button></form></>}</motion.div></motion.div>; }

function OrderLogModal({ onClose }) { const [orders, setOrders] = useState(null); useEffect(() => { fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`).then((r) => r.json()).then(setOrders).catch(() => setOrders([])); }, []); return <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><motion.div className="modal order-log-modal" data-testid="order-log-modal" initial={{ y: 46, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.97, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}><button className="close-button" onClick={onClose} data-testid="order-log-close"><X /></button><div className="eyebrow">OWNER VIEW</div><h2>Order<br /><span>intents.</span></h2>{!orders ? <p className="order-log-note">Loading…</p> : orders.length === 0 ? <p className="order-log-note" data-testid="order-log-empty">No order intents yet. They'll appear here the moment someone checks out.</p> : <div className="order-log-list">{orders.map((o) => <div className="order-card" key={o.id} data-testid={`order-card-${o.code}`}><div className="order-card-head"><strong>{o.code}</strong>{(o.sheet_status === "submitted" || o.google_form_status === "submitted") && <span className="gf-badge">In Google Sheet ✓</span>}<span>{new Date(o.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div><div className="order-card-body"><b>{o.name}</b><span>{o.phone}</span><span>{o.address}, {o.city} — {o.pin}</span></div><ul>{o.items.map((i, idx) => <li key={idx}>{i.quantity} × {i.name} ({i.size} g) — ₹{i.price * i.quantity}</li>)}</ul><div className="order-card-total"><span>Total</span><strong>₹{o.subtotal}</strong></div></div>)}</div>}</motion.div></motion.div>; }

export default App;
