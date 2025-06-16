# API 接口文档

## 📋 概述

银行告警监控系统的API接口文档，定义了前端与后端数据交互的接口规范。

## 🔗 基础信息

### 基础URL
```
开发环境: http://localhost:3000/api
生产环境: https://api.bank-monitor.com/api
```

### 认证方式
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### 响应格式
```typescript
interface ApiResponse<T> {
  code: number          // 状态码
  message: string       // 响应消息
  data: T              // 响应数据
  timestamp: number    // 时间戳
}
```

## 📊 关键指标接口

### 获取关键指标
```http
GET /metrics/summary
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalAlerts": {
      "value": 127,
      "change": "+23%",
      "trend": "up"
    },
    "highRiskTransactions": {
      "value": 8,
      "change": "-12%",
      "trend": "down"
    },
    "monitoredAccounts": {
      "value": 2847,
      "change": "+5%",
      "trend": "up"
    },
    "systemHealth": {
      "value": "98.5%",
      "change": "+0.2%",
      "trend": "up"
    }
  },
  "timestamp": 1718544000000
}
```

**数据类型:**
```typescript
interface MetricsSummary {
  totalAlerts: MetricItem
  highRiskTransactions: MetricItem
  monitoredAccounts: MetricItem
  systemHealth: MetricItem
}

interface MetricItem {
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
}
```

## 🚨 告警接口

### 获取实时告警列表
```http
GET /alerts/realtime?limit=10&offset=0
```

**查询参数:**
- `limit`: 返回数量限制 (默认: 10)
- `offset`: 偏移量 (默认: 0)
- `level`: 告警级别过滤 (可选: critical, warning, info)

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "title": "异常大额转账检测",
        "description": "账户 ****1234 发生单笔 500万 转账，超出日常交易阈值",
        "level": "critical",
        "timestamp": 1718543700000,
        "source": "transaction_monitor",
        "relatedAccount": "****1234",
        "amount": 5000000
      }
    ],
    "total": 127,
    "hasMore": true
  },
  "timestamp": 1718544000000
}
```

**数据类型:**
```typescript
interface AlertsResponse {
  alerts: AlertItem[]
  total: number
  hasMore: boolean
}

interface AlertItem {
  id: string
  title: string
  description: string
  level: 'critical' | 'warning' | 'info'
  timestamp: number
  source: string
  relatedAccount?: string
  amount?: number
}
```

### 获取告警详情
```http
GET /alerts/{alertId}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "alert-001",
    "title": "异常大额转账检测",
    "description": "账户 ****1234 发生单笔 500万 转账，超出日常交易阈值",
    "level": "critical",
    "timestamp": 1718543700000,
    "source": "transaction_monitor",
    "details": {
      "transactionId": "TXN001234567",
      "fromAccount": "****1234",
      "toAccount": "****5678",
      "amount": 5000000,
      "riskScore": 95,
      "riskFactors": [
        "大额交易",
        "异常时间",
        "新收款账户"
      ]
    },
    "actions": [
      {
        "id": "freeze_account",
        "name": "冻结账户",
        "type": "critical"
      },
      {
        "id": "manual_review",
        "name": "人工审核",
        "type": "normal"
      }
    ]
  },
  "timestamp": 1718544000000
}
```

### 处理告警
```http
POST /alerts/{alertId}/handle
```

**请求体:**
```json
{
  "action": "manual_review",
  "comment": "已安排人工审核",
  "operator": "admin001"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "告警处理成功",
  "data": {
    "alertId": "alert-001",
    "status": "handled",
    "handledAt": 1718544000000,
    "operator": "admin001"
  },
  "timestamp": 1718544000000
}
```

## 🌍 地域分布接口

### 获取地域分布统计
```http
GET /statistics/regions?date=2024-06-15
```

**查询参数:**
- `date`: 查询日期 (格式: YYYY-MM-DD, 默认: 昨日)
- `type`: 统计类型 (可选: transaction, alert, user)

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "2024-06-15",
    "total": 4441,
    "regions": [
      {
        "name": "北京",
        "code": "BJ",
        "count": 1234,
        "percentage": 28,
        "trend": "up",
        "change": "+5.2%"
      },
      {
        "name": "上海",
        "code": "SH",
        "count": 987,
        "percentage": 22,
        "trend": "down",
        "change": "-2.1%"
      }
    ]
  },
  "timestamp": 1718544000000
}
```

**数据类型:**
```typescript
interface RegionStatistics {
  date: string
  total: number
  regions: RegionItem[]
}

interface RegionItem {
  name: string
  code: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'neutral'
  change: string
}
```

## 🖥️ 系统状态接口

### Electron IPC 系统监控

#### 获取系统状态
```typescript
// 渲染进程调用
const systemStatus = await window.api.getSystemStatus()
```

**返回数据结构:**
```typescript
interface SystemStatus {
  cpu: SystemComponent
  memory: SystemComponent
  network: SystemComponent
  database: SystemComponent
}

interface SystemComponent {
  name: string
  value: string
  percentage: number
  status: 'normal' | 'warning' | 'critical'
  total?: string
  connectionCount?: number
  maxConnections?: number
}
```

**响应示例:**
```json
{
  "cpu": {
    "name": "CPU使用率",
    "value": "8.3%",
    "percentage": 8,
    "status": "normal"
  },
  "memory": {
    "name": "内存使用率",
    "value": "12.4GB",
    "percentage": 62,
    "status": "warning",
    "total": "20.0GB"
  },
  "network": {
    "name": "网络延迟",
    "value": "23ms",
    "percentage": 77,
    "status": "normal"
  },
  "database": {
    "name": "数据库连接",
    "value": "正常",
    "percentage": 100,
    "status": "normal",
    "connectionCount": 245,
    "maxConnections": 500
  }
}
```

#### 获取系统信息
```typescript
// 渲染进程调用
const systemInfo = await window.api.getSystemInfo()
```

**返回数据结构:**
```typescript
interface SystemInfo {
  platform: string
  distro: string
  release: string
  arch: string
  hostname: string
  cpu: {
    manufacturer: string
    brand: string
    cores: number
    physicalCores: number
    speed: number
  }
  memory: {
    total: number
    free: number
    used: number
  }
}
```

**响应示例:**
```json
{
  "platform": "win32",
  "distro": "Microsoft Windows",
  "release": "10.0.19045",
  "arch": "x64",
  "hostname": "DESKTOP-ABC123",
  "cpu": {
    "manufacturer": "Intel",
    "brand": "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz",
    "cores": 16,
    "physicalCores": 8,
    "speed": 3.8
  },
  "memory": {
    "total": 21474836480,
    "free": 8589934592,
    "used": 12884901888
  }
}
```

### 状态判断逻辑

#### CPU状态
- **normal**: 使用率 < 60%
- **warning**: 使用率 60-80%
- **critical**: 使用率 > 80%

#### 内存状态
- **normal**: 使用率 < 60%
- **warning**: 使用率 60-80%
- **critical**: 使用率 > 80%

#### 网络状态
- **normal**: 延迟 < 50ms
- **warning**: 延迟 50-100ms
- **critical**: 延迟 > 100ms

### HTTP API 系统状态（可选）

如果需要通过HTTP API获取系统状态：

#### 获取系统状态
```http
GET /api/system/status
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overall": "normal",
    "components": [
      {
        "name": "CPU使用率",
        "value": "68%",
        "percentage": 68,
        "status": "normal",
        "threshold": 80
      },
      {
        "name": "内存使用率",
        "value": "4.2GB",
        "percentage": 45,
        "status": "normal",
        "threshold": 80
      },
      {
        "name": "网络延迟",
        "value": "12ms",
        "percentage": 85,
        "status": "normal",
        "threshold": 100
      },
      {
        "name": "数据库连接",
        "value": "正常",
        "percentage": 100,
        "status": "normal",
        "connectionCount": 234,
        "maxConnections": 500
      }
    ],
    "lastUpdate": 1718544000000
  },
  "timestamp": 1718544000000
}
```

**数据类型:**
```typescript
interface SystemStatusResponse {
  overall: 'normal' | 'warning' | 'critical'
  components: SystemComponent[]
  lastUpdate: number
}

interface SystemComponent {
  name: string
  value: string
  percentage: number
  status: 'normal' | 'warning' | 'critical'
  threshold?: number
  connectionCount?: number
  maxConnections?: number
}
```

## 📋 交易监控接口

### 获取交易列表
```http
GET /transactions?limit=20&offset=0&status=all&riskLevel=all
```

**查询参数:**
- `limit`: 返回数量限制 (默认: 20)
- `offset`: 偏移量 (默认: 0)
- `status`: 状态过滤 (可选: completed, pending, failed, all)
- `riskLevel`: 风险等级过滤 (可选: high, medium, low, all)
- `startDate`: 开始日期 (格式: YYYY-MM-DD)
- `endDate`: 结束日期 (格式: YYYY-MM-DD)

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "transactions": [
      {
        "id": "TXN001234567",
        "account": "****1234",
        "amount": 5000000,
        "type": "转账",
        "status": "pending",
        "riskLevel": "high",
        "timestamp": 1718543700000,
        "fromAccount": "****1234",
        "toAccount": "****5678",
        "riskScore": 95,
        "location": "北京"
      }
    ],
    "total": 15234,
    "hasMore": true,
    "summary": {
      "totalAmount": 120000000,
      "completedCount": 14890,
      "pendingCount": 234,
      "failedCount": 110
    }
  },
  "timestamp": 1718544000000
}
```

**数据类型:**
```typescript
interface TransactionsResponse {
  transactions: TransactionItem[]
  total: number
  hasMore: boolean
  summary: TransactionSummary
}

interface TransactionItem {
  id: string
  account: string
  amount: number
  type: string
  status: 'completed' | 'pending' | 'failed'
  riskLevel: 'high' | 'medium' | 'low'
  timestamp: number
  fromAccount: string
  toAccount: string
  riskScore: number
  location: string
}

interface TransactionSummary {
  totalAmount: number
  completedCount: number
  pendingCount: number
  failedCount: number
}
```

### 获取交易详情
```http
GET /transactions/{transactionId}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "TXN001234567",
    "account": "****1234",
    "amount": 5000000,
    "type": "转账",
    "status": "pending",
    "riskLevel": "high",
    "timestamp": 1718543700000,
    "details": {
      "fromAccount": "****1234",
      "toAccount": "****5678",
      "fromBank": "中国银行",
      "toBank": "工商银行",
      "purpose": "业务往来",
      "channel": "网银",
      "deviceInfo": {
        "ip": "192.168.1.100",
        "device": "Windows PC",
        "location": "北京市朝阳区"
      }
    },
    "riskAnalysis": {
      "score": 95,
      "factors": [
        "大额交易",
        "异常时间",
        "新收款账户"
      ],
      "recommendation": "建议人工审核"
    }
  },
  "timestamp": 1718544000000
}
```

## 🔄 WebSocket 实时推送

### 连接地址
```
ws://localhost:3000/ws
wss://api.bank-monitor.com/ws
```

### 认证
```javascript
// 连接时发送认证信息
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}))
```

### 消息格式
```typescript
interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}
```

### 消息类型

#### 新告警推送
```json
{
  "type": "new_alert",
  "data": {
    "id": "alert-002",
    "title": "可疑登录行为",
    "level": "warning",
    "timestamp": 1718544000000
  },
  "timestamp": 1718544000000
}
```

#### 系统状态更新
```json
{
  "type": "system_status_update",
  "data": {
    "component": "CPU使用率",
    "value": "75%",
    "status": "warning"
  },
  "timestamp": 1718544000000
}
```

#### 交易状态更新
```json
{
  "type": "transaction_update",
  "data": {
    "id": "TXN001234567",
    "status": "completed",
    "timestamp": 1718544000000
  },
  "timestamp": 1718544000000
}
```

## ❌ 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 检查认证token |
| 403 | 权限不足 | 联系管理员分配权限 |
| 404 | 资源不存在 | 检查请求路径 |
| 429 | 请求频率过高 | 降低请求频率 |
| 500 | 服务器内部错误 | 联系技术支持 |
| 503 | 服务不可用 | 稍后重试 |

## 📝 使用示例

### JavaScript/TypeScript
```typescript
// 获取实时告警
async function getRealtimeAlerts() {
  try {
    const response = await fetch('/api/alerts/realtime', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      return result.data.alerts
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('获取告警失败:', error)
    throw error
  }
}

// WebSocket 连接
const ws = new WebSocket('ws://localhost:3000/ws')

ws.onopen = () => {
  // 发送认证
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }))
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  switch (message.type) {
    case 'new_alert':
      handleNewAlert(message.data)
      break
    case 'system_status_update':
      updateSystemStatus(message.data)
      break
  }
}
```

---

这份API文档提供了银行告警监控系统所有接口的详细说明，包括请求格式、响应格式、数据类型和使用示例。
