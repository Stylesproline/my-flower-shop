'use client';
import { useEffect, useState, useCallback } from 'react';

export default function FlowerShop() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Загрузка товаров из API
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  // 2. Логика оформления заказа
  const handleCheckout = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || cart.length === 0) return;

    tg.MainButton.showProgress();

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart,
          initData: tg.initData,
        }),
      });

      if (response.ok) {
        tg.showAlert('🌸 Заказ успешно отправлен!');
        setCart([]);
      } else {
        tg.showAlert('Ошибка при оформлении заказа.');
      }
    } catch (e) {
      tg.showAlert('Ошибка связи с сервером.');
    } finally {
      tg.MainButton.hideProgress();
      tg.MainButton.hide();
    }
  }, [cart]);

  // 3. Управление кнопкой Telegram "Оплатить"
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      tg.MainButton.text = `КУПИТЬ: ${total} ₽`;
      tg.MainButton.show();
      tg.MainButton.onClick(handleCheckout);
    } else {
      tg.MainButton.hide();
    }

    return () => tg.MainButton.offClick(handleCheckout);
  }, [cart, handleCheckout]);

  if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>Загрузка магазина...</div>;

  return (
    <main style={{ 
      padding: '16px', 
      backgroundColor: 'var(--tg-theme-bg-color)', 
      color: 'var(--tg-theme-text-color)',
      minHeight: '100vh' 
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Магазин Цветов 🌸</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {products.map(product => (
          <div key={product.id} style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderRadius: '12px',
            padding: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <img 
              src={product.image_url || 'https://placeholder.com'} 
              style={{ width: '100%', borderRadius: '8px', marginBottom: '8px', height: '120px', objectFit: 'cover' }} 
            />
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{product.name}</div>
            <div style={{ fontSize: '16px', color: 'var(--tg-theme-link-color)', marginBottom: '8px' }}>{product.price} ₽</div>
            
            <button 
              onClick={() => setCart([...cart, product])}
              style={{
                backgroundColor: 'var(--tg-theme-button-color)',
                color: 'var(--tg-theme-button-text-color)',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold'
              }}
            >
              Добавить
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          textAlign: 'center', 
          color: 'var(--tg-theme-hint-color)',
          fontSize: '14px' 
        }}>
          В корзине товаров: {cart.length}
        </div>
      )}
    </main>
  );
}




