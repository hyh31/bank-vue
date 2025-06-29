/**
 * 统一的 API 响应接口
 */
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    code?: number
    timestamp?: number
}

/**
 * API 错误响应接口
 */
export interface ApiError {
    code: number
    message: string
    details?: any
}

/**
 * 请求配置接口
 */
export interface RequestConfig {
    endpoint: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    params?: Record<string, any>
    data?: any
}