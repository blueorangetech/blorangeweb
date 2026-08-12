import React, { useState, useEffect, useRef, useMemo } from 'react';

import DeleteConfirmModal from './DeleteConfirmModal';
import FolderTreePopover from './FolderTreePopover';
import LibraryCard from './LibraryCard';
import LibraryLightbox from './LibraryLightbox';
import '../../styles/ImageLibrary.css';
import { LibraryApi } from '../../api';

/**
 * 에셋 라이브러리 메인 컴포넌트 (src/components/ImageLibrary/index.jsx)
 */
function ImageLibrary({ pageName = 'playground', bucketName, customTitle, allowFolderSelector }) {
  const isFolderSelectorAllowed = allowFolderSelector !== undefined ? allowFolderSelector : Boolean(bucketName);

  const [selectedFolder, setSelectedFolder] = useState(pageName || 'all');
  const [dynamicFolders, setDynamicFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [fitMode, setFitMode] = useState('contain'); // 'contain' 또는 'cover'
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fileInputRef = useRef(null);
  const activeFolder = selectedFolder;

  // bucketName이 변경될 때마다 LibraryApi 인스턴스를 재생성
  const libraryApi = useMemo(() => new LibraryApi(bucketName), [bucketName]);

  // 폴더 목록 조회 (광고주 전용 집행 소재 라이브러리일 때만 수행)
  const fetchFolders = async () => {
    try {
      const data = await libraryApi.getFolders();
      if (data.folders) {
        setDynamicFolders(data.folders);
      }
    } catch (err) {
      console.error('Failed to fetch bucket subfolders:', err);
    }
  };

  // 이미지 목록 조회
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const folderParam = activeFolder || 'all';
      const data = await libraryApi.getImages(folderParam);
      setImages(data);
    } catch (err) {
      console.error('Failed to fetch library images:', err);
      setError(err.message || '서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFolderSelectorAllowed) {
      fetchFolders();
    }
  }, [bucketName, isFolderSelectorAllowed]);

  useEffect(() => {
    fetchImages();
  }, [activeFolder, bucketName]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleCopyUrl = (url, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    showToast('이미지 URL이 클립보드에 복사되었습니다!');
  };

  const handleDownload = (url, filename, e) => {
    if (e) e.stopPropagation();
    try {
      const folderParam = activeFolder || 'all';
      const downloadUrl = libraryApi.getDownloadUrl(folderParam, filename);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download_image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('다운로드가 시작되었습니다!');
    } catch (err) {
      console.error('Download error:', err);
      showToast('다운로드 요청 실패');
    }
  };

  const handleDeleteClick = (filename, e) => {
    if (e) e.stopPropagation();
    setDeleteTarget(filename);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const filename = deleteTarget;
    setDeleteTarget(null);

    try {
      const folderParam = activeFolder || 'all';
      await libraryApi.deleteImage(folderParam, filename);
      showToast('이미지가 성공적으로 삭제되었습니다.');
      if (selectedImage && selectedImage.filename === filename) {
        setSelectedImage(null);
      }
      fetchImages();
    } catch (err) {
      showToast(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const folderParam = activeFolder || 'root';
      await libraryApi.uploadImage(folderParam, formData);

      showToast('이미지가 성공적으로 업로드되었습니다!');
      fetchImages();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredImages = images.filter((img) =>
    img.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="image-library-container">
      {/* 토스트 알림 */}
      {toast && <div className="library-toast">{toast}</div>}

      {/* 이미지 삭제 확인 모달 */}
      <DeleteConfirmModal
        targetFilename={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* 헤더 바 */}
      <div className="library-header">
        <div className="library-header-left">
          <h2 className="library-title">
            <span className="material-symbols-outlined library-title-icon">photo_library</span>
            {customTitle || `${activeFolder.toUpperCase()} 에셋 라이브러리`}
          </h2>
          <span className="library-count-badge">
            {loading ? '조회 중...' : `${filteredImages.length}개의 에셋`}
          </span>
        </div>

        <div className="library-header-right">
          {/* 광고주 전용 라이브러리일 때만 접이식 폴더 트리 노출 */}
          {isFolderSelectorAllowed && (
            <FolderTreePopover
              selectedFolder={selectedFolder}
              dynamicFolders={dynamicFolders}
              onSelectFolder={setSelectedFolder}
            />
          )}

          {/* 파일명 검색창 */}
          <div className="library-search-box">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="파일명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* 비율 변경 버튼 */}
          <button
            className="library-btn secondary-btn"
            onClick={() => setFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
            title={fitMode === 'contain' ? '카드에 꽉 채우기 모드로 변경' : '원본 비율 전체 보기 모드로 변경'}
          >
            <span className="material-symbols-outlined">
              {fitMode === 'contain' ? 'aspect_ratio' : 'crop_free'}
            </span>
            {fitMode === 'contain' ? '원본 비율 전체 보기' : '카드 영역 꽉 채우기'}
          </button>

          {/* 새로고침 버튼 */}
          <button
            className="library-btn refresh-btn"
            onClick={fetchImages}
            disabled={loading}
            title="새로고침"
          >
            <span className={`material-symbols-outlined ${loading ? 'spin' : ''}`}>refresh</span>
          </button>

          {/* 숨겨진 업로드 input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* 업로드 버튼 */}
          <button
            className="library-btn upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <span className="material-symbols-outlined">upload_file</span>
            {uploading ? '업로드 중...' : '이미지 업로드'}
          </button>
        </div>
      </div>

      {/* 본문 영역 */}
      {loading && images.length === 0 ? (
        <div className="library-loading">
          <div className="library-spinner"></div>
          <p>라이브러리 이미지를 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div className="library-error-box">
          <span className="material-symbols-outlined error-icon">error_outline</span>
          <h3>라이브러리 연결 오류</h3>
          <p>{error}</p>
          <button className="library-btn primary-btn" onClick={fetchImages}>
            다시 시도
          </button>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="library-empty-state">
          <span className="material-symbols-outlined empty-icon">collections</span>
          <h3>보관된 이미지가 없습니다</h3>
          <p>
            {searchTerm
              ? `'${searchTerm}' 검색 결과와 일치하는 이미지가 없습니다.`
              : `GCS 버킷 ${bucketName || 'ai-generation-assets'}/${activeFolder}/ 디렉토리에 저장된 이미지가 없습니다. 상단의 업로드 버튼으로 이미지를 추가해보세요.`}
          </p>
          {searchTerm && (
            <button className="library-btn secondary-btn" onClick={() => setSearchTerm('')}>
              검색 초기화
            </button>
          )}
        </div>
      ) : (
        <div className="library-grid">
          {filteredImages.map((img) => (
            <LibraryCard
              key={img.blob_name || img.url || img.filename}
              img={img}
              fitMode={fitMode}
              onSelect={setSelectedImage}
              onCopyUrl={handleCopyUrl}
              onDownload={handleDownload}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* 전체화면 라이트박스 모달 */}
      <LibraryLightbox
        selectedImage={selectedImage}
        activeFolder={activeFolder}
        onClose={() => setSelectedImage(null)}
        onCopyUrl={handleCopyUrl}
        onDownload={handleDownload}
        onDelete={handleDeleteClick}
      />
    </div>
  );
}

export default ImageLibrary;
