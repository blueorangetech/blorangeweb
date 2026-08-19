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

  getFavoriteGroups(customer = 'atria', startDate, endDate) {
    return this.client.get('/manage/naver/favorite-groups', {
      customer,
      start_date: startDate,
      end_date: endDate
    });
  }

  createFavoriteGroup(name, budget, customer = 'atria', userName) {
    return this.client.post('/manage/naver/favorite-groups', { name, budget, userName }, { customer });
  }

  updateFavoriteGroup(groupId, name, budget, customer = 'atria', userName) {
    return this.client.put(`/manage/naver/favorite-groups/${groupId}`, { name, budget, userName }, { customer });
  }

  deleteFavoriteGroup(groupId, customer = 'atria') {
    return this.client.delete(`/manage/naver/favorite-groups/${groupId}`, { customer });
  }

  addFavoriteGroupMember(groupId, adgroupId, parentCampaignId, customer = 'atria') {
    return this.client.put(
      `/manage/naver/favorite-groups/${groupId}/adgroups/${adgroupId}`,
      { parentCampaignId },
      { customer }
    );
  }

  removeFavoriteGroupMember(groupId, adgroupId, customer = 'atria') {
    return this.client.delete(
      `/manage/naver/favorite-groups/${groupId}/adgroups/${adgroupId}`,
      { customer }
    );
  }

  async downloadFavoriteGroupExcel(groupId, customer = 'atria', startDate, endDate) {
    const url = this.client.buildUrl(`/manage/naver/favorite-groups/${groupId}/export`, {
      customer,
      start_date: startDate,
      end_date: endDate
    });
    const response = await fetch(url);
    if (!response.ok) {
      let message = '엑셀 파일을 다운로드하지 못했습니다.';
      try {
        const error = await response.json();
        message = error.detail || message;
      } catch {
        // JSON 오류 응답이 아닌 경우 기본 메시지를 사용한다.
      }
      throw new Error(message);
    }
    return response.blob();
  }

  async downloadAllAdgroupsExcel(customer = 'atria', startDate, endDate) {
    const url = this.client.buildUrl('/manage/naver/adgroups/export-excel', {
      customer,
      start_date: startDate,
      end_date: endDate
    });
    const response = await fetch(url);
    if (!response.ok) {
      let message = '전체 광고그룹 엑셀 파일을 다운로드하지 못했습니다.';
      try {
        const error = await response.json();
        message = error.detail || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }
    return response.blob();
  }

  async uploadAdgroupBudgetExcel(file, customer = 'atria') {
    const formData = new FormData();
    formData.append('file', file);
    const url = this.client.buildUrl('/manage/naver/adgroups/upload-excel', { customer });
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      let message = '엑셀 파일 업로드에 실패했습니다.';
      try {
        const error = await response.json();
        message = error.detail || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }
    return response.json();
  }

  updateAdgroupBudgets(items, customer = 'atria', userName) {
    return this.client.put('/manage/naver/adgroups/bulk-budget', { items, userName }, { customer });
  }

  /**
   * 캠페인 예산 변경
   */
  updateCampaignBudget(campaignId, budget, useBudget, customer = 'atria', options = {}) {
    return this.client.put(
      `/manage/naver/campaigns/${campaignId}/budget`,
      {
        budget,
        useBudget,
        name: options.name,
        prevBudget: options.prevBudget,
        prevUseBudget: options.prevUseBudget,
        userName: options.userName,
      },
      { customer }
    );
  }

  /**
   * 광고그룹 예산 변경
   */
  updateAdgroupBudget(adgroupId, budget, useBudget, customer = 'atria', options = {}) {
    return this.client.put(
      `/manage/naver/adgroups/${adgroupId}/budget`,
      {
        budget,
        useBudget,
        name: options.name,
        parentCampaignId: options.parentCampaignId,
        prevBudget: options.prevBudget,
        prevUseBudget: options.prevUseBudget,
        userName: options.userName,
      },
      { customer }
    );
  }

  /**
   * 예산 변경 이력(로그) 조회
   */
  getBudgetLogs(params = {}) {
    const {
      customer = 'atria',
      media = 'naver',
      startDate,
      endDate,
      targetType,
      changeType,
      search,
      page = 1,
      pageSize = 50,
    } = params;

    return this.client.get('/manage/naver/logs', {
      customer,
      media,
      startDate,
      endDate,
      targetType: targetType !== 'all' ? targetType : undefined,
      changeType: changeType !== 'all' ? changeType : undefined,
      search: search || undefined,
      page,
      pageSize,
    });
  }
}

export const manageNaverApi = new ManageNaverApi();

