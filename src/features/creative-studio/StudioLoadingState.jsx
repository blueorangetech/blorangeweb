import React, { useEffect, useState } from 'react';

export default function StudioLoadingState({
  title = 'AI 작업 처리 중',
  steps = [
    'AI 모델 연결 및 이미지 분석 중...',
    '공간 구조 및 디테일 매핑 중...',
    '고해상도 렌더링 처리 중...',
    '최종 결과물 생성 중...',
  ],
  icon = 'auto_awesome',
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (!steps || steps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % steps.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="studio-motion-loading">
      {/* 백그라운드 빛 발산 효과 */}
      <div className="motion-ambient-glow" />

      {/* 중앙 궤도 회전 + 스캐닝 빔 애니메이션 */}
      <div className="motion-orbit-container">
        <div className="motion-ring ring-outer" />
        <div className="motion-ring ring-middle" />
        <div className="motion-ring ring-inner" />
        <div className="motion-scan-bar" />
        <div className="motion-core-badge">
          <span className="material-symbols-outlined motion-core-icon">{icon}</span>
        </div>
        <div className="motion-particle p1" />
        <div className="motion-particle p2" />
        <div className="motion-particle p3" />
      </div>

      {/* 타이틀 및 스텝 진행 텍스트 */}
      <div className="motion-text-container">
        <h4 className="motion-title">{title}</h4>
        <div className="motion-step-badge">
          <span className="motion-pulsing-dot" />
          <span className="motion-step-text" key={currentStepIdx}>
            {steps[currentStepIdx]}
          </span>
        </div>
      </div>

      {/* 프로그레스 웨이브 바 */}
      <div className="motion-progress-track">
        <div className="motion-progress-wave" />
      </div>
    </div>
  );
}
