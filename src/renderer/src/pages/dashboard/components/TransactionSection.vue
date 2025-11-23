<template>
  <!-- 交易数据表格 -->
  <Card class="hover:shadow-md transition-shadow duration-300" style="height: 18rem;">
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
    <CardContent>
      <div v-if="isLoading" class="text-center py-8">
        <div class="text-sm text-muted-foreground">加载交易数据中...</div>
      </div>
      <div v-else-if="transactionData.length > 0" class="max-h-[12.5rem] overflow-y-auto">
        <Table class="relative">
          <TableHeader class="sticky top-0 z-10 bg-white shadow-sm">
            <TableRow>
              <TableHead class="bg-white">交易ID</TableHead>
              <TableHead class="bg-white">金额</TableHead>
              <TableHead class="bg-white">类型</TableHead>
              <TableHead class="bg-white">状态</TableHead>
              <TableHead class="bg-white">风险等级</TableHead>
              <TableHead class="bg-white">时间</TableHead>
              <TableHead class="bg-white">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="transaction in transactionData"
              :key="transaction.id"
              class="hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <TableCell class="font-mono text-primary">{{ transaction.id }}</TableCell>
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
                  {{ getRiskLevelText(transaction.riskLevel) }}
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
      <div v-else class="text-center py-8">
        <div class="text-sm text-muted-foreground">暂无交易数据</div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Database, RefreshCw } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableRow, TableCell, TableHead, TableHeader } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useTransactions } from '../composables/useTransactions'

const { transactionData, isLoading, formatCurrency, getStatusVariant, getRiskVariant, formatTime, getRiskLevelText } = useTransactions()

</script>