<!-- 告警页面的主内容页面 -->
<template>
  <div class="flex flex-col h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
    <!-- 精简操作栏 -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
      <div class="flex items-center gap-4">
        <div class="flex items-center space-x-2">
          <Checkbox
            :checked="isAllSelected"
            :indeterminate="isPartiallySelected"
            @update:checked="toggleSelectAll"
            class="rounded-md"
          />
          <span class="text-sm text-slate-600 dark:text-slate-400">
            {{ selectedAlerts.length > 0 ? `已选择 ${selectedAlerts.length} 项` : '全选' }}
          </span>
        </div>

        <!-- 批量操作 -->
        <div v-if="selectedAlerts.length > 0" class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="batchResolve"
            class="h-8 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <CheckCircle class="h-3 w-3 mr-1" />
            批量解决
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="batchIgnore"
            class="h-8 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            <XCircle class="h-3 w-3 mr-1" />
            批量忽略
          </Button>
        </div>
      </div>

      <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
        共 {{ pagination.total }} 条
      </span>
    </div>

    <!-- 优化的告警网格布局 -->
    <div class="flex-1 overflow-y-auto scrollbar-hide">
      <div class="p-4 grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 auto-rows-max">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer overflow-hidden"
          @click="handleRowClick(alert)"
        >
          <!-- 告警级别指示条 -->
          <div
            :class="[
              'absolute left-0 top-0 bottom-0 w-1',
              alert.level === 'critical' ? 'bg-red-500' :
              alert.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            ]"
          ></div>

          <div class="p-4 pl-6">
            <!-- 头部：选择框、标题、状态 -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <Checkbox
                  :checked="selectedAlerts.includes(alert.id)"
                  @update:checked="toggleSelect(alert.id)"
                  @click.stop
                  class="rounded-md mt-0.5 flex-shrink-0"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {{ alert.title }}
                    </h3>
                    <Badge
                      :variant="getLevelVariant(alert.level)"
                      :class="[
                        'text-xs px-1.5 py-0.5 flex-shrink-0',
                        getLevelClass(alert.level)
                      ]"
                    >
                      {{ getLevelText(alert.level) }}
                    </Badge>
                  </div>

                  <!-- 告警描述 -->
                  <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-1">
                    {{ alert.description }}
                  </p>

                  <!-- 标签 -->
                  <div class="flex items-center gap-1 mb-2">
                    <Badge
                      v-for="tag in (alert.tags || []).slice(0, 2)"
                      :key="tag"
                      variant="outline"
                      class="text-xs px-1.5 py-0.5 bg-slate-50 dark:bg-slate-700"
                    >
                      {{ tag }}
                    </Badge>
                    <span v-if="alert.tags && alert.tags.length > 2" class="text-xs text-slate-400">+{{ alert.tags.length - 2 }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                <AlertStatusBadge :status="alert.status" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      @click.stop
                    >
                      <MoreHorizontal class="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuItem @click="handleViewDetail(alert)">
                      <Eye class="h-3 w-3 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleUpdateStatus(alert.id, 'processing')">
                      <Play class="h-3 w-3 mr-2" />
                      开始处理
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleUpdateStatus(alert.id, 'resolved')">
                      <CheckCircle class="h-3 w-3 mr-2" />
                      标记解决
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleUpdateStatus(alert.id, 'ignored')">
                      <XCircle class="h-3 w-3 mr-2" />
                      忽略告警
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <!-- 底部：负责人和时间 -->
            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
                  {{ getAssigneeInitial(alert.assignee) }}
                </div>
                <span class="truncate">{{ getAssigneeName(alert.assignee) }}</span>
              </div>
              <span class="flex-shrink-0">{{ formatTime(alert.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && alerts.length === 0" class="flex flex-col items-center justify-center py-12">
        <AlertTriangle class="h-12 w-12 text-slate-400 mb-4" />
        <h3 class="text-lg font-medium mb-2 text-slate-700 dark:text-slate-300">暂无告警数据</h3>
        <p class="text-slate-500 dark:text-slate-400">当前筛选条件下没有找到相关告警</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-slate-500 dark:text-slate-400">加载中...</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="border-t border-border p-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          显示第 {{ (pagination.page - 1) * pagination.pageSize + 1 }} - 
          {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，
          共 {{ pagination.total }} 条记录
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page <= 1"
            @click="handlePageChange(pagination.page - 1)"
          >
            <ChevronLeft class="h-4 w-4" />
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page >= Math.ceil(pagination.total / pagination.pageSize)"
            @click="handlePageChange(pagination.page + 1)"
          >
            下一页
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Eye,
  Play,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-vue-next'
import AlertStatusBadge from './AlertStatusBadge.vue'
import { formatTime } from '@renderer/utils'
import type { AlertCenterItem, Pagination, AlertLevel, AlertType } from '../types/alert-center'

interface Props {
  alerts: AlertCenterItem[]
  loading: boolean
  pagination: Pagination
}

interface Emits {
  (e: 'view-detail', alert: AlertCenterItem): void
  (e: 'update-status', alertId: string, status: string): void
  (e: 'page-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 选中状态
const selectedAlerts = ref<string[]>([])

// 计算属性
const isAllSelected = computed(() => {
  return selectedAlerts.value.length > 0 && selectedAlerts.value.length === props.alerts.length
})

const isPartiallySelected = computed(() => {
  return selectedAlerts.value.length > 0 && selectedAlerts.value.length < props.alerts.length
})

// 事件处理
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedAlerts.value = []
  } else {
    selectedAlerts.value = props.alerts.map(alert => alert.id)
  }
}

const toggleSelect = (alertId: string) => {
  const index = selectedAlerts.value.indexOf(alertId)
  if (index > -1) {
    selectedAlerts.value.splice(index, 1)
  } else {
    selectedAlerts.value.push(alertId)
  }
}

const handleRowClick = (alert: AlertCenterItem) => {
  emit('view-detail', alert)
}

const handleViewDetail = (alert: AlertCenterItem) => {
  emit('view-detail', alert)
}

const handleUpdateStatus = (alertId: string, status: string) => {
  emit('update-status', alertId, status)
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const batchResolve = () => {
  selectedAlerts.value.forEach(alertId => {
    emit('update-status', alertId, 'resolved')
  })
  selectedAlerts.value = []
}

const batchIgnore = () => {
  selectedAlerts.value.forEach(alertId => {
    emit('update-status', alertId, 'ignored')
  })
  selectedAlerts.value = []
}

// 辅助函数
const getLevelVariant = (level: AlertLevel) => {
  switch (level) {
    case 'critical': return 'destructive'
    case 'warning': return 'default'
    case 'info': return 'secondary'
    default: return 'outline'
  }
}

const getLevelClass = (level: AlertLevel) => {
  switch (level) {
    case 'critical': return 'bg-red-50 text-red-700 border-red-200'
    case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'info': return 'bg-blue-50 text-blue-700 border-blue-200'
    default: return ''
  }
}

const getLevelText = (level: AlertLevel) => {
  switch (level) {
    case 'critical': return '严重'
    case 'warning': return '警告'
    case 'info': return '信息'
    default: return '未知'
  }
}

// 获取负责人姓名
const getAssigneeName = (assignee: any) => {
  if (!assignee) return '未分配'
  return assignee.realName || assignee.username || '未知用户'
}

// 获取负责人姓名首字母
const getAssigneeInitial = (assignee: any) => {
  if (!assignee) return '?'
  const name = assignee.realName || assignee.username || '?'
  return name.charAt(0).toUpperCase()
}

const getTypeText = (type: AlertType) => {
  switch (type) {
    case 'business': return '业务'
    case 'system': return '系统'
    case 'security': return '安全'
    case 'compliance': return '合规'
    default: return '未知'
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* 或者使用自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
