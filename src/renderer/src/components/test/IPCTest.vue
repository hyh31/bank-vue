<template>
  <div class="p-6 space-y-4">
    <h2 class="text-2xl font-bold">IPC 通信测试</h2>
    
    <!-- 测试按钮 -->
    <div class="space-x-4">
      <button 
        @click="testRegionData"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="loading"
      >
        测试地域数据
      </button>
      
      <button 
        @click="testBusinessData"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        :disabled="loading"
      >
        测试业务数据
      </button>
      
      <button 
        @click="testRealtimeData"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        :disabled="loading"
      >
        测试实时数据
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="text-blue-600">
      正在加载数据...
    </div>
    
    <!-- 结果显示 -->
    <div v-if="result" class="mt-4">
      <h3 class="text-lg font-semibold mb-2">测试结果:</h3>
      <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <!-- 错误显示 -->
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <h3 class="font-semibold">错误:</h3>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const result = ref<any>(null)
const error = ref<string>('')

const testRegionData = async () => {
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    console.log('开始测试地域数据API...')
    
    // 检查API是否存在
    if (!window.api || !(window.api as any).fetchRegionData) {
      throw new Error('window.api.fetchRegionData 不存在')
    }
    
    const response = await (window.api as any).fetchRegionData({ dataType: 'transaction' })
    console.log('地域数据API响应:', response)
    result.value = response
  } catch (err: any) {
    console.error('地域数据API测试失败:', err)
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
}

const testBusinessData = async () => {
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    console.log('开始测试业务数据API...')
    
    if (!window.api || !(window.api as any).fetchBusinessData) {
      throw new Error('window.api.fetchBusinessData 不存在')
    }
    
    const response = await (window.api as any).fetchBusinessData()
    console.log('业务数据API响应:', response)
    result.value = response
  } catch (err: any) {
    console.error('业务数据API测试失败:', err)
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
}

const testRealtimeData = async () => {
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    console.log('开始测试实时数据API...')
    
    if (!window.api || !(window.api as any).fetchRealtimeData) {
      throw new Error('window.api.fetchRealtimeData 不存在')
    }
    
    const response = await (window.api as any).fetchRealtimeData()
    console.log('实时数据API响应:', response)
    result.value = response
  } catch (err: any) {
    console.error('实时数据API测试失败:', err)
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
}

// 页面加载时检查API可用性
console.log('检查API可用性:')
console.log('window.api:', window.api)
console.log('window.electron:', window.electron)
</script>
