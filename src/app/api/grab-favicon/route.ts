import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url, size } = await request.json()

    // 验证 URL，确保有协议
    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname
 
    // 生成可能的 favicon 路径
    const faviconPaths = [
      // 根域名
      `${parsedUrl.origin}/favicon.ico`,
      
      // www 子域名
      `https://www.${domain}/favicon.ico`,
      
      // 其他常见路径
      `${parsedUrl.origin}/favicon.png`,
      `${parsedUrl.origin}/icon.ico`,
      `${parsedUrl.origin}/icons/favicon.ico`,
      
      // Google Favicon Service - 带尺寸
      `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`,
      
      // Google Favicon Service - 不带尺寸
      `https://www.google.com/s2/favicons?domain=${domain}`,
      
      // DuckDuckGo Favicon Service
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      
      // 详细的 Google Favicon URL - 带尺寸
      `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${parsedUrl.origin}&size=${size}`,
      
      // 详细的 Google Favicon URL - 不带尺寸
      `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${parsedUrl.origin}`
    ]

    // 详细的请求头，模拟浏览器
    const requestHeaders = {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      'cache-control': 'max-age=0',
      'if-modified-since': 'Tue, 17 Mar 2020 17:44:59 GMT',
      'priority': 'u=0, i',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A_Brand";v="24"',
      'sec-ch-ua-arch': 'arm',
      'sec-ch-ua-bitness': '64',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-model': '""',
      'sec-ch-ua-platform': '"macOS"',
      'sec-ch-ua-platform-version': '"14.1.0"',
      'sec-ch-ua-wow64': '?0',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'x-browser-channel': 'stable',
      'x-browser-year': '2024',
      'x-client-data': 'CIW2yQEIpLbJAQipncoBCNL3ygEIlqHLAQiGoM0BCP6lzgEI1qzOAQit0M4BCJ/SzgEIstPOAQjX1M4BCKfVzgEI8NXOARiPzs0B'
    }

    // 尝试获取 favicon
    for (const service of faviconPaths) {
      try {
        console.log(`尝试获取 favicon: ${service}`)
        
        const response = await fetch(service, {
          method: 'GET',
          headers: requestHeaders,
          mode: 'cors',
          signal: AbortSignal.timeout(1000)
        })

        if (response.ok) {
          const contentType = response.headers.get('Content-Type')

          if (contentType && 
              (contentType.startsWith('image/') || 
               contentType.includes('icon') || 
               contentType === 'application/octet-stream')) {
            
            const buffer = await response.arrayBuffer()
            
            return new NextResponse(buffer, {
              status: 200,
              headers: { 
                'Content-Type': contentType || 'image/png',
                'Content-Disposition': `inline; filename="favicon-${size}x${size}.png"`
              }
            })
          } else {
            console.warn(`不匹配的内容类型: ${contentType}`)
          }
        } else {
          console.warn(`请求失败: 状态码 ${response.status}`)
        }
      } catch {
        continue
      }
    }

    // 如果所有方法都失败
    return NextResponse.json({ error: '无法获取网站图标' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: '获取网站图标失败' }, { status: 500 })
  }
} 