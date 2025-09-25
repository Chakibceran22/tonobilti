// src/app/product/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CarDetailClientComponent from './CarDetailClientComponenet'; // Move your component here

export default function ProductPage() {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string>('');
  const [agentToken, setAgentToken] = useState<string | null>(null);

  
  useEffect(() => {
    const productId = searchParams.get('id');
    if (productId) {
      setId(productId);
    }
    const token = searchParams.get('token');
    if (token) {
      setAgentToken(token);
    }
  }, [searchParams]);

  if (!id) {
    return <div>Loading...</div>;
  }

  return <CarDetailClientComponent id={id} token={agentToken} />;
}