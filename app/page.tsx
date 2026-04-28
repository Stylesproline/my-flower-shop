'use client';
import { useEffect, useState } from 'react';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Подключаем Telegram
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    // Пробуем загрузить товары
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Ошибка API:", err));
  }, []);

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Магазин Цветов 🌸</h1>
      {products.length === 0 ? (
        <p>Загрузка товаров...</p>
      ) : (
        products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '10px' }}>
            <h3>{p.name}</h3>
            <p>{p.price} ₽</p>
          </div>
        ))
      )}
    </main>
  );
}


