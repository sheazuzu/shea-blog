# Shea Blog - 个人博客系统

一个使用 Docker 容器化的个人博客系统，包含前端静态页面和后端邮件服务。

## 快速开始

### 1. 一键部署（推荐）

使用提供的部署脚本快速启动：
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. 手动配置

复制环境变量配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置SMTP信息：
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
PORT=3000
```

### 3. 启动服务

使用 Docker Compose：
```bash
docker-compose up -d
```

访问网站：http://localhost:80

## 项目结构

```
shea-blog/
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker Compose 配置
├── package.json            # Node.js 项目配置
├── server.js               # 后端服务器
├── deploy.sh               # 一键部署脚本
├── .env.example            # 环境变量配置模板
├── src/                    # 前端源代码目录
│   ├── index.html          # 主页面
│   └── profile.jpg         # 个人头像
└── README.md               # 项目说明
```

## 主要功能

- 响应式个人博客页面
- 联系表单邮件发送
- SMTP邮件服务集成
- Docker容器化部署
- 一键部署脚本

## API接口

- `GET /` - 前端页面
- `GET /health` - 健康检查
- `POST /contact` - 联系表单提交
- `GET /test-smtp` - SMTP连接测试