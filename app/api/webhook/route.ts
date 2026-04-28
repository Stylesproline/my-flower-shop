// ВМЕСТО import { sql } FROM '@vercel/postgres' ПИШЕМ ЭТО:
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.MY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
import { NextResponse } from 'next/server';

const pool = createPool({
  connectionString: process.env.MY_DATABASE_URL // Твоя рабочая переменная
});

export async function GET() {
  try {
    // ВМЕСТО await sql`...` ПИШЕМ ТАК:
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

