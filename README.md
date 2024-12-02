# Image Tools

一套强大的在线图像处理工具集合，提供多种图像处理功能。

## 功能特性

- 图片压缩 - 高效压缩图片，保持最佳质量
  - 支持的格式：PNG, JPEG, WebP
  - 最大文件大小：10MB
- Logo生成 - 快速生成专业的Logo设计（开发中）
- AI 生图 - 使用AI技术生成独特的图像（开发中）

## 技术栈

- 框架：Next.js 13+ (App Router)
- 语言：TypeScript
- 样式：Tailwind CSS
- 包管理：pnpm

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 项目结构

```
src/
  ├── app/                 # App Router 路由
  │   ├── page.tsx        # 首页
  │   ├── compress/       # 图片压缩功能
  │   ├── logo/          # Logo生成功能（计划中）
  │   └── ai-image/      # AI生图功能（计划中）
  ├── components/         # 共享组件
  └── styles/            # 全局样式
```

## 开发进度

- [x] 项目初始化
- [ ] 图片压缩功能
- [ ] Logo生成功能
- [ ] AI生图功能

## 部署

本项目可以轻松部署到 [Vercel 平台](https://vercel.com)。

## 了解更多

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 特性和 API
- [Learn Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

## 环境要求

- Node.js 16.x 或更高版本
- pnpm 8.x 或更高版本

## 贡献指南

欢迎提交 Pull Request 或 Issue！

1. Fork 本仓库
2. 创建新分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
