<!-- 告警中心左侧的筛选条件 -->
<template>
  <div class="h-full flex flex-col max-h-full">
    <!-- 紧凑筛选头部 -->
    <div class="flex-shrink-0 p-3 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">筛选条件</h3>
        <Button
          variant="ghost"
          size="sm"
          @click="clearFilters"
          class="h-6 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <X class="h-3 w-3 mr-1" />
          清空
        </Button>
      </div>
    </div>

    <!-- 筛选内容 - 内部滚动，限制高度 -->
    <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-6">
      <!-- 告警级别 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <Label class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">告警级别</Label>
          <span class="text-xs text-slate-400">{{ filters.levels.length }}/3</span>
        </div>
        <div class="grid grid-cols-1 gap-2">
          <!-- 严重告警 -->
          <div class="group relative overflow-hidden rounded-lg border border-red-200 dark:border-red-800/50 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 hover:shadow-sm transition-all">
            <Label class="flex items-center p-3 cursor-pointer gap-0">
              <Checkbox
                id="level-critical"
                :checked="filters.levels.includes('critical')"
                @update:modelValue="(checked) => toggleLevel('critical', checked)"
                class="rounded-md border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
              />
              <div for="level-critical" class="flex items-center gap-3 flex-1 ml-3">
                <div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
                <span class="font-medium text-red-800 dark:text-red-300">严重</span>
                <div class="ml-auto flex items-center gap-2">
                  <Badge class="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700 text-xs font-semibold">
                    {{ stats.critical }}
                  </Badge>
                </div>
              </div>
            </Label>
          </div>

          <!-- 警告告警 -->
          <div class="group relative overflow-hidden rounded-lg border border-yellow-200 dark:border-yellow-800/50 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 hover:shadow-sm transition-all">
            <Label class="flex items-center p-3 cursor-pointer gap-0">
              <Checkbox
                id="level-warning"
                :checked="filters.levels.includes('warning')"
                @update:modelValue="(checked) => toggleLevel('warning', checked)"
                class="rounded-md border-yellow-300 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <div for="level-warning" class="flex items-center gap-3 flex-1 ml-3">
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"></div>
                <span class="font-medium text-yellow-800 dark:text-yellow-300">警告</span>
                <div class="ml-auto flex items-center gap-2">
                  <Badge class="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700 text-xs font-semibold">
                    {{ stats.warning }}
                  </Badge>
                </div>
              </div>
            </Label>
          </div>

          <!-- 信息告警 -->
          <div class="group relative overflow-hidden rounded-lg border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 hover:shadow-sm transition-all">
            <Label class="flex items-center p-3 cursor-pointer gap-0">
              <Checkbox
                id="level-info"
                :checked="filters.levels.includes('info')"
                @update:modelValue="(checked) => toggleLevel('info', checked)"
                class="rounded-md border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <div for="level-info" class="flex items-center gap-3 flex-1 ml-3">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                <span class="font-medium text-blue-800 dark:text-blue-300">信息</span>
                <div class="ml-auto flex items-center gap-2">
                  <Badge class="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 text-xs font-semibold">
                    {{ stats.info }}
                  </Badge>
                </div>
              </div>
            </Label>
          </div>
        </div>
      </div>

      <!-- 告警状态 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <Label class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">告警状态</Label>
          <span class="text-xs text-slate-400">{{ filters.statuses.length }}/3</span>
        </div>
        <div class="grid grid-cols-1 gap-2">
          <!-- 待处理 -->
          <div class="group relative overflow-hidden rounded-lg border border-orange-200 dark:border-orange-800/50 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 hover:shadow-sm transition-all">
            <Label class="flex items-center p-3 cursor-pointer gap-0">
              <Checkbox
                id="status-pending"
                :checked="filters.statuses.includes('pending')"
                @update:modelValue="(checked) => toggleStatus('pending', checked)"
                class="rounded-md border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <div for="status-pending" class="flex items-center gap-3 flex-1 ml-3">
                <Clock class="w-4 h-4 text-orange-500" />
                <span class="font-medium text-orange-800 dark:text-orange-300">待处理</span>
                <div class="ml-auto">
                  <Badge class="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700 text-xs font-semibold">
                    {{ stats.pending }}
                  </Badge>
                </div>
              </div>
            </Label>
          </div>

          <!-- 处理中 -->
          <div class="group relative overflow-hidden rounded-lg border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 hover:shadow-sm transition-all">
            <Label class="flex items-center p-3 cursor-pointer gap-0">
              <Checkbox
                id="status-processing"
                :checked="filters.statuses.includes('processing')"
                @update:modelValue="(checked) => toggleStatus('processing', checked)"
                class="rounded-md border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <div for="status-processing" class="flex items-center gap-3 flex-1 ml-3">
                <Loader class="w-4 h-4 text-blue-500" />
                <span class="font-medium text-blue-800 dark:text-blue-300">处理中</span>
                <div class="ml-auto">
                  <Badge class="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 text-xs font-semibold">
                    {{ stats.processing }}
                  </Badge>
                </div>
              </div>
            </Label>
          </div>

          <!-- 已解决 -->
          <div class="group relative overflow-hidden rounded-lg border border-green-200 dark:border-green-800/50 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 hover:shadow-sm transition-all">
            <Label class="flex items-center p-3 cursor-pointer gap-0">
              <Checkbox
                id="status-resolved"
                :checked="filters.statuses.includes('resolved')"
                @update:modelValue="(checked) => toggleStatus('resolved', checked)"
                class="rounded-md border-green-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <div for="status-resolved" class="flex items-center gap-3 flex-1 ml-3">
                <CheckCircle class="w-4 h-4 text-green-500" />
                <span class="font-medium text-green-800 dark:text-green-300">已解决</span>
                <div class="ml-auto">
                  <Badge class="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 text-xs font-semibold">
                    {{ stats.resolved }}
                  </Badge>
                </div>
              </div>
            </Label>
          </div>
        </div>
      </div>

      <!-- 告警类型 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <Label class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">告警类型</Label>
          <span class="text-xs text-slate-400">{{ filters.types.length }}/4</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <!-- 业务告警 -->
          <div class="group relative overflow-hidden rounded-lg border border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 hover:shadow-sm transition-all">
            <Label class="flex flex-col items-center p-3 text-center cursor-pointer gap-0">
              <Checkbox
                id="type-business"
                :checked="filters.types.includes('business')"
                @update:modelValue="(checked) => toggleType('business', checked)"
                class="mb-2 rounded-md border-purple-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <TrendingUp class="w-5 h-5 text-purple-500 mb-1" />
              <span for="type-business" class="text-xs font-medium text-purple-800 dark:text-purple-300">
                业务告警
              </span>
            </Label>
          </div>

          <!-- 系统告警 -->
          <div class="group relative overflow-hidden rounded-lg border border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 hover:shadow-sm transition-all">
            <Label class="flex flex-col items-center p-3 text-center cursor-pointer gap-0">
              <Checkbox
                id="type-system"
                :checked="filters.types.includes('system')"
                @update:modelValue="(checked) => toggleType('system', checked)"
                class="mb-2 rounded-md border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Server class="w-5 h-5 text-blue-500 mb-1" />
              <span for="type-system" class="text-xs font-medium text-blue-800 dark:text-blue-300">
                系统告警
              </span>
            </Label>
          </div>

          <!-- 安全告警 -->
          <div class="group relative overflow-hidden rounded-lg border border-red-200 dark:border-red-800/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 hover:shadow-sm transition-all">
            <Label class="flex flex-col items-center p-3 text-center cursor-pointer gap-0">
              <Checkbox
                id="type-security"
                :checked="filters.types.includes('security')"
                @update:modelValue="(checked) => toggleType('security', checked)"
                class="mb-2 rounded-md border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
              />
              <Shield class="w-5 h-5 text-red-500 mb-1" />
              <span for="type-security" class="text-xs font-medium text-red-800 dark:text-red-300">
                安全告警
              </span>
            </Label>
          </div>

          <!-- 合规告警 -->
          <div class="group relative overflow-hidden rounded-lg border border-green-200 dark:border-green-800/50 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 hover:shadow-sm transition-all">
            <Label for="type-compliance" class="flex flex-col items-center p-3 text-center cursor-pointer gap-0">
              <Checkbox
                id="type-compliance"
                :checked="filters.types.includes('compliance')"
                @update:modelValue="(checked) => toggleType('compliance', checked)"
                class="mb-2 rounded-md border-green-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <FileCheck class="w-5 h-5 text-green-500 mb-1" />
              <span for="type-compliance" class="text-xs font-medium text-green-800 dark:text-green-300">
                合规告警
              </span>
            </Label>
          </div>
        </div>
      </div>

      <!-- 时间范围 -->
      <div class="space-y-3">
        <Label class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">时间范围</Label>

        <!-- 快捷时间选择 -->
        <div class="grid grid-cols-2 gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            @click="setQuickTimeRange('today')"
            class="text-xs h-8 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            今天
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="setQuickTimeRange('week')"
            class="text-xs h-8 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            本周
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="setQuickTimeRange('month')"
            class="text-xs h-8 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            本月
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="clearTimeRange"
            class="text-xs h-8 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            清除
          </Button>
        </div>

        <!-- 自定义时间选择 -->
        <div class="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div>
            <Label for="start-time" class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">开始时间</Label>
            <Input
              id="start-time"
              type="datetime-local"
              v-model="filters.timeRange.start"
              @change="handleFilterChange"
              class="text-xs h-8"
            />
          </div>
          <div>
            <Label for="end-time" class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">结束时间</Label>
            <Input
              id="end-time"
              type="datetime-local"
              v-model="filters.timeRange.end"
              @change="handleFilterChange"
              class="text-xs h-8"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import { Input } from '@/components/ui/input'
import Label from '@/components/ui/label/Label.vue'
import { X, Clock, Loader, CheckCircle, TrendingUp, Server, Shield, FileCheck } from 'lucide-vue-next'
import type { AlertFilters, AlertStats, AlertLevel, AlertStatus, AlertType } from '../types/alert-center'

interface Props {
  filters: AlertFilters
  stats: AlertStats
}

interface Emits {
  (e: 'update:filters', filters: AlertFilters): void
  (e: 'filter-change'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 切换告警级别
 */
const toggleLevel = (level: AlertLevel, checked: boolean | string) => {
  const levels = [...props.filters.levels]
  const index = levels.indexOf(level)
  const isChecked = checked === true || checked === 'indeterminate'

  if (isChecked && index === -1) {
    levels.push(level)
  } else if (!isChecked && index > -1) {
    levels.splice(index, 1)
  }

  updateFilters({ levels })
}

/**
 * 切换告警状态
 */
const toggleStatus = (status: AlertStatus, checked: boolean | string) => {

  const statuses = [...props.filters.statuses]
  const index = statuses.indexOf(status)

  const isChecked = checked === true || checked === 'indeterminate'

  if (isChecked && index === -1) {
    statuses.push(status)
  } else if (!isChecked && index > -1) {
    statuses.splice(index, 1)
  }

  updateFilters({ statuses })
}

/**
 * 切换告警类型
 */
const toggleType = (type: AlertType, checked: boolean | string) => {

  const types = [...props.filters.types]
  const index = types.indexOf(type)

  const isChecked = checked === true || checked === 'indeterminate'

  if (isChecked && index === -1) {
    types.push(type)
  } else if (!isChecked && index > -1) {
    types.splice(index, 1)
  }

  updateFilters({ types })
}

/**
 * 更新筛选条件
 */
const updateFilters = (updates: Partial<AlertFilters>) => {
  const newFilters = { ...props.filters, ...updates }
  emit('update:filters', newFilters)
  emit('filter-change')
}

/**
 * 格式化时间
 */
const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const miao = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hour}:${minute}:${miao}`
}

/**
 * 设置快捷时间范围
 */
const setQuickTimeRange = (type: string) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let start = ''
  let end = ''

  switch (type) {
    case 'today':
      start = formatTime(today)
      end = formatTime(new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1))
      break
    case 'week':
      const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
      start = formatTime(weekStart)
      end = formatTime(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1))
      break
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      start = formatTime(monthStart)
      end = formatTime(monthEnd)
      break
  }

  updateFilters({
    timeRange: { start, end }
  })
}

/**
 * 清除时间范围
 */
const clearTimeRange = () => {
  updateFilters({
    timeRange: { start: '', end: '' }
  })
}

/**
 * 清空筛选条件
 */
const clearFilters = () => {
  const clearedFilters: AlertFilters = {
    levels: [],
    types: [],
    statuses: [],
    assigneeIds: [],
    timeRange: { start: '', end: '' },
    keyword: '',
    tags: []
  }
  emit('update:filters', clearedFilters)
  emit('filter-change')
}

/**
 * 处理筛选变化
 */
const handleFilterChange = () => {
  emit('filter-change')
}


</script>

<style scoped>
/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(148 163 184) rgb(241 245 249);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgb(241 245 249);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(148 163 184);
  border-radius: 4px;
  border: 1px solid rgb(226 232 240);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(100 116 139);
}

/* 暗色模式滚动条 */
.dark .custom-scrollbar {
  scrollbar-color: rgb(71 85 105) rgb(30 41 59);
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: rgb(30 41 59);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(71 85 105);
  border: 1px solid rgb(51 65 85);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(100 116 139);
}
</style>
