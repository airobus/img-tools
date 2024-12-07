'use client';

import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { GenerationResult } from '@/types';

export default function ImageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [details, setDetails] = useState<GenerationResult | null>(null);
  
  useEffect(() => {
    const fetchDetails = async () => {
      const docRef = doc(db, 'imageHistory', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setDetails(docSnap.data() as GenerationResult);
      }
    };
    
    fetchDetails();
  }, [id]);

  if (!details) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>生成详情</h1>
      <img src={details.imageUrl} alt={details.prompt} />
      <p>提示词: {details.prompt}</p>
      <p>反向提示词: {details.negativePrompt}</p>
    </div>
  );
} 