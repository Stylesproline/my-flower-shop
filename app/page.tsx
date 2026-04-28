'use client';
import { useEffect, useState, useCallback, useRef } from 'react';

// Типизация для надежности
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  count?: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Красные розы', price: 1500, image_url: 'https://unsplash.com' },
  { id: 2, name: 'Белые лилии', price: 2000, image_url: 'https://unsplash.com' },
  { id: 3, name: 'Нежные тюльпаны', price: 1200, image_url: 'https://unsplash.com' },
  { id: 4, name: 'Пионы', price: 2500, image_url: 'https://unsplash.com' }
];

export default function FlowerShop() {
  const [cart, setCart] = useState<Product[]>([]);
  const [address, setAddress] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const tgRef = useRef<any>(null);

  // Инициализация Telegram SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tgRef.current = tg;
      tg.ready();
      tg.expand();
    }
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * (item.count || 1), 0);

  // Оформление заказа
  const handleCheckout = useCallback(async () => {
    const tg = tgRef.current;
    if (!isCartOpen) {
      setIsCartOpen(true);
      return;
    }

    if (!address.trim()) {
      tg?.showAlert('Пожалуйста, введите адрес и телефон!');
      return;
    }

    tg?.MainButton.showProgress();
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, address, initData: tg?.initData })
      });

      if (res.ok) {
        tg?.showAlert('🌸 Заказ принят! Мы скоро свяжемся с вами.');
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

  // Синхронизация MainButton
  useEffect(() => {
    const tg = tgRef.current;
    if (!tg) return;

    if (cart.length > 0) {
      tg.MainButton.setParams({
        text: isCartOpen ? 'ПОДТВЕРДИТЬ ЗАКАЗ' : `В КОРЗИНУ (${totalPrice} ₽)`,
        is_visible: true,
        color: '#2ecc71'
      });
      tg.MainButton.onClick(handleCheckout);
    } else {
      tg.MainButton.hide();
    }

    return () => tg.MainButton.offClick(handleCheckout);
  }, [cart, isCartOpen, totalPrice, handleCheckout]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? { ...i, count: (i.count || 1) + 1 } : i);
      return [...prev, { ...p, count: 1 }];
    });
  };

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Магазин Цветов 🌸</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', borderRadius: '16px', padding: '10px', textAlign: 'center', background: '#fcfcfc' }}>
            <img src={p.image_url} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px' }} alt={p.name} />
            <div style={{ fontWeight: 'bold', margin: '8px 0' }}>{p.name}</div>
            <div style={{ color: '#2ecc71', marginBottom: '10px' }}>{p.price} ₽</div>
            <button 
              onClick={() => addToCart(p)}
              style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '10px', background: '#3498db', color: 'white', fontWeight: 'bold' }}
            >Добавить</button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3>Ваша корзина</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span>{item.name} x{item.count}</span>
                <span>{item.price * (item.count || 1)} ₽</span>
              </div>
            ))}
            <h3 style={{ textAlign: 'right' }}>Итого: {totalPrice} ₽</h3>
            <textarea 
              placeholder="Введите адрес доставки и номер телефона"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', marginTop: '10px', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ width: '100%', padding: '15px', border: 'none', borderRadius: '12px', background: '#95a5a6', color: 'white', fontWeight: 'bold', marginTop: '10px' }}
          >Назад в магазин</button>
        </div>
      )}
      <div style={{ height: '80px' }} />
    </div>
  );
}

