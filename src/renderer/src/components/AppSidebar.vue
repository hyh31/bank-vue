<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import icon from '../assets/admin.png'

// 侧边栏使用
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  GalleryVerticalEnd,
  LineChart,
  Monitor,
  PieChart,
  Server,
  Settings2,
  Shield,
  TrendingUp,
  Zap,
  Home,
  Building2,
  Eye,
  ShieldCheck,
  Gauge,
  TrendingUpDown,
  Bell,
  BarChart4,
  Cpu
} from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'

/**
 * 组件属性定义
 */
interface AppSidebarProps extends SidebarProps {
  currentView?: string
}

/**
 * 组件事件定义
 */
interface Emits {
  (e: 'view-change', view: string): void
}

const props = withDefaults(defineProps<AppSidebarProps>(), {
  collapsible: 'icon',
  currentView: 'dashboard'
})

const emit = defineEmits<Emits>()

/**
 * 处理主视图切换
 */
const handleMainViewChange = (view: string) => {
  console.log('侧边栏切换视图:', view)
  emit('view-change', view)
}

// 银行监控告警系统数据
const data = {
  user: {
    name: '烨晖',
    email: '620042827@qq.com',
    avatar: icon
  },
  teams: [
    {
      name: '银行监控中心',
      logo: Building2,
      plan: 'Enterprise'
    },
    {
      name: '实时监控系统',
      logo: Eye,
      plan: 'Professional'
    },
    {
      name: '安全防护中心',
      logo: ShieldCheck,
      plan: 'Standard'
    }
  ],
  // 主视图导航
  mainViews: [
    {
      id: 'dashboard',
      title: '监控仪表盘',
      icon: Gauge,
      description: '银行系统监控概览'
    },
    {
      id: 'data-visualization',
      title: '数据可视化',
      icon: TrendingUpDown,
      description: '业务数据分析中心'
    }
  ],
  navMain: [
    {
      title: '告警监控',
      url: '#',
      icon: Bell,
      items: [
        {
          title: '实时告警大屏',
          url: '#'
        },
        {
          title: '告警统计分析',
          url: '#'
        },
        {
          title: '系统健康监控',
          url: '#'
        },
        {
          title: '业务风险监控',
          url: '#'
        }
      ]
    },
    {
      title: '告警中心',
      url: '#',
      icon: AlertTriangle,
      items: [
        {
          title: '实时告警',
          url: '#'
        },
        {
          title: '告警统计',
          url: '#'
        },
        {
          title: '告警配置',
          url: '#'
        },
        {
          title: '历史记录',
          url: '#'
        }
      ]
    },
    {
      title: '系统监控',
      url: '#',
      icon: Cpu,
      items: [
        {
          title: '系统性能',
          url: '#'
        },
        {
          title: '网络监控',
          url: '#'
        },
        {
          title: '数据库监控',
          url: '#'
        },
        {
          title: '应用服务监控',
          url: '#'
        }
      ]
    },
    {
      title: '数据管理',
      url: '#',
      icon: Database,
      items: [
        {
          title: '数据源配置',
          url: '#'
        },
        {
          title: '数据质量监控',
          url: '#'
        },
        {
          title: '数据同步状态',
          url: '#'
        },
        {
          title: '备份管理',
          url: '#'
        }
      ]
    }
  ],
  projects: [
    {
      name: '交易监控',
      url: '#',
      icon: TrendingUp
    },
    {
      name: '风险分析',
      url: '#',
      icon: Shield
    },
    {
      name: '报表中心',
      url: '#',
      icon: PieChart
    }
  ]
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <!-- 主视图切换 -->
      <SidebarGroup>
        <SidebarGroupLabel>主要功能</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="view in data.mainViews" :key="view.id">
              <SidebarMenuButton
                :is-active="props.currentView === view.id"
                class="hover:bg-primary/10 transition-colors duration-200"
                @click="handleMainViewChange(view.id)"
              >
                <component :is="view.icon" class="w-4 h-4" />
                <span class="font-medium">{{ view.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- 原有导航 -->
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
