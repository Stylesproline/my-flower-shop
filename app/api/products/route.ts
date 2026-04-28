import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Пробуем подключиться к Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Ключи Supabase не настроены");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Ошибка API:', err.message);
    
    // Возвращаем тестовые данные, чтобы магазин работал в любом случае
    return NextResponse.json([
      { id: 1, name: 'Розы (Тест)', price: 1500, image_url: 'https://unsplash.com' },
      { id: 2, name: 'Лилии (Тест)', price: 2000, image_url: 'https://unsplash.com' }
    ]);
  }
}




