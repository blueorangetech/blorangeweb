# 경쟁사 모니터링 — 공식 출처 기반 프론트엔드

2026-10-19 확인한 공식 행사/상품 6건. 수집 서버·스케줄러는 추가하지 않았으며 자동 감지 이력을 생성하지 않는다.

- 데이터: monitoringData.js / 한국 날짜·필터·상태 계산: monitoringModel.js
- 이미지: public/images/competitor-monitoring/ (공식 원본 그대로, sources.json에 이미지 URL 기록)
- 기존 가상 행사·할인율 변경·기간 연장·수집 실패 기록 및 화면의 예시 시연 문구 제거.
- 가격 비교는 같은 원문에 공개된 정가/특별가 또는 기존가/새 가격이다. 수집 시점 간 변경으로 표현하지 않는다.
- 종료 임박: 한국 날짜로 D-3~D-day만 포함. 미래 시작·종료 행사 제외. 기간 미공개는 별도 상태.
- 출처 확인 현황: 실제 확인한 3개사만 원문 확인으로 표시. 나머지는 미확인.

## 원문

1. 이케아 이케사는 세일: https://www.ikea.com/kr/ko/campaigns/storage-week-fy27-l2-pub47d55da0/ — 2026.10.08–10.27, Family 대상 10%. 개별 특별가 구분.
2. 일룸 스트라토: https://www.iloom.com/eventNews/event_main.do — 2026.08.24–11.01. 구체적 할인율 추정하지 않음.
3. 리바트 제휴: https://www.hyundailivart.co.kr/eventDetail/E200000624 — 행사 기간은 https://www.hyundailivart.co.kr/event 에서 2026.09.01–11.30 확인.
4. 이케아 BILLY / OXBERG: https://www.ikea.com/kr/ko/p/billy-oxberg-bookcase-with-doors-white-s99528347/ — 기존가149,900원/새가격139,900원. 기간 미공개.
5. 이케아 RÅSKOG: https://www.ikea.com/kr/ko/p/raskog-trolley-white-20586788/ — 정가42,900원/Family38,000원. 기간은 공식 캠페인 참조.
6. 일룸 카드사 혜택: https://www.iloom.com/eventNews/event_main.do — 2026.10.01–10.31. 카드별 개월수 추정하지 않음.

일룸은 공식 이벤트 목록에서 확인했으며 접근하지 못한 개별 상세 URL은 만들지 않았다. 2026-10-19 기준 종료 임박 0건은 정상이다. 자동 갱신 데이터가 아니므로 변경 시 원문 재확인 및 verifiedOn 갱신 필요.

검증: node --test src/components/common/CompetitorMonitoring/monitoringModel.test.mjs / 해당 폴더 ESLint / npm run build / 실제 브라우저 필터·상세·이미지·모바일 확인.

## SNS·뉴스 확장 (2026-10-19)

- 일룸 RM 캠페인: https://www.iloom.com/magazine/idea_8 의 유튜브 삽입 영상 `uZ0tvQr2mn4` 확인. 영상 자체 게시일은 미확인이므로 null 유지.
- 동일 캠페인 기사: https://hypebeast.kr/2023/10/iloom-campaign-with-rm-of-bts — article:published_time 2023-10-26T03:00:28+00:00. 일룸 제공 표기도 상세에 명시. 캠페인 한 건에 세 출처를 연결한다.
- 팝업 보도자료: https://www.newswire.co.kr/newsRead.php?no=1026531 — 2026-01-07 게시, 송파구 팝업 2026-01-16~02-14. 기업 제공 보도자료로 분류하며 종료 행사로 표시.
- 홈페이지·유튜브·뉴스·보도자료 필터, 출처별 게시일·확인일·제공 주체 표시. 게시 콘텐츠는 기간 미정 행사와 별도 상태.
- 인스타그램 개별 게시물은 원문 접근이 확인되지 않아 추가하지 않았다. 프로필 링크나 제3자 복제물을 게시물 증거로 사용하지 않는다.
- 현재 총 8건의 수동 확인 소식. 자동 수집 기능을 구현한 것은 아니다.

## 날짜 표시 수정

일괄 확인일은 내부 검증 메타데이터로만 유지한다. 화면은 출처별 실제 게시일과 행사 기간을 표시하며, 게시일을 알 수 없으면 미공개로 표시한다. 오늘 날짜는 행사 상태 계산 기준으로만 사용한다.
