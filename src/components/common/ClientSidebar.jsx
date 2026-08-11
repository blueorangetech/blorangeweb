import React, { useState, useEffect } from 'react';
import '../../styles/ClientSidebar.css';

const MENU_STRUCTURE = [
  {
    id: 'report',
    label: '리포트',
    icon: 'monitoring',
    subItems: [
      { id: 'report-overview', label: 'Overview' },
      { id: 'report-detail', label: '상세 성과 비교' },
      { id: 'report-chat', label: 'Data Chat' }
    ]
  },
  {
    id: 'creative',
    label: '크리에이티브',
    icon: 'palette',
    subItems: [
      { id: 'creative-integrated', label: '통합 소재 대시보드' },
      { id: 'creative-insight', label: '매체별 소재 인사이트' },
      { id: 'creative-compare', label: 'AI분석 / 인사이트' },
      { id: 'creative-ai-studio', label: 'AI 크리에이티브' },
      { id: 'creative-library', label: '에셋 라이브러리' }
    ]
  },
  {
    id: 'mediamix',
    label: '미디어믹스',
    icon: 'pie_chart',
    subItems: [
      { id: 'mediamix-campaign', label: '캠페인/매체별 성과' },
      { id: 'mediamix-target', label: '미디어믹스 점검' },
      { id: 'mediamix-simulation', label: 'AI 시뮬레이션' }
    ]
  },
  {
    id: 'etc',
    label: '설정',
    icon: 'settings',
    subItems: [
      { id: 'etc-account', label: '계정 관리(로그인/회원권한)' },
      { id: 'etc-upload', label: '데이터 업로드 및 수정' }
    ]
  }
];

function ClientSidebar({ activeMenu, onMenuChange, enabledMenuIds = [], menuStructure = MENU_STRUCTURE }) {
  const [openCategories, setOpenCategories] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  // 접힘 상태가 바뀔 때마다 로컬 스토리지에 유지
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  // 현재 활성화된 메뉴가 속한 대분류 카테고리를 자동으로 열어줍니다.
  useEffect(() => {
    const parentCategory = menuStructure.find(cat =>
      cat.subItems.some(sub => sub.id === activeMenu)
    );
    if (parentCategory) {
      setOpenCategories(prev => ({
        ...prev,
        [parentCategory.id]: true
      }));
    }
  }, [activeMenu, menuStructure]);

  const toggleCategory = (categoryId) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenCategories(prev => ({
        ...prev,
        [categoryId]: true
      }));
    } else {
      setOpenCategories(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
      }));
    }
  };

  const handleSubItemClick = (subItemId, isEnabled) => {
    if (isEnabled) {
      onMenuChange(subItemId);
    }
  };

  return (
    <div className={`client-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-menu">
        {menuStructure.map((category) => {
          const isOpen = !!openCategories[category.id];
          return (
            <div
              key={category.id}
              className={`sidebar-category ${isOpen ? 'open' : ''}`}
            >
              <div
                className="sidebar-category-header"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="sidebar-category-title">
                  <span className="material-symbols-outlined sidebar-category-icon">
                    {category.icon}
                  </span>
                  <span>{category.label}</span>
                </div>
                <span className="material-symbols-outlined sidebar-category-arrow">
                  expand_more
                </span>
              </div>
              <div className="sidebar-sub-menu">
                {category.subItems.map((subItem) => {
                  const isEnabled = enabledMenuIds.includes(subItem.id);
                  const isActive = activeMenu === subItem.id;
                  return (
                    <div
                      key={subItem.id}
                      className={`sidebar-sub-item ${isActive ? 'active' : ''} ${!isEnabled ? 'disabled' : ''}`}
                      onClick={() => handleSubItemClick(subItem.id, isEnabled)}
                    >
                      <span>{subItem.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
        >
          <span className="material-symbols-outlined">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ClientSidebar;
