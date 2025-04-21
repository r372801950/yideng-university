// app/api/cars/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'Blue',
    price: 25000
  });
}