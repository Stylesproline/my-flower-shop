'use client';
import { useEffect, useState, useCallback, useRef } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Красные розы', price: 1500, image: 'https://unsplash.com' },
  { id: 2, name: 'Белые лилии', price: 2000, image: 'https://unsplash.com' },
  { id: 3, name: 'Тюльпаны', price: 1200, image: 'https://unsplash.com' },
  { id: 4, name: 'Пионы', price: 2500, image: 'https://unsplash.com' }
];

export default function Shop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const tgRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tgRef.current = tg;
      tg.ready();
      tg.expand();
    }
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.count, 0);

  const handleCheckout = useCallback(async () => {
    const tg = tgRef.current;
    if (!isCartOpen) {
      setIsCartOpen(true);
      return;
    }
    if (!address.trim()) return tg?.showAlert('Введите адрес и телефон!');

    tg?.MainButton.showProgress();
    const res = await fetch('/api/order', {
      method: 'POST',
      body: JSON.stringify({ cart, address, initData: tg?.initData })
    });
    if (res.ok) {
      tg?.showAlert('🌸 Заказ принят!');
      setCart([]); setAddress(''); setIsCartOpen(false);
      tg?.MainButton.hide();
    }
    tg?.MainButton.hideProgress();
  }, [cart, address, isCartOpen]);

  useEffect(() => {
    const tg = tgRef.current;
    if (!tg || cart.length === 0) {
      tg?.MainButton.hide();
      return;
    }
    tg.MainButton.setParams({
      text: isCartOpen ? 'ПОДТВЕРДИТЬ ЗАКАЗ' : `В КОРЗИНУ (${total} ₽)`,
      is_visible: true,
      color: '#2ecc71'
    });
    tg.MainButton.onClick(handleCheckout);
    return () => tg.MainButton.offClick(handleCheckout);
  }, [cart, total, isCartOpen, handleCheckout]);

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: 'black', background: 'white', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center' }}>Цветочная Лавка 🌸</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
            <img src={p.image} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            <p style={{ fontWeight: 'bold', margin: '8px 0' }}>{p.name}</p>
            <button 
              style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#3498db', color: 'white', border: 'none' }}
              onClick={() => setCart(prev => {
                const ex = prev.find(i => i.id === p.id);
                return ex ? prev.map(i => i.id === p.id ? {...i, count: i.count + 1} : i) : [...prev, {...p, count: 1}];
              })}
            > {p.price} ₽ </button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', padding: '20px', zIndex: 100 }}>
          <h3>Ваш заказ:</h3>
          {cart.map(i => <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span>{i.name} x{i.count}</span>
            <span>{i.price * i.count} ₽</span>
          </div>)}
          <hr />
          <h4>Итого: {total} ₽</h4>
          <textarea 
            placeholder="Адрес доставки и телефон" 
            value={address} 
            onChange={e => setAddress(e.target.value)}
            style={{ width: '100%', height: '100px', margin: '15px 0', padding: '10px', boxSizing: 'border-box' }}
          />
          <button onClick={() => setIsCartOpen(false)} style={{ width: '100%', padding: '12px', background: '#eee', border: 'none', borderRadius: '8px' }}>Назад в магазин</button>
        </div>
      )}
    </div>
  );
}

