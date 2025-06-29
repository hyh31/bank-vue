# 银行业务监控分析系统

一个基于 Electron + Vue 3 + TypeScript 的现代化银行业务监控分析系统，提供实时告警监控、业务数据分析、地域分布统计、系统状态监控等功能。支持ATM和外汇(FX)业务的多维度数据分析和可视化展示。

## 🎯 项目概述

本系统专为银行业务监控和数据分析设计，提供直观的仪表板界面和专业的业务分析功能。系统支持多种业务类型的独立监控，包括ATM业务和外汇业务，提供总览模式、详细分析和对比分析三种显示模式。采用现代化的技术栈和响应式设计，确保在不同分辨率下都能提供最佳的用户体验。

## ✨ 核心功能

### 📊 关键指标监控
- **今日告警总数**：实时统计当日所有告警数量
- **高风险交易**：监控高风险交易笔数和趋势
- **监控交易数**：显示当前监控的账户总数
- **系统健康度**：实时系统健康状态评估

### 🚨 实时告警系统
- **三级告警分类**：严重、警告、信息三个级别
- **自动滚动展示**：200px固定高度，每3秒自动滚动
- **无缝循环**：连续滚动显示，无跳跃感
- **交互式操作**：点击查看详细信息

### 🌍 地域分布统计
- **8个主要城市**：北京、上海、广州、深圳、杭州、成都、武汉、西安
- **车轮式滚动**：连续不断的平滑滚动效果
- **实时数据**：显示交易笔数和占比
- **彩色标识**：不同城市使用不同颜色区分

### 🖥️ 系统状态监控
- **真实CPU使用率**：使用 systeminformation 库获取真实的系统CPU使用率
- **真实内存使用率**：实时监控内存占用情况，显示已用/总量
- **网络延迟监控**：网络连接质量检测（可扩展为真实ping测试）
- **数据库连接状态**：数据库连接池状态监控
- **自动状态判断**：根据使用率自动判断正常/警告/严重状态
- **定时刷新**：每10秒自动更新系统状态数据

### 📋 业务类型分析
- **多业务支持**：ATM业务和外汇(FX)业务独立监控
- **三种显示模式**：总览模式、详细分析、对比分析
- **智能数据聚合**：自动计算汇总指标和趋势分析
- **省份分布统计**：可视化展示各省份业务分布情况

#### 🏦 ATM业务监控
- **交易量统计**：实时统计ATM交易笔数和金额
- **省份分布**：展示各省份ATM交易分布情况
- **金额区间分析**：按交易金额区间进行统计分析
- **KPI指标监控**：关键性能指标实时监控

#### 💱 外汇业务监控
- **外汇交易统计**：外汇业务交易量和金额统计
- **交易目的分析**：按交易目的（旅游、投资、留学等）分类
- **币种分布**：不同币种的交易量分布统计
- **年龄段分析**：按客户年龄段进行业务分析
- **近一周趋势分析**：7天交易量趋势图表，包含历史数据和预测数据

#### 📊 总览模式功能
- **核心KPI展示**：交易量、交易金额、趋势变化百分比
- **周对比分析**：本周与上周数据对比，自动计算增长趋势
- **活跃省份统计**：展示业务活跃的省份数量
- **近一周业务趋势**：7天趋势可视化（6天历史数据 + 1天预测数据）
- **智能预测算法**：基于历史数据的简单预测模型
- **实时数据更新**：支持手动刷新和自动更新
- **响应式图表**：现代化ECharts图表，支持交互和动画

### 📋 交易监控数据
- **完整交易信息**：ID、账户、金额、类型、状态等
- **风险等级标识**：高、中、低风险分级显示
- **实时状态更新**：交易状态实时同步
- **详细操作**：支持查看交易详情

## 🛠️ 技术栈

### 前端框架
- **Electron**: 跨平台桌面应用框架
- **Vue 3**: 渐进式JavaScript框架
- **TypeScript**: 类型安全的JavaScript超集
- **Vite**: 现代化构建工具

### 后端技术栈
- **Spring Boot**: Java企业级应用框架
- **MyBatis**: 持久层框架，支持SQL映射和XML配置
- **MySQL**: 关系型数据库，存储业务数据
- **Maven**: 项目构建和依赖管理工具

### UI组件库
- **shadcn-vue**: 现代化UI组件库
- **Tailwind CSS**: 实用优先的CSS框架
- **Lucide Vue**: 精美的图标库
- **ECharts**: 专业的数据可视化图表库
- **Vue ECharts**: Vue 3的ECharts集成组件

### 数据可视化
- **ECharts**: 专业的数据可视化图表库
- **Vue ECharts**: Vue 3的ECharts集成组件
- **自定义图表**: 趋势图、分布图、对比图

### 开发工具
- **Electron Vite**: Electron应用的Vite集成
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 完整的类型定义和检查

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建应用
```bash
# 构建所有平台
npm run build

# 仅构建Windows
npm run build:win

# 仅构建macOS
npm run build:mac

# 仅构建Linux
npm run build:linux
```

## 📱 响应式设计

系统针对不同分辨率进行了优化：

### 主要支持分辨率
- **1920×1080**: 主要开发和优化目标
- **1366×768**: 笔记本电脑标准分辨率
- **1440×900**: MacBook标准分辨率
- **其他分辨率**: 自适应响应式布局

### 布局特点
- **三层布局结构**: 关键指标 → 实时监控 → 交易数据
- **固定高度设计**: 避免滚动条，一屏展示所有内容
- **响应式网格**: 根据屏幕尺寸自动调整列数

## 🎨 界面设计

### 设计原则
- **专业性**: 银行级别的专业界面设计
- **易用性**: 直观的操作和清晰的信息层次
- **美观性**: 现代化的视觉设计和动画效果
- **一致性**: 统一的设计语言和交互模式

### 颜色方案
- **主色调**: 蓝色系，体现专业和信任
- **告警色**: 红色（严重）、黄色（警告）、蓝色（信息）
- **状态色**: 绿色（正常）、橙色（警告）、红色（异常）

### 动画效果
- **悬停效果**: 卡片缩放、阴影变化
- **滚动动画**: 平滑的连续滚动
- **状态变化**: 渐变过渡效果

## 📁 项目结构

```
electron-app/
├── src/
│   ├── main/                 # 主进程代码
│   │   └── index.ts          # 主进程入口，包含IPC处理器
│   ├── preload/              # 预加载脚本
│   │   ├── index.ts          # 预加载脚本，定义API接口
│   │   └── index.d.ts        # TypeScript类型定义
│   └── renderer/             # 渲染进程代码
│       ├── src/
│       │   ├── components/   # Vue组件
│       │   │   ├── ui/       # UI基础组件
│       │   │   ├── charts/   # 图表组件
│       │   │   │   ├── BusinessTypeChart.vue  # 业务类型分析主组件
│       │   │   │   └── business-type/         # 业务类型子组件
│       │   │   │       ├── OverviewMode.vue   # 总览模式组件
│       │   │   │       ├── DetailedMode.vue   # 详细分析组件
│       │   │   │       ├── ComparisonMode.vue # 对比分析组件
│       │   │   │       ├── types.ts           # 类型定义
│       │   │   │       └── utils.ts           # 工具函数
│       │   │   └── Dashboard.vue              # 主仪表板组件
│       │   ├── assets/       # 静态资源
│       │   ├── env.d.ts      # 全局类型定义
│       │   └── main.ts       # 入口文件
│       └── index.html        # HTML模板
├── backend-reference/        # 后端参考代码
│   ├── FXOverviewController.java    # FX总览控制器
│   ├── FXOverviewService.java       # FX总览服务
│   ├── FXOverviewMapper.java        # FX数据访问层
│   ├── FXOverviewDTO.java           # 数据传输对象
│   ├── ATMOverviewController.java   # ATM总览控制器
│   └── DashboardOverviewController.java # 全业务总览控制器
├── docs/                     # 项目文档
│   ├── API.md               # API接口文档
│   └── IPC_USAGE_GUIDE.md   # IPC使用指南
├── out/                      # 构建输出目录
├── package.json              # 项目配置
└── README.md                 # 项目文档
```

## 🔧 配置说明

### 主要配置文件
- `package.json`: 项目依赖和脚本配置
- `electron.vite.config.ts`: Electron Vite构建配置
- `components.json`: shadcn-vue组件配置
- `tailwind.config.js`: Tailwind CSS配置

### 环境变量
系统支持通过环境变量进行配置：
- `NODE_ENV`: 运行环境（development/production）
- `VITE_API_URL`: API服务器地址
- `VITE_WS_URL`: WebSocket服务器地址

## 🔌 后端API接口

### 总览模式专用接口

#### FX外汇业务总览
```http
GET /Bank/fx/overview/yesterday          # 外汇业务总览数据
```

**返回数据结构：**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 785,                      // 总交易量
      "sumAmount": 7737400,              // 总交易金额
      "trend": -11.99                    // 趋势百分比
    },
    "weeklyComparison": {
      "thisWeek": 785,                   // 本周交易量
      "lastWeek": 892,                   // 上周交易量
      "percentage": -11.99,              // 变化百分比
      "dailyData": [                     // 近7天每日数据
        {
          "date": "2024-06-18",
          "volume": 180,                 // 当日交易量
          "amount": 850000               // 当日交易金额
        }
        // ... 其他6天数据
      ]
    },
    "topProvinces": [],                  // 热门省份数据
    "quickInsights": []                  // 快速洞察
  }
}
```

#### ATM业务总览
```http
GET /Bank/atm/overview/yesterday         # ATM业务总览数据
```

#### 全业务总览
```http
GET /Bank/overview/dashboard?timeRange=week
```

### 详细分析接口
```http
GET /Bank/fx/province/yesterday     # FX省份分布
GET /Bank/fx/purpose/yesterday      # FX交易目的
GET /Bank/fx/kind/yesterday         # FX币种分布
GET /Bank/fx/age/yesterday          # FX年龄分布

GET /Bank/atm/province/yesterday    # ATM省份分布
GET /Bank/atm/amount/distribution/yesterday  # ATM金额分布
```

### 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体业务数据
  },
  "timestamp": 1719123456789
}
```

## 📊 数据接口

### IPC通信接口
系统使用Electron的IPC机制进行前后端通信，支持以下API：

```typescript
// 系统监控API
window.api.getSystemStatus(): Promise<SystemStatus>
window.api.getSystemInfo(): Promise<any>

// 数据获取API
window.api.fetchData(): Promise<any>
window.api.fetchRegionData(params?: DataFetchParams): Promise<ApiResponse>
window.api.fetchBusinessData(params?: BusinessDataParams): Promise<ApiResponse>

// 总览模式专用API
window.api.fetchOverviewData(params: OverviewDataParams): Promise<ApiResponse>
```

### 业务数据结构

#### ATM业务数据
```typescript
interface ATMData {
  totalTransactions: number    // 总交易笔数
  totalAmount: number         // 总交易金额
  avgAmount: number          // 平均交易金额
  percentage: number         // 业务占比
  trend: number             // 趋势百分比
  provinceData: Array<{     // 省份分布数据
    province: string
    transcation_times: number
    sum_amount: number
  }>
  amountDistribution: Array<{ // 金额分布数据
    amountLevel: string
    total: number
  }>
}
```

#### FX外汇业务数据
```typescript
interface FXData {
  total: number              // 总交易笔数
  sumAmount: number         // 总交易金额
  percentage: number        // 业务占比
  trend: number            // 趋势百分比
  provinceData: Array<{    // 省份分布数据
    province: string
    total: number
    sum_amount: number
  }>
  purposeData: Array<{     // 交易目的数据
    purpose: string
    total: number
  }>
  kindData: Array<{        // 币种分布数据
    kind: string
    total: number
  }>
  ageData: Array<{         // 年龄分布数据
    ageLevel: string
    total: number
  }>
}
```

#### 总览模式数据结构
```typescript
// 外汇业务总览数据
interface FXOverviewData {
  summary: OverviewSummary              // 汇总数据
  weeklyComparison: WeeklyComparison    // 周对比数据
  topProvinces: TopProvince[]           // 热门省份
  quickInsights: string[]               // 快速洞察
}

// 汇总数据结构
interface OverviewSummary {
  total: number                         // 总交易量（笔数）
  sumAmount: number                     // 总金额
  trend: number                         // 趋势百分比
}

// 周对比数据结构
interface WeeklyComparison {
  thisWeek: number                      // 本周交易量总计
  lastWeek: number                      // 上周交易量总计
  percentage: number                    // 变化百分比
  dailyData: DailyTransactionData[]     // 近7天每日详细数据
}

// 每日交易数据
interface DailyTransactionData {
  date: string                          // 日期 (YYYY-MM-DD)
  volume: number                        // 当日交易量（笔数）
  amount: number                        // 当日交易金额
}

// 热门省份数据
interface TopProvince {
  province: string                      // 省份名称
  total: number                         // 交易笔数
  sum_amount: number                    // 交易金额
  percentage: number                    // 占比
}
```

### 告警数据结构
```typescript
interface AlertItem {
  id: string
  title: string
  description: string
  level: 'critical' | 'warning' | 'info'
  timestamp: Date
}
```

### 地域统计数据结构
```typescript
interface RegionStat {
  name: string
  count: number
  percentage: number
  color: string
  variant: string
}
```

## 🔄 实时更新机制

### 自动刷新
- **数据刷新**: 每30秒自动刷新一次数据
- **告警滚动**: 每3秒自动滚动显示
- **地域滚动**: 连续平滑滚动，60fps刷新率

### 手动刷新
- **全局刷新**: 顶部刷新按钮
- **交易数据刷新**: 交易表格独立刷新按钮
- **状态指示**: 刷新时显示加载状态

## 🎯 性能优化

### 渲染优化
- **虚拟滚动**: 大数据量时使用虚拟滚动
- **懒加载**: 组件按需加载
- **缓存策略**: 合理的数据缓存机制

### 动画优化
- **requestAnimationFrame**: 使用浏览器优化的动画API
- **GPU加速**: 使用transform进行硬件加速
- **防抖节流**: 避免过度渲染

## 🔒 安全考虑

### 数据安全
- **敏感信息脱敏**: 账户号码等敏感信息部分隐藏
- **权限控制**: 基于角色的访问控制
- **数据加密**: 传输和存储数据加密

### 应用安全
- **CSP策略**: 内容安全策略防护
- **沙箱模式**: 渲染进程沙箱隔离
- **更新机制**: 安全的自动更新

## 🐛 故障排除

### 常见问题
1. **应用启动失败**: 检查Node.js版本和依赖安装
2. **界面显示异常**: 清除缓存重新启动
3. **数据不更新**: 检查网络连接和API配置
4. **性能问题**: 检查系统资源占用

### 调试方法
- **开发者工具**: F12打开Chrome DevTools
- **日志查看**: 查看控制台输出
- **网络监控**: 检查API请求状态

## 🏗️ 架构设计

### 前后端分离架构
- **前端**: Electron + Vue 3 + TypeScript
- **后端**: Spring Boot + MyBatis + MySQL
- **通信**: IPC (进程间通信) + HTTP API
- **数据库**: MySQL 8.0+ 支持复杂查询和聚合

### 数据流架构
```
前端组件 → IPC调用 → 主进程 → HTTP请求 → 后端API → 数据库
                ↓
            数据处理 ← 响应数据 ← JSON响应 ← 业务逻辑 ← MyBatis SQL
```

### 总览模式架构
1. **前端组件层**: OverviewMode.vue 负责UI展示和图表渲染
2. **IPC通信层**: fetchOverviewData API 负责数据获取
3. **主进程处理层**: 数据聚合、错误处理和并发请求管理
4. **后端API层**: 专用的总览模式接口，支持数据聚合
5. **数据访问层**: MyBatis映射器，优化的SQL查询和数据聚合
6. **预测算法层**: 基于历史数据的简单预测模型

### 近一周趋势功能架构
```
前端趋势图表 ← 7天数据 ← 数据组合 ← 历史数据查询 + 预测算法
                                    ↓              ↓
                                MyBatis SQL    简单预测模型
                                    ↓              ↓
                                数据库查询      历史数据分析
```

## 📝 更新日志

### v1.2.0 (2024-06-24)
- 🚀 **重大更新**: 完整实现外汇业务近一周趋势分析功能
- 📊 **新增功能**: 7天趋势图表（6天历史数据 + 1天预测数据）
- 🔮 **智能预测**: 基于历史数据的简单预测算法
- 🗄️ **后端优化**: 使用MyBatis实现数据访问层，支持复杂SQL查询
- 📈 **数据结构优化**: 完善WeeklyComparison和DailyTransactionData类型定义
- 🔧 **API完善**: 统一的数据接口，支持并发请求和错误处理
- 🎨 **前端优化**: 改进趋势图表显示，支持智能日期格式化
- 📚 **文档更新**: 完善API文档和数据结构说明

### v1.1.0 (2024-06-23)
- ✨ 新增外汇业务总览模式
- 🏦 完善ATM和FX业务分析功能
- 📊 新增三种显示模式：总览、详细、对比
- 🔄 实现专用的总览模式API接口
- 📈 新增趋势分析和周对比功能
- 🗺️ 优化省份分布可视化
- 🎨 改进UI组件和动画效果
- 📚 完善API文档和类型定义

### v1.0.0 (2024-06-16)
- ✨ 初始版本发布
- 🎯 完整的仪表板功能
- 🚨 实时告警系统
- 🌍 地域分布统计
- 📊 交易监控数据
- 🎨 响应式设计

## 🤝 贡献指南

### 开发流程
1. Fork项目到个人仓库
2. 创建功能分支
3. 提交代码变更
4. 创建Pull Request
5. 代码审查和合并

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 使用Prettier格式化代码
- 编写单元测试

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 邮箱: [your-email@example.com]
- 🐛 问题反馈: [GitHub Issues]
- 📖 文档: [项目Wiki]

---

**银行业务监控分析系统** - 专业、智能、高效的银行业务监控和数据分析解决方案 🏦📊✨

## 🎯 核心特性

- 🏦 **多业务支持**: ATM业务和外汇业务独立监控分析
- 📊 **三种分析模式**: 总览模式、详细分析、对比分析
- 📈 **智能趋势分析**: 近一周趋势图表，包含历史数据和预测算法
- 🔮 **预测功能**: 基于历史数据的简单预测模型，支持未来趋势预估
- 🗺️ **地域分布统计**: 省份级别的业务分布分析
- 🔄 **实时数据更新**: 支持手动刷新和自动更新机制
- 🎨 **现代化UI设计**: 响应式布局、ECharts图表、专业视觉效果
- 🔌 **完整API体系**: 前后端分离、IPC通信、MyBatis数据访问
- 🛡️ **类型安全**: 完整的TypeScript类型定义和检查
- 🗄️ **数据库支持**: MySQL + MyBatis，支持复杂查询和数据聚合
