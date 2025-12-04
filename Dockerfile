# 使用Node.js 18 Alpine作为基础镜像（轻量级Linux发行版）
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json文件（依赖管理）
COPY package*.json ./

# 安装生产环境依赖（不安装devDependencies）
RUN npm install --production

# 复制后端服务器代码
COPY server.js .

# 复制环境变量模板
COPY .env.example .env

# 复制前端静态文件到public目录
COPY src/ ./public/

# 暴露应用端口（后端API服务端口）
EXPOSE 3000

# 设置环境变量为生产环境
ENV NODE_ENV=production

# 启动应用（同时提供前端静态文件和后端API服务）
CMD ["node", "server.js"]