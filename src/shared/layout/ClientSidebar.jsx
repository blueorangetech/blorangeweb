import React, { useState, useEffect } from 'react';
import './ClientSidebar.css';

function ClientSidebar({ activeMenu, onMenuChange, enabledMenuIds = [], menuStructure = [] }) {
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
      (cat.subItems || cat.items || []).some(sub => sub.id === activeMenu)
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
          const subItemsList = category.subItems || category.items || [];
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
                {subItemsList.map((subItem) => {
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
