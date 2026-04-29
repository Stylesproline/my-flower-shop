'use client';
import { useEffect, useState } from 'react';

// ТОВАРЫ С ОПИСАНИЕМ
const PRODUCTS = [
  { 
    id: 1, 
    name: 'Красные розы', 
    price: 150, 
    desc: 'Классические кенийские розы с тонким ароматом.',
    image: 'https://cdn4.telesco.pe/file/akqi47LPnkxhNLYl1gLp2uzTBfHwWFxVMGHW4L_4CUxVnhqSgEUbkP1-Yb4JofHb1HkbrTOQT3X-NkQh-ilF-heNq-sVyhIh0rKYuzDxvohpmH-2SN7A3jBmDlqIni_rhpDbGtApoZkoJpZwJP1L6qeRW9JlvA6iyLdlPagZC_130IePAltg6ddA70v0sZNhl0b-G7KxK1Snm1uAIyFRVA2q7sG28WzjsgLMpNKVrrV5qDBbN4iNBT0rXuN3ubiy0KH6hEbiNpTZpg4yKY3ZXDYYU9DbiAj1XH3BycCXbYwSwPWcDK6T2nXjeD22yqVBII1mWMtnHNyhTVV7prxgZg.jpg' 
  },
  { 
    id: 2, 
    name: 'Белые лилии', 
    price: 200, 
    desc: 'Королевские лилии. Символ чистоты и свежести.',
    image: 'https://cdn4.telesco.pe/file/X0zdaAeToHxbGWma1G0xpWJkFyxVSkJ8PJdXweZYytXOvWw40vQEyoFYTsj7Hpw0KxIy3yULzWB8xs5hZr5Vv6OGAW6jdMTkgBj_FwyvpuNqAbBGPTdfn2Y8ysW89-r26s9w4SbRKuANXWMzJYCPBp6yU1AsF63IdcCi7UUFOgHQFPlmTEiA8UmO5BTWmPQDq-Mmmk8QNIeU_yOXB-GOLw2NSbkZNdHK_ZVf0BDJZuCetgXu3xVqlmz5NdCJfPVSRZMiXCwxCgoll2cYFdar-PHKzBqutPIEjMxGTJZ3FtntCJgf5w0-G7YHdbijygbUhXNemywiYyHqQ11jz0O0tA.jpg' 
  },
  { 
    id: 3, 
    name: 'Гортензии', 
    price: 320, 
    desc: 'Объемный букет небесно-голубого цвета.',
    image: 'https://cdn4.telesco.pe/file/JnBnBHTQIbGeat3jbRBzBXuHjcG01v_pfcHD6k3-PGOn3XaB1ZYnWEwLVz0_zergwNujdKrcvwRN4gPlLylzQc-MESjydBI0EgbbylJ64hGu5zF0w3CHVth84R3A-BhdUSf1OVjyuRCV_zNynugxC24RCJ29mTaKmtpODLwmtrHyU_1zxS_1dtMg43qZERyT4IQApfH_op4fXUT2Kbfe5lfILBFyUL-pnkxTpbJpCHmh_yDbM20eO1x8L7wC1chEio_XjqXvucwGGVkCF1WMgGGqCSoO-YezOiUhfjRIPfCKOXUdKLZWSKC9cgADO1Y7VIRwYM9uchqS0zDLxj83rw.jpg' 
  }
];

export default function Shop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showCart, setShowCart] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.count, 0);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  const handleAdd = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, count: i.count + 1} : i);
      return [...prev, {...p, count: 1}];
    });
  };

  const handleCheckout = async () => {
    if (!address.trim()) return alert('Введите адрес!');
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, address })
    });
    if (res.ok) {
      alert('🌸 Заказ успешно отправлен!');
      setCart([]); setAddress(''); setShowCart(false);
    }
  };

  return (
    <div style={{ 
      padding: '0 16px 100px', 
      background: 'var(--tg-theme-bg-color, #f0f2f5)', 
      color: 'var(--tg-theme-text-color, #000)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* HEADER С ЭФФЕКТОМ РАЗМЫТИЯ */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 10,
        padding: '16px 0',
        backdropFilter: 'blur(10px)',
        background: 'var(--tg-theme-bg-color, rgba(255,255,255,0.8))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Цветочный 🌸</h2>
        {cart.length > 0 && (
          <button onClick={() => setShowCart(true)} style={{ 
            padding: '8px 16px', borderRadius: '20px', 
            background: 'var(--tg-theme-button-color, #3498db)', 
            color: 'var(--tg-theme-button-text-color, white)',
            border: 'none', fontWeight: 'bold', fontSize: '14px'
          }}>
            Корзина ({cart.length})
          </button>
        )}
      </header>

      {/* СЕТКА ТОВАРОВ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ 
            background: 'var(--tg-theme-secondary-bg-color, white)', 
            borderRadius: '20px', 
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <img src={p.image} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>{p.name}</div>
              <div style={{ 
                fontSize: '11px', color: 'var(--tg-theme-hint-color, #888)', 
                margin: '4px 0 8px', lineHeight: '1.2' 
              }}>
                {p.desc}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--tg-theme-link-color, #2ecc71)' }}>{p.price}₽</span>
                <button 
                  onClick={() => handleAdd(p)} 
                  style={{ 
                    padding: '6px 12px', borderRadius: '12px', 
                    background: 'var(--tg-theme-button-color, #007bff)', 
                    color: 'var(--tg-theme-button-text-color, white)',
                    border: 'none', fontSize: '12px', fontWeight: 'bold'
                  }}
                > + </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛКА КОРЗИНЫ */}
      {showCart && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'var(--tg-theme-bg-color, white)',
          padding: '24px', display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Ваш заказ</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(i => (
              <div key={i.id} style={{ 
                display: 'flex', justifyContent: 'space-between', 
                padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' 
              }}>
                <span>{i.name} <b>x{i.count}</b></span>
                <span style={{ fontWeight: 'bold' }}>{i.price * i.count}₽</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              Итого: {total}₽
            </div>
            
            <p style={{ marginTop: '30px', fontWeight: 'bold', fontSize: '14px' }}>Куда и кому везти?</p>
            <textarea 
              placeholder="Адрес, подъезд, телефон..." 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              style={{ 
                width: '100%', height: '100px', padding: '15px', 
                marginTop: '10px', borderRadius: '15px', 
                border: '1px solid var(--tg-theme-hint-color, #ccc)', 
                background: 'var(--tg-theme-secondary-bg-color, #f9f9f9)',
                color: 'var(--tg-theme-text-color, black)',
                boxSizing: 'border-box' 
              }} 
            />
          </div>
          
          <button onClick={handleCheckout} style={{ 
            width: '100%', padding: '16px', 
            background: 'var(--tg-theme-button-color, #2ecc71)', 
            color: 'var(--tg-theme-button-text-color, white)',
            border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '16px'
          }}>
            ОФОРМИТЬ ЗАКАЗ
          </button>
          <button onClick={() => setShowCart(false)} style={{ 
            width: '100%', padding: '12px', marginTop: '8px',
            background: 'transparent', color: 'var(--tg-theme-link-color, #3498db)',
            border: 'none', fontWeight: 'bold'
          }}>
            Вернуться назад
          </button>
        </div>
      )}
    </div>
  );
}

