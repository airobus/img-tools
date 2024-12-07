import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

export async function GET() {
  try {
    const q = query(
      collection(db, 'generations'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const generations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      prompt: doc.data().prompt,
      negativePrompt: doc.data().negativePrompt,
      imageUrl: doc.data().imageUrl,
      createdAt: Number(doc.data().createdAt),
      status: 'completed' as const,
      progress: 100
    }))

    return NextResponse.json(generations)
  } catch (error) {
    console.error('Failed to load history:', error)
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }
} 