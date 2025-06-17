# 银行监控告警系统 - 数据可视化功能

## 📊 概述

数据可视化模块是银行监控告警系统的核心功能之一，提供了丰富的图表组件和实时数据监控能力。该模块采用组件化设计，支持响应式布局，针对1920*1080和3840*2160分辨率进行了优化。

## 🎯 功能特性

### 主要功能
- **交易趋势分析** - 实时交易量、成功率、异常率监控
- **风险分布统计** - 低、中、高风险等级可视化分析
- **实时数据流** - 系统性能指标实时监控
- **业务数据报表** - 地域分布、时段分析、业务类型统计
- **自动刷新机制** - 可配置的数据自动更新

### 技术特性
- **无路由设计** - 通过侧边栏切换视图，无需复杂路由配置
- **组件化架构** - 可复用的图表组件，遵循DRY原则
- **响应式布局** - 适配多种分辨率，优化用户体验
- **实时更新** - 支持WebSocket连接和定时刷新
- **性能优化** - 防抖节流、数据缓存、动画优化

## 🏗️ 架构设计

### 组件结构
```
src/renderer/src/components/
├── DataVisualization.vue          # 数据可视化主组件
├── charts/                        # 专门图表组件目录
│   ├── index.ts                   # 图表组件包索引
│   ├── TransactionTrendChart.vue  # 交易趋势图表
│   ├── RiskDistributionChart.vue  # 风险分布饼图
│   └── RealtimeDataStream.vue     # 实时数据流组件
├── dashboard/                     # 仪表盘组件包
│   ├── index.ts                   # 组件包索引（已更新）
│   └── types.ts                   # 类型定义
└── ui/                           # 基础UI组件
```

### 视图切换机制
```typescript
// App.vue - 主应用组件
type ViewType = 'dashboard' | 'data-visualization'
const currentView = ref<ViewType>('dashboard')

// AppSidebar.vue - 侧边栏组件
interface Emits {
  (e: 'view-change', view: string): void
}
```

## 📈 图表组件详解

### 1. TransactionTrendChart - 交易趋势图表

**功能特性：**
- 实时交易量监控
- 成功率和异常率趋势
- 可配置时间范围
- 自动刷新机制

**使用示例：**
```vue
<TransactionTrendChart 
  title="交易趋势分析"
  subtitle="实时交易量监控"
  chart-height="300px"
  :auto-refresh="true"
  :refresh-interval="30000"
/>
```

**数据结构：**
```typescript
interface TransactionTrendData {
  timestamp: number
  volume: number
  successRate: number
  errorRate: number
}
```

### 2. RiskDistributionChart - 风险分布饼图

**功能特性：**
- 风险等级可视化
- 动态饼图展示
- 趋势指示器
- 交互式图例

**使用示例：**
```vue
<RiskDistributionChart
  title="风险等级分布"
  subtitle="交易风险分析统计"
  chart-height="300px"
  :auto-refresh="true"
  :refresh-interval="45000"
/>
```

**数据结构：**
```typescript
interface RiskDistributionData {
  low: { count: number; percentage: number }
  medium: { count: number; percentage: number }
  high: { count: number; percentage: number }
}
```

### 3. RealtimeDataStream - 实时数据流

**功能特性：**
- 系统性能监控
- 实时事件日志
- 连接状态管理
- 数据流动画效果

**使用示例：**
```vue
<RealtimeDataStream
  title="实时数据流监控"
  subtitle="系统性能与交易数据实时监控"
  chart-height="400px"
  :max-data-points="50"
/>
```

**数据结构：**
```typescript
interface RealtimeMetrics {
  tps: number
  latency: number
  errorRate: number
  connections: number
}
```

## 🎨 样式设计

### 响应式布局
```css
/* 基础网格布局 */
.grid-cols-4 { /* 4列布局 */ }
.grid-cols-3 { /* 3列布局 */ }
.grid-cols-2 { /* 2列布局 */ }

/* 1920*1080 分辨率优化 */
@media (max-width: 1920px) {
  .grid-cols-4 { @apply grid-cols-2; }
  .grid-cols-3 { @apply grid-cols-2; }
}

/* 4K分辨率优化 */
@media (min-width: 3840px) {
  .grid-cols-4 { @apply grid-cols-6; }
  .grid-cols-3 { @apply grid-cols-4; }
  .grid-cols-2 { @apply grid-cols-3; }
}
```

### 动画效果
```css
/* 卡片悬停效果 */
.hover:shadow-lg { /* 阴影增强 */ }
.hover:scale-105 { /* 轻微放大 */ }
.transition-all { /* 平滑过渡 */ }

/* SVG动画 */
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

## 🔧 配置选项

### 图表颜色主题
```typescript
export const CHART_COLORS = {
  primary: '#3b82f6',    // 主色调
  success: '#10b981',    // 成功状态
  warning: '#f59e0b',    // 警告状态
  danger: '#ef4444',     // 危险状态
  info: '#8b5cf6',       // 信息状态
  neutral: '#6b7280'     // 中性状态
} as const
```

### 刷新间隔配置
```typescript
export const CHART_REFRESH_INTERVALS = {
  fast: 5000,      // 快速刷新 - 5秒
  normal: 30000,   // 正常刷新 - 30秒
  slow: 60000,     // 慢速刷新 - 1分钟
  verySlow: 300000 // 超慢刷新 - 5分钟
} as const
```

## 🛠️ 工具函数

### 数据格式化
```typescript
// 数值格式化
formatChartValue(1234567, 'number')    // "1.2M"
formatChartValue(85.6, 'percentage')   // "85.6%"
formatChartValue(1234.56, 'currency')  // "¥1,235"

// 时间标签生成
generateTimeLabels(12, 5)  // 生成12个标签，间隔5分钟

// 模拟数据生成
generateMockData(10, 0, 100, 'up')  // 生成上升趋势数据
```

### 趋势计算
```typescript
const trend = calculateTrend([10, 15, 20, 18, 25])
// 返回: { direction: 'up', change: 15, changePercent: 150 }
```

## 📱 响应式适配

### 分辨率支持
- **1920*1080** - 主要开发分辨率，2列布局优化
- **3840*2160** - 4K分辨率，3-6列布局优化
- **移动端** - 单列布局，简化交互

### 布局策略
```typescript
// 网格布局自适应
const getGridCols = (screenWidth: number) => {
  if (screenWidth >= 3840) return 6      // 4K显示器
  if (screenWidth >= 1920) return 4      // 标准显示器
  if (screenWidth >= 1280) return 2      // 小屏幕
  return 1                               // 移动端
}
```

## 🚀 性能优化

### 数据更新策略
- **防抖处理** - 避免频繁更新
- **增量更新** - 只更新变化的数据
- **缓存机制** - 减少重复计算
- **虚拟滚动** - 处理大量数据

### 动画优化
- **CSS动画** - 使用GPU加速
- **requestAnimationFrame** - 平滑动画
- **will-change** - 优化渲染性能

## 📝 开发规范

### 组件设计原则
1. **单一职责** - 每个组件专注一个功能
2. **可复用性** - 通过props配置不同行为
3. **类型安全** - 完整的TypeScript类型定义
4. **性能优先** - 避免不必要的重渲染

### 代码规范
```typescript
// 组件属性定义
interface Props {
  title?: string
  subtitle?: string
  chartHeight?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

// 事件定义
interface Emits {
  (e: 'data-update', data: any): void
  (e: 'error', error: Error): void
}
```

## 🔮 未来规划

### 短期目标
- [ ] 集成真实图表库 (ECharts/Chart.js)
- [ ] 添加更多图表类型
- [ ] 实现数据导出功能
- [ ] 添加图表配置面板

### 长期目标
- [ ] 支持自定义图表
- [ ] 实现拖拽布局
- [ ] 添加数据钻取功能
- [ ] 支持多主题切换

## 📞 技术支持

如有问题或建议，请联系开发团队：
- **作者**: Hyphen
- **邮箱**: admin@bankmonitor.com
- **创建日期**: 2024-06-16
- **版本**: 1.0.0
