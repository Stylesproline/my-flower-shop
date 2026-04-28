'use client';
import { useEffect, useState, useCallback } from 'react';

export default function FlowerShop() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      setProducts(data);
      setLoading(false);
    });
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, count: item.count + 1 } : item);
      }
      return [...prev, { ...product, count: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, count: item.count - 1 } : item).filter(item => item.count > 0));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0);

  const onCheckout = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!address.trim()) {
      tg.showAlert('Пожалуйста, введите адрес и телефон!');
      return;
    }

    tg.MainButton.showProgress();
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, address, initData: tg.initData })
    });

    if (res.ok) {
      tg.MainButton.hide();
      tg.showAlert('🌸 Заказ принят! Мы скоро свяжемся с вами.');
      setCart([]);
      setAddress('');
      setIsCartOpen(false);
    } else {
      tg.showAlert('Ошибка при оформлении заказа');
    }
    tg.MainButton.hideProgress();
  }, [cart, address]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (cart.length > 0 && !isCartOpen) {
      tg.MainButton.setParams({ text: `КОРЗИНА (${totalPrice} ₽)`, is_visible: true, color: '#2ecc71' });
      tg.MainButton.onClick(() => setIsCartOpen(true));
    } else if (cart.length > 0 && isCartOpen) {
      tg.MainButton.setParams({ text: `ПОДТВЕРДИТЬ ЗАКАЗ`, is_visible: true, color: '#2ecc71' });
      tg.MainButton.onClick(onCheckout);
    } else {
      tg.MainButton.hide();
    }
    return () => {
      tg?.MainButton.offClick(onCheckout);
      tg?.MainButton.offClick(() => setIsCartOpen(true));
    };
  }, [cart, totalPrice, isCartOpen, onCheckout]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка магазина...</div>;

  return (
    <main style={{ padding: '16px', background: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Букеты 🌸</h1>
        <button onClick={() => setIsCartOpen(true)} style={{ padding: '10px', borderRadius: '12px', border: 'none', background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}>
          🛒 {cart.length}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {products.map(p => (
          <div key={p.id} style={{ background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '16px', padding: '10px', textAlign: 'center' }}>
            <img src={p.image_url} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
            <div style={{ margin: '8px 0', fontWeight: 'bold' }}>{p.name}</div>
            <div style={{ color: 'var(--tg-theme-link-color)' }}>{p.price} ₽</div>
            <button onClick={() => addToCart(p)} style={{ width: '100%', marginTop: '10px', borderRadius: '10px', border: 'none', padding: '8px', background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)', fontWeight: 'bold' }}>+ В корзину</button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--tg-theme-bg-color)', borderRadius: '20px', padding: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Ваш заказ</h2>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span>{item.name} x{item.count}</span>
                <div>
                  <button onClick={() => removeFromCart(item.id)}>-</button>
                  <span style={{ margin: '0 10px' }}>{item.price * item.count} ₽</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>
              </div>
            ))}
            <h3 style={{ textAlign: 'right' }}>Итого: {totalPrice} ₽</h3>
            
            <p>Контактные данные:</p>
            <textarea
              placeholder="Введите номер телефона и адрес доставки..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #555', background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)', boxSizing: 'border-box' }}
              rows={4}
            />
            
            <button onClick={() => setIsCartOpen(false)} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '12px', border: 'none', background: '#e74c3c', color: 'white', fontWeight: 'bold' }}>Назад к цветам</button>
          </div>
        </div>
      )}
    </main>
  );
}

