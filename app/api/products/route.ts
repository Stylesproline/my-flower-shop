'use client';
import { useEffect, useState, useCallback } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Красные розы', price: 1500, image_url: 'https://unsplash.com' },
  { id: 2, name: 'Белые лилии', price: 2000, image_url: 'https://unsplash.com' },
  { id: 3, name: 'Нежные тюльпаны', price: 1200, image_url: 'https://unsplash.com' },
  { id: 4, name: 'Пионы', price: 2500, image_url: 'https://unsplash.com' }
];

export default function FlowerShop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Инициализация
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const addToCart = (p: any) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? {...i, count: i.count + 1} : i);
      return [...prev, {...p, count: 1}];
    });
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.count, 0);

  // Главная функция для кнопки Telegram
  const handleMainButtonClick = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (!isCartOpen) {
      setIsCartOpen(true);
    } else {
      if (!address.trim()) {
        tg.showAlert('Пожалуйста, введите адрес и телефон!');
        return;
      }
      
      tg.MainButton.showProgress();
      try {
        const res = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, address, initData: tg.initData })
        });

        if (res.ok) {
          tg.showAlert('🌸 Заказ принят! Мы скоро свяжемся с вами.');
          setCart([]);
          setAddress('');
          setIsCartOpen(false);
          tg.MainButton.hide();
        } else {
          tg.showAlert('Ошибка сервера. Попробуйте еще раз.');
        }
      } catch (e) {
        tg.showAlert('Ошибка сети.');
      } finally {
        tg.MainButton.hideProgress();
      }
    }
  }, [isCartOpen, cart, address]);

  // Синхронизация MainButton
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (cart.length > 0) {
      tg.MainButton.setParams({
        text: isCartOpen ? 'ПОДТВЕРДИТЬ ЗАКАЗ' : `КОРЗИНА (${totalPrice} ₽)`,
        is_visible: true,
        color: '#2ecc71'
      });
      tg.MainButton.onClick(handleMainButtonClick);
    } else {
      tg.MainButton.hide();
    }

    return () => {
      tg.MainButton.offClick(handleMainButtonClick);
    };
  }, [cart, isCartOpen, totalPrice, handleMainButtonClick]);

  return (
    <div style={{ padding: '16px', background: 'var(--tg-theme-bg-color, #fff)', minHeight: '100vh', color: 'var(--tg-theme-text-color, #000)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Магазин Цветов 🌸</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)', padding: '10px', borderRadius: '16px', textAlign: 'center' }}>
            <img src={p.image_url} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px' }} alt={p.name} />
            <p style={{ margin: '8px 0 4px', fontWeight: 'bold' }}>{p.name}</p>
            <p style={{ margin: '0 0 8px', color: '#2ecc71' }}>{p.price} ₽</p>
            <button 
              onClick={() => addToCart(p)}
              style={{ width: '100%', background: 'var(--tg-theme-button-color, #3498db)', color: 'var(--tg-theme-button-text-color, #fff)', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}
            > Добавить </button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--tg-theme-bg-color, #fff)', zLayer: 100, padding: '20px' }}>
          <h3>Ваша корзина</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {cart.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{i.name} x{i.count}</span>
                <span>{i.price * i.count}₽</span>
              </div>
            ))}
          </div>
          <h3 style={{ textAlign: 'right' }}>Итого: {totalPrice}₽</h3>
          <p>Введите адрес и телефон:</p>
          <textarea 
            placeholder="Минск, ул. Ленина 1..." 
            value={address} 
            onChange={e => setAddress(e.target.value)}
            style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '12px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <button 
            onClick={() => setIsCartOpen(false)} 
            style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '12px', border: 'none', background: '#e74c3c', color: 'white' }}
          >Назад</button>
        </div>
      )}
      <div style={{ height: '100px' }}></div>
    </div>
  );
}

