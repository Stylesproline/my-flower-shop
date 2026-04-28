'use client';
import { useEffect, useState } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Красные розы', price: 1500, image: 'https://unsplash.com' },
  { id: 2, name: 'Белые лилии', price: 2000, image: 'https://unsplash.com' },
  { id: 3, name: 'Тюльпаны', price: 1200, image: 'https://unsplash.com' }
];

export default function Shop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showCart, setShowCart] = useState(false);

  // Обычный подсчет суммы
  const total = cart.reduce((s, i) => s + i.price * i.count, 0);

  // Инициализация TG
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  // Добавление (теперь это простая функция)
  const handleAdd = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, count: i.count + 1} : i);
      return [...prev, {...p, count: 1}];
    });
  };

  // Отправка заказа
  const handleCheckout = async () => {
    if (!address.trim()) return alert('Введите адрес!');
    
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, address })
    });

    if (res.ok) {
      alert('🌸 Заказ отправлен!');
      setCart([]);
      setAddress('');
      setShowCart(false);
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: 'black', background: 'white', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Магазин 🌸</h2>
        {cart.length > 0 && (
          <button onClick={() => setShowCart(true)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#2ecc71', color: 'white', border: 'none' }}>
            🛒 {cart.length}
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '12px', textAlign: 'center', background: '#f9f9f9' }}>
            <img src={p.image} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            <p style={{ fontWeight: 'bold', margin: '8px 0' }}>{p.name}</p>
            <p style={{ color: '#2ecc71', marginBottom: '8px' }}>{p.price}₽</p>
            <button 
              onClick={() => handleAdd(p)} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Купить
            </button>
          </div>
        ))}
      </div>

      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', padding: '20px', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <h3>Ваша корзина</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{i.name} x{i.count}</span>
                <span>{i.price * i.count}₽</span>
              </div>
            ))}
            <h4 style={{ textAlign: 'right' }}>Итого: {total}₽</h4>
            <textarea 
              placeholder="Адрес и телефон для связи" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              style={{ width: '100%', height: '100px', padding: '10px', marginTop: '10px', boxSizing: 'border-box' }} 
            />
          </div>
          <button onClick={handleCheckout} style={{ width: '100%', padding: '15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
            ПОДТВЕРДИТЬ ЗАКАЗ
          </button>
          <button onClick={() => setShowCart(false)} style={{ width: '100%', padding: '10px', background: '#eee', border: 'none', borderRadius: '12px' }}>
            Назад
          </button>
        </div>
      )}
    </div>
  );
}

