import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { prompt } = await request.json()
  
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-70b-instruct`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI绘画提示词专家，请帮我优化以下提示词，使其更适合AI绘画。请直接返回优化后的提示词，不要包含任何解释。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  const data = await response.json()
  return NextResponse.json(data)
} 