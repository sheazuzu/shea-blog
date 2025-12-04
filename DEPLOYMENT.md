# Shea Blog 部署指南

## 概述

本项目已从纯静态网站升级为全栈博客系统，包含：
- ✅ 前端静态页面（HTML/CSS/JS）
- ✅ 后端Node.js服务（Express + SMTP）
- ✅ 联系表单邮件自动发送功能

## 部署前准备

### 1. SMTP邮件服务配置

#### Hotmail/Outlook 配置（推荐）
1. 登录您的Hotmail/Outlook邮箱
2. 启用应用专用密码：
   - 访问 https://account.microsoft.com/security
   - 开启"两步验证"（如果未启用）
   - 生成应用专用密码

3. 配置环境变量：
```bash
# 复制配置文件模板
cp .env.example .env

# 编辑配置文件
nano .env
```

4. 填写SMTP配置：
```env
# Hotmail/Outlook SMTP配置
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=sheazuzu@hotmail.com
SMTP_PASS=your_app_specific_password_here
PORT=3000
```

#### 其他邮箱服务商配置

**Gmail配置：**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

**QQ邮箱配置：**
```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your@qq.com
SMTP_PASS=your_authorization_code
```

## 部署步骤

### 方法一：使用Docker Compose（推荐）

```bash
# 1. 构建并启动服务
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 3. 查看服务日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

### 方法二：使用Docker命令

```bash
# 1. 构建镜像
docker build -t shea-blog .

# 2. 运行容器
docker run -d \
  --name shea-blog-app \
  -p 3000:3000 \
  --env-file .env \
  shea-blog

# 3. 查看容器状态
docker ps

# 4. 停止容器
docker stop shea-blog-app
```

### 方法三：手动部署（开发模式）

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问网站
# 打开浏览器访问 http://localhost:3000
```

## 验证部署

### 1. 访问网站
打开浏览器访问：http://localhost:3000

### 2. 测试联系表单
1. 点击页面上的"Contact Me"按钮
2. 填写测试信息并提交
3. 检查您的邮箱是否收到测试邮件

### 3. API接口测试
```bash
# 健康检查
curl http://localhost:3000/health

# SMTP连接测试
curl http://localhost:3000/test-smtp
```

### 4. 使用测试脚本
```bash
# 运行自动化测试
node test-backend.js
```

## 故障排除

### 常见问题

#### 1. 邮件发送失败
**症状：** 表单提交后显示错误信息
**解决方案：**
- 检查SMTP配置是否正确
- 验证邮箱密码或应用专用密码
- 检查防火墙和网络连接

#### 2. 服务无法启动
**症状：** Docker容器启动失败
**解决方案：**
- 检查端口3000是否被占用
- 查看Docker日志：`docker-compose logs`
- 验证.env文件格式是否正确

#### 3. 表单提交无响应
**症状：** 点击提交按钮后页面卡住
**解决方案：**
- 检查后端服务是否正常运行
- 查看浏览器控制台错误信息
- 验证网络连接和CORS配置

### 日志查看

```bash
# 查看Docker容器日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs shea-blog

# 实时查看日志
docker-compose logs -f --tail=100
```

## 生产环境部署

### 1. 安全配置
- 使用HTTPS加密传输
- 配置防火墙规则
- 定期更新依赖包
- 使用应用专用密码

### 2. 性能优化
- 启用Gzip压缩
- 配置静态文件缓存
- 使用CDN加速
- 数据库连接池优化

### 3. 监控告警
- 设置服务健康检查
- 配置邮件发送失败告警
- 监控服务器资源使用情况

## 更新和维护

### 1. 更新代码
```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

### 2. 备份数据
```bash
# 备份配置文件
cp .env .env.backup

# 备份Docker镜像
docker save shea-blog > shea-blog-backup.tar
```

## 技术支持

如果遇到问题，请：
1. 查看本文档的故障排除部分
2. 检查服务日志获取详细错误信息
3. 联系技术支持或查看项目文档

---

**部署完成！** 🎉 您的博客现在已具备完整的联系表单邮件发送功能。