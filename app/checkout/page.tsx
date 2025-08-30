// src/app/product/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChekoutClientComponent from './CheckoutClientComponent'; // Move your component here

export default function ProductPage() {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string>('');
  
  useEffect(() => {
    const productId = searchParams.get('id');
    if (productId) {
      setId(productId);
    }
  }, [searchParams]);

  if (!id) {
    return <div>Loading...</div>;
  }

  return <ChekoutClientComponent id={id} />;
}