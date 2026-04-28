'use client';
import { useEffect, useState, useCallback } from 'react';

// Стабильные фото с Unsplash
const PRODUCTS = [
  { 
    id: 1, 
    name: 'Красные розы', 
    price: 1500, 
    image_url: 'https://unsplash.com' 
  },
  { 
    id: 2, 
    name: 'Белые лилии', 
    price: 2000, 
    image_url: 'https://unsplash.com' 
  },
  { 
    id: 3, 
    name: 'Нежные тюльпаны', 
    price: 1200, 
    image_url: 'https://unsplash.com' 
  },
  { 
    id: 4, 
    name: 'Пионы', 
    price: 2500, 
    image_url: 'https://unsplash.com' 
  }
];

export default function FlowerShop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  const addToCart = (p: any) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? {...i, count: i.count + 1} : i);
      return [...prev, {...p, count: 1}];
    });
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.count, 0);

  const onCheckout = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!address.trim()) return tg.showAlert('Введите адрес и телефон!');
    
    tg.MainButton.showProgress();
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, address, initData: tg.initData })
    });

    if (res.ok) {
      tg.showAlert('🌸 Заказ принят! Спасибо.');
      setCart([]); setAddress(''); setIsCartOpen(false);
      tg.MainButton.hide();
    } else {
      tg.showAlert('Ошибка сервера. Попробуйте еще раз.');
    }
    tg.MainButton.hideProgress();
  }, [cart, address]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    if (cart.length > 0) {
      tg.MainButton.setParams({ 
        text: isCartOpen ? 'ПОДТВЕРДИТЬ ЗАКАЗ' : `ОФОРМИТЬ (${totalPrice}₽)`, 
        is_visible: true,
        color: '#2ecc71'
      });
      tg.MainButton.onClick(isCartOpen ? onCheckout : () => setIsCartOpen(true));
    } else tg.MainButton.hide();
    return () => { tg.MainButton.offClick(onCheckout); tg.MainButton.offClick(() => setIsCartOpen(true)); };
  }, [cart, totalPrice, isCartOpen, onCheckout]);

  return (
    <div style={{ 
      padding: '16px', 
      background: 'var(--tg-theme-bg-color, white)', 
      minHeight: '100vh', 
      color: 'var(--tg-theme-text-color, black)',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ textAlign: 'center' }}>Наши Букеты 🌸</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ 
            background: 'var(--tg-theme-secondary-bg-color, #f9f9f9)', 
            padding: '10px', 
            borderRadius: '16px', 
            textAlign: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <img src={p.image_url} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px' }} alt={p.name} />
            <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>{p.name}</p>
            <p style={{ margin: '0 0 8px', color: 'var(--tg-theme-link-color, #248b65)' }}>{p.price} ₽</p>
            <button 
              onClick={() => addToCart(p)}
              style={{ 
                width: '100%', 
                background: 'var(--tg-theme-button-color, #3498db)', 
                color: 'var(--tg-theme-button-text-color, white)',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            > Добавить </button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'var(--tg-theme-bg-color, white)', zIndex: 100, padding: '20px' 
        }}>
          <h3>Ваша корзина</h3>
          {cart.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{i.name} x{i.count}</span>
              <span>{i.price * i.count}₽</span>
            </div>
          ))}
          <h3 style={{ textAlign: 'right', marginTop: '20px' }}>Итого: {totalPrice}₽</h3>
          <p>Адрес и контактный телефон:</p>
          <textarea 
            placeholder="Например: Минск, ул. Цветочная 5, кв. 10. Тел: +375..." 
            value={address} 
            onChange={e => setAddress(e.target.value)}
            style={{ 
              width: '100%', height: '100px', margin: '10px 0', padding: '10px', 
              borderRadius: '12px', border: '1px solid #ccc', boxSizing: 'border-box' 
            }}
          />
          <button 
            onClick={() => setIsCartOpen(false)} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#e74c3c', color: 'white' }}
          >Назад к покупкам</button>
        </div>
      )}
      <div style={{ height: '80px' }}></div>
    </div>
  );
}





