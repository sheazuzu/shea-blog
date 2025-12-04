# Shea Blog - Docker 容器化部署

这是一个使用 Docker 容器化的个人博客静态网站。

## 快速开始

### 使用 Docker Compose（推荐）

1. 构建并启动容器：
```bash
docker-compose up -d
```

2. 访问网站：
打开浏览器访问 http://localhost:8080

3. 停止容器：
```bash
docker-compose down
```

### 使用 Docker 命令

1. 构建镜像：
```bash
docker build -t shea-blog .
```

2. 运行容器：
```bash
docker run -d -p 8080:80 --name shea-blog-container shea-blog
```

3. 访问网站：
打开浏览器访问 http://localhost:8080

## 项目结构

```
shea-blog/
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker Compose 配置
├── src/                    # 源代码目录
│   ├── index.html          # 主页面
│   └── profile.jpg         # 个人头像
└── README.md              # 项目说明
```

## 技术栈

- **Web服务器**: Nginx (Alpine Linux)
- **端口**: 80 (容器内部) / 8080 (主机)
- **部署方式**: Docker 容器化

## 开发说明

- 修改 `src/` 目录下的文件后，Docker Compose 会自动重新加载（由于 volume 映射）
- 如需重新构建镜像，运行 `docker-compose build`
- 生产环境建议使用反向代理（如 Nginx）进行 SSL 终止和负载均衡

## 环境变量

- `NGINX_HOST`: Nginx 服务器主机名（默认: localhost）
- `NGINX_PORT`: Nginx 服务器端口（默认: 80）