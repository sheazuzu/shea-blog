# Shea Blog - 个人博客系统

一个使用 Docker 容器化的个人博客系统，包含前端静态页面和后端邮件服务。

## 快速开始

### 1. 一键部署

使用部署脚本快速构建并启动服务：
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
CONTACT_TO=your_destination_email@example.com
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
├── .dockerignore           # Docker 构建忽略规则
├── package.json            # Node.js 项目配置
├── server.js               # 服务启动入口
├── test-email.js           # SMTP 配置测试脚本
├── deploy.sh               # 一键部署脚本
├── .env.example            # 环境变量配置模板
├── src/
│   ├── index.html          # 主页面
│   ├── profile.jpg         # 个人头像
│   └── server/             # 后端应用模块
│       ├── app.js          # Express app factory
│       ├── config.js       # 环境变量配置聚合
│       ├── middleware/     # 通用中间件
│       ├── routes/         # API 路由
│       ├── services/       # 外部服务集成
│       └── utils/          # 通用工具函数
└── README.md               # 项目说明
```

## 架构说明

后端按职责拆分为可扩展模块：

- `server.js` 只负责启动服务和优雅退出
- `src/server/app.js` 负责组装 Express 应用、中间件、静态文件和路由
- `src/server/routes/` 按接口域拆分，例如健康检查、联系表单、SMTP 测试
- `src/server/services/` 封装邮件等外部服务，后续可替换为队列、第三方邮件 API 或 mock
- `src/server/config.js` 集中读取环境变量，避免业务代码散落配置读取逻辑
- `src/server/middleware/rateLimiter.js` 当前使用内存限流，单实例部署足够；多实例部署时可以替换为 Redis backed limiter

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

## 邮件发送功能

### 配置SMTP

1. 复制环境变量配置文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置SMTP信息：
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CONTACT_TO=your_destination_email@example.com
PORT=3000
```

### 测试邮件功能

```bash
# 测试SMTP连接
npm run test-email

# 同上，保留兼容脚本名
npm run test-smtp
```

## 邮件功能特性

- 实时传输日志显示
- SMTP连接状态监控
- 联系表单输入校验
- 邮件内容HTML转义
- 支持多种SMTP服务商
- 联系表单轻量限流
