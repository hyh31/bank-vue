<!-- 告警信息详情抽屉--点开一个告警后的展示 -->
<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-2xl w-full bg-white dark:bg-slate-900 p-0 max-h-[85vh] overflow-hidden"
      @close="handleOpenChange(false)"
    >
      <!-- 精简头部 -->
      <div class="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-start justify-start gap-5">
          <div class="space-y-3 flex-1 pr-4 max-w-xs">
            <div class="flex items-center gap-2">
              <Badge
                :variant="getLevelVariant(alert?.level)"
                :class="[
                  'px-3 py-1 text-sm font-semibold',
                  getLevelClass(alert?.level)
                ]"
              >
                {{ getLevelText(alert?.level) }}
              </Badge>
              <Badge variant="outline" class="text-xs">
                {{ getTypeText(alert?.alertType) }}
              </Badge>
            </div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {{ alert?.title }}
            </h1>
          </div>

          <AlertStatusBadge :status="alert?.status || 'pending'" />
        </div>
      </div>

      <div v-if="alert" class="p-6 space-y-6">
        <!-- 告警描述 -->
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">告警描述</h3>
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">{{ alert.description }}</p>
          </div>
        </div>

        <!-- 关键信息 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">创建时间</div>
            <div class="text-sm font-medium text-blue-900 dark:text-blue-200">{{ formatTime(alert.createTime) }}</div>
          </div>

          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">负责人</div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                {{ getAssigneeInitial(alert.assignee) }}
              </div>
              <span class="text-sm font-medium text-purple-900 dark:text-purple-200">{{ alert.assignee?.realName || '未分配' }}</span>
            </div>
          </div>
        </div>

        <!-- 标签（如果有的话） -->
        <div v-if="alert.tags && alert.tags.length > 0">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">相关标签</h3>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="tag in alert.tags"
              :key="tag"
              variant="outline"
              class="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
            >
              {{ tag }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-end gap-3">
          <Button
            v-if="alert?.status === 'pending'"
            @click="handleUpdateStatus('processing')"
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play class="h-4 w-4 mr-2" />
            开始处理
          </Button>

          <Button
            v-if="alert?.status !== 'resolved'"
            @click="handleUpdateStatus('resolved')"
            class="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle class="h-4 w-4 mr-2" />
            标记解决
          </Button>

          <Button
            v-if="alert?.status !== 'ignored'"
            variant="outline"
            @click="handleUpdateStatus('ignored')"
          >
            <XCircle class="h-4 w-4 mr-2" />
            忽略
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Play, CheckCircle, XCircle } from 'lucide-vue-next'
import AlertStatusBadge from './AlertStatusBadge.vue'
import { formatTime } from '@renderer/utils'
import type { AlertCenterItem, AlertLevel, AlertType } from '../types/alert-center'

interface Props {
  open: boolean
  alert: AlertCenterItem | null
}

interface Emits {
  (e: 'update:open', open: boolean): void
  (e: 'update-status', alertId: string, status: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 处理抽屉开关状态
 */
const handleOpenChange = (open: boolean) => {
  emit('update:open', open)
  if (!open) {
    emit('close')
  }
}

/**
 * 处理状态更新
 */
const handleUpdateStatus = (status: string) => {
  if (props.alert) {
    emit('update-status', props.alert.id, status)
  }
}



/**
 * 获取级别变体
 */
const getLevelVariant = (level?: AlertLevel) => {
  switch (level) {
    case 'critical': return 'destructive'
    case 'warning': return 'default'
    case 'info': return 'secondary'
    default: return 'outline'
  }
}

/**
 * 获取级别样式
 */
const getLevelClass = (level?: AlertLevel) => {
  switch (level) {
    case 'critical': return 'bg-red-50 text-red-700 border-red-200'
    case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'info': return 'bg-blue-50 text-blue-700 border-blue-200'
    default: return ''
  }
}

/**
 * 获取级别文本
 */
const getLevelText = (level?: AlertLevel) => {
  switch (level) {
    case 'critical': return '严重'
    case 'warning': return '警告'
    case 'info': return '信息'
    default: return '未知'
  }
}

/**
 * 获取类型文本
 */
const getTypeText = (type?: AlertType) => {
  switch (type) {
    case 'business': return '业务告警'
    case 'system': return '系统告警'
    case 'security': return '安全告警'
    case 'compliance': return '合规告警'
    default: return '未知类型'
  }
}

// 获取负责人姓名首字母
const getAssigneeInitial = (assignee: any) => {
  if (!assignee) return '?'
  const name = assignee.realName || assignee.username || '?'
  return name.charAt(0).toUpperCase()
}
</script>
