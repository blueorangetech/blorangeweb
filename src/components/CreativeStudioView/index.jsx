import React, { useState } from 'react';
import MultipleAngleView from './MultipleAngleView';
import RestyleView from './RestyleView';
import PhotoRoomStudioView from './photoroom/PhotoRoomStudioView';
import ImageExpandView from './photoroom/ImageExpandView';
import '../../styles/CreativeStudioView.css';

function CreativeStudioView({ embedded = false, pageName = 'playground', bucketName }) {
  const [activeTab, setActiveTab] = useState('multiple-angles');

  return (
    <main className={`hanssem-main creative-studio-main${embedded ? ' embedded' : ''}`}>
      <div className="creative-tool-tabs" role="tablist" aria-label="AI 이미지 편집 도구">
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
      </div>
      {activeTab === 'image-expand' ? (
        <ImageExpandView embedded={embedded} />
      ) : activeTab === 'photoroom' ? (
        <PhotoRoomStudioView
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
