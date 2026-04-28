import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Создаем подключение вручную, используя твою новую переменную
const pool = createPool({
  connectionString: process.env.MY_DATABASE_URL 
});

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

