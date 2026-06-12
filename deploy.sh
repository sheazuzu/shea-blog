#!/bin/bash

# Shea Blog 一键部署脚本
# 快速构建和启动Docker容器

echo "🚀 开始部署 Shea Blog..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查 Docker Compose 是否可用，兼容 v1 和 v2 命令
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到.env文件，复制.env.example模板..."
    cp .env.example .env
    echo "📝 请编辑.env文件配置SMTP信息"
fi

# 停止并删除现有容器
echo "🔧 清理现有容器..."
$COMPOSE_CMD down

# 构建新镜像
echo "🏗️  构建Docker镜像..."
$COMPOSE_CMD build

# 启动服务
echo "🚀 启动服务..."
$COMPOSE_CMD up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -f http://localhost:80/health &> /dev/null; then
    echo "✅ 服务启动成功！"
    echo "🌐 访问地址: http://localhost:80"
    echo "📧 邮件测试: http://localhost:80/test-smtp"
else
    echo "❌ 服务启动失败，请检查日志"
    echo "📋 查看日志: $COMPOSE_CMD logs"
fi

echo "🎉 部署完成！"
