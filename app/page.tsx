'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';

// ТВОИ ТОВАРЫ
const PRODUCTS = [
  { id: 1, category: 'Розы', name: 'Красный Наоми', price: 150, desc: '11 роз с крупным бутоном', image: 'https://telesco.pe' },
  { id: 2, category: 'Лилии', name: 'Желтая Азия', price: 210, desc: 'Нежный аромат и стойкость до 2 недель', image: 'https://telesco.pe' },
  { id: 3, category: 'Букеты', name: 'Гортензия Микс', price: 72, desc: 'Объемный букет для особого случая', image: 'https://telesco.pe' },
  { id: 4, category: 'Розы', name: 'Белый Шоколад', price: 170, desc: 'Белоснежные розы высшего сорта', image: 'https://telesco.pe' },
  { id: 5, category: 'Букеты', name: 'Полевой сон', price: 120, desc: 'Ромашки и сухоцветы в крафте', image: 'https://telesco.pe' },
];

const CATEGORIES = ['Все', 'Розы', 'Лилии', 'Букеты'];

export default function Shop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [debug, setDebug] = useState('Инициализация...');

  // 1. Проверка Telegram SDK
  useEffect(() => {
    const init = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (tg.initData) {
          setDebug(`✅ OK. Пользователь: ${tg.initDataUnsafe?.user?.first_name || 'Найдён'}`);
        } else {
          setDebug('❌ Объект TG есть, но initData пуст (запуск вне Mini App?)');
        }
      } else {
        setDebug('❌ Скрипт Telegram не найден');
      }
    };
    init();
    setTimeout(init, 1000); // Повторная проверка через секунду
  }, []);

  const filteredProducts = useMemo(() => {
    return activeCategory === 'Все' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const total = cart.reduce((s, i) => s + i.price * i.count, 0);

  const handleAdd = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, count: i.count + 1} : i);
      return [...prev, {...p, count: 1}];
    });
  };

  const handleCheckout = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!address.trim()) return alert('Введите адрес и телефон!');

    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cart, 
        address, 
        initData: tg?.initData || "" // ПЕРЕДАЕМ ДАННЫЕ СЮДА
      })
    });

    if (res.ok) {
      alert('🌸 Заказ отправлен!');
      setCart([]); setAddress(''); setShowCart(false);
    }
  };

  return (
    <div style={{ padding: '0 16px 120px', background: 'var(--tg-theme-bg-color, #f5f5f7)', color: 'var(--tg-theme-text-color, #000)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* ДИАГНОСТИКА (Удали потом, когда всё заработает) */}
      <div style={{ fontSize: '10px', color: 'red', padding: '10px 0', borderBottom: '1px solid red' }}>
        {debug}
      </div>

      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--tg-theme-bg-color, #f5f5f7)', padding: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0 }}>Магазин 🌸</h2>
          {cart.length > 0 && (
            <div onClick={() => setShowCart(true)} style={{ background: 'var(--tg-theme-button-color, #007aff)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
              🛒 {cart.reduce((a, b) => a + b.count, 0)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '16px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '8px 16px', borderRadius: '15px', border: 'none', background: activeCategory === cat ? 'black' : '#e5e5ea', color: activeCategory === cat ? 'white' : 'black', whiteSpace: 'nowrap', fontWeight: '600' }}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
        {filteredProducts.map(p => (
          <div key={p.id} style={{ background: 'var(--tg-theme-secondary-bg-color, #fff)', borderRadius: '24px', padding: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <img src={p.image} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '18px' }} />
            <div style={{ fontWeight: '700', fontSize: '15px', marginTop: '10px' }}>{p.name}</div>
            <div style={{ fontSize: '11px', color: '#8e8e93', margin: '4px 0', flex: 1 }}>{p.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontWeight: '800', color: '#34c759' }}>{p.price}₽</span>
              <button onClick={() => handleAdd(p)} style={{ background: '#007aff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#fff', fontSize: '18px' }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--tg-theme-bg-color, #fff)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '800' }}>Ваш заказ</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e5e5ea' }}>
                <span>{i.name} x{i.count}</span>
                <span>{i.price * i.count}₽</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '22px', fontWeight: '800' }}>Итого: {total}₽</div>
            <textarea placeholder="Адрес и телефон..." value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', height: '100px', padding: '15px', marginTop: '20px', borderRadius: '18px', border: '1px solid #d1d1d6', background: 'var(--tg-theme-secondary-bg-color, #f2f2f7)', color: 'black' }} />
          </div>
          <button onClick={handleCheckout} style={{ width: '100%', padding: '18px', background: '#34c759', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '18px' }}>ОФОРМИТЬ</button>
          <button onClick={() => setShowCart(false)} style={{ width: '100%', padding: '12px', marginTop: '10px', background: 'transparent', color: '#007aff', border: 'none' }}>Назад</button>
        </div>
      )}
    </div>
  );
}

