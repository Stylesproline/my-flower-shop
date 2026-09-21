'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Product = {
  id: number;
  category: string;
  name: string;
  price: number;
  desc: string;
  image: string;
};

type CartItem = Product & { count: number };

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  initData?: string;
  initDataUnsafe?: { user?: { first_name?: string } };
  HapticFeedback?: {
    impactOccurred?: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred?: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged?: () => void;
  };
  close?: () => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

const PRODUCTS: Product[] = [
  { id: 1, category: 'Розы', name: 'Красный Наоми', price: 79, desc: '10 роз с крупным бутоном', image: '/images/rose-naomi.jpg' },
  { id: 2, category: 'Розы', name: 'Розовый фламинго', price: 89, desc: 'Нежный аромат и стойкость до 2 недель', image: '/images/lily-asia.jpg' },
  { id: 3, category: 'Букеты', name: 'Розы Лилии Микс', price: 299, desc: 'Цветочная подписка 1 раз в неделю / 1 месяц', image: '/images/lili-rose.jpeg' },
  { id: 4, category: 'Розы', name: 'Белый Шоколад', price: 89, desc: 'Белоснежные розы высшего сорта / 10 шт.', image: '/images/field-dream.jpg' },
  { id: 5, category: 'Пионы', name: 'Пион белый', price: 87, desc: 'Пион белый, 9 шт.', image: '/images/yquued.jpeg' },
  { id: 6, category: 'Букеты', name: 'Хризантемы одноголовые', price: 57, desc: 'Хризантемы, 9 шт.', image: '/images/77ntitled.jpeg' },
];

const CATEGORIES = ['Все', 'Розы', 'Пионы', 'Букеты'];

function getTelegram(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.Telegram?.WebApp;
}

export default function Shop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [debug, setDebug] = useState('');

  const tg = getTelegram();

  useEffect(() => {
    const init = () => {
      const app = getTelegram();

      if (!app) {
        setDebug('DEMO MODE');
        return;
      }

      app.ready?.();
      app.expand?.();
      app.setHeaderColor?.('#fff8fb');
      app.setBackgroundColor?.('#fff8fb');

      if (app.initData) {
        setDebug(app.initDataUnsafe?.user?.first_name ? `Привет, ${app.initDataUnsafe.user.first_name} 🌸` : 'Telegram OK');
      } else {
        setDebug('Открой через Telegram для полной версии');
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!showCart) {
      tg?.disableClosingConfirmation?.();
      return;
    }
    tg?.enableClosingConfirmation?.();
    return () => tg?.disableClosingConfirmation?.();
  }, [showCart, tg]);

  const filteredProducts = useMemo(
    () => activeCategory === 'Все' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const itemCount = cart.reduce((sum, item) => sum + item.count, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.count, 0);

  const haptic = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
    tg?.HapticFeedback?.impactOccurred?.(style);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(style === 'heavy' ? 25 : style === 'medium' ? 15 : 8);
    }
  }, [tg]);

  const addToCart = useCallback((product: Product) => {
    haptic('medium');
    setAddedId(product.id);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, count: item.count + 1 } : item);
      }
      return [...prev, { ...product, count: 1 }];
    });
    setToast(`${product.name} добавлен в букет 🌸`);
    window.setTimeout(() => setAddedId(null), 450);
  }, [haptic]);

  const changeCount = useCallback((id: number, delta: number) => {
    haptic('light');
    setCart((prev) => prev
      .map((item) => item.id === id ? { ...item, count: item.count + delta } : item)
      .filter((item) => item.count > 0)
    );
  }, [haptic]);

  const handleCheckout = useCallback(async () => {
    if (!address.trim()) {
      haptic('heavy');
      setToast('Добавьте адрес и телефон 📍');
      return;
    }

    if (!cart.length) return;

    setCheckoutLoading(true);

    try {
      const app = getTelegram();
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          address,
          initData: app?.initData || '',
        }),
      });

      if (!res.ok) throw new Error('ORDER_FAILED');

      app?.HapticFeedback?.notificationOccurred?.('success');
      setCart([]);
      setAddress('');
      setShowCart(false);
      setSuccess(true);
    } catch {
      tg?.HapticFeedback?.notificationOccurred?.('error');
      setToast('Не удалось отправить заказ. Попробуйте ещё раз.');
    } finally {
      setCheckoutLoading(false);
    }
  }, [address, cart, haptic, tg]);

  return (
    <main className="shop-shell">
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff8fb; }
        button, textarea { font: inherit; }
        button { -webkit-tap-highlight-color: transparent; }

        .shop-shell {
          min-height: 100vh;
          padding: 0 16px 112px;
          color: var(--tg-theme-text-color, #1d1720);
          background:
            radial-gradient(circle at 90% 8%, rgba(255, 187, 211, .38), transparent 24%),
            radial-gradient(circle at 5% 30%, rgba(255, 221, 232, .48), transparent 22%),
            #fff8fb;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
          overflow-x: hidden;
        }

        .hero {
          position: relative;
          min-height: 205px;
          margin: 0 -16px;
          padding: 22px 20px 24px;
          overflow: hidden;
          background: linear-gradient(145deg, #ff4f87 0%, #ff7da8 48%, #ffc0d3 100%);
          color: white;
          border-radius: 0 0 34px 34px;
          box-shadow: 0 18px 45px rgba(218, 73, 119, .20);
        }

        .hero::before, .hero::after {
          content: '';
          position: absolute;
          border-radius: 999px;
          background: rgba(255,255,255,.14);
          pointer-events: none;
        }
        .hero::before { width: 170px; height: 170px; right: -50px; top: -70px; }
        .hero::after { width: 95px; height: 95px; left: -35px; bottom: -40px; }

        .hero-top { display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; }
        .brand { font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; opacity:.9; }
        .hello { font-size: 12px; font-weight: 700; background: rgba(255,255,255,.18); padding: 8px 11px; border-radius: 999px; backdrop-filter: blur(8px); }
        .hero-title { position:relative; z-index:2; margin: 26px 0 5px; font-size: 36px; line-height: .98; letter-spacing: -.045em; font-weight: 900; }
        .hero-subtitle { position:relative; z-index:2; margin:0; max-width: 280px; font-size:14px; line-height:1.35; font-weight:600; opacity:.94; }
        .petal { position:absolute; z-index:1; font-size:24px; animation: floatPetal 4.5s ease-in-out infinite; opacity:.72; }
        .petal.one { right:28%; top:25px; animation-delay:.4s; }
        .petal.two { right:8%; bottom:32px; font-size:17px; animation-delay:1.2s; }
        .petal.three { left:42%; bottom:16px; font-size:14px; animation-delay:2s; }

        .section-head { display:flex; justify-content:space-between; align-items:end; gap:12px; margin:24px 0 12px; }
        .section-title { margin:0; font-size:23px; font-weight:900; letter-spacing:-.03em; }
        .section-note { margin:0; font-size:11px; color:#9b8f96; font-weight:700; }

        .categories { display:flex; gap:8px; overflow-x:auto; padding:2px 1px 6px; scrollbar-width:none; }
        .categories::-webkit-scrollbar { display:none; }
        .chip { flex:0 0 auto; border:0; border-radius:999px; padding:10px 15px; background:rgba(255,255,255,.78); color:#786b73; font-weight:800; font-size:13px; box-shadow:0 3px 14px rgba(67,31,49,.06); transition:.2s ease; }
        .chip.active { color:white; background:#1f1820; transform:translateY(-1px); box-shadow:0 7px 16px rgba(31,24,32,.16); }

        .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:8px; }
        .card { position:relative; overflow:hidden; min-width:0; border-radius:25px; padding:9px; background:rgba(255,255,255,.86); box-shadow:0 8px 25px rgba(74,38,55,.08); transition:transform .22s ease, box-shadow .22s ease; }
        .card:active { transform:scale(.975); }
        .image-wrap { position:relative; overflow:hidden; border-radius:19px; aspect-ratio:1 / 1; background:#f2e9ed; }
        .product-image { width:100%; height:100%; display:block; object-fit:cover; transition:transform .5s cubic-bezier(.2,.8,.2,1); }
        .card:hover .product-image { transform:scale(1.045); }
        .quick-badge { position:absolute; top:8px; left:8px; padding:5px 8px; border-radius:999px; background:rgba(255,255,255,.86); color:#ff3f78; font-size:9px; font-weight:900; backdrop-filter:blur(8px); }
        .product-name { margin:10px 3px 3px; font-size:14px; line-height:1.1; font-weight:900; }
        .product-desc { margin:0 3px; min-height:31px; color:#9a8e95; font-size:10px; line-height:1.35; }
        .card-bottom { display:flex; align-items:center; justify-content:space-between; gap:7px; margin:10px 2px 2px; }
        .price { font-size:16px; font-weight:950; letter-spacing:-.03em; }
        .price small { font-size:10px; font-weight:800; color:#a0959b; }
        .add-button { position:relative; overflow:hidden; width:40px; height:40px; border:0; border-radius:14px; background:#ff4f87; color:white; font-size:25px; line-height:1; box-shadow:0 8px 16px rgba(255,79,135,.28); transition:transform .18s ease, background .18s ease; }
        .add-button:active { transform:scale(.86) rotate(-5deg); }
        .add-button.added { background:#1fbc76; animation:pop .42s ease; }

        .floating-cart { position:fixed; z-index:40; left:16px; right:16px; bottom:16px; display:flex; align-items:center; justify-content:space-between; padding:10px 11px 10px 15px; border:1px solid rgba(255,255,255,.58); border-radius:22px; background:rgba(31,24,32,.92); color:white; box-shadow:0 15px 40px rgba(30,17,24,.28); backdrop-filter:blur(18px); animation:slideUp .35s ease; }
        .cart-meta { display:flex; align-items:center; gap:10px; }
        .cart-icon { width:40px; height:40px; display:grid; place-items:center; border-radius:14px; background:#ff4f87; font-size:19px; }
        .cart-text b { display:block; font-size:13px; }
        .cart-text span { display:block; margin-top:2px; color:#c9c1c6; font-size:10px; }
        .cart-open { border:0; border-radius:15px; padding:12px 15px; background:white; color:#1f1820; font-weight:900; font-size:12px; }

        .modal-backdrop { position:fixed; inset:0; z-index:80; background:rgba(23,14,20,.48); backdrop-filter:blur(8px); animation:fadeIn .2s ease; }
        .sheet { position:absolute; left:0; right:0; bottom:0; max-height:92vh; overflow:auto; padding:10px 18px 22px; border-radius:30px 30px 0 0; background:#fffafd; box-shadow:0 -20px 60px rgba(20,10,18,.25); animation:sheetUp .32s cubic-bezier(.2,.8,.2,1); }
        .grabber { width:40px; height:5px; margin:2px auto 16px; border-radius:99px; background:#ddd2d8; }
        .sheet-head { display:flex; justify-content:space-between; align-items:center; }
        .sheet-title { margin:0; font-size:26px; font-weight:950; letter-spacing:-.04em; }
        .close { width:36px; height:36px; border:0; border-radius:50%; background:#f0e9ed; font-size:18px; }

        .product-detail-image { width:100%; aspect-ratio:1.15 / 1; object-fit:cover; border-radius:25px; margin:0 0 16px; }
        .detail-price { font-size:27px; font-weight:950; margin:5px 0 8px; }
        .detail-desc { color:#8d8188; font-size:13px; line-height:1.5; margin-bottom:18px; }
        .primary { width:100%; border:0; border-radius:18px; padding:17px; background:#ff4f87; color:white; font-size:16px; font-weight:900; box-shadow:0 12px 24px rgba(255,79,135,.24); }

        .cart-list { display:flex; flex-direction:column; gap:10px; }
        .cart-row { display:flex; align-items:center; gap:10px; padding:9px; border-radius:20px; background:#f7f0f4; }
        .cart-thumb { width:55px; height:55px; border-radius:15px; object-fit:cover; }
        .cart-info { flex:1; min-width:0; }
        .cart-name { font-size:13px; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cart-price { margin-top:3px; color:#8f838a; font-size:11px; }
        .stepper { display:flex; align-items:center; gap:7px; }
        .stepper button { width:29px; height:29px; border:0; border-radius:10px; background:white; font-weight:900; }
        .stepper span { min-width:16px; text-align:center; font-size:12px; font-weight:900; }
        .total-box { display:flex; align-items:end; justify-content:space-between; margin:20px 2px 14px; }
        .total-label { color:#9a8e95; font-size:12px; }
        .total { font-size:28px; font-weight:950; letter-spacing:-.04em; }
        .address { width:100%; min-height:100px; resize:none; border:1px solid #eadfe5; outline:none; border-radius:19px; padding:15px; background:#fff; color:#1f1820; font-size:14px; line-height:1.4; box-shadow:inset 0 1px 0 rgba(0,0,0,.02); }
        .address:focus { border-color:#ff83aa; box-shadow:0 0 0 4px rgba(255,79,135,.10); }
        .checkout { margin-top:12px; }
        .checkout:disabled { opacity:.55; }
        .back { width:100%; border:0; background:transparent; color:#8d7d86; padding:12px; font-weight:800; }

        .toast { position:fixed; z-index:120; left:50%; bottom:86px; transform:translateX(-50%); max-width:calc(100vw - 32px); padding:11px 15px; border-radius:999px; background:#1f1820; color:white; font-size:12px; font-weight:800; box-shadow:0 12px 35px rgba(0,0,0,.22); animation:toastIn .25s ease; white-space:nowrap; }

        .success { position:fixed; inset:0; z-index:150; display:grid; place-items:center; padding:25px; background:linear-gradient(160deg,#fff7fb,#ffe5ef); overflow:hidden; animation:fadeIn .2s ease; }
        .success-card { position:relative; width:min(390px,100%); padding:35px 25px 28px; text-align:center; border-radius:32px; background:rgba(255,255,255,.9); box-shadow:0 25px 70px rgba(110,38,70,.17); backdrop-filter:blur(16px); animation:successPop .55s cubic-bezier(.2,1.4,.4,1) both; }
        .success-flower { font-size:68px; line-height:1; animation:bounce 1.1s ease-in-out infinite; }
        .success h2 { margin:14px 0 8px; font-size:30px; font-weight:950; letter-spacing:-.04em; }
        .success p { margin:0 0 22px; color:#8f8189; font-size:13px; line-height:1.45; }
        .confetti { position:absolute; top:-20px; width:9px; height:18px; border-radius:4px; animation:confettiFall 2.6s linear infinite; }
        .c1 { left:10%; animation-delay:0s; transform:rotate(15deg); }
        .c2 { left:24%; animation-delay:.4s; transform:rotate(65deg); }
        .c3 { left:42%; animation-delay:.8s; transform:rotate(35deg); }
        .c4 { left:62%; animation-delay:.2s; transform:rotate(80deg); }
        .c5 { left:78%; animation-delay:1s; transform:rotate(20deg); }
        .c6 { left:91%; animation-delay:.55s; transform:rotate(55deg); }

        @keyframes floatPetal { 0%,100% { transform:translateY(0) rotate(0); } 50% { transform:translateY(-12px) rotate(12deg); } }
        @keyframes pop { 0% { transform:scale(1); } 40% { transform:scale(1.22) rotate(-8deg); } 100% { transform:scale(1); } }
        @keyframes slideUp { from { transform:translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes sheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translate(-50%,15px) scale(.95); } to { opacity:1; transform:translate(-50%,0) scale(1); } }
        @keyframes successPop { from { opacity:0; transform:scale(.72) translateY(25px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes bounce { 0%,100% { transform:translateY(0) rotate(-3deg); } 50% { transform:translateY(-7px) rotate(3deg); } }
        @keyframes confettiFall { 0% { top:-25px; opacity:1; } 100% { top:110vh; opacity:.1; transform:translateX(35px) rotate(540deg); } }

        @media (min-width: 700px) {
          .shop-shell { max-width:680px; margin:0 auto; padding-left:20px; padding-right:20px; }
          .hero { margin:0 -20px; }
          .grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
          .floating-cart { left:50%; right:auto; width:640px; max-width:calc(100vw - 32px); transform:translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; }
        }
      `}</style>

      <section className="hero">
        <div className="petal one">🌸</div>
        <div className="petal two">✦</div>
        <div className="petal three">🌷</div>
        <div className="hero-top">
          <div className="brand">Flower Club</div>
          <div className="hello">{debug || 'Добро пожаловать'} </div>
        </div>
        <h1 className="hero-title">Цветы,<br />которые хочется подарить.</h1>
        <p className="hero-subtitle">Собери свой заказ за несколько тапов — остальное мы сделаем сами.</p>
      </section>

      <div className="section-head">
        <h2 className="section-title">Выбери настроение</h2>
        <p className="section-note">{PRODUCTS.length} позиций</p>
      </div>

      <nav className="categories" aria-label="Категории">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              setActiveCategory(cat);
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      <section className="grid">
        {filteredProducts.map((product) => (
          <article key={product.id} className="card">
            <button
              onClick={() => {
                haptic('light');
                setSelectedProduct(product);
              }}
              style={{ border: 0, padding: 0, background: 'transparent', display: 'block', width: '100%', textAlign: 'left' }}
              aria-label={`Подробнее: ${product.name}`}
            >
              <div className="image-wrap">
                <img className="product-image" src={product.image} alt={product.name} />
                {product.id === 3 && <span className="quick-badge">ХИТ</span>}
              </div>
              <div className="product-name">{product.name}</div>
              <p className="product-desc">{product.desc}</p>
            </button>

            <div className="card-bottom">
              <div className="price">{product.price} <small>BYN</small></div>
              <button
                className={`add-button ${addedId === product.id ? 'added' : ''}`}
                onClick={() => addToCart(product)}
                aria-label={`Добавить ${product.name}`}
              >
                {addedId === product.id ? '✓' : '+'}
              </button>
            </div>
          </article>
        ))}
      </section>

      {itemCount > 0 && (
        <div className="floating-cart">
          <div className="cart-meta">
            <div className="cart-icon">🛍️</div>
            <div className="cart-text">
              <b>{itemCount} {itemCount === 1 ? 'цветок / товар' : 'товара в заказе'}</b>
              <span>{total} BYN · уже почти готово</span>
            </div>
          </div>
          <button className="cart-open" onClick={() => { haptic('medium'); setShowCart(true); }}>
            Открыть →
          </button>
        </div>
      )}

      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <section className="sheet" onClick={(event) => event.stopPropagation()}>
            <div className="grabber" />
            <div className="sheet-head">
              <h2 className="sheet-title">О цветах</h2>
              <button className="close" onClick={() => setSelectedProduct(null)}>✕</button>
            </div>
            <img className="product-detail-image" src={selectedProduct.image} alt={selectedProduct.name} />
            <div style={{ fontSize: 12, fontWeight: 900, color: '#ff4f87' }}>{selectedProduct.category}</div>
            <h3 style={{ margin: '5px 0 0', fontSize: 25, fontWeight: 950 }}>{selectedProduct.name}</h3>
            <div className="detail-price">{selectedProduct.price} BYN</div>
            <div className="detail-desc">{selectedProduct.desc}</div>
            <button className="primary" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
              Добавить в мой заказ 🌸
            </button>
          </section>
        </div>
      )}

      {showCart && (
        <div className="modal-backdrop" onClick={() => setShowCart(false)}>
          <section className="sheet" onClick={(event) => event.stopPropagation()}>
            <div className="grabber" />
            <div className="sheet-head">
              <h2 className="sheet-title">Твой букет</h2>
              <button className="close" onClick={() => setShowCart(false)}>✕</button>
            </div>

            <div className="cart-list" style={{ marginTop: 18 }}>
              {cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <img className="cart-thumb" src={item.image} alt={item.name} />
                  <div className="cart-info">
                    <div className="cart-name">{item.name}</div>
                    <div className="cart-price">{item.price} BYN × {item.count}</div>
                  </div>
                  <div className="stepper">
                    <button onClick={() => changeCount(item.id, -1)} aria-label="Уменьшить">−</button>
                    <span>{item.count}</span>
                    <button onClick={() => changeCount(item.id, 1)} aria-label="Увеличить">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-box">
              <div>
                <div className="total-label">Итого</div>
                <div className="total">{total} BYN</div>
              </div>
              <div style={{ fontSize: 12, color: '#9a8e95', fontWeight: 800 }}>🌸 хороший выбор</div>
            </div>

            <textarea
              className="address"
              placeholder="📍 Адрес + телефон для связи"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />

            <button className="primary checkout" onClick={handleCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? 'Отправляем заказ…' : 'Оформить заказ →'}
            </button>
            <button className="back" onClick={() => setShowCart(false)}>Продолжить выбирать</button>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {success && (
        <div className="success">
          <div className="confetti c1" style={{ background: '#ff4f87' }} />
          <div className="confetti c2" style={{ background: '#ffd166' }} />
          <div className="confetti c3" style={{ background: '#6ed5a5' }} />
          <div className="confetti c4" style={{ background: '#8e7dff' }} />
          <div className="confetti c5" style={{ background: '#ff8fb3' }} />
          <div className="confetti c6" style={{ background: '#5ac8fa' }} />
          <div className="success-card">
            <div className="success-flower">💐</div>
            <h2>Заказ принят!</h2>
            <p>Цветы уже отправились в нашу очередь на сборку. Скоро свяжемся с вами для подтверждения.</p>
            <button className="primary" onClick={() => setSuccess(false)}>Вернуться в магазин</button>
          </div>
        </div>
      )}
    </main>
  );
}
