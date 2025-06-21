# IPC 通信使用指南

## 📋 概述

本文档说明如何在Electron应用中使用IPC（Inter-Process Communication）来调用后端API接口。

## 🔧 已配置的IPC方法

### 1. 地域分布数据 - `fetchRegionData`

**用途**: 获取省份/地区的交易数据、金额数据或风险数据

**调用方式**:
```typescript
const response = await window.api.fetchRegionData({ 
  dataType: 'transaction' | 'amount' | 'risk' 
})
```

**后端接口映射**:
- `transaction`: `/Bank/atm/province/yesterday`
- `amount`: `/Bank/atm/province/amount/yesterday`  
- `risk`: `/Bank/atm/province/risk/yesterday`

**返回数据格式**:
```typescript
{
  success: boolean
  data: Array<{
    province: string           // 省份名称
    transaction_count: number  // 交易数量
    total_amount: number      // 交易金额（分）
    risk_score: number        // 风险分数
    trend?: string           // 趋势 "up"|"down"|"neutral"
    risk_level?: string      // 风险等级 "low"|"medium"|"high"
  }>
  message: string
  timestamp: string
}
```

### 2. 业务类型数据 - `fetchBusinessData`

**用途**: 获取不同业务类型的分布数据

**调用方式**:
```typescript
const response = await window.api.fetchBusinessData(params)
```

**后端接口**: `/Bank/business/distribution`

### 3. 实时监控数据 - `fetchRealtimeData`

**用途**: 获取系统实时性能指标

**调用方式**:
```typescript
const response = await window.api.fetchRealtimeData()
```

**后端接口**: `/Bank/realtime/metrics`

### 4. 兼容接口 - `fetchData`

**用途**: 兼容旧版本的数据获取方式

**调用方式**:
```typescript
const data = await window.api.fetchData()
```

## 🎯 在组件中使用

### 基本用法

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const data = ref([])
const loading = ref(false)
const error = ref('')

const loadData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await window.api.fetchRegionData({ 
      dataType: 'transaction' 
    })
    
    if (response.success) {
      data.value = response.data
    } else {
      error.value = response.message
    }
  } catch (err) {
    error.value = err.message || '数据加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
```

### 错误处理

```typescript
try {
  const response = await window.api.fetchRegionData({ dataType: 'transaction' })
  
  if (!response.success) {
    console.error('API返回错误:', response.message)
    // 使用备用数据或显示错误信息
    return
  }
  
  // 处理成功数据
  processData(response.data)
  
} catch (error) {
  console.error('网络或系统错误:', error)
  // 使用本地缓存或模拟数据
  useBackupData()
}
```

## 🔍 调试和测试

### 1. 使用测试组件

导入并使用 `IPCTest.vue` 组件来测试IPC通信:

```vue
<template>
  <IPCTest />
</template>

<script setup>
import IPCTest from '@/components/test/IPCTest.vue'
</script>
```

### 2. 浏览器控制台调试

```javascript
// 检查API是否可用
console.log('API methods:', Object.keys(window.api))

// 直接调用API
window.api.fetchRegionData({ dataType: 'transaction' })
  .then(console.log)
  .catch(console.error)
```

### 3. 主进程日志

主进程会输出详细的日志信息，包括:
- 接收到的请求参数
- 后端API调用结果
- 错误信息

## ⚠️ 注意事项

1. **类型安全**: 使用TypeScript类型定义确保类型安全
2. **错误处理**: 始终包含try-catch和备用方案
3. **加载状态**: 提供用户友好的加载指示器
4. **数据验证**: 验证后端返回的数据格式
5. **性能优化**: 避免频繁调用，考虑缓存机制

## 🚀 扩展新的IPC方法

### 1. 在主进程中添加处理器

```typescript
// src/main/index.ts
ipcMain.handle('your-new-method', async (_, params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/your/endpoint`)
    return {
      success: true,
      data: response.data,
      message: '成功'
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message
    }
  }
})
```

### 2. 在preload中暴露方法

```typescript
// src/preload/index.ts
const api = {
  // ... 现有方法
  yourNewMethod: (params) => ipcRenderer.invoke('your-new-method', params)
}
```

### 3. 更新类型定义

```typescript
// src/preload/index.d.ts
interface API {
  // ... 现有方法
  yourNewMethod: (params: any) => Promise<ApiResponse>
}
```

## 📝 最佳实践

1. **统一错误处理**: 使用统一的错误处理模式
2. **数据转换**: 在组件中处理数据格式转换
3. **缓存策略**: 实现合适的数据缓存机制
4. **重试机制**: 对于网络错误实现重试逻辑
5. **用户体验**: 提供清晰的加载和错误状态
