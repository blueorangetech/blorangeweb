# Atria 광고그룹 즐겨찾기 그룹 기능 계획서

## 1. 확정 범위

Atria에서는 캠페인을 즐겨찾기하지 않고 광고그룹만 즐겨찾기로 관리한다. 즐겨찾기는 개인별 데이터가 아니라 페이지 공용 데이터이며, 여러 즐겨찾기 그룹을 만들 수 있다.

각 즐겨찾기 그룹에는 별도 관리 예산을 입력한다. 선택한 조회 기간 동안 그룹에 포함된 광고그룹의 소진액을 합산하고 다음 식으로 그룹 소진율을 계산한다.

```text
그룹 소진율 = 그룹 내 광고그룹 소진액 합계 ÷ 그룹 관리 예산 × 100
```

그룹 관리 예산은 네이버 광고 시스템의 실제 일일 예산을 변경하지 않는 Atria 내부 관리 기준이다.

## 2. MongoDB 구성

무료 티어의 기존 클러스터를 재사용한다.

```text
Cluster: RequestBoard
└── Database: media_favorites
    └── Collection: atria
```

`atria` 컬렉션에는 즐겨찾기 그룹 문서만 저장한다. 기존 단일 즐겨찾기 문서는 `document_type`이 없어 새 그룹 조회 대상에서 제외된다.

## 3. 데이터 모델

```json
{
  "_id": "ObjectId",
  "document_type": "favorite_group",
  "customer": "atria",
  "media": "naver",
  "account_id": "naver-customer-id",
  "name": "핵심 운영 그룹",
  "budget": 10000000,
  "members": [
    {
      "adgroup_id": "nccAdgroupId",
      "parent_campaign_id": "nccCampaignId"
    }
  ],
  "created_at": "UTC datetime",
  "updated_at": "UTC datetime"
}
```

캠페인명, 광고그룹명, 상태, 소진액은 MongoDB에 복제하지 않는다. 네이버 광고 API의 최신 값을 사용한다.

### 인덱스

- `customer + media + account_id + name`: 같은 페이지와 광고 계정 내 그룹명 고유 보장
- `customer + account_id + members.adgroup_id`: 광고그룹이 포함된 그룹 검색 지원

이전 단일 즐겨찾기 모델의 인덱스는 앱 시작 시 제거한다.

## 4. 기능

### 그룹 관리

- 그룹 생성
- 그룹명 수정
- 그룹 관리 예산 입력 및 수정
- 그룹 삭제
- 그룹을 컴팩트한 한 줄 목록으로 표시
- 한 줄에 포함 광고그룹 개수, 예산, 선택 기간 소진액, 소진율 표시
- 그룹 행을 선택하면 해당 그룹의 광고그룹만 하단 목록에 표시
- 선택한 그룹을 다시 누르면 전체 목록으로 복귀
- 그룹 선택 시 상단 KPI를 그룹 예산, 소진액, 소진율, 클릭·노출·CTR·CPC로 동기화
- 선택 그룹의 광고그룹을 캠페인 계층 없이 평면 표로 표시
- 대량 예산 수정용 `.xlsx` 템플릿 다운로드 제공

### 광고그룹 관리

- 광고그룹 행에만 별 버튼 표시
- 별 버튼을 누르면 그룹 배정 창 표시
- 하나의 광고그룹을 여러 그룹에 포함 가능
- 그룹별 체크박스로 추가·해제
- 즐겨찾기 광고그룹이 있는 캠페인에 포함 개수 표시
- `즐겨찾기만 보기`에서 즐겨찾기 광고그룹이 포함된 캠페인과 광고그룹만 표시

캠페인 행에는 즐겨찾기 버튼을 표시하지 않는다.

## 5. API

### 그룹 목록과 소진율

```http
GET /manage/naver/favorite-groups
  ?customer=atria
  &start_date=YYYY-MM-DD
  &end_date=YYYY-MM-DD
```

그룹, 멤버, 관리 예산, 기간 소진액, 소진율을 반환한다. 네이버 통계 조회가 일시적으로 실패해도 그룹 정의는 반환하며 소진액은 0으로 처리한다.

### 그룹 생성

```http
POST /manage/naver/favorite-groups?customer=atria
```

```json
{ "name": "핵심 운영 그룹", "budget": 10000000 }
```

### 그룹 수정

```http
PUT /manage/naver/favorite-groups/{group_id}?customer=atria
```

### 그룹 삭제

```http
DELETE /manage/naver/favorite-groups/{group_id}?customer=atria
```

### 광고그룹 배정 및 해제

```http
PUT /manage/naver/favorite-groups/{group_id}/adgroups/{adgroup_id}?customer=atria
DELETE /manage/naver/favorite-groups/{group_id}/adgroups/{adgroup_id}?customer=atria
```

배정 요청에는 `parentCampaignId`를 포함하며, 서버는 해당 광고그룹이 실제 Atria 네이버 계정과 캠페인에 속하는지 검증한다.

### Excel 템플릿 다운로드

```http
GET /manage/naver/favorite-groups/{group_id}/export
```

현재 예산과 성과 지표, 사용자가 입력할 `수정 예산`, `수정 예산 사용` 컬럼을 포함한다.

### 광고그룹 예산 일괄 수정

```http
PUT /manage/naver/adgroups/bulk-budget
```

최대 500개 광고그룹의 `adgroupId`, `budget`, `useBudget`을 받아 네이버 검색광고 수정 API를 순차 호출한다. 일부 항목이 실패하면 성공·실패 결과를 항목별로 반환한다.

## 6. 소진율 정책

- 조회 기간은 Atria 상단 날짜 필터와 동일하다.
- 그룹 소진액은 그룹 멤버 광고그룹의 `salesAmt` 합계다.
- 예산이 0원이면 소진율을 계산하지 않고 `-`로 표시한다.
- 70% 이상은 주의, 90% 이상은 위험 색상으로 표시한다.
- 같은 광고그룹이 여러 그룹에 포함되면 각 그룹의 소진액에 각각 반영한다.
- 한 그룹 안에서는 같은 광고그룹을 중복 저장하지 않는다.
- 그룹 예산은 네이버의 실제 캠페인·광고그룹 예산과 독립적이다.

## 7. 오류 처리

- MongoDB 장애가 기존 캠페인 및 광고그룹 상태 조회를 막지 않도록 한다.
- 잘못된 그룹 ID는 `422`, 없는 그룹은 `404`로 처리한다.
- 중복 그룹명은 `409`로 처리한다.
- 허용되지 않은 고객사는 `403`으로 처리한다.
- 광고 계정에 없는 광고그룹은 `404`로 처리한다.
- 그룹 삭제 전 사용자 확인을 받는다.

## 8. 완료 기준

- 캠페인 즐겨찾기 UI와 API가 존재하지 않는다.
- 여러 공용 즐겨찾기 그룹을 생성·수정·삭제할 수 있다.
- 광고그룹을 하나 이상의 그룹에 추가·해제할 수 있다.
- 그룹별 관리 예산을 저장하고 수정할 수 있다.
- 선택 기간의 광고그룹 소진액으로 그룹별 소진율이 계산된다.
- 새로고침과 재접속 후 동일한 공용 그룹이 표시된다.
- 페이지와 광고 계정 범위가 서로 섞이지 않는다.
