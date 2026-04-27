'use client';

import { useEffect, useState, useCallback } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

export default function FlowerShop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      // Установка цвета заголовка в тон темы
      tg.setHeaderColor('secondary_bg_color');
    }

    // Загрузка товаров из нашего API
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error('Ошибка загрузки товаров:', err));
  }, []);

  // Функция оформления заказа
  const handleOrder = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || cart.length === 0) return;

    tg.MainButton.showProgress();

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart,
          initData: tg.initData, // Передаем данные для проверки на сервере
        }),
      });

      if (response.ok) {
        tg.showAlert('🌸 Заказ успешно оформлен! Бот прислал подтверждение.');
        setCart([]); // Очистка корзины
      } else {
        tg.showAlert('Ошибка при оформлении заказа. Попробуйте позже.');
      }
    } catch (error) {
      tg.showAlert('Произошла ошибка связи с сервером.');
    } finally {
      tg.MainButton.hideProgress();
    }
  }, [cart]);

  // Управление Главной Кнопкой Telegram (MainButton)
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      tg.MainButton.setParams({
        text: `ОФОРМИТЬ ЗАКАЗ — ${total} ₽`,
        color: tg.themeParams.button_color || '#248b65',
        is_visible: true,
      });
      tg.MainButton.onClick(handleOrder);
    } else {
      tg.MainButton.hide();
    }

    // Чистим обработчик при обновлении корзины, чтобы не было дублей
    return () => {
      tg.MainButton.offClick(handleOrder);
    };
  }, [cart, handleOrder]);

  if (loading) {
    return <div style={{ color: 'var(--tg-theme-text-color)', padding: '20px', textAlign: 'center' }}>Загрузка каталога...</div>;
  }

  return (
    <main style={{ 
      padding: '16px', 
      minHeight: '100vh', 
      backgroundColor: 'var(--tg-theme-bg-color)',
      color: 'var(--tg-theme-text-color)',
      fontFamily: 'sans-serif'
    }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Магазин Цветов 🌸</h1>
        <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>Свежие букеты с доставкой</p>
      </header>

      <div style={{ display: 'grid', gap: '16px' }}>
        {products.map((product) => (
          <div key={product.id} style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            {/* Изображение товара */}
            <div style={{ width: '100%', height: '180px', backgroundColor: '#eee', position: 'relative' }}>
              <img 
                src={product.image_url || 'https://placeholder.com'} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Контент карточки */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{product.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{product.price} ₽</span>
                <button 
                  onClick={() => setCart([...cart, product])}
                  style={{
                    backgroundColor: 'var(--tg-theme-button-color)',
                    color: 'var(--tg-theme-button-text-color)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Индикатор пустой корзины */}
      {cart.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px', 
          color: 'var(--tg-theme-hint-color)' 
        }}>
          Выберите цветы, чтобы начать заказ
        </div>
      )}

      {/* Отступ снизу, чтобы контент не перекрывался кнопкой Telegram */}
      <div style={{ height: '80px' }} />
    </main>
  );
}

