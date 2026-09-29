"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number; name: string; price: number; image?: string;
  category: "Розы" | "Пионы" | "Букеты"; description?: string; badge?: string;
};
type CartItem = Product & { count: number };

const PRODUCTS: Product[] = [
  { id: 1, name: "Красный Наоми", price: 79, image: "/flowers/naomi.jpg", category: "Розы", description: "10 свежих красных роз", badge: "Хит" },
  { id: 2, name: "Розовый фламинго", price: 89, image: "/flowers/flamingo.jpg", category: "Розы", description: "Нежные розовые розы" },
  { id: 3, name: "Розы Лилии Микс", price: 299, image: "/flowers/mix.jpg", category: "Букеты", description: "Премиальный микс", badge: "Premium" },
  { id: 4, name: "Белый Шоколад", price: 89, image: "/flowers/white.jpg", category: "Розы", description: "Элегантные белые розы" },
  { id: 5, name: "Пион белый", price: 87, image: "/flowers/peony.jpg", category: "Пионы", description: "Белые пышные пионы" },
  { id: 6, name: "Хризантемы одноголовые", price: 57, image: "/flowers/chrysanthemum.jpg", category: "Букеты", description: "Воздушные сезонные цветы" },
];
const CATEGORIES = ["Все", "Розы", "Пионы", "Букеты"] as const;

declare global { interface Window { Telegram?: { WebApp?: any } } }

const haptic = (type: "light" | "medium" | "success" = "light") => {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === "success") tg.HapticFeedback.notificationOccurred("success");
      else tg.HapticFeedback.impactOccurred(type);
    } else if (navigator.vibrate) navigator.vibrate(type === "medium" ? 18 : 8);
  } catch {}
};
const money = (n: number) => `${n.toLocaleString("ru-RU")} BYN`;

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Все");
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [combo, setCombo] = useState(0);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp; if (!tg) return;
    try { tg.ready(); tg.expand(); tg.setHeaderColor?.("#fff8fb"); tg.setBackgroundColor?.("#fff8fb"); } catch {}
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp; if (!tg) return;
    const back = () => selected ? setSelected(null) : cartOpen ? setCartOpen(false) : undefined;
    try {
      tg.BackButton?.onClick(back);
      selected || cartOpen ? tg.BackButton?.show() : tg.BackButton?.hide();
      cart.length || address.trim() ? tg.enableClosingConfirmation?.() : tg.disableClosingConfirmation?.();
    } catch {}
    return () => { try { tg.BackButton?.offClick(back); } catch {} };
  }, [selected, cartOpen, cart.length, address]);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 1800); return () => clearTimeout(t); }, [toast]);

  const products = useMemo(() => category === "Все" ? PRODUCTS : PRODUCTS.filter(p => p.category === category), [category]);
  const count = cart.reduce((s, x) => s + x.count, 0);
  const total = cart.reduce((s, x) => s + x.price * x.count, 0);

  const add = (p: Product) => {
    haptic("medium");
    setCart(c => c.some(x => x.id === p.id) ? c.map(x => x.id === p.id ? { ...x, count: x.count + 1 } : x) : [...c, { ...p, count: 1 }]);
    setCombo(x => Math.min(5, x + 1)); setLastAdded(p.id); setToast(`${p.name} добавлен 🌸`);
    setTimeout(() => setLastAdded(null), 500);
  };
  const change = (id: number, delta: number) => { haptic(); setCart(c => c.map(x => x.id === id ? { ...x, count: x.count + delta } : x).filter(x => x.count > 0)); };

  const checkout = async () => {
    if (!cart.length || !address.trim() || loading) return;
    setLoading(true);
    try {
      const tg = window.Telegram?.WebApp;
      const r = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart, address: address.trim(), initData: tg?.initData || "" }) });
      if (!r.ok) throw new Error();
      haptic("success"); setCart([]); setAddress(""); setCartOpen(false); setCombo(0); setSuccess(true);
    } catch { setToast("Не удалось отправить заказ"); haptic("medium"); }
    finally { setLoading(false); }
  };

  return <main className="shop">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar"><div><div className="eyebrow">FLOWER CLUB</div><h1>Собери свой букет</h1></div>{combo > 0 && <div className="combo">🔥 <b>x{combo}</b></div>}</header>

    <section className="hero-card"><div className="hero-copy"><span className="hero-kicker">🌷 Сегодняшний букет</span><h2>Добавляй цветы<br />и получай настроение</h2><p>Собери композицию из любимых цветов.</p><div className="progress-row"><div className="progress"><span style={{ width: `${Math.min(count / 5, 1) * 100}%` }} /></div><b>{Math.min(count, 5)}/5</b></div></div><div className="hero-flower">💐</div></section>

    <nav className="categories">{CATEGORIES.map(c => <button key={c} className={category === c ? "category active" : "category"} onClick={() => { haptic(); setCategory(c); }}>{c}</button>)}</nav>

    <section className="product-grid">{products.map(p => { const item = cart.find(x => x.id === p.id); return <article key={p.id} className={`product-card ${lastAdded === p.id ? "added" : ""}`} onClick={() => setSelected(p)}>
      <div className="product-image">{p.image ? <img src={p.image} alt={p.name} /> : <span>🌸</span>}{p.badge && <span className="badge">{p.badge}</span>}<button className="add-button" onClick={e => { e.stopPropagation(); add(p); }}>{item ? item.count : "+"}</button></div>
      <div className="product-info"><h3>{p.name}</h3><p>{p.description}</p><strong>{money(p.price)}</strong></div>
    </article>; })}</section>

    {cart.length > 0 && <button className="floating-cart" onClick={() => setCartOpen(true)}><span className="cart-icon">🛍️</span><span className="cart-label"><small>{count} {count === 1 ? "цветок" : "цветов"}</small><b>Открыть букет</b></span><strong>{money(total)}</strong></button>}
    {toast && <div className="toast">{toast}</div>}

    {selected && <div className="overlay" onClick={() => setSelected(null)}><section className="sheet product-sheet" onClick={e => e.stopPropagation()}><div className="sheet-handle" /><div className="detail-image">{selected.image ? <img src={selected.image} alt={selected.name} /> : <span>🌸</span>}</div><div className="detail-content"><span className="hero-kicker">Свежие цветы</span><h2>{selected.name}</h2><p>{selected.description}</p><div className="detail-bottom"><strong>{money(selected.price)}</strong><button className="primary-button" onClick={() => { add(selected); setSelected(null); }}>Добавить 🌸</button></div></div></section></div>}

    {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><section className="sheet cart-sheet" onClick={e => e.stopPropagation()}><div className="sheet-handle" /><div className="sheet-title"><div><span className="hero-kicker">Твой букет</span><h2>Почти готово 💐</h2></div><button className="close-button" onClick={() => setCartOpen(false)}>×</button></div>
      <div className="bouquet-progress"><div className="bouquet-orbit">{cart.slice(0, 5).map((x, i) => <span key={x.id} style={{ transform: `rotate(${i * 72}deg) translateY(-42px)` }}><span>🌸</span></span>)}</div><p>{count >= 5 ? "Букет собран! Можно оформлять 🎉" : `Добавь ещё ${5 - Math.min(count, 5)} ${5 - Math.min(count, 5) === 1 ? "цветок" : "цветка"}`}</p></div>
      <div className="cart-list">{cart.map(x => <div className="cart-item" key={x.id}><div className="cart-thumb">{x.image ? <img src={x.image} alt="" /> : "🌸"}</div><div className="cart-item-main"><strong>{x.name}</strong><span>{money(x.price)}</span></div><div className="quantity"><button onClick={() => change(x.id, -1)}>−</button><b>{x.count}</b><button onClick={() => change(x.id, 1)}>+</button></div></div>)}</div>
      <label className="address-label">Адрес доставки<textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Улица, дом, квартира..." rows={2} /></label>
      <div className="checkout-row"><div><small>Итого</small><strong>{money(total)}</strong></div><button className="primary-button checkout-button" disabled={!address.trim() || loading} onClick={checkout}>{loading ? "Отправляем..." : "Заказать →"}</button></div>
    </section></div>}

    {success && <div className="success-screen"><div className="confetti">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties}>✦</i>)}</div><div className="success-bloom">💐</div><span className="hero-kicker">FLOWER CLUB</span><h2>Букет уже собирается!</h2><p>Заказ отправлен. Скоро с тобой свяжутся для подтверждения доставки.</p><button className="primary-button" onClick={() => setSuccess(false)}>Вернуться в магазин</button></div>}
  </main>;
}
