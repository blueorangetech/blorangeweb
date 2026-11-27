import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardHeader, Footer } from '../../shared/layout';
import { useAuth } from '../../shared/auth/AuthContext';
import logoImage from '../../assets/blueorange_logo.png';
import './styles.css';

const imageBase = `${import.meta.env.BASE_URL}images/boweb-home`;
const imageVersion = 'v2';

const features = [
  {
    id: 'performance',
    title: '광고 성과 분석',
    description: 'CSV·Excel 성과 데이터를 업로드하고, 매체·기간·키워드별 광고 성과와 전월 대비 변화를 빠르게 비교하세요.',
    tags: ['매체별 성과 비교', '키워드·소재 분석', 'ROAS 추이'],
    cardAlt: '월 집행 광고비 3억 2,000만원 기준 매체별 ROAS 비교 예시: 검색 광고 680%, 디스플레이 광고 495%, 동영상 광고 458%.',
  },
  {
    id: 'data-chat',
    title: 'AI 데이터 챗',
    description: '복잡한 엑셀·매체 리포트를 올리고 자연어로 질문하면, 핵심 수치 요약과 예산 개선 포인트를 바로 답해드립니다.',
    tags: ['자연어 질의', '엑셀·CSV 분석', 'AI 인사이트'],
    cardAlt: '엑셀 리포트 파일을 첨부해 이번 달 ROAS 1위 매체와 매출을 질문하면 AI가 검색 광고 ROAS 680%와 핵심 수치를 답하는 예시.',
  },
  {
    id: 'creative',
    title: 'AI 광고 소재 제작',
    description: '제품 연출 이미지와 매체별 배너 소재를 AI로 제작하고, 완성된 결과물을 라이브러리에서 관리하세요.',
    tags: ['배경 리스타일', '규격 베리에이션', '에셋 라이브러리'],
    cardAlt: '같은 제품을 배경과 조명을 바꿔 만든 두 가지 광고 소재',
  },
];

const heroHighlights = [
  { icon: 'monitoring', label: '매체 통합 리포트' },
  { icon: 'chat', label: 'AI 데이터 챗' },
  { icon: 'auto_awesome', label: '크리에이티브 스튜디오' },
];

function PlatformFlowVisual() {
  return (
    <div className="intro-flow" aria-label="매체 데이터 연동에서 AI 분석, 광고 소재 생성까지의 플랫폼 흐름">
      <div className="intro-flow-stage">
        <div className="intro-flow-stage-head">
          <span className="intro-flow-step">01 DATA</span>
          <span className="intro-flow-status">실시간 통합 수집</span>
        </div>
        <div className="intro-flow-stage-title">멀티 매체 데이터 연동</div>
        <div className="intro-flow-chips">
          <span className="intro-flow-chip"><i className="dot dot-naver" />Naver</span>
          <span className="intro-flow-chip"><i className="dot dot-google" />Google</span>
          <span className="intro-flow-chip"><i className="dot dot-meta" />Meta</span>
          <span className="intro-flow-chip"><i className="dot dot-file" />Excel · CSV</span>
        </div>
      </div>

      <div className="intro-flow-connector" aria-hidden="true">
        <span className="intro-flow-line" />
        <span className="material-symbols-outlined">arrow_downward</span>
      </div>

      <div className="intro-flow-stage is-featured">
        <div className="intro-flow-stage-head">
          <span className="intro-flow-step">02 AI ENGINE</span>
          <span className="intro-flow-badge">AI 데이터 챗</span>
        </div>
        <div className="intro-flow-stage-title">성과 분석 &amp; AI 인사이트 도출</div>
        <div className="intro-flow-metrics">
          <div className="intro-flow-metric">
            <span>통합 ROAS</span>
            <strong>580%</strong>
          </div>
          <div className="intro-flow-metric">
            <span>전환 매출</span>
            <strong>18.5억</strong>
          </div>
          <div className="intro-flow-metric">
            <span>효율 개선</span>
            <strong className="is-up">+42%p</strong>
          </div>
        </div>
        <p className="intro-flow-insight">
          <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
          검색 광고 ROAS 680% 달성 · 고효율 키워드 예산 확대 권장
        </p>
      </div>

      <div className="intro-flow-connector" aria-hidden="true">
        <span className="intro-flow-line" />
        <span className="material-symbols-outlined">arrow_downward</span>
      </div>

      <div className="intro-flow-stage">
        <div className="intro-flow-stage-head">
          <span className="intro-flow-step">03 CREATIVE</span>
          <span className="intro-flow-status">매체 규격 자동 생성</span>
        </div>
        <div className="intro-flow-stage-title">AI 소재 제작 &amp; 에셋 라이브러리</div>
        <div className="intro-flow-chips">
          <span className="intro-flow-chip">배경 리스타일</span>
          <span className="intro-flow-chip">배너 규격 변형</span>
          <span className="intro-flow-chip">팀 라이브러리 공유</span>
        </div>
      </div>
    </div>
  );
}

function Intro() {
  const {
    isLoggedIn,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  useEffect(() => {
    checkAuth('intro', false);
  }, [checkAuth]);

  return (
    <div className="intro-container">
      <DashboardHeader
        title={
          <span className="intro-brand-title">
            <img src={logoImage} alt="" className="intro-brand-logo" width="28" height="28" />
            <span>AI Dashboard</span>
          </span>
        }
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />

      <main className="intro-content">
        <section className="intro-hero" aria-labelledby="intro-hero-title">
          <div className="intro-shell intro-hero-grid">
            <div className="intro-hero-content">
              <p className="intro-hero-eyebrow">BLUEORANGE MARKETING PLATFORM</p>
              <h2 id="intro-hero-title" className="intro-hero-title">
                광고 성과 분석부터
                <span>AI 소재 제작까지</span>
              </h2>
              <p className="intro-hero-subtitle">
                매체별 성과를 비교하고, AI 데이터 챗으로 인사이트를 찾고, 광고에 쓸 이미지를 한 곳에서 만들어 보세요.
              </p>

              <div className="intro-hero-actions">
                <Link className="intro-cta-button" to="/imweb">
                  대시보드 시작하기
                  <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>

              <ul className="intro-hero-highlights" aria-label="핵심 제공 영역">
                {heroHighlights.map(item => (
                  <li key={item.label} className="intro-hero-highlight">
                    <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <PlatformFlowVisual />
          </div>
        </section>

        <section className="intro-shell intro-features-section" aria-labelledby="intro-features-title">
          <div className="intro-section-header">
            <div>
              <p className="intro-section-eyebrow">CORE CAPABILITIES</p>
              <h2 id="intro-features-title" className="intro-section-title">주요 기능</h2>
            </div>
            <p className="intro-section-lead">데이터 집계부터 AI 분석, 소재 제작까지 실무에 필요한 핵심 기능을 제공합니다.</p>
          </div>

          <div className="intro-features-grid">
            {features.map(feature => (
              <article key={feature.id} className="intro-feature-card">
                <img
                  className="intro-feature-image"
                  src={`${imageBase}/${feature.id}-card.webp?${imageVersion}`}
                  alt={feature.cardAlt}
                  width="1254"
                  height="1254"
                  loading="lazy"
                  decoding="async"
                />
                <div className="intro-feature-body">
                  <h3 className="intro-feature-title">{feature.title}</h3>
                  <p className="intro-feature-description">{feature.description}</p>
                  <ul className="intro-feature-tags" aria-label={`${feature.title} 세부 기능`}>
                    {feature.tags.map(tag => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Intro;
