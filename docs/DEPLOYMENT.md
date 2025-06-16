# 部署指南

## 🚀 部署概述

银行告警监控系统支持多种部署方式，包括开发环境、测试环境和生产环境的部署配置。

## 📋 环境要求

### 系统要求
- **操作系统**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **内存**: >= 4GB RAM
- **磁盘**: >= 2GB 可用空间

### 开发环境
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 16.0.0

# 检查 npm 版本
npm --version   # 应该 >= 8.0.0

# 检查 Git 版本
git --version
```

## 🛠️ 开发环境部署

### 1. 克隆项目
```bash
git clone https://github.com/your-org/bank-monitoring-system.git
cd bank-monitoring-system
```

### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 如果遇到网络问题，可以使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### 3. 环境配置
```bash
# 复制环境配置文件
cp .env.example .env.development

# 编辑配置文件
vim .env.development
```

**.env.development 示例:**
```env
# 应用配置
NODE_ENV=development
VITE_APP_TITLE=银行告警监控系统
VITE_APP_VERSION=1.0.0

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws

# 功能开关
VITE_ENABLE_MOCK=true
VITE_ENABLE_DEBUG=true
VITE_ENABLE_HOT_RELOAD=true

# 安全配置
VITE_ENCRYPTION_KEY=your-encryption-key
VITE_JWT_SECRET=your-jwt-secret
```

### 4. 启动开发服务器
```bash
# 启动开发模式
npm run dev

# 应用将在以下地址启动:
# Renderer: http://localhost:5174
# Electron: 自动启动桌面应用
```

### 5. 开发工具配置

#### VSCode 配置
创建 `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.vue": "vue"
  }
}
```

#### ESLint 配置
```json
{
  "extends": [
    "@electron-toolkit/eslint-config-ts",
    "@electron-toolkit/eslint-config-prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "vue/multi-word-component-names": "off"
  }
}
```

## 🧪 测试环境部署

### 1. 构建测试版本
```bash
# 构建测试版本
npm run build:test

# 或者构建特定平台
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

### 2. 测试环境配置
**.env.test 示例:**
```env
NODE_ENV=test
VITE_API_BASE_URL=https://test-api.bank-monitor.com/api
VITE_WS_URL=wss://test-api.bank-monitor.com/ws
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEBUG=true
```

### 3. 自动化测试
```bash
# 运行单元测试
npm run test

# 运行端到端测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:coverage
```

### 4. 测试部署脚本
```bash
#!/bin/bash
# deploy-test.sh

echo "开始测试环境部署..."

# 1. 拉取最新代码
git pull origin develop

# 2. 安装依赖
npm ci

# 3. 运行测试
npm run test

# 4. 构建应用
npm run build:test

# 5. 部署到测试服务器
scp -r dist/* test-server:/opt/bank-monitor/

echo "测试环境部署完成!"
```

## 🏭 生产环境部署

### 1. 生产环境配置
**.env.production 示例:**
```env
NODE_ENV=production
VITE_API_BASE_URL=https://api.bank-monitor.com/api
VITE_WS_URL=wss://api.bank-monitor.com/ws
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_HOT_RELOAD=false

# 安全配置
VITE_ENCRYPTION_KEY=production-encryption-key
VITE_JWT_SECRET=production-jwt-secret
```

### 2. 构建生产版本
```bash
# 清理之前的构建
npm run clean

# 构建生产版本
npm run build

# 验证构建结果
npm run build:check
```

### 3. 代码签名配置

#### Windows 代码签名
```json
// package.json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "certificate-password",
      "signingHashAlgorithms": ["sha256"],
      "signDlls": true
    }
  }
}
```

#### macOS 代码签名
```json
// package.json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name",
      "hardenedRuntime": true,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    }
  }
}
```

### 4. 自动化部署

#### GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy Production

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/
    
    - name: Deploy to production
      run: |
        # 部署脚本
        ./scripts/deploy-production.sh
```

#### 部署脚本
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "开始生产环境部署..."

# 1. 备份当前版本
BACKUP_DIR="/opt/backups/bank-monitor-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r /opt/bank-monitor/* $BACKUP_DIR/

# 2. 停止当前服务
systemctl stop bank-monitor

# 3. 部署新版本
rm -rf /opt/bank-monitor/*
cp -r dist/* /opt/bank-monitor/

# 4. 更新配置文件
cp config/production.json /opt/bank-monitor/config/

# 5. 设置权限
chown -R bank-monitor:bank-monitor /opt/bank-monitor
chmod +x /opt/bank-monitor/bank-monitor

# 6. 启动服务
systemctl start bank-monitor
systemctl enable bank-monitor

# 7. 健康检查
sleep 10
if systemctl is-active --quiet bank-monitor; then
    echo "部署成功，服务正常运行"
else
    echo "部署失败，正在回滚..."
    systemctl stop bank-monitor
    rm -rf /opt/bank-monitor/*
    cp -r $BACKUP_DIR/* /opt/bank-monitor/
    systemctl start bank-monitor
    exit 1
fi

echo "生产环境部署完成!"
```

## 🐳 Docker 部署

### 1. Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  bank-monitor:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_BASE_URL=https://api.bank-monitor.com
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - bank-monitor
    restart: unless-stopped
```

### 3. 构建和运行
```bash
# 构建镜像
docker build -t bank-monitor:latest .

# 运行容器
docker run -d \
  --name bank-monitor \
  -p 3000:3000 \
  -v $(pwd)/config:/app/config \
  bank-monitor:latest

# 使用 Docker Compose
docker-compose up -d
```

## 🔧 系统服务配置

### Linux Systemd 服务
```ini
# /etc/systemd/system/bank-monitor.service
[Unit]
Description=Bank Monitoring System
After=network.target

[Service]
Type=simple
User=bank-monitor
WorkingDirectory=/opt/bank-monitor
ExecStart=/opt/bank-monitor/bank-monitor
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# 启用和启动服务
sudo systemctl daemon-reload
sudo systemctl enable bank-monitor
sudo systemctl start bank-monitor

# 查看服务状态
sudo systemctl status bank-monitor

# 查看日志
sudo journalctl -u bank-monitor -f
```

### Windows 服务
```xml
<!-- bank-monitor-service.xml -->
<service>
  <id>BankMonitor</id>
  <name>Bank Monitoring System</name>
  <description>银行告警监控系统</description>
  <executable>C:\Program Files\BankMonitor\bank-monitor.exe</executable>
  <workingdirectory>C:\Program Files\BankMonitor</workingdirectory>
  <logmode>rotate</logmode>
</service>
```

## 📊 监控和日志

### 1. 应用监控
```javascript
// 性能监控
const performanceMonitor = {
  startTime: Date.now(),
  
  logMetrics: () => {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: Date.now()
    }
    
    console.log('Performance metrics:', metrics)
  }
}

setInterval(performanceMonitor.logMetrics, 60000) // 每分钟记录一次
```

### 2. 日志配置
```javascript
// 日志配置
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

### 3. 健康检查
```bash
#!/bin/bash
# scripts/health-check.sh

# 检查进程是否运行
if ! pgrep -f "bank-monitor" > /dev/null; then
    echo "ERROR: Bank Monitor process not running"
    exit 1
fi

# 检查端口是否监听
if ! netstat -tuln | grep ":3000 " > /dev/null; then
    echo "ERROR: Port 3000 not listening"
    exit 1
fi

# 检查 HTTP 响应
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "ERROR: Health check endpoint not responding"
    exit 1
fi

echo "OK: All health checks passed"
exit 0
```

## 🔄 更新和回滚

### 1. 滚动更新
```bash
#!/bin/bash
# scripts/rolling-update.sh

NEW_VERSION=$1
CURRENT_VERSION=$(cat /opt/bank-monitor/VERSION)

echo "开始滚动更新: $CURRENT_VERSION -> $NEW_VERSION"

# 1. 下载新版本
wget "https://releases.bank-monitor.com/v$NEW_VERSION/bank-monitor-$NEW_VERSION.tar.gz"

# 2. 备份当前版本
cp -r /opt/bank-monitor /opt/backups/bank-monitor-$CURRENT_VERSION

# 3. 部署新版本
tar -xzf bank-monitor-$NEW_VERSION.tar.gz -C /opt/bank-monitor

# 4. 重启服务
systemctl restart bank-monitor

# 5. 验证部署
if ./scripts/health-check.sh; then
    echo "更新成功"
    echo $NEW_VERSION > /opt/bank-monitor/VERSION
else
    echo "更新失败，正在回滚..."
    ./scripts/rollback.sh $CURRENT_VERSION
fi
```

### 2. 快速回滚
```bash
#!/bin/bash
# scripts/rollback.sh

TARGET_VERSION=$1

echo "开始回滚到版本: $TARGET_VERSION"

# 1. 停止服务
systemctl stop bank-monitor

# 2. 恢复备份
rm -rf /opt/bank-monitor/*
cp -r /opt/backups/bank-monitor-$TARGET_VERSION/* /opt/bank-monitor/

# 3. 启动服务
systemctl start bank-monitor

# 4. 验证回滚
if ./scripts/health-check.sh; then
    echo "回滚成功"
    echo $TARGET_VERSION > /opt/bank-monitor/VERSION
else
    echo "回滚失败，请手动检查"
    exit 1
fi
```

## 🔒 安全配置

### 1. 防火墙配置
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### 2. SSL/TLS 配置
```nginx
# nginx SSL 配置
server {
    listen 443 ssl http2;
    server_name bank-monitor.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

这份部署指南涵盖了从开发环境到生产环境的完整部署流程，包括自动化部署、监控、安全配置等关键环节。
