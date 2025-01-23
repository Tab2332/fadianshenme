# 发点什么

一个简单的个人博客系统，使用 Vue 3 + Vite + Supabase 构建。

## 功能特点

- 📝 支持文本和图片发布
- 🖼️ 图片自动压缩和预览
- 🔍 文章搜索功能
- 📅 按日期筛选
- ✨ 优雅的动画效果
- 🗑️ 支持批量删除
- ✏️ 支持编辑文章

## 技术栈

- Vue 3
- Vite
- Element Plus
- Tailwind CSS
- Supabase
- Vue Easy Lightbox

## 开始使用

1. 克隆项目
```bash
git clone https://github.com/Tab2332/fadianshenme.git
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制 `.env.example` 文件为 `.env`，并填入你的 Supabase 配置：
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 启动开发服务器
```bash
npm run dev
```

## 构建部署

```bash
npm run build
```

## License

MIT 