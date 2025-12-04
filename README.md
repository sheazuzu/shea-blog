# Shea Blog - 全栈博客系统

这是一个使用 Docker 容器化的个人博客系统，包含前端静态页面和后端邮件服务。

## 新功能：后端邮件服务

- ✅ 前端通过 HTTP POST 发送表单数据到后端 API
- ✅ 后端使用 SMTP 自动发送邮件到指定邮箱
- ✅ 支持表单验证和错误处理
- ✅ 响应式设计和用户友好的交互体验

## 快速开始

### 1. 配置SMTP邮件服务

**重要提示**: Hotmail/Outlook已禁用基本身份验证，必须使用现代身份验证和应用专用密码。

详细配置指南请参考：[SMTP_SETUP.md](./SMTP_SETUP.md)

1. 复制环境变量配置文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置您的SMTP信息：
```bash
# Hotmail/Outlook配置示例（必须使用应用专用密码）
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=sheazuzu@hotmail.com
SMTP_PASS=your_app_specific_password_here  # 必须是应用专用密码，不是主密码
PORT=3000
```

### 2. 使用 Docker Compose（推荐）

1. 构建并启动容器：
```bash
docker-compose up -d
```

2. 访问网站：
打开浏览器访问 http://localhost:3000

3. 停止容器：
```bash
docker-compose down
```

### 3. 使用 Docker 命令

1. 构建镜像：
```bash
docker build -t shea-blog .
```

2. 运行容器：
```bash
docker run -d -p 3000:3000 --name shea-blog-container shea-blog
```

3. 访问网站：
打开浏览器访问 http://localhost:3000

## 项目结构

```
shea-blog/
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker Compose 配置
├── package.json            # Node.js 项目配置
├── server.js               # 后端服务器（Express + SMTP）
├── .env.example            # 环境变量配置模板
├── src/                    # 前端源代码目录
│   ├── index.html          # 主页面（包含联系表单）
│   └── profile.jpg         # 个人头像
└── README.md              # 项目说明
```

## 技术栈

### 前端
- **静态页面**: HTML5 + CSS3 + JavaScript
- **交互效果**: 打字机动画、粒子背景、模态框

### 后端
- **服务器**: Node.js + Express
- **邮件服务**: Nodemailer + SMTP
- **端口**: 3000

### 部署
- **容器化**: Docker
- **服务**: 一体化服务（前端+后端）

## API接口

### 联系表单接口
- **URL**: `POST /contact`
- **功能**: 接收表单数据并发送邮件
- **请求体**:
```json
{
    "name": "姓名",
    "email": "邮箱地址", 
    "subject": "主题",
    "message": "消息内容"
}
```

### 健康检查接口
- **URL**: `GET /health`
- **功能**: 检查服务状态

### SMTP测试接口
- **URL**: `GET /test-smtp`
- **功能**: 测试SMTP连接状态

## 配置说明

### SMTP配置支持
- **Hotmail/Outlook**: `smtp.office365.com:587`
- **Gmail**: `smtp.gmail.com:587`
- **QQ邮箱**: `smtp.qq.com:587`
- **163邮箱**: `smtp.163.com:25`

### 安全建议
- 使用应用专用密码而不是主密码
- 生产环境使用环境变量存储敏感信息
- 建议启用SSL/TLS加密

## 开发说明

- 修改前端文件后需要重新构建Docker镜像
- 后端服务会自动重启（使用nodemon开发模式）
- 生产环境建议使用反向代理进行SSL终止

## 故障排除

### 邮件发送失败
1. 检查SMTP配置是否正确
2. 验证邮箱密码或应用专用密码
3. 检查防火墙和网络连接
4. 查看服务器日志获取详细错误信息

### 表单提交失败
1. 检查后端服务是否正常运行
2. 验证网络连接和CORS配置
3. 查看浏览器控制台错误信息