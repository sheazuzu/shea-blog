# 使用Node.js官方镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制后端源代码
COPY server.js .
COPY .env.example .env

# 复制前端静态文件到public目录
COPY src/ ./public/

# 暴露端口（后端API端口和前端服务端口）
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用（同时提供前端静态文件和后端API服务）
CMD ["node", "server.js"]