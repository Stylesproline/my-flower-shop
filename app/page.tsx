'use client';
import { useEffect, useState, useCallback } from 'react';

export default function FlowerShop() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  // Функция отправки заказа в наш API
  const sendOrder = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || cart.length === 0) return;

    tg.MainButton.showProgress();

    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart,
        initData: tg.initData, // Важно для идентификации пользователя сервером
      }),
    });

    if (response.ok) {
      tg.MainButton.hide();
      tg.showAlert('🌸 Заказ принят! Бот прислал вам подтверждение.');
      setCart([]);
    } else {
      tg.showAlert('Ошибка при оформлении');
    }
    tg.MainButton.hideProgress();
  }, [cart]);

  // Следим за корзиной: если она не пуста — показываем кнопку оплаты в Telegram
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (cart.length > 0) {
      const total = cart.reduce((sum, i) => sum + i.price, 0);
      tg.MainButton.text = `Оплатить ${total} ₽`;
      tg.MainButton.show();
      tg.MainButton.onClick(sendOrder);
    } else {
      tg.MainButton.hide();
    }
    return () => tg.MainButton.offClick(sendOrder);
  }, [cart, sendOrder]);

  return (
    <div style={{ padding: '15px', color: 'var(--tg-theme-text-color)', background: 'var(--tg-theme-bg-color)', minHeight: '100vh' }}>
      <h2>Наши цветы 🌸</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', borderRadius: '12px', padding: '10px' }}>
            <img src={p.image_url} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
            <h3>{p.name}</h3>
            <p>{p.price} ₽</p>
            <button 
              onClick={() => setCart([...cart, p])}
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)', border: 'none', padding: '8px 15px', borderRadius: '8px', width: '100%' }}
            >
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}



