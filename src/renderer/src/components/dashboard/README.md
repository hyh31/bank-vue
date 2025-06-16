# 银行监控告警系统 - 仪表盘组件包

这个组件包包含了银行监控告警系统的所有仪表盘相关组件，遵循DRY原则设计，提供统一的接口和配置。

## 📦 包含组件

### 主要组件
- **Dashboard** - 主仪表盘容器组件
- **TopHeader** - 顶部标题栏组件
- **StatusIndicator** - 系统状态指示器组件

### 数据展示组件
- **StatCard** - 统计卡片组件
- **ChartContainer** - 图表容器组件
- **ProgressChart** - 进度图表组件
- **DataTable** - 数据表格组件

## 🚀 快速开始

### 导入单个组件
```typescript
import { Dashboard, StatCard, ChartContainer } from '@/components/dashboard'
```

### 导入所有组件
```typescript
import DashboardPackage from '@/components/dashboard'
```

### 导入类型定义
```typescript
import type { StatisticItem, ProgressItem, TableColumn } from '@/components/dashboard'
```

## 📖 组件使用示例

### 1. Dashboard 主仪表盘
```vue
<template>
  <Dashboard />
</template>

<script setup lang="ts">
import { Dashboard } from '@/components/dashboard'
</script>
```

### 2. StatCard 统计卡片
```vue
<template>
  <StatCard
    title="总余额"
    value="¥2,152.62"
    change="+12%"
    trend="up"
    :icon="DollarSign"
    color="blue"
  />
</template>

<script setup lang="ts">
import { StatCard } from '@/components/dashboard'
import { DollarSign } from 'lucide-vue-next'
</script>
```

### 3. ChartContainer 图表容器
```vue
<template>
  <ChartContainer
    title="收支分析"
    :chart-data="chartData"
    chart-type="bar"
    :show-time-range="true"
  />
</template>

<script setup lang="ts">
import { ChartContainer, type ChartData } from '@/components/dashboard'

const chartData: ChartData = {
  labels: ['收入', '支出', '已完成', '未完成'],
  datasets: [{
    label: '金额统计',
    data: [1200, 800, 950, 400],
    backgroundColor: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B']
  }]
}
</script>
```

### 4. ProgressChart 进度图表
```vue
<template>
  <ProgressChart
    title="作业进度统计"
    :progress-items="progressData"
    :show-summary="true"
  />
</template>

<script setup lang="ts">
import { ProgressChart, type ProgressItem } from '@/components/dashboard'

const progressData: ProgressItem[] = [
  {
    id: 'task-1',
    label: '待处理',
    value: 1,
    total: 1,
    status: 'pending'
  }
]
</script>
```

### 5. DataTable 数据表格
```vue
<template>
  <DataTable
    title="市场人员统计"
    :columns="columns"
    :data="tableData"
    :searchable="true"
    :show-pagination="true"
  />
</template>

<script setup lang="ts">
import { DataTable, type TableColumn } from '@/components/dashboard'

const columns: TableColumn[] = [
  { key: 'name', label: '姓名', sortable: true },
  { key: 'amount', label: '金额', sortable: true },
  { key: 'status', label: '状态', sortable: false }
]

const tableData = [
  {
    id: '1',
    name: 'Bingsong Wu',
    amount: '¥2,152.62',
    status: 'active'
  }
]
</script>
```

## 🎨 主题和样式

### 颜色主题
组件包提供了统一的颜色主题：
- `blue` - 主要色彩
- `green` - 成功/正常状态
- `yellow` - 警告状态
- `red` - 错误/危险状态
- `purple` - 信息状态
- `gray` - 中性状态

### 响应式设计
所有组件都支持响应式设计，在不同屏幕尺寸下自动调整布局。

## 🛠️ 工具函数

### 格式化函数
```typescript
import { formatCurrency, formatPercentage, formatDateTime } from '@/components/dashboard'

// 格式化货币
const amount = formatCurrency(1234.56) // ¥1,234.56

// 格式化百分比
const percent = formatPercentage(0.1234, true) // 12.3%

// 格式化日期
const date = formatDateTime(new Date(), 'datetime') // 2024/6/16 13:30:00
```

### 性能优化函数
```typescript
import { debounce, throttle } from '@/components/dashboard'

// 防抖
const debouncedSearch = debounce((query: string) => {
  // 搜索逻辑
}, 300)

// 节流
const throttledScroll = throttle(() => {
  // 滚动处理逻辑
}, 100)
```

## 📋 类型定义

### StatisticItem
```typescript
interface StatisticItem {
  id: string
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: any
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray'
  unit?: string
  description?: string
}
```

### ProgressItem
```typescript
interface ProgressItem {
  id: string
  label: string
  value: number
  total: number
  status: 'completed' | 'active' | 'pending' | 'error'
  color?: string
  details?: string
}
```

### TableColumn
```typescript
interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any) => string
}
```

## 🔧 配置选项

### 默认配置
```typescript
import { DEFAULT_COLORS, DEFAULT_CHART_CONFIG, DEFAULT_TABLE_CONFIG } from '@/components/dashboard'
```

## 📝 开发规范

### 代码规范
1. **DRY原则** - 避免重复代码，提取公共逻辑
2. **注释规范** - 所有公共函数和复杂逻辑都需要添加注释
3. **类型安全** - 使用TypeScript类型定义确保类型安全
4. **响应式设计** - 所有组件都需要支持响应式布局

### 组件设计原则
1. **单一职责** - 每个组件只负责一个功能
2. **可复用性** - 组件设计要考虑复用性
3. **可配置性** - 提供足够的配置选项
4. **性能优化** - 使用适当的性能优化技术

## 🚀 未来规划

- [ ] 添加更多图表类型支持
- [ ] 集成真实的图表库 (Chart.js/ECharts)
- [ ] 添加主题切换功能
- [ ] 支持自定义组件样式
- [ ] 添加组件单元测试
- [ ] 支持国际化

## 📄 版本信息

- **版本**: 1.0.0
- **作者**: Hyphen
- **创建日期**: 2024-06-16
- **最后更新**: 2024-06-16

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📞 支持

如有问题或建议，请联系开发团队或创建 Issue。
