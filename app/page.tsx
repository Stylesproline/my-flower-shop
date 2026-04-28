'use client';
import { useEffect, useState, useCallback } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Красные розы', price: 1500, image: 'https://unsplash.com' },
  { id: 2, name: 'Белые лилии', price: 2000, image: 'https://unsplash.com' },
  { id: 3, name: 'Тюльпаны', price: 1200, image: 'https://unsplash.com' }
];

export default function Shop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showCart, setShowCart] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.count, 0);

  const checkout = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!address.trim()) return tg?.showAlert('Введите адрес!');

    tg?.MainButton.showProgress();
    const res = await fetch('/api/order', {
      method: 'POST',
      body: JSON.stringify({ cart, address, initData: tg?.initData })
    });
    if (res.ok) {
      tg?.showAlert('Заказ принят!');
      setCart([]); setAddress(''); setShowCart(false);
      tg?.MainButton.hide();
    }
    tg?.MainButton.hideProgress();
  }, [cart, address]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();

    if (cart.length > 0) {
      tg.MainButton.setParams({
        text: showCart ? 'ОФОРМИТЬ' : `В КОРЗИНУ (${total}₽)`,
        is_visible: true,
        color: '#2ecc71'
      });
      tg.MainButton.onClick(showCart ? checkout : () => setShowCart(true));
    } else {
      tg.MainButton.hide();
    }
    return () => tg.MainButton.offClick(checkout);
  }, [cart, total, showCart, checkout]);

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: 'black' }}>
      <h2 style={{ textAlign: 'center' }}>Магазин 🌸</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
            <img src={p.image} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            <p style={{fontWeight:'bold'}}>{p.name}</p>
            <button style={{width:'100%', padding:'8px', borderRadius:'8px', background:'#3498db', color:'white', border:'none'}} 
              onClick={() => setCart(prev => {
                const ex = prev.find(i => i.id === p.id);
                return ex ? prev.map(i => i.id === p.id ? {...i, count: i.count+1} : i) : [...prev, {...p, count:1}];
              })}> {p.price}₽ </button>
          </div>
        ))}
      </div>

      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', padding: '20px', zIndex: 100 }}>
          <h3>Корзина</h3>
          {cart.map(i => <div key={i.id} style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}>
            <span>{i.name} x{i.count}</span>
            <span>{i.price * i.count}₽</span>
          </div>)}
          <hr />
          <h4>Итого: {total}₽</h4>
          <textarea placeholder="Адрес и телефон" value={address} onChange={e => setAddress(e.target.value)} 
            style={{ width: '100%', height: '80px', margin: '10px 0', padding: '10px' }} />
          <button onClick={() => setShowCart(false)} style={{ width: '100%', padding: '10px', background: '#eee', border: 'none', borderRadius: '8px' }}>Назад</button>
        </div>
      )}
    </div>
  );
}

