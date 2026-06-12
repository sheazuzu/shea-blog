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
├── server.js               # 后端服务器
├── test-email.js           # SMTP 配置测试脚本
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
