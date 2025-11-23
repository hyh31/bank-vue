<!-- 整一个告警中心的模板页面--头部 -->
<template>
  <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm">
      <div class="max-w-full px-6 py-4">
        <div class="flex items-center justify-between">
        <!-- 左侧：标题和统计 -->
        <div class="flex items-center gap-8">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">告警中心</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">实时监控和管理系统告警</p>
          </div>

          <!-- 快速统计 -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
              <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span class="text-lg font-semibold text-red-700 dask:text-red-400">{{ stats.pending }}</span>
              <span class="text-xs text-red-600 dark:text-red-500">待处理</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
              <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span class="text-lg font-semibold text-blue-700 dark:text-blue-400">{{ stats.processing }}</span>
              <span class="text-xs text-blue-600 dark:text-blue-500">处理中</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-lg font-medium text-green-700 dark:text-green-400">{{ stats.resolved }}</span>
              <span class="text-xs text-green-600 dark:text-green-500">已解决</span>
            </div>
          </div>
        </div>

        <!-- 右侧：操作区域 -->
        <div class="flex items-center gap-3">
          <!-- 搜索框 -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="searchKeyword"
              placeholder="搜索告警..."
              class="w-64 pl-9"
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 刷新按钮 -->
          <Button
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="handleRefresh"
          >
            <RotateCcw :class="['h-4 w-4', loading && 'animate-spin']" />
            刷新
          </Button>

          <!-- 导出按钮 -->
          <Button variant="outline" size="sm">
            <Download class="h-4 w-4 mr-2" />
            导出
          </Button>

          <!-- 设置按钮 -->
          <Button variant="outline" size="sm">
            <Settings class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RotateCcw, Download, Settings } from 'lucide-vue-next'
import type { AlertStats } from '../types/alert-center'

interface Props {
  stats: AlertStats
  loading: boolean
}

interface Emits {
  (e: 'refresh'): void
  (e: 'search', keyword: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 搜索关键词
const searchKeyword = ref('')

/**
 * 处理刷新
 */
const handleRefresh = () => {
  emit('refresh')
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  emit('search', searchKeyword.value)
}
</script>
