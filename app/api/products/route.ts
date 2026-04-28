import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connectionString = process.env.MY_DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json({ error: 'Строка подключения не найдена' }, { status: 500 });
  }

  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Обязательно для Supabase
    }
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products ORDER BY id ASC');
    client.release();
    await pool.end();

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Database Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

