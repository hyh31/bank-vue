# 银行监控告警系统 - 仪表盘组件

银行监控告警系统的仪表盘组件库，包含了完整的数据展示和监控功能。

## 组件列表

### 核心组件
- **KeyMetricsSection** - 关键指标展示
- **AlertsSection** - 告警信息滚动显示
- **SystemStatusSection** - 系统状态监控
- **RegionStatsSection** - 地域分布统计
- **TransactionSection** - 交易数据表格

### 业务逻辑 (Composables)
- **useMetrics** - 指标数据管理
- **useAlerts** - 告警数据管理
- **useSystemMonitor** - 系统监控
- **useRegionStats** - 地域统计
- **useTransactions** - 交易数据管理
- **useHealthCalculator** - 健康度计算

## 使用方法

### 导入组件
```typescript
import {
  KeyMetricsSection,
  AlertsSection,
  SystemStatusSection
} from '@/components/dashboard'
```

### 导入 Composables
```typescript
import { useMetrics, useAlerts } from '@/components/dashboard'
```

## 组件使用示例

### 关键指标组件
```vue
<template>
  <KeyMetricsSection />
</template>

<script setup lang="ts">
import { KeyMetricsSection } from '@/components/dashboard'
</script>
```

### 告警信息组件
```vue
<template>
  <AlertsSection />
</template>

<script setup lang="ts">
import { AlertsSection } from '@/components/dashboard'
</script>
```

### 系统状态组件
```vue
<template>
  <SystemStatusSection />
</template>

<script setup lang="ts">
import { SystemStatusSection } from '@/components/dashboard'
</script>
```

### 地域统计组件
```vue
<template>
  <RegionStatsSection />
</template>

<script setup lang="ts">
import { RegionStatsSection } from '@/components/dashboard'
</script>
```

### 交易数据组件
```vue
<template>
  <TransactionSection />
</template>

<script setup lang="ts">
import { TransactionSection } from '@/components/dashboard'
</script>
```

## Composable 使用示例

### 指标数据管理
```typescript
import { useMetrics } from '@/components/dashboard'

const {
  metrics,
  initializeMetrics,
  updateMetric
} = useMetrics()
```

### 告警数据管理
```typescript
import { useAlerts } from '@/components/dashboard'

const {
  alerts,
  fetchAlerts,
  startAutoScroll
} = useAlerts()
```

## 功能特性

### 自动数据刷新
所有组件都支持自动数据刷新，默认30秒更新一次。

### 实时滚动效果
告警信息和地域统计支持平滑的自动滚动显示。

### 响应式布局
组件在不同屏幕尺寸下自动调整布局和显示效果。

### 错误处理
内置完善的错误处理机制，网络异常时显示友好提示。

## 工具函数

### 货币格式化
```typescript
// 在 composable 中使用
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}
```

### 时间格式化
```typescript
// 相对时间显示
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  // ...
}
```

## 数据接口

### 告警数据
```typescript
interface AlertItem {
  id: string
  level: 'high' | 'medium' | 'low'
  message: string
  timestamp: Date
  source: string
}
```

### 交易数据
```typescript
interface TransactionItem {
  id: string
  amount: number
  type: string
  status: 'completed' | 'pending' | 'failed'
  riskLevel: 'high' | 'medium' | 'low'
  timestamp: Date
}
```

### 地域统计
```typescript
interface RegionStatsItem {
  name: string
  count: number
  percentage: string
  color: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}
```

## 配置选项

### 自动刷新配置
```typescript
// 在 composable 中配置
const { alerts } = useAlerts({
  autoRefresh: true,
  refreshInterval: 30000  // 30秒
})
```

## 开发说明

### 组件架构
采用 Vue 3 Composition API 设计，每个组件都有对应的 composable 来管理业务逻辑。

### 技术栈
- Vue 3 + TypeScript
- Tailwind CSS + shadcn/ui
- Lucide Vue (图标库)
- Pinia (状态管理)

### 文件结构
```
dashboard/
├── index.ts                 # 统一导出
├── KeyMetricsSection.vue    # 关键指标组件
├── AlertsSection.vue        # 告警信息组件
├── SystemStatusSection.vue  # 系统状态组件
├── RegionStatsSection.vue   # 地域统计组件
├── TransactionSection.vue   # 交易数据组件
├── useMetrics.ts           # 指标数据逻辑
├── useAlerts.ts            # 告警数据逻辑
├── useSystemMonitor.ts     # 系统监控逻辑
├── useRegionStats.ts       # 地域统计逻辑
├── useTransactions.ts      # 交易数据逻辑
└── useHealthCalculator.ts  # 健康度计算逻辑
```

### 设计原则
1. 组件只负责 UI 渲染
2. 业务逻辑封装在 composable 中
3. 数据和 UI 完全分离
4. 支持自动数据刷新和错误处理

## 版本信息

当前版本：1.0.0
最后更新：2025-07-11
