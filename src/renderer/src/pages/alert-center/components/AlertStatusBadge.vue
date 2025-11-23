<!-- 处理状态显示 -->
<template>
  <Badge :variant="getVariant(status)" :class="getStatusClass(status)">
    <div class="flex items-center gap-1">
      <div :class="getIndicatorClass(status)" class="w-2 h-2 rounded-full"></div>
      {{ getStatusText(status) }}
    </div>
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import type { AlertStatus } from '../types/alert-center'

interface Props {
  status: AlertStatus
}

const props = defineProps<Props>()

/**
 * 获取状态对应的Badge变体
 */
const getVariant = (status: AlertStatus) => {
  switch (status) {
    case 'pending':
      return 'destructive'
    case 'processing':
      return 'default'
    case 'resolved':
      return 'secondary'
    case 'ignored':
      return 'outline'
    default:
      return 'default'
  }
}

/**
 * 获取状态样式类
 */
const getStatusClass = (status: AlertStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    case 'processing':
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    case 'resolved':
      return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
    case 'ignored':
      return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    default:
      return ''
  }
}

/**
 * 获取指示器样式类
 */
const getIndicatorClass = (status: AlertStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-red-500 animate-pulse'
    case 'processing':
      return 'bg-blue-500 animate-pulse'
    case 'resolved':
      return 'bg-green-500'
    case 'ignored':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = (status: AlertStatus) => {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'processing':
      return '处理中'
    case 'resolved':
      return '已解决'
    case 'ignored':
      return '已忽略'
    default:
      return '未知'
  }
}
</script>
