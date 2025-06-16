<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

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
  Zap
} from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon'
})

// 银行监控告警系统数据
const data = {
  user: {
    name: 'Hyphen',
    email: 'admin@bankmonitor.com',
    avatar: '/avatars/user.jpg'
  },
  teams: [
    {
      name: '监控中心',
      logo: Monitor,
      plan: 'Enterprise'
    },
    {
      name: '风控部门',
      logo: Shield,
      plan: 'Professional'
    },
    {
      name: '运维团队',
      logo: Server,
      plan: 'Standard'
    }
  ],
  navMain: [
    {
      title: '仪表盘',
      url: '#',
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: '监控概览',
          url: '#'
        },
        {
          title: '关键指标',
          url: '#'
        },
        {
          title: '实时数据',
          url: '#'
        }
      ]
    },
    {
      title: '告警监控',
      url: '#',
      icon: Monitor,
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
      title: '数据可视化',
      url: '#',
      icon: BarChart3,
      items: [
        {
          title: '交易趋势分析',
          url: '#'
        },
        {
          title: '风险指标图表',
          url: '#'
        },
        {
          title: '业务数据报表',
          url: '#'
        },
        {
          title: '实时数据流',
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
      icon: Activity,
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
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
