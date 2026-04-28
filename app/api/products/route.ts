import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. Берем строку подключения из переменной
  const connectionString = process.env.MY_DATABASE_URL;

  // 2. Проверка: если переменной нет, мы выведем это в лог
  if (!connectionString) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: Переменная MY_DATABASE_URL не найдена!");
    return NextResponse.json({ error: 'Конфигурация базы отсутствует' }, { status: 500 });
  }

  try {
    // 3. Создаем пул вручную внутри функции
    const pool = createPool({ connectionString });
    
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Ошибка БД:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

