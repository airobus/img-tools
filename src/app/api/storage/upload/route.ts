import { NextResponse } from 'next/server'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: Request) {
  try {
    const { imageUrl, metadata } = await request.json()
    
    const docRef = await addDoc(collection(db, 'imageHistory'), {
      imageUrl,
      originalPrompt: metadata.prompt,
      optimizedPrompt: metadata.prompt,
      createdAt: new Date().toISOString(),
      id: metadata.id
    })

    return NextResponse.json({ 
      success: true, 
      docId: docRef.id,
      imageUrl 
    })
  } catch (error) {
    console.error('Failed to save:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
} 