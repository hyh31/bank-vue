<template>
  <div class="flex flex-col h-full bg-background">
    <!-- 银行告警系统顶部标题栏 -->
    <div class="border-b bg-card px-6 py-3 hover:bg-muted/30 transition-colors duration-300">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-foreground">银行告警监控系统</h1>
          <p class="text-xs text-muted-foreground mt-1">实时监控银行业务风险与异常告警</p>
        </div>
        <div class="flex items-center space-x-2">
          <!-- 系统状态指示器 -->
          <Badge
            :variant="
              systemStatus === 'normal'
                ? 'default'
                : systemStatus === 'warning'
                  ? 'secondary'
                  : 'destructive'
            "
            class="hover:scale-105 transition-transform cursor-pointer"
          >
            <Activity class="w-3 h-3 mr-1" />
            {{ systemStatusText }}
          </Badge>

          <!-- 刷新按钮 -->
          <Button
            variant="outline"
            size="sm"
            :disabled="isRefreshing"
            class="hover:scale-105 transition-all duration-300 hover:shadow-md"
            @click="refreshData"
          >
            <RefreshCw :class="['w-3 h-3 mr-1', isRefreshing ? 'animate-spin' : '']" />
            刷新
          </Button>

          <!-- 告警设置 -->
          <Button
            variant="outline"
            size="sm"
            class="hover:scale-105 transition-all duration-300 hover:shadow-md"
          >
            <Settings class="w-3 h-3 mr-1" />
            设置
          </Button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 p-4 h-full overflow-hidden">
      <div class="h-full grid grid-rows-[auto_auto_1fr] gap-4">
        <!-- 关键指标卡片 -->
        <div class="grid grid-cols-4 gap-4">
          <Card
            v-for="metric in keyMetrics"
            :key="metric.id"
            class="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 group hover:bg-primary/5"
          >
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
            <CardTitle class="text-sm font-medium group-hover:text-primary transition-colors">
              {{ metric.title }}
            </CardTitle>
            <component
              :is="metric.icon"
              :class="[
                'h-4 w-4 transition-all duration-300 group-hover:scale-110',
                metric.iconColor
              ]"
            />
          </CardHeader>
          <CardContent class="pb-3">
            <div class="text-xl font-bold group-hover:text-primary transition-colors mb-1">
              {{ metric.value }}
            </div>
            <div class="flex items-center text-xs text-muted-foreground">
              <component
                :is="
                  metric.trend === 'up'
                    ? TrendingUp
                    : metric.trend === 'down'
                      ? TrendingDown
                      : Minus
                "
                :class="['h-3 w-3 mr-1 transition-all duration-300', getTrendColor(metric.trend)]"
              />
              <span :class="getTrendColor(metric.trend)">{{ metric.change }}</span>
              <span class="ml-1">较昨日</span>
            </div>
          </CardContent>
          </Card>
        </div>

        <!-- 实时告警区域 -->
        <div class="grid grid-cols-3 gap-4">
          <!-- 告警列表 -->
          <div class="col-span-1">
          <Card
            class="hover:shadow-md transition-all duration-300 hover:border-primary/30"
            style="height: 300px"
          >
            <CardHeader class="pb-2">
              <CardTitle class="flex items-center">
                <AlertTriangle class="w-5 h-5 mr-2 text-destructive animate-pulse" />
                实时告警
                <Badge variant="destructive" class="ml-2 text-xs">{{
                  realtimeAlerts.length
                }}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent class="h-full overflow-hidden relative">
              <div
                ref="alertContainer"
                class="space-y-3 transition-transform duration-1000 ease-in-out"
                :style="{ transform: `translateY(-${currentAlertIndex * 100}px)` }"
              >
                <!-- 原始告警列表 -->
                <div
                  v-for="alert in realtimeAlerts"
                  :key="alert.id"
                  class="p-3 rounded-lg border hover:bg-muted/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-sm"
                  style="height: 88px"
                >
                  <div class="flex items-start justify-between h-full">
                    <div class="flex items-start space-x-3 flex-1 min-w-0">
                      <component
                        :is="getAlertIcon(alert.level)"
                        :class="['h-4 w-4 mt-0.5 flex-shrink-0', getAlertIconColor(alert.level)]"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium truncate">{{ alert.title }}</div>
                        <div class="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {{ alert.description }}
                        </div>
                        <div class="text-xs text-muted-foreground mt-1">
                          {{ formatTime(alert.timestamp) }}
                        </div>
                      </div>
                    </div>
                    <Badge
                      :variant="getAlertVariant(alert.level)"
                      class="text-xs hover:scale-105 transition-transform flex-shrink-0 ml-2"
                    >
                      {{ alert.level }}
                    </Badge>
                  </div>
                </div>

                <!-- 复制的告警列表，用于无缝循环 -->
                <div
                  v-for="alert in realtimeAlerts"
                  :key="`copy-${alert.id}`"
                  class="p-3 rounded-lg border hover:bg-muted/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-sm"
                  style="height: 88px"
                >
                  <div class="flex items-start justify-between h-full">
                    <div class="flex items-start space-x-3 flex-1 min-w-0">
                      <component
                        :is="getAlertIcon(alert.level)"
                        :class="['h-4 w-4 mt-0.5 flex-shrink-0', getAlertIconColor(alert.level)]"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium truncate">{{ alert.title }}</div>
                        <div class="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {{ alert.description }}
                        </div>
                        <div class="text-xs text-muted-foreground mt-1">
                          {{ formatTime(alert.timestamp) }}
                        </div>
                      </div>
                    </div>
                    <Badge
                      :variant="getAlertVariant(alert.level)"
                      class="text-xs hover:scale-105 transition-transform flex-shrink-0 ml-2"
                    >
                      {{ alert.level }}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

        <!-- 告警统计和系统状态 -->
        <div class="space-y-4">
          <!-- 昨日地域分布统计 -->
          <Card class="hover:shadow-md transition-shadow duration-300" style="height: 300px">
            <CardHeader class="pb-2">
              <CardTitle class="flex items-center">
                <BarChart3 class="w-4 h-4 mr-2" />
                昨日地域分布
              </CardTitle>
            </CardHeader>
            <CardContent class="h-full overflow-hidden relative">
              <div
                ref="regionContainer"
                class="space-y-3"
                :style="{
                  transform: `translateY(-${regionScrollOffset}px)`,
                  transition: isRegionScrolling ? 'none' : 'transform 0.1s ease-out'
                }"
              >
                <!-- 原始地域列表 -->
                <div
                  v-for="region in regionStats"
                  :key="region.name"
                  class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  style="height: 48px"
                >
                  <div class="flex items-center">
                    <div :class="['w-3 h-3 rounded-full mr-3', region.color]"></div>
                    <span class="text-sm font-medium">{{ region.name }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-muted-foreground">{{ region.percentage }}%</span>
                    <Badge :variant="region.variant" class="hover:scale-105 transition-transform">
                      {{ region.count }}笔
                    </Badge>
                  </div>
                </div>

                <!-- 复制的地域列表，用于无缝循环 -->
                <div
                  v-for="region in regionStats"
                  :key="`copy-${region.name}`"
                  class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  style="height: 48px"
                >
                  <div class="flex items-center">
                    <div :class="['w-3 h-3 rounded-full mr-3', region.color]"></div>
                    <span class="text-sm font-medium">{{ region.name }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-muted-foreground">{{ region.percentage }}%</span>
                    <Badge :variant="region.variant" class="hover:scale-105 transition-transform">
                      {{ region.count }}笔
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="space-y-4">
          <!-- 系统状态监控 -->
          <Card class="hover:shadow-md transition-shadow duration-300" style="height: 300px">
            <CardHeader>
              <CardTitle class="flex items-center">
                <Activity class="w-4 h-4 mr-2" />
                系统状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div v-for="status in systemStatusList" :key="status.name" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{{ status.name }}</span>
                    <Badge :variant="status.status === 'normal' ? 'default' : 'secondary'">
                      {{ status.value }}
                    </Badge>
                  </div>
                  <div class="w-full bg-muted rounded-full h-2">
                    <div
                      :class="['h-2 rounded-full transition-all duration-500', status.color]"
                      :style="{ width: `${status.percentage}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        <!-- 监控数据表格 -->
        <Card class="hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <div class="flex items-center">
              <Database class="w-5 h-5 mr-2" />
              交易监控数据
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw class="w-4 h-4 mr-2" />
              刷新
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent class="flex-1 overflow-hidden">
          <div class="h-full overflow-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易ID</TableHead>
                <TableHead>账户</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>风险等级</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="transaction in transactionData"
                :key="transaction.id"
                class="hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <TableCell class="font-mono text-primary">{{ transaction.id }}</TableCell>
                <TableCell class="font-medium">{{ transaction.account }}</TableCell>
                <TableCell class="font-mono">{{ formatCurrency(transaction.amount) }}</TableCell>
                <TableCell>{{ transaction.type }}</TableCell>
                <TableCell>
                  <Badge
                    :variant="getStatusVariant(transaction.status)"
                    class="hover:scale-105 transition-transform"
                  >
                    {{ transaction.status }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="getRiskVariant(transaction.riskLevel)"
                    class="hover:scale-105 transition-transform"
                  >
                    {{ transaction.riskLevel }}
                  </Badge>
                </TableCell>
                <TableCell class="text-muted-foreground">{{
                  formatTime(transaction.timestamp)
                }}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" class="hover:scale-105 transition-transform">
                    查看详情
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  AlertTriangle,
  Shield,
  Users,
  Database,
  RefreshCw,
  Settings,
  AlertCircle,
  XCircle,
  CheckCircle,
  BarChart3
} from 'lucide-vue-next'

// shadcn-vue 组件导入
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

/**
 * 银行告警系统数据接口定义
 */
interface KeyMetric {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: any
  iconColor: string
}

interface AlertItem {
  id: string
  title: string
  description: string
  level: 'critical' | 'warning' | 'info'
  timestamp: Date
}

interface TransactionItem {
  id: string
  account: string
  amount: number
  type: string
  status: 'completed' | 'pending' | 'failed'
  riskLevel: 'high' | 'medium' | 'low'
  timestamp: Date
}

/**
 * 系统状态管理
 */
const systemStatus = ref<'normal' | 'warning' | 'critical'>('normal')
const isRefreshing = ref(false)

/**
 * 告警自动滚动管理
 */
const currentAlertIndex = ref(0)
const alertContainer = ref<HTMLElement | null>(null)
let alertScrollInterval: NodeJS.Timeout | null = null

/**
 * 地域分布自动滚动管理
 */
const regionScrollOffset = ref(0)
const isRegionScrolling = ref(false)
const regionContainer = ref<HTMLElement | null>(null)
let regionScrollInterval: NodeJS.Timeout | null = null

const systemStatusText = computed(() => {
  const statusMap = {
    normal: '系统正常',
    warning: '系统警告',
    critical: '系统异常'
  }
  return statusMap[systemStatus.value]
})

/**
 * 关键指标数据
 */
const keyMetrics = ref<KeyMetric[]>([
  {
    id: 'total-alerts',
    title: '今日告警总数',
    value: '127',
    change: '+23%',
    trend: 'up',
    icon: AlertTriangle,
    iconColor: 'text-destructive'
  },
  {
    id: 'high-risk-transactions',
    title: '高风险交易',
    value: '8',
    change: '-12%',
    trend: 'down',
    icon: Shield,
    iconColor: 'text-orange-500'
  },
  {
    id: 'monitored-accounts',
    title: '监控账户数',
    value: '2,847',
    change: '+5%',
    trend: 'up',
    icon: Users,
    iconColor: 'text-blue-500'
  },
  {
    id: 'system-health',
    title: '系统健康度',
    value: '98.5%',
    change: '+0.2%',
    trend: 'up',
    icon: Activity,
    iconColor: 'text-green-500'
  }
])

/**
 * 实时告警数据
 */
const realtimeAlerts = ref<AlertItem[]>([
  {
    id: 'alert-1',
    title: '异常大额转账检测',
    description: '账户 ****1234 发生单笔 500万 转账，超出日常交易阈值',
    level: 'critical',
    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5分钟前
  },
  {
    id: 'alert-2',
    title: '可疑登录行为',
    description: '用户 张三 在异地IP登录，存在账户安全风险',
    level: 'warning',
    timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15分钟前
  },
  {
    id: 'alert-3',
    title: '系统性能监控',
    description: '核心交易系统CPU使用率达到85%，建议关注',
    level: 'info',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
  }
])

/**
 * 昨日地域分布统计数据
 */
const regionStats = ref([
  {
    name: '北京',
    count: 1234,
    percentage: 28,
    color: 'bg-blue-500',
    variant: 'default' as const
  },
  {
    name: '上海',
    count: 987,
    percentage: 22,
    color: 'bg-green-500',
    variant: 'default' as const
  },
  {
    name: '广州',
    count: 654,
    percentage: 15,
    color: 'bg-yellow-500',
    variant: 'secondary' as const
  },
  {
    name: '深圳',
    count: 543,
    percentage: 12,
    color: 'bg-purple-500',
    variant: 'default' as const
  },
  {
    name: '杭州',
    count: 432,
    percentage: 10,
    color: 'bg-orange-500',
    variant: 'default' as const
  },
  {
    name: '成都',
    count: 321,
    percentage: 7,
    color: 'bg-pink-500',
    variant: 'default' as const
  },
  {
    name: '武汉',
    count: 234,
    percentage: 5,
    color: 'bg-indigo-500',
    variant: 'default' as const
  },
  {
    name: '西安',
    count: 156,
    percentage: 4,
    color: 'bg-teal-500',
    variant: 'default' as const
  }
])

/**
 * 交易监控数据
 */
const transactionData = ref<TransactionItem[]>([
  {
    id: 'TXN001234567',
    account: '****1234',
    amount: 5000000,
    type: '转账',
    status: 'pending',
    riskLevel: 'high',
    timestamp: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: 'TXN001234568',
    account: '****5678',
    amount: 150000,
    type: '取现',
    status: 'completed',
    riskLevel: 'medium',
    timestamp: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    id: 'TXN001234569',
    account: '****9012',
    amount: 25000,
    type: '存款',
    status: 'completed',
    riskLevel: 'low',
    timestamp: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    id: 'TXN001234570',
    account: '****3456',
    amount: 800000,
    type: '转账',
    status: 'failed',
    riskLevel: 'high',
    timestamp: new Date(Date.now() - 45 * 60 * 1000)
  }
])

/**
 * 系统状态监控数据
 */
const systemStatusList = ref([
  {
    name: 'CPU使用率',
    value: '获取中...',
    percentage: 0,
    status: 'normal',
    color: 'bg-gray-500'
  },
  {
    name: '内存使用率',
    value: '获取中...',
    percentage: 0,
    status: 'normal',
    color: 'bg-gray-500'
  },
  {
    name: '网络延迟',
    value: '获取中...',
    percentage: 0,
    status: 'normal',
    color: 'bg-gray-500'
  },
  {
    name: '数据库连接',
    value: '获取中...',
    percentage: 0,
    status: 'normal',
    color: 'bg-gray-500'
  }
])

/**
 * 工具函数
 */

/**
 * 获取趋势颜色样式
 */
const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * 获取告警变体样式
 */
const getAlertVariant = (level: 'critical' | 'warning' | 'info') => {
  switch (level) {
    case 'critical':
      return 'destructive'
    case 'warning':
      return 'default'
    case 'info':
      return 'default'
    default:
      return 'default'
  }
}

/**
 * 获取告警图标
 */
const getAlertIcon = (level: 'critical' | 'warning' | 'info') => {
  switch (level) {
    case 'critical':
      return XCircle
    case 'warning':
      return AlertCircle
    case 'info':
      return CheckCircle
    default:
      return AlertCircle
  }
}

/**
 * 获取告警图标颜色
 */
const getAlertIconColor = (level: 'critical' | 'warning' | 'info') => {
  switch (level) {
    case 'critical':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * 获取状态变体样式
 */
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'failed':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * 获取风险等级变体样式
 */
const getRiskVariant = (riskLevel: string) => {
  switch (riskLevel) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    case 'low':
      return 'default'
    default:
      return 'outline'
  }
}

/**
 * 格式化货币
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

/**
 * 格式化时间
 */
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`

  return date.toLocaleDateString('zh-CN')
}

/**
 * 事件处理函数
 */

/**
 * 获取系统状态颜色
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return 'bg-green-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'critical':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * 获取真实系统状态
 */
const getSystemStatus = async () => {
  try {
    console.log('开始获取系统状态...')
    console.log('window.api:', window.api)

    // 检查是否有 API 可用
    if (window.api && window.api.getSystemStatus) {
      console.log('API可用，正在调用...')
      const systemData = await window.api.getSystemStatus()
      console.log('获取到系统数据:', systemData)

      // 更新系统状态列表
      systemStatusList.value = [
        {
          name: systemData.cpu.name,
          value: systemData.cpu.value,
          percentage: systemData.cpu.percentage,
          status: systemData.cpu.status,
          color: getStatusColor(systemData.cpu.status)
        },
        {
          name: systemData.memory.name,
          value: systemData.memory.value,
          percentage: systemData.memory.percentage,
          status: systemData.memory.status,
          color: getStatusColor(systemData.memory.status)
        },
        {
          name: systemData.network.name,
          value: systemData.network.value,
          percentage: systemData.network.percentage,
          status: systemData.network.status,
          color: getStatusColor(systemData.network.status)
        },
        {
          name: systemData.database.name,
          value: systemData.database.value,
          percentage: systemData.database.percentage,
          status: systemData.database.status,
          color: getStatusColor(systemData.database.status)
        }
      ]

      // 更新整体系统状态
      const hasError = systemStatusList.value.some((item) => item.status === 'critical')
      const hasWarning = systemStatusList.value.some((item) => item.status === 'warning')

      if (hasError) {
        systemStatus.value = 'critical'
      } else if (hasWarning) {
        systemStatus.value = 'warning'
      } else {
        systemStatus.value = 'normal'
      }

      console.log('系统状态更新完成:', systemData)
    } else {
      console.warn('系统监控API不可用')
      console.log('window对象:', window)
      console.log('可用的属性:', Object.keys(window))
    }
  } catch (error) {
    console.error('获取系统状态失败:', error)
    console.error('错误详情:', error.message)
    // 如果获取失败，显示错误状态
    systemStatusList.value.forEach((item) => {
      item.value = '获取失败'
      item.status = 'critical'
      item.color = 'bg-red-500'
    })
  }
}

/**
 * 刷新数据
 */
const refreshData = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true
  try {
    // 获取真实系统状态
    await getSystemStatus()

    // 模拟其他数据刷新
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log('数据刷新完成')
  } catch (error) {
    console.error('刷新失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

/**
 * 启动告警自动滚动
 */
const startAlertAutoScroll = () => {
  if (realtimeAlerts.value.length <= 2) return

  alertScrollInterval = setInterval(() => {
    currentAlertIndex.value++

    // 当滚动到复制列表的开始位置时，无缝重置到原始列表
    if (currentAlertIndex.value >= realtimeAlerts.value.length) {
      // 先移除过渡动画
      const container = alertContainer.value
      if (container) {
        container.style.transition = 'none'
        currentAlertIndex.value = 0

        // 强制重绘后恢复动画
        setTimeout(() => {
          container.style.transition = 'transform 1000ms ease-in-out'
        }, 50)
      }
    }
  }, 3000) // 每3秒滚动一次
}

/**
 * 停止告警自动滚动
 */
const stopAlertAutoScroll = () => {
  if (alertScrollInterval) {
    clearInterval(alertScrollInterval)
    alertScrollInterval = null
    console.log('✅ 告警自动滚动已停止')
  }
}

/**
 * 启动地域分布自动滚动
 */
const startRegionAutoScroll = () => {
  if (regionStats.value.length <= 4) return // 如果城市数量少于等于4个，不需要滚动

  isRegionScrolling.value = true
  const itemHeight = 60 // 每个项目的高度（48px + 12px间距）
  const totalHeight = regionStats.value.length * itemHeight

  // 使用 requestAnimationFrame 实现平滑连续滚动
  const scroll = () => {
    if (!isRegionScrolling.value) return

    // 每次移动 0.5px，实现平滑滚动
    regionScrollOffset.value += 0.5

    // 当滚动到原始列表的末尾时，无缝重置到开始位置
    if (regionScrollOffset.value >= totalHeight) {
      regionScrollOffset.value = 0
    }

    requestAnimationFrame(scroll)
  }

  // 开始滚动动画
  requestAnimationFrame(scroll)
}

/**
 * 停止地域分布自动滚动
 */
const stopRegionAutoScroll = () => {
  isRegionScrolling.value = false
  if (regionScrollInterval) {
    clearInterval(regionScrollInterval)
    regionScrollInterval = null
  }
  console.log('✅ 地域分布自动滚动已停止')
}

/**
 * 自动刷新数据
 */
let refreshInterval: NodeJS.Timeout | null = null

onMounted(() => {
  // 初始化时获取系统状态
  getSystemStatus()

  // 每10秒自动刷新系统状态
  refreshInterval = setInterval(() => {
    if (!isRefreshing.value) {
      getSystemStatus()
    }
  }, 10000)

  // 启动告警自动滚动
  startAlertAutoScroll()

  // 启动地域分布自动滚动
  startRegionAutoScroll()
})

onUnmounted(() => {
  console.log('🔄 Dashboard组件开始卸载，清理所有定时器...')

  // 清理系统状态刷新定时器
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
    console.log('✅ 系统状态刷新定时器已清理')
  }

  // 停止告警自动滚动
  stopAlertAutoScroll()

  // 停止地域分布自动滚动
  stopRegionAutoScroll()

  // 重置所有状态
  currentAlertIndex.value = 0
  regionScrollOffset.value = 0
  isRegionScrolling.value = false
  isRefreshing.value = false

  console.log('✅ Dashboard组件卸载完成')
})




</script>

<style scoped>
/**
 * 银行告警监控系统样式
 * 使用 shadcn-vue 组件，最小化自定义样式
 */

/* 自定义动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 确保表格在小屏幕上可滚动 */
@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }
}
</style>
