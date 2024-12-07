import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt, negativePrompt } = await request.json()
    
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt,
        negative_prompt: negativePrompt,
        image_size: '1024x576',
        batch_size: 1,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        prompt_enhancement: false
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Image generation failed:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
} 