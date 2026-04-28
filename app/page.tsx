'use client';
import { useEffect, useState, useCallback, useRef } from 'react';

// Описываем интерфейсы прямо здесь, чтобы не было ошибок сборки
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  count: number;
}

const PRODUCTS_DATA = [
  { id: 1, name: 'Красные розы', price: 1500, image_url: 'https://unsplash.com' },
  { id: 2, name: 'Белые лилии', price: 2000, image_url: 'https://unsplash.com' },
  { id: 3, name: 'Нежные тюльпаны', price: 1200, image_url: 'https://unsplash.com' },
  { id: 4, name: 'Пионы', price: 2500, image_url: 'https://unsplash.com' }
];

export default function FlowerShop() {
  const [cart, setCart] = useState<Product[]>([]);
  const [address, setAddress] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const tgRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tgRef.current = tg;
      tg.ready();
      tg.expand();
      setIsReady(true);
    }
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0);

  const handleCheckout = useCallback(async () => {
    const tg = tgRef.current;
    if (!isCartOpen) {
      setIsCartOpen(true);
      return;
    }

    if (!address.trim()) {
      tg?.showAlert('Пожалуйста, введите контакты!');
      return;
    }

    tg?.MainButton.showProgress();
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, address, initData: tg?.initData }),
      });

      if (res.ok) {
        tg?.showAlert('🌸 Заказ отправлен!');
        setCart([]);
        setAddress('');
        setIsCartOpen(false);
      }
    } catch (e) {
      tg?.showAlert('Ошибка сети');
    } finally {
      tg?.MainButton.hideProgress();
    }
  }, [isCartOpen, cart, address]);

  useEffect(() => {
    const tg = tgRef.current;
    if (!tg || !isReady) return;

    if (cart.length > 0) {
      tg.MainButton.setParams({
        text: isCartOpen ? 'ПОДТВЕРДИТЬ' : `КОРЗИНА (${totalPrice} ₽)`,
        is_visible: true,
        color: '#2ecc71'
      });
      tg.MainButton.onClick(handleCheckout);
    } else {
      tg.MainButton.hide();
    }

    return () => tg.MainButton.offClick(handleCheckout);
  }, [cart, isCartOpen, totalPrice, handleCheckout, isReady]);

  const addToCart = (p: any) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? { ...i, count: i.count + 1 } : i);
      return [...prev, { ...p, count: 1 }];
    });
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center' }}>Магазин 🌸</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PRODUCTS_DATA.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
            <img src={p.image_url} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} alt="" />
            <div style={{ fontWeight: 'bold', fontSize: '14px', margin: '5px 0' }}>{p.name}</div>
            <div style={{ color: '#2ecc71', fontSize: '14px' }}>{p.price} ₽</div>
            <button 
              onClick={() => addToCart(p)}
              style={{ width: '100%', marginTop: '5px', padding: '8px', border: 'none', borderRadius: '8px', backgroundColor: '#3498db', color: '#fff' }}
            >+ Купить</button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 1000, padding: '20px' }}>
          <h3>Ваш заказ:</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.name} x{item.count}</span>
              <span>{item.price * item.count} ₽</span>
            </div>
          ))}
          <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '10px' }}>Итого: {totalPrice} ₽</div>
          <textarea 
            placeholder="Адрес и телефон"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', height: '80px', marginTop: '15px', padding: '10px', boxSizing: 'border-box' }}
          />
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#eee', border: 'none', borderRadius: '8px' }}
          >Назад</button>
        </div>
      )}
    </div>
  );
}

