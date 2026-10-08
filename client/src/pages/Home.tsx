import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Instagram,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import {
  addToCart,
  loadCart,
  loadProducts,
  removeCartLine,
  safeCatalog,
  updateCartLine,
  type CatalogProduct,
  type StorefrontCart,
} from "@/lib/shopify";

const PAYMENT_LINKS: Record<string, string> = {
  "Instagram Views": "https://rzp.io/rzp/x6VYI3kg",
  "High-quality Instagram Likes": "https://rzp.io/rzp/XkSob2x",
};

const WHATSAPP_NUMBER = "916296989639";

function formatPrice(product: CatalogProduct) {
  if (!product.price) return "Let’s talk";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.price.currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(product.price.amount));
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function productTone(product: CatalogProduct) {
  if (product.title.includes("Instagram")) return "violet";
  if (product.title.includes("Website")) return "lime";
  return "orange";
}

export default function Home() {
  const [products, setProducts] = useState<CatalogProduct[]>(safeCatalog);
  const [cart, setCart] = useState<StorefrontCart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All services");
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void Promise.all([loadProducts(), loadCart()]).then(([catalog, currentCart]) => {
      setProducts(catalog);
      setCart(currentCart);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "Marketing") return products.filter(product => product.productType.includes("marketing"));
    if (activeFilter === "Build") return products.filter(product => product.productType.includes("creation"));
    return products;
  }, [activeFilter, products]);

  const cartCount = cart?.totalQuantity ?? 0;
  const cartTotal = cart?.cost.totalAmount
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: cart.cost.totalAmount.currencyCode, maximumFractionDigits: 0 }).format(Number(cart.cost.totalAmount.amount))
    : "₹0";

  async function handleAdd(product: CatalogProduct) {
    if (!product.variantId) {
      window.open(buildWhatsAppUrl(`Hi BISU DIGITAL NETWORK, I want to discuss ${product.title}.`), "_blank", "noopener,noreferrer");
      return;
    }
    setLoadingProduct(product.id);
    setNotice("");
    try {
      const nextCart = await addToCart(product.variantId);
      setCart(nextCart);
      setCartOpen(true);
    } catch {
      setNotice("Shopify cart is momentarily unavailable. Please try again or message us on WhatsApp.");
    } finally {
      setLoadingProduct(null);
    }
  }

  async function handleQuantity(lineId: string, quantity: number) {
    try {
      const nextCart = quantity <= 0 ? await removeCartLine(lineId) : await updateCartLine(lineId, quantity);
      setCart(nextCart);
    } catch {
      setNotice("We couldn’t update that cart line. Please try once more.");
    }
  }

  function copyWhatsAppNumber() {
    void navigator.clipboard?.writeText(`+${WHATSAPP_NUMBER}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="bisu-app">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="BISU DIGITAL NETWORK home">
          <span className="wordmark-node" />
          <span>BISU</span>
          <span className="wordmark-sub">DIGITAL NETWORK</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#how-it-works">How it works</a>
          <a href="#support">Support</a>
        </nav>
        <button className="cart-trigger" type="button" onClick={() => setCartOpen(true)}>
          <ShoppingBag size={17} />
          <span>Cart</span>
          <b>{cartCount}</b>
        </button>
        <button className="mobile-menu" type="button" aria-label="Open menu"><Menu size={20} /></button>
      </header>

      <main id="top">
        <section className="hero-section container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> DIGITAL SERVICES / 01</div>
            <h1>Pick the <em>signal</em><br />you want to send.</h1>
            <p className="hero-intro">Fast, focused digital services for people building their next move — from social visibility to websites and apps.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#services">Explore services <ArrowUpRight size={16} /></a>
              <a className="text-link" href="#how-it-works">See how it works <ChevronRight size={15} /></a>
            </div>
            <div className="hero-proof"><span><Check size={13} /> Shopify-backed checkout</span><span><Check size={13} /> Customer-led WhatsApp support</span></div>
          </div>
          <div className="hero-signal" aria-label="BISU service pulse">
            <div className="signal-orbit orbit-one" />
            <div className="signal-orbit orbit-two" />
            <div className="signal-core"><span>BI</span><small>SU</small></div>
            <div className="signal-label label-top">01 — SOCIAL</div>
            <div className="signal-label label-bottom">02 — BUILD</div>
            <div className="signal-note"><Sparkles size={15} /> Small moves. Real momentum.</div>
          </div>
        </section>

        <section className="ticker" aria-label="Store highlights">
          <div className="ticker-track"><span>CLARITY FIRST</span><i /> <span>INR PRICING</span><i /> <span>EXPLICIT CHECKOUT</span><i /> <span>CLARITY FIRST</span><i /> <span>INR PRICING</span><i /></div>
        </section>

        <section className="services-section container" id="services">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> THE CATALOG / 02</div><h2>Services with<br /><span>a clear next step.</span></h2></div>
            <p>Choose a ready-to-go service or start a conversation. Every listing tells you what happens after the click.</p>
          </div>
          <div className="filter-row" role="tablist" aria-label="Service filters">
            {["All services", "Marketing", "Build"].map(filter => <button key={filter} type="button" className={activeFilter === filter ? "filter active" : "filter"} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
          </div>
          {notice && <div className="notice" role="status">{notice}</div>}
          <div className="product-list">
            {filteredProducts.map((product, index) => {
              const tone = productTone(product);
              const paymentLink = PAYMENT_LINKS[product.title];
              return <article className={`product-card tone-${tone}`} key={product.id}>
                <div className="product-index">0{index + 1}</div>
                <div className="product-main">
                  <div className="product-topline"><span className="product-tag">{product.productType}</span><span className="product-status"><span /> Available now</span></div>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <div className="product-meta"><span className="product-price">{formatPrice(product)}</span><span className="product-scope">Digital delivery · INR</span></div>
                </div>
                <div className="product-actions">
                  {paymentLink && <a className="button button-external" href={paymentLink} target="_blank" rel="noreferrer">Pay via Razorpay <ExternalLink size={14} /></a>}
                  <button className="button button-dark" type="button" onClick={() => void handleAdd(product)} disabled={loadingProduct === product.id}>{loadingProduct === product.id ? "Adding…" : "Add to Shopify cart"}<Plus size={15} /></button>
                </div>
              </article>;
            })}
          </div>
          <div className="inquiry-strip">
            <div className="inquiry-icon"><Instagram size={18} /></div>
            <div><span className="product-tag">Custom scope</span><h3>Instagram · Facebook · YouTube · Telegram</h3><p>Need a different legitimate service? Tell us the channel, goal, and timeline. We’ll confirm scope before any work begins.</p></div>
            <a className="button button-outline" href={buildWhatsAppUrl("Hi BISU DIGITAL NETWORK, I want to discuss a legitimate service for Instagram, Facebook, YouTube, or Telegram.")} target="_blank" rel="noreferrer">Start an inquiry <ArrowUpRight size={15} /></a>
          </div>
        </section>

        <section className="process-section" id="how-it-works">
          <div className="container process-inner">
            <div className="section-heading process-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> THE HANDOFF / 03</div><h2>Pay your way.<br /><span>Stay in control.</span></h2></div><p>Two clear paths, one simple rule: you choose what information to share and when.</p></div>
            <div className="process-grid">
              <div className="process-step"><span className="step-number">01</span><h3>Choose a service</h3><p>Pick a listed service and review the exact price, scope, and next action before you commit.</p></div>
              <div className="process-step"><span className="step-number">02</span><h3>Pay or checkout</h3><p>Use Shopify checkout for build services, or open the clearly labeled Razorpay link for Instagram services.</p></div>
              <div className="process-step"><span className="step-number">03</span><h3>Send only what you mean to</h3><p>Open WhatsApp yourself, attach a payment screenshot if you choose, and include your username plus service details.</p></div>
            </div>
            <div className="trust-note"><span className="trust-mark"><Check size={15} /></span><p><strong>Plain-language promise:</strong> Payment is not automatically verified here. Screenshots and customer details are never transmitted unless you choose to send them.</p></div>
          </div>
        </section>

        <section className="support-section container" id="support">
          <div className="support-card">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> AFTER PAYMENT / SUPPORT</div><h2>Ready when<br /><em>you are.</em></h2><p>After payment, open WhatsApp and manually send your screenshot, username, and service details to the BISU team.</p></div>
            <div className="support-actions"><a className="button button-whatsapp" href={buildWhatsAppUrl("Hi BISU DIGITAL NETWORK, I’ve completed payment. Service: ______. Username: ______. I’m attaching my screenshot manually.")} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Open WhatsApp</a><button className="number-chip" type="button" onClick={copyWhatsAppNumber}><span>+91 62969 89639</span>{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
          </div>
        </section>
      </main>

      <footer className="site-footer container"><div className="wordmark footer-wordmark"><span className="wordmark-node" /><span>BISU</span><span className="wordmark-sub">DIGITAL NETWORK</span></div><p>Digital services, shipped with clarity.</p><span>© 2026 BISU DIGITAL NETWORK</span></footer>

      {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={event => event.stopPropagation()} aria-label="Shopping cart">
        <div className="drawer-head"><div><div className="eyebrow"><span className="eyebrow-dot" /> SHOPIFY CART</div><h2>Your picks <span>({cartCount})</span></h2></div><button className="close-button" type="button" aria-label="Close cart" onClick={() => setCartOpen(false)}><X size={19} /></button></div>
        {cart?.lines.nodes.length ? <>
          <div className="cart-lines">{cart.lines.nodes.map(line => <div className="cart-line" key={line.id}><div><h3>{line.merchandise.product.title}</h3><span>{formatPrice({ price: line.merchandise.price } as CatalogProduct)} each</span></div><div className="line-controls"><button type="button" onClick={() => void handleQuantity(line.id, line.quantity - 1)} aria-label="Decrease quantity"><Minus size={13} /></button><b>{line.quantity}</b><button type="button" onClick={() => void handleQuantity(line.id, line.quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div></div>)}</div>
          <div className="cart-summary"><div><span>Subtotal</span><strong>{cartTotal}</strong></div><p>Shopify checkout opens in a new tab. Digital-service scope is confirmed after the handoff.</p><a className="button button-primary full-width" href={cart.checkoutUrl} target="_blank" rel="noreferrer">Continue to checkout <ArrowUpRight size={15} /></a></div>
        </> : <div className="empty-cart"><ShoppingBag size={24} /><h3>Your cart is clear.</h3><p>Add a build service to create a Shopify checkout.</p><button className="button button-dark" type="button" onClick={() => { setCartOpen(false); document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}>Browse services <ChevronRight size={15} /></button></div>}
        <div className="drawer-foot"><MessageCircle size={15} /> Need a custom scope? <a href={buildWhatsAppUrl("Hi BISU DIGITAL NETWORK, I have a custom service question.")} target="_blank" rel="noreferrer">Message us</a></div>
      </aside></div>}
    </div>
  );
}
