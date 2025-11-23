import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAlertsStore } from '@renderer/stores/alerts'

export function useAlertsLifecycle() {
    const alertsStore = useAlertsStore()

    onMounted(async () => {
        await alertsStore.autoInitialize()
        alertsStore.startAutoRefresh()
    })

    onUnmounted(() => {
        alertsStore.stopAutoRefresh()
    })

    const { alerts, currentIndex, isLoading, alertContainer } = storeToRefs(alertsStore)

    return {
        alerts,
        currentIndex,
        isLoading,
        alertContainer,
    }
}