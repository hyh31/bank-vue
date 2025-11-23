// 管理分页逻辑
import { reactive } from "vue"
import type { Pagination } from "../types/alert-center"

/**
 * 告警分页逻辑
 * 分页状态管理、页码切换、页面大小设置
 */
export function useAlertPagination() {
    // 分页状态
    const pagination = reactive<Pagination>({
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 0
    })

    // 跳转到指定页码
    const goToPage = (page: number) => {
        if (page >= 1 && page <= getTotalPages()) {
            pagination.page = page
        }
    }

    // 上一页
    const prevPage = () => {
        if (pagination.page > 1) {
            pagination.page--
        }
    }

    // 下一页
    const nextPage = () => {
        if (pagination.page < getTotalPages()) {
            pagination.page++
        }
    }

    // 获取总页数
    const getTotalPages = () => {
        return Math.ceil(pagination.total / pagination.pageSize)
    }

    // 当前页的显示数据的范围
    const getCurrentRange = () => {
        const start = (pagination.page - 1) * pagination.pageSize + 1
        const end = Math.min(pagination.page * pagination.pageSize, pagination.total)
        return { start, end }
    }

    // 检查是否有上一页 避免出界
    const checkPrevPage = () => {
        return pagination.page > 1
    }

    // 检查是否有下一页 避免出界
    const checkNextPage = () => {
        return pagination.page < getTotalPages()
    }

    // 获取分页信息描述
    const getPaginationInfo = () => {
        const { start, end } = getCurrentRange()
        return `显示第 ${start}-${end} 条，共 ${pagination.total} 条记录`
    }

    return {
        pagination,
        goToPage,
        prevPage,
        nextPage,
        getTotalPages,
        getCurrentRange,
        checkPrevPage,
        checkNextPage,
        getPaginationInfo
    }
}