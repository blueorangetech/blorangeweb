import { mediaClient } from './client';

/**
 * src/api/media/manageNaverApi.js
 *
 * 네이버 광고 운영 및 예산 관리 백엔드 API 서비스 (Media/Pandasai 서버 호출)
 */
export class ManageNaverApi {
  constructor() {
    this.client = mediaClient;
  }

  /**
   * 캠페인 리스트 및 오늘 소진 비용 조회
   */
  getCampaigns(customer = 'atria', startDate, endDate) {
    return this.client.get('/manage/naver/campaigns', {
      customer,
      start_date: startDate,
      end_date: endDate
    });
  }

  /**
   * 특정 캠페인의 광고그룹 리스트 및 오늘 소진 비용 조회
   */
  getAdgroups(campaignId, customer = 'atria', startDate, endDate) {
    return this.client.get('/manage/naver/adgroups', {
      campaign_id: campaignId,
      customer,
      start_date: startDate,
      end_date: endDate
    });
  }

  /**
   * 캠페인 예산 변경
   */
  updateCampaignBudget(campaignId, budget, useBudget, customer = 'atria') {
    return this.client.put(
      `/manage/naver/campaigns/${campaignId}/budget`,
      { budget, useBudget },
      { customer }
    );
  }

  /**
   * 광고그룹 예산 변경
   */
  updateAdgroupBudget(adgroupId, budget, useBudget, customer = 'atria') {
    return this.client.put(
      `/manage/naver/adgroups/${adgroupId}/budget`,
      { budget, useBudget },
      { customer }
    );
  }
}

export const manageNaverApi = new ManageNaverApi();
