'use client';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// 动态导入客户端组件，避免SSR渲染导致window对象不可用的错误
const YiDengTokenBuyerClient = dynamic(
  () => import('./YiDengTokenBuyerClient'),
  { ssr: false }
);


export default function BuyYiDengPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">购买一灯币</h1>
      <YiDengTokenBuyerClient />
    </div>
  );
}