#!/bin/bash

# Shea Blog 一键部署脚本
# 运行此脚本将自动完成整个项目的部署

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
IMAGE_NAME="shea-blog"
CONTAINER_NAME="shea-blog-container"
HOST_PORT=80
CONTAINER_PORT=3000

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    log_success "Docker 已安装"
}

# 清理现有容器和镜像
cleanup_existing() {
    log_info "清理现有部署环境..."
    
    # 停止并删除现有容器
    if docker ps -a | grep -q $CONTAINER_NAME; then
        log_info "停止并删除现有容器"
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
    fi
    
    # 删除现有镜像
    if docker images | grep -q $IMAGE_NAME; then
        log_info "删除现有镜像"
        docker rmi $IMAGE_NAME 2>/dev/null || true
    fi
}

# 构建Docker镜像
build_image() {
    log_info "开始构建 Docker 镜像..."
    docker build -t $IMAGE_NAME .
    if [ $? -eq 0 ]; then
        log_success "Docker 镜像构建成功"
    else
        log_error "Docker 镜像构建失败"
        exit 1
    fi
}

# 运行容器
run_container() {
    log_info "启动容器..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $HOST_PORT:$CONTAINER_PORT \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        log_success "容器启动成功"
    else
        log_error "容器启动失败"
        exit 1
    fi
}

# 显示部署结果
show_result() {
    echo ""
    echo "==========================================="
    log_success "Shea Blog 部署完成！"
    echo ""
    echo "网站地址: http://localhost:$HOST_PORT"
    echo "容器名称: $CONTAINER_NAME"
    echo "镜像名称: $IMAGE_NAME"
    echo ""
    echo "部署状态:"
    docker ps | grep $CONTAINER_NAME
    echo "==========================================="
}

# 主部署流程
main() {
    echo "开始一键部署 Shea Blog..."
    echo ""
    
    # 检查Docker
    check_docker
    
    # 清理现有环境
    cleanup_existing
    
    # 构建镜像
    build_image
    
    # 运行容器
    run_container
    
    # 等待容器启动
    sleep 2
    
    # 显示部署结果
    show_result
}

# 执行部署
main