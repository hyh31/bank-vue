<template>
  <div
    class="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-h-[90vh] overflow-hidden"
    :class="$attrs.class"
  >
    <!-- 关闭按钮 -->
    <button
      @click="$emit('close')"
      class="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-600"
    >
      <X class="h-5 w-5 text-slate-600 dark:text-slate-400" />
    </button>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineEmits<{
  close: []
}>()
</script>
