import React, { useState, useRef, useEffect } from 'react';

/**
 * 광고주 전용 접이식(Foldable) 계층형 폴더 트리 탐색기 팝오버
 */
function FolderTreePopover({ selectedFolder, dynamicFolders, onSelectFolder }) {
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const treeRef = useRef(null);

  // 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (treeRef.current && !treeRef.current.contains(e.target)) {
        setIsTreeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFolderExpand = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const buildTree = (folders) => {
    const rootNodes = [];
    const map = {};

    folders.forEach((path) => {
      const parts = path.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, parts.length - 1).join('/');

      const node = { path, name, children: [] };
      map[path] = node;

      if (parentPath && map[parentPath]) {
        map[parentPath].children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const folderTree = buildTree(dynamicFolders);

  const renderTreeNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFolder === node.path;

    return (
      <div key={node.path} style={{ marginLeft: `${level * 12}px` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: isSelected ? '#eff6ff' : 'transparent',
            color: isSelected ? '#2563eb' : '#334155',
            fontWeight: isSelected ? '700' : '500',
            fontSize: '13px',
            transition: 'background 0.15s ease'
          }}
          onClick={() => {
            onSelectFolder(node.path);
            setIsTreeOpen(false);
          }}
        >
          {hasChildren ? (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', color: '#64748b', userSelect: 'none' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleFolderExpand(node.path);
              }}
            >
              {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
            </span>
          ) : (
            <span style={{ width: '18px', display: 'inline-block' }} />
          )}

          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isSelected ? '#2563eb' : '#64748b' }}>
            {hasChildren ? (isExpanded ? 'folder_open' : 'folder') : 'folder'}
          </span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.name}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree-wrapper" ref={treeRef} style={{ position: 'relative' }}>
      <button
        className="library-btn secondary-btn"
        onClick={() => setIsTreeOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#0f172a',
          borderColor: isTreeOpen ? '#2563eb' : '#cbd5e1',
          backgroundColor: '#ffffff'
        }}
      >
        <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: '18px' }}>
          folder_open
        </span>
        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedFolder === 'all' ? '📁 전체 보기' : selectedFolder === 'root' ? '🏠 최상위 루트' : `📂 ${selectedFolder}`}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>
          {isTreeOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </button>

      {isTreeOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '6px',
            width: '320px',
            maxHeight: '380px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
            zIndex: 9999,
            overflowY: 'auto',
            padding: '10px 8px',
            animation: 'fadeInLightbox 0.15s ease forwards'
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedFolder === 'all' ? '700' : '500',
              color: selectedFolder === 'all' ? '#2563eb' : '#334155',
              backgroundColor: selectedFolder === 'all' ? '#eff6ff' : 'transparent',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => {
              onSelectFolder('all');
              setIsTreeOpen(false);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>collections</span>
            📁 전체 보기 (All Folders)
          </div>

          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedFolder === 'root' ? '700' : '500',
              color: selectedFolder === 'root' ? '#2563eb' : '#334155',
              backgroundColor: selectedFolder === 'root' ? '#eff6ff' : 'transparent',
              marginBottom: '6px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => {
              onSelectFolder('root');
              setIsTreeOpen(false);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>folder_special</span>
            🏠 버킷 최상위 루트 (Root)
          </div>

          {folderTree.map((node) => renderTreeNode(node, 0))}
        </div>
      )}
    </div>
  );
}

export default FolderTreePopover;
