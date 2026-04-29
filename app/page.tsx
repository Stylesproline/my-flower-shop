'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';

// РАСШИРЕННЫЙ СПИСОК ТОВАРОВ С КАТЕГОРИЯМИ
const PRODUCTS = [
  { id: 1, category: 'Розы', name: 'Красный Наоми', price: 150, desc: '11 роз с крупным бутоном', image: 'https://cdn4.telesco.pe/file/SrJ6ug-hc-RzwCajRdAXB-6NWF2liB_0wPi3DDgDEnxBbpXrU6pJNepFGmdlK12OHAHwuJR_X86xTUOq4a_sUIiA98RhvrxRjUNxLZtHelKDUzjcu6T99_zQ-QTH4lIHre7_xuBX9D_9U7lbvG1xInOX-Ua38LFIqCK7K0XjfRrgdZHFPaqeXg8jVKDrLJnfxubMzOHbLtd4bL8fbAIhzJHLHvp9kHIFXuOusNdX5dx4PJQ9e95NFZHQ8uGvM0YclCrkrp_uC_aKA1ILLEUPDsTvLE2gxcMiimrxlJ49Wg8_x6Kt2JTitdR5jBpLFtWX1OcFMEPOiH-doD1ElkqjLg.jpg' },
  { id: 2, category: 'Лилии', name: 'Желтая Азия', price: 210, desc: 'Нежный аромат и стойкость до 2 недель', image: 'https://cdn4.telesco.pe/file/X0zdaAeToHxbGWma1G0xpWJkFyxVSkJ8PJdXweZYytXOvWw40vQEyoFYTsj7Hpw0KxIy3yULzWB8xs5hZr5Vv6OGAW6jdMTkgBj_FwyvpuNqAbBGPTdfn2Y8ysW89-r26s9w4SbRKuANXWMzJYCPBp6yU1AsF63IdcCi7UUFOgHQFPlmTEiA8UmO5BTWmPQDq-Mmmk8QNIeU_yOXB-GOLw2NSbkZNdHK_ZVf0BDJZuCetgXu3xVqlmz5NdCJfPVSRZMiXCwxCgoll2cYFdar-PHKzBqutPIEjMxGTJZ3FtntCJgf5w0-G7YHdbijygbUhXNemywiYyHqQ11jz0O0tA.jpg' },
  { id: 3, category: 'Букеты', name: 'Гортензия Микс', price: 72, desc: 'Объемный букет для особого случая', image: 'https://cdn4.telesco.pe/file/JnBnBHTQIbGeat3jbRBzBXuHjcG01v_pfcHD6k3-PGOn3XaB1ZYnWEwLVz0_zergwNujdKrcvwRN4gPlLylzQc-MESjydBI0EgbbylJ64hGu5zF0w3CHVth84R3A-BhdUSf1OVjyuRCV_zNynugxC24RCJ29mTaKmtpODLwmtrHyU_1zxS_1dtMg43qZERyT4IQApfH_op4fXUT2Kbfe5lfILBFyUL-pnkxTpbJpCHmh_yDbM20eO1x8L7wC1chEio_XjqXvucwGGVkCF1WMgGGqCSoO-YezOiUhfjRIPfCKOXUdKLZWSKC9cgADO1Y7VIRwYM9uchqS0zDLxj83rw.jpg' },
  { id: 4, category: 'Розы', name: 'Белый Шоколад', price: 170, desc: 'Белоснежные розы высшего сорта', image: 'https://cdn4.telesco.pe/file/pbMk4ZbyAIaVj2dNSUg2H2zctzLTIHHcSbGWqbITIMqUjc7_5EGt-GQvywVor-c00ZHJjz03Rkbcvjhaj3ehpzcPW-yjiBRQAh49SY_XbnJruNEHRHdsTDbp_A41cL3dsLxgYeCWVusott1gKXrPmxS71S1I4hCJ_ljWOB4gPNThInD7qaxb--cgA32sWswnJ8sSrQ16RH4_PNFGBY33WWfuIQl6pn05oBqnby_ckYrcSi3iEoMJUeRXhYIM5Kanc4mULxj_mVlymBQ87KoIyEcToswJgmhbuGLt51W2gZvP-s5e-zo_1onefMxWTsvf3jvmAvUq7QHMnb3sv1KPZQ.jpg' },
  { id: 5, category: 'Букеты', name: 'Полевой сон', price: 120, desc: 'Ромашки и сухоцветы в крафте', image: 'https://cdn4.telesco.pe/file/akqi47LPnkxhNLYl1gLp2uzTBfHwWFxVMGHW4L_4CUxVnhqSgEUbkP1-Yb4JofHb1HkbrTOQT3X-NkQh-ilF-heNq-sVyhIh0rKYuzDxvohpmH-2SN7A3jBmDlqIni_rhpDbGtApoZkoJpZwJP1L6qeRW9JlvA6iyLdlPagZC_130IePAltg6ddA70v0sZNhl0b-G7KxK1Snm1uAIyFRVA2q7sG28WzjsgLMpNKVrrV5qDBbN4iNBT0rXuN3ubiy0KH6hEbiNpTZpg4yKY3ZXDYYU9DbiAj1XH3BycCXbYwSwPWcDK6T2nXjeD22yqVBII1mWMtnHNyhTVV7prxgZg.jpg' },
];

const CATEGORIES = ['Все', 'Розы', 'Лилии', 'Букеты'];

export default function Shop() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Все');

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return activeCategory === 'Все' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const total = cart.reduce((s, i) => s + i.price * i.count, 0);

  const handleAdd = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, count: i.count + 1} : i);
      return [...prev, {...p, count: 1}];
    });
  };

  const handleCheckout = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (!address.trim()) {
      tg?.showAlert('Пожалуйста, введите адрес и телефон!');
      return;
    }

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cart, 
          address, 
          initData: tg?.initData || "" // ПЕРЕДАЕМ ДАННЫЕ TG
        })
      });

      if (res.ok) {
        tg?.showAlert('🌸 Заказ успешно отправлен!');
        setCart([]);
        setAddress('');
        setShowCart(false);
      } else {
        tg?.showAlert('Ошибка при оформлении заказа.');
      }
    } catch (e) {
      tg?.showAlert('Ошибка связи с сервером.');
    }
  }, [cart, address]);

  return (
    <div style={{ 
      padding: '0 16px 120px', 
      background: 'var(--tg-theme-bg-color, #f5f5f7)', 
      color: 'var(--tg-theme-text-color, #000)',
      minHeight: '100vh',
      fontFamily: '-apple-system, system-ui, sans-serif'
    }}>
      
      {/* СТИЛЬНЫЙ HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--tg-theme-bg-color, #f5f5f7)', padding: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Магазин 🌸</h2>
          {cart.length > 0 && (
            <div onClick={() => setShowCart(true)} style={{ 
              background: 'var(--tg-theme-button-color, #007aff)', 
              color: 'var(--tg-theme-button-text-color, #fff)',
              padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'
            }}>
              🛒 {cart.reduce((a,b) => a + b.count, 0)}
            </div>
          )}
        </div>

        {/* КАТЕГОРИИ */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '16px', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '8px 16px', borderRadius: '15px', border: 'none',
              background: activeCategory === cat ? 'var(--tg-theme-button-color, #000)' : 'var(--tg-theme-secondary-bg-color, #e5e5ea)',
              color: activeCategory === cat ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-text-color, #000)',
              whiteSpace: 'nowrap', fontWeight: '600', transition: '0.2s'
            }}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* СЕТКА ТОВАРОВ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
        {filteredProducts.map(p => (
          <div key={p.id} style={{ 
            background: 'var(--tg-theme-secondary-bg-color, #fff)', borderRadius: '24px', 
            padding: '12px', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <img src={p.image} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '18px' }} />
            <div style={{ fontWeight: '700', fontSize: '15px', marginTop: '10px' }}>{p.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color, #8e8e93)', margin: '4px 0', flex: 1 }}>{p.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontWeight: '800', color: 'var(--tg-theme-link-color, #34c759)' }}>{p.price}₽</span>
              <button onClick={() => handleAdd(p)} style={{ 
                background: 'var(--tg-theme-button-color, #007aff)', border: 'none', width: '32px', height: '32px',
                borderRadius: '50%', color: '#fff', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
              }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛЬНОЕ ОКНО КОРЗИНЫ */}
      {showCart && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 100, background: 'var(--tg-theme-bg-color, #fff)',
          padding: '24px', display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '28px', fontWeight: '800' }}>Ваш заказ</h3>
          <div style={{ flex: 1, overflowY: 'auto', marginTop: '15px' }}>
            {cart.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #e5e5ea' }}>
                <span style={{ fontWeight: '500' }}>{i.name} (x{i.count})</span>
                <span style={{ fontWeight: '700' }}>{i.price * i.count}₽</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '22px', fontWeight: '800' }}>Итого: {total}₽</div>
            
            <p style={{ marginTop: '20px', fontWeight: '600' }}>Куда доставить?</p>
            <textarea 
              placeholder="Адрес и телефон для связи" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              style={{ 
                width: '100%', height: '100px', padding: '15px', marginTop: '10px',
                borderRadius: '18px', border: '1px solid #d1d1d6', boxSizing: 'border-box',
                background: 'var(--tg-theme-secondary-bg-color, #f2f2f7)',
                color: 'var(--tg-theme-text-color, #000)', fontSize: '16px'
              }} 
            />
          </div>
          
          <button onClick={handleCheckout} style={{ 
            width: '100%', padding: '18px', background: 'var(--tg-theme-button-color, #34c759)', 
            color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '18px', cursor: 'pointer'
          }}>ОФОРМИТЬ ЗАКАЗ</button>
          
          <button onClick={() => setShowCart(false)} style={{ 
            width: '100%', padding: '12px', marginTop: '10px', background: 'transparent', 
            color: 'var(--tg-theme-link-color, #007aff)', border: 'none', fontWeight: '700', cursor: 'pointer'
          }}>Назад к цветам</button>
        </div>
      )}
    </div>
  );
}

