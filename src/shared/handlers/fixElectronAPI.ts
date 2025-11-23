import { fetchBusinessDataHandler } from "./fetch-business-data";
import { fetchOverviewDataHandler } from "./fetch-overview-data";
import { fetchRegionDataHandler } from "./fetch-region-data";
import { fetchDataHandler } from "./fetchData";
import {  fetchAlertDetailHandler, fetchAlertsHandler, fetchAlertsPageHandler, fetchAlertStatisticsHandler } from "./fetch-alerts";

export function fixElectrionAPI() {
    if ((window as any).electron === undefined) {
        (window as any).api = {
            fetchRegionData: fetchRegionDataHandler,
            fetchBusinessData: fetchBusinessDataHandler,
            fetchOverviewData: fetchOverviewDataHandler,
            fetchData: fetchDataHandler,
            fetchAlerts: fetchAlertsHandler,
            fetchAlertsPage: fetchAlertsPageHandler,
            fetchAlertDetail: fetchAlertDetailHandler,
            fetchAlertStatistics: fetchAlertStatisticsHandler
        }
    }
}