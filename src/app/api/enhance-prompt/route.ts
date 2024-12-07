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
                    content: `你是一个专业的AI绘画提示词专家，请帮我优化以下提示词，使其更适合AI绘画，根据下面的规则，得出最终的提示语。
                    关键词公式
                    主题（加下面的）
                    环境（背景，周围）
                    气氛（烈日下，雾蒙蒙，恐怖的，风暴席卷的）
                    灯光（顶光，雾气光，漫反射的，强对比的）
                    色彩（低饱和度，颜色鲜艳的，花里胡哨的，强反射的主色调，某种颜色是是accent color）
                    构图(黄金分割，三分法的，电影镜头，广角，鸟瞰图)
                    风格参考（超清细节的，照片级别的，写实的，抽象的，2D/3D，4k8k，数字雕刻，概念艺术，水墨，水彩，海报，某个软件，某个游戏，艺术家，艺术平台）

                    比如：
                    去艺术家分类找自己的喜欢的艺术家风格，放到风格参考的关键词里面
                    去照明分类找自己的喜欢的风格，放到灯光的关键词里面
                    去颜色和调色板分类找自己的喜欢的风格，放到色彩的关键词里

                    示例：
                    公式：
                    主体内容+气氛灯光色彩+构图+风格参考
                    主体内容：
                    宇宙飞船
                    一般/一群 宇宙飞船
                    一艘 废士/卡通 风格的宇宙飞船
                    一艘 类似使命召唤 废土风格的 字宙飞船
                    一艘 类似使命召唤 废土风格的 宇宙飞船 爆炸了
                    一艘 类似使命召唤 废土风格的 宇宙飞船 在空中/降落时 爆炸了
                    一艘 类似使命召唤 废土风格的 字宙飞船 在空中 爆炸了 并且引擎/驾驶舱冒着黑烟
                    加入环境
                    周围是一群红色的/蓝色的小型飞行器
                    背景是一片沙漠/城市
                    背景是一片被遗弃的/被植被覆盖的城市
                    背景是一片被遗弃的古代/现代城市随处可见高耸的工业塔并且有一些枯萎的植被
                    加入气氛
                    雾蒙蒙的、烈日下、恐怖的、风暴席卷的
                    加入灯光
                    顶光的、雾气光、漫反射的、强对比的
                    加入色彩（色彩三要素）低饱和度的、颜色鲜艳的、花里胡哨的、强反射的、主色调、某种颜色是accent color
                    加入构图
                    黄金分割的、三分法的、电影镜头式的、广角的、鸟瞰图
                    加入风格参考
                    超清细节的、照片级别的、写实的、抽象的、2D/3D、4k/8k、数字雕刻的、概念艺术、建筑设计、environment，水墨草稿、水彩风的、海报风的、水墨风、某个软件（Blender，Zbrush，Octane Render，Unreal Engine）、某个电影/游戏、某个艺术家、某个艺术平台trending on artstation权重"。`
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