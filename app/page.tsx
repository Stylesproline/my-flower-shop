'use client';
import { useEffect, useState, useCallback } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Красные розы', price: 1500, image_url: 'https://unsplash.com' },
  { id: 2, name: 'Белые лилии', price: 2000, image_url: 'https://unsplash.com' },
  { id: 3, name: 'Тюльпаны', price: 1200, image_url: 'https://unsplash.com' }
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
    if (!address.trim()) return tg.showAlert('Введите адрес!');
    
    tg.MainButton.showProgress();
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, address, initData: tg.initData })
    });

    if (res.ok) {
      tg.showAlert('🌸 Заказ принят!');
      setCart([]); setAddress(''); setIsCartOpen(false);
      tg.MainButton.hide();
    } else {
      tg.showAlert('Ошибка сервера');
    }
    tg.MainButton.hideProgress();
  }, [cart, address]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    if (cart.length > 0) {
      tg.MainButton.setParams({ text: isCartOpen ? 'ПОДТВЕРДИТЬ' : `КОРЗИНА (${totalPrice}₽)`, is_visible: true });
      tg.MainButton.onClick(isCartOpen ? onCheckout : () => setIsCartOpen(true));
    } else tg.MainButton.hide();
    return () => { tg.MainButton.offClick(onCheckout); };
  }, [cart, totalPrice, isCartOpen, onCheckout]);

  return (
    <div style={{ padding: '15px', background: 'white', minHeight: '100vh', color: 'black' }}>
      <h2>Цветы 🌸</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
            <img src={p.image_url} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
            <p>{p.name}</p>
            <button onClick={() => addToCart(p)}> Купить {p.price}₽</button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 100, padding: '20px' }}>
          <h3>Ваша корзина</h3>
          {cart.map(i => <div key={i.id}>{i.name} x{i.count}</div>)}
          <h4 style={{marginTop: '20px'}}>Итого: {totalPrice}₽</h4>
          <textarea 
            placeholder="Адрес и телефон" 
            value={address} 
            onChange={e => setAddress(e.target.value)}
            style={{ width: '100%', height: '80px', margin: '10px 0' }}
          />
          <button onClick={() => setIsCartOpen(false)} style={{ width: '100%', background: '#ccc' }}>Назад</button>
        </div>
      )}
    </div>
  );
}

