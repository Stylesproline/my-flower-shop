import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  const { rows } = await sql`SELECT * FROM products ORDER BY id ASC`;
  return NextResponse.json(rows);
}
