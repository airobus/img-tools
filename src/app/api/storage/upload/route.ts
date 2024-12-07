import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export async function POST(request: Request) {
  try {
    const { imageUrl, metadata } = await request.json()
    
    if (!imageUrl || !metadata?.id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const docRef = doc(db, 'generations', metadata.id)
    
    await setDoc(docRef, {
      imageUrl,
      prompt: metadata.prompt,
      negativePrompt: metadata.negativePrompt,
      createdAt: metadata.createdAt,
      id: metadata.id
    })

    return NextResponse.json({ success: true, imageUrl, metadata })
  } catch (error) {
    console.error('Failed to save generation:', error)
    return NextResponse.json({ error: 'Failed to save generation' }, { status: 500 })
  }
} 