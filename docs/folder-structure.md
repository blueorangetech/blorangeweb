# Boweb 프로젝트 폴더 구조 및 개발 지침

이 문서는 `Boweb` 프로젝트의 프론트엔드 폴더 구조와 신규 클라이언트 페이지/기능 개발 시 준수해야 할 원칙을 정의합니다.

---

## 1. 핵심 설계 원칙

1. **클라이언트 독립 우선 (Client-First Colocation)**
   - 각 클라이언트(브랜드) 페이지는 요구사항, 메뉴 구조, 레이아웃, 디자인이 서로 다르므로 `src/pages/<클라이언트명>/` 폴더 안에서 독립적으로 구성합니다.
   - 특정 클라이언트에서만 쓰는 컴포넌트, 스타일(CSS), 데이터/분석 로직, 전용 유틸은 해당 클라이언트 폴더 내부에 함께 배치합니다.
   - 클라이언트 추가·수정·삭제 시 **해당 폴더 하나만 다루면 끝나도록** 유지합니다.

2. **메뉴와 레이아웃은 각 페이지가 직접 소유**
   - `ClientSidebar`는 고정 메뉴를 가지지 않는 순수 UI 컴포넌트로 유지하며, 사이드바가 필요한 페이지만 `menuStructure`와 `enabledMenuIds`를 props로 전달합니다.
   - 사이드바 형태가 맞지 않는 페이지(예: `imweb`, `Samsungfire`)는 억지로 `ClientSidebar`를 쓰지 않고 페이지 자체 네비게이션/레이아웃을 자유롭게 구현합니다.

3. **공통화는 검증된 경우에만 (Rule of Three)**
   - 신규 클라이언트 페이지 작업 시 처음부터 `shared/`나 `features/`로 빼지 않고, 먼저 `src/pages/<클라이언트명>/` 내부에 구현합니다.
   - **2~3개 이상의 클라이언트에서 동일하게 재사용**되는 독립 기능 모듈만 `src/features/`로 승격합니다.
   - 앱 전역 인프라(인증, 공통 헤더/푸터, 기본 API 클라이언트, 범용 유틸)만 `src/shared/`에 둡니다.

4. **CSS Colocation**
   - `src/styles/`처럼 스타일 파일만 별도 트리로 분리하지 않고, 각 페이지·기능·공통 컴포넌트 바로 옆에 CSS를 배치합니다.

---

## 2. 디렉터리 구조

```text
src/
├── shared/                     # 앱 전역 공통 인프라 및 순수 UI
│   ├── auth/                   # AuthContext, LoginModal(+CSS), LoginRequiredCard, AccessDeniedCard
│   ├── layout/                 # Header, DashboardHeader, Footer, AppLauncher, ClientSidebar(+CSS), Common.css
│   ├── ui/                     # ComparisonResultCard, ImageDetailModal, ImageSeedUploader, ImageUploadPreview
│   ├── api/                    # 공통 API 클라이언트 및 엔드포인트 (geo/, media/, client.js)
│   └── utils/                  # auth, cropCloseUp, downloadUtils, fileUpload, mediaUtils
│
├── features/                   # 여러 클라이언트가 선택적으로 가져다 쓰는 독립 기능 모듈
│   ├── creative-studio/        # AI 크리에이티브 스튜디오 (+ 전용 CSS, hooks)
│   ├── image-library/          # 에셋 라이브러리 (+ 전용 CSS)
│   ├── competitor-monitoring/  # 경쟁사 모니터링 (+ 전용 CSS, model, test)
│   └── user-management/        # 계정/권한 관리
│
└── pages/                      # 라우트/클라이언트별 독립 폴더
    ├── intro/                  # 메인 소개 페이지 (index.jsx, styles.css)
    ├── not-found/              # 404 페이지 (index.jsx, styles.css)
    ├── atria/                  # Atria (index.jsx, styles.css, components/)
    ├── imweb/                  # 아임웹 (index.jsx, styles.css)
    ├── playground/             # Play Ground (index.jsx, styles.css)
    ├── Samsungfire/            # 삼성화재 (index.jsx, data.js, analysis.js, styles.css)
    └── hanssem/                # 한샘 계열 (리하우스 & 홈퍼니싱)
        ├── menu.js             # 한샘 공통 사이드바 메뉴 정의
        ├── styles.css          # 한샘 공통 페이지 스타일
        ├── shared/             # 한샘 계열 내부 공통 뷰 (TrendView, CompareView, MediaMix, DataChat 등)
        ├── rehouse/            # 한샘 리하우스 (index.jsx, components/, utils/)
        └── hf/                 # 한샘 홈퍼니싱 (index.jsx, components/, utils/)
```

---

## 3. 의존성(Import) 규칙

단방향 의존성을 유지하여 클라이언트 간 결합을 방지합니다.

- `pages/<client>` → `features/*`, `shared/*`, 같은 클라이언트 내부 파일만 import 가능
- `features/*` → `shared/*`, 같은 feature 내부 파일만 import 가능
- `shared/*` → `shared/*` 내부 파일만 import 가능
- **금지 사항**:
  - 다른 클라이언트 폴더(`pages/A` → `pages/B`) 직접 import 금지
  - `shared/`나 `features/`에서 특정 클라이언트(`pages/*`) 역참조 금지

*(예외: `hanssem/rehouse`와 `hanssem/hf`처럼 동일 브랜드 계열 내부에서만 공유하는 코드는 `pages/hanssem/shared/`에 배치합니다.)*

---

## 4. 신규 클라이언트 페이지 추가 체크리스트

새로운 클라이언트(예: `acme`) 페이지를 추가할 때는 아래 순서를 따릅니다.

1. `src/pages/acme/` 폴더 생성 (소문자 kebab-case 권장)
   - `index.jsx`: 페이지 진입점
   - `styles.css`: 페이지 전용 스타일 (다른 페이지와 충돌 방지를 위해 클래스 prefix 사용 권장, 예: `.acme-...`)
   - 필요 시 `components/`, `data.js`, `analysis.js`, `utils/` 등 자유롭게 내부 구성
2. 공통 인증/헤더가 필요하면 `src/shared/auth`, `src/shared/layout`에서 import
3. AI 스튜디오·라이브러리 등 기존 기능 모듈이 필요하면 `src/features/*`에서 import
4. [src/App.jsx](../src/App.jsx)에 `<Route>` 및 `titleMap` 등록
5. 빌드 및 테스트 확인 (`npm run build`, 관련 단위 테스트 실행)
