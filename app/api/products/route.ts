import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = [
    { id: 1, name: 'Красные розы', price: 1500, image_url: 'https://unsplash.com' },
    { id: 2, name: 'Белые лилии', price: 2000, image_url: 'https://unsplash.com' },
    { id: 3, name: 'Тюльпаны', price: 1200, image_url: 'https://unsplash.com' },
    { id: 4, name: 'Пионы', price: 2500, image_url: 'https://unsplash.com' }
  ];
  
  return NextResponse.json(products);
}

