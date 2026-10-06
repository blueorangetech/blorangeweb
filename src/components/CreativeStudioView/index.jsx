import React, { useState } from 'react';
import MultipleAngleView from './MultipleAngleView';
import RestyleView from './RestyleView';
import ImageComposeView from './ImageComposeView';
import BackgroundRemovalView from './BackgroundRemovalView';
import ImageExpandView from './ImageExpandView';
import ImageVariationView from './ImageVariationView';
import '../../styles/CreativeStudioView.css';

function CreativeStudioView({ embedded = false, pageName = 'playground', bucketName }) {
  const [activeTab, setActiveTab] = useState('multiple-angles');

  return (
    <main className={`hanssem-main creative-studio-main${embedded ? ' embedded' : ''}`}>
      <div className="creative-tool-tabs" role="tablist" aria-label="AI 이미지 편집 도구">
        <button type="button" role="tab" aria-selected={activeTab === 'compose'}
          className={activeTab === 'compose' ? 'active' : ''} onClick={() => setActiveTab('compose')}>
          <span className="material-symbols-outlined">photo_library</span>이미지 합성
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'multiple-angles'}
          className={activeTab === 'multiple-angles' ? 'active' : ''}
          onClick={() => setActiveTab('multiple-angles')}
        >
          <span className="material-symbols-outlined">360</span>다양한 각도
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'restyle'}
          className={activeTab === 'restyle' ? 'active' : ''}
          onClick={() => setActiveTab('restyle')}
        >
          <span className="material-symbols-outlined">brush</span>리스타일
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'photoroom'}
          className={activeTab === 'photoroom' ? 'active' : ''}
          onClick={() => setActiveTab('photoroom')}
        >
          <span className="material-symbols-outlined">layers_clear</span>배경제거
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'image-expand'}
          className={activeTab === 'image-expand' ? 'active' : ''}
          onClick={() => setActiveTab('image-expand')}
        >
          <span className="material-symbols-outlined">aspect_ratio</span>이미지 확장
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'image-variations'}
          className={activeTab === 'image-variations' ? 'active' : ''}
          onClick={() => setActiveTab('image-variations')}>
          <span className="material-symbols-outlined">resize</span>소재 베리에이션
        </button>
      </div>
      {activeTab === 'compose' ? (
        <ImageComposeView embedded={embedded} pageName={pageName} bucketName={bucketName} />
      ) : activeTab === 'image-variations' ? (
        <ImageVariationView embedded={embedded} />
      ) : activeTab === 'image-expand' ? (
        <ImageExpandView embedded={embedded} />
      ) : activeTab === 'photoroom' ? (
        <BackgroundRemovalView
          embedded={embedded}
        />
      ) : activeTab === 'restyle' ? (
        <RestyleView embedded={embedded} pageName={pageName} bucketName={bucketName} />
      ) : (
        <MultipleAngleView embedded={embedded} pageName={pageName} bucketName={bucketName} />
      )}
    </main>
  );
}

export default CreativeStudioView;
