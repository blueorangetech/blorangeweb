import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const UserManagement = ({ customerUrl, currentUserInfo, siteId = 'analytics' }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '확인',
    confirmBgColor: '#000000',
    onConfirm: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const openConfirm = ({ title, message, confirmText = '확인', confirmBgColor = '#000000', onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmBgColor,
      onConfirm
    });
  };

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', confirmText: '확인', confirmBgColor: '#000000', onConfirm: null });
  };

  const fetchUsers = async () => {
    const token = Cookies.get('Authorization');
    if (!token) return;

    setIsLoadingUsers(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/${customerUrl}/manage/users?site_id=${siteId}`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [customerUrl]);

  const executeManageUser = async (targetId, role, isMaster) => {
    const token = Cookies.get('Authorization');
    if (!token) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/${customerUrl}/manage/${targetId}?site_id=${siteId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: role,
          is_master: isMaster
        })
      });

      if (response.ok) {
        showToast('권한이 성공적으로 변경되었습니다.', 'success');
        fetchUsers(); // 리스트 새로고침
      } else {
        const errorData = await response.json();
        showToast(`실패: ${errorData.detail || '권한 변경 중 오류가 발생했습니다.'}`, 'error');
      }
    } catch (err) {
      console.error('Manage user error:', err);
      showToast('오류가 발생했습니다.', 'error');
    }
  };

  const handleManageUser = (targetId, role, isMaster) => {
    const roleLabel = role === 'none' ? '제거' : (role || (isMaster ? 'Master' : '기본'));
    openConfirm({
      title: '권한 변경 확인',
      message: `해당 사용자에게 '${roleLabel}' 권한을 부여하시겠습니까?`,
      confirmText: '권한 변경',
      confirmBgColor: '#2563eb',
      onConfirm: () => executeManageUser(targetId, role, isMaster)
    });
  };

  const executeDeleteUser = async (targetId) => {
    const token = Cookies.get('Authorization');
    if (!token) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/${customerUrl}/manage/${targetId}?site_id=${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (response.ok) {
        showToast('사용자 계정이 성공적으로 삭제되었습니다.', 'success');
        fetchUsers(); // 리스트 새로고침
      } else {
        const errorData = await response.json();
        showToast(`삭제 실패: ${errorData.detail || '사용자 삭제 중 오류가 발생했습니다.'}`, 'error');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      showToast('사용자 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteUser = (targetId, targetName) => {
    openConfirm({
      title: '계정 영구 삭제',
      message: `정말로 사용자 '${targetName || targetId}'(${targetId}) 계정을 영구 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다.`,
      confirmText: '영구 삭제',
      confirmBgColor: '#ef4444',
      onConfirm: () => executeDeleteUser(targetId)
    });
  };



  const getCurrentUserIdFromToken = () => {
    const token = Cookies.get('Authorization');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const parsed = JSON.parse(jsonPayload);
      return parsed.user_id || parsed.userId || null;
    } catch (e) {
      return null;
    }
  };

  const currentUserId = getCurrentUserIdFromToken();

  const handleRoleChange = (userId, value) => {
    if (!value) return;

    if (value === 'viewer') handleManageUser(userId, 'viewer', false);
    else if (value === 'admin') handleManageUser(userId, 'admin', false);
    else if (value === 'master') handleManageUser(userId, '', true);
    else if (value === 'none') handleManageUser(userId, 'none', false);
  };


  const getCurrentRoleValue = (user) => {
    if (user.is_master) return 'master';
    if (user.access_list?.[siteId]?.[customerUrl] === 'admin') return 'admin';
    if (user.access_list?.[siteId]?.[customerUrl] === 'viewer') return 'viewer';
    return '';
  };

  return (
    <div className="management-container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left', padding: '0 20px', position: 'relative' }}>
      {/* 커스텀 Confirm 팝업 모달 */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999
        }} onClick={closeConfirm}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '28px 32px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
              {confirmModal.title}
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={closeConfirm}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  closeConfirm();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: confirmModal.confirmBgColor || '#000000',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s'
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (

        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          fontWeight: '600',
          fontSize: '0.95rem',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}
      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>권한 관리 시스템</h2>

      <p style={{ color: '#666', marginBottom: '32px' }}>사용자별 대시보드 접근 권한을 설정하고 관리합니다.</p>

      <div className="management-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* 좌측: 권한 보유 유저 */}
        <div className="management-card" style={{
          background: '#fff',
          padding: '32px',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid #eee',
          minHeight: '500px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>권한이 있는 유저</h3>
            <span style={{ fontSize: '0.9rem', color: '#666', background: '#f0f0f0', padding: '4px 12px', borderRadius: '12px' }}>
              {allUsers.filter(u => (u.access_list && u.access_list[siteId]?.[customerUrl]) || u.is_master).length}명
            </span>
          </div>

          <div className="user-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoadingUsers ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
            ) : allUsers.filter(u => (u.access_list && u.access_list[siteId]?.[customerUrl]) || u.is_master).length > 0 ? (
              allUsers.filter(u => (u.access_list && u.access_list[siteId]?.[customerUrl]) || u.is_master).map(user => (
                <div key={user.user_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #eee'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: '600', color: '#111' }}>{user.name}</div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.user_id}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!user.is_master && (
                      <select
                        value={getCurrentRoleValue(user)}
                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          background: '#fff',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                          fontWeight: '600',
                          height: '32px',
                          width: '110px'
                        }}
                      >
                        {/* 현재 권한은 항상 표시되어야 함 */}
                        <option value="viewer" disabled={currentUserInfo.role !== 'master' && currentUserInfo.role !== 'admin' && getCurrentRoleValue(user) !== 'viewer'}>Viewer</option>
                        <option value="admin" disabled={currentUserInfo.role !== 'master' && getCurrentRoleValue(user) !== 'admin'}>Admin</option>

                        {/* Master 전용 옵션 */}
                        {currentUserInfo.role === 'master' && (
                          <option value="master">Master로 승격</option>
                        )}

                        {/* 삭제 옵션 (상위 권한자만 가능) */}
                        {(currentUserInfo.role === 'master' || (currentUserInfo.role === 'admin' && getCurrentRoleValue(user) === 'viewer')) && (
                          <option value="none" style={{ color: '#ff4d4f' }}>권한 제거</option>
                        )}
                      </select>
                    )}
                    {user.is_master && (
                      <span style={{
                        fontSize: '0.8rem',
                        background: '#000',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '32px',
                        width: '110px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>MASTER</span>
                    )}

                    {/* Master 유저 전용: 계정 삭제 버튼 */}
                    {currentUserInfo.role === 'master' && user.user_id !== currentUserId && (

                      <button
                        onClick={() => handleDeleteUser(user.user_id, user.name)}
                        title="계정 영구 삭제"
                        style={{
                          height: '32px',
                          padding: '0 10px',
                          borderRadius: '8px',
                          border: '1px solid #ffccc7',
                          background: '#fff2f0',
                          color: '#ff4d4f',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ff4d4f';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff2f0';
                          e.currentTarget.style.color = '#ff4d4f';
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', backgroundColor: '#f9f9f9', borderRadius: '16px' }}>
                권한을 보유한 사용자가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 우측: 전체 유저 리스트 */}
        <div className="management-card" style={{
          background: '#fff',
          padding: '32px',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid #eee',
          minHeight: '500px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>전체 유저 리스트</h3>
            <span style={{ fontSize: '0.9rem', color: '#666', background: '#f0f0f0', padding: '4px 12px', borderRadius: '12px' }}>
              {allUsers.filter(u => !(u.access_list && u.access_list[siteId]?.[customerUrl]) && !u.is_master).length}명
            </span>
          </div>

          <div className="user-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoadingUsers ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
            ) : allUsers.filter(u => !(u.access_list && u.access_list[siteId]?.[customerUrl]) && !u.is_master).length > 0 ? (
              allUsers.filter(u => !(u.access_list && u.access_list[siteId]?.[customerUrl]) && !u.is_master).map(user => (
                <div key={user.user_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #eee',
                  transition: 'all 0.2s'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#111' }}>{user.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.user_id}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {currentUserInfo.role === "master" || currentUserInfo.role === "admin" ? (
                      <select
                        defaultValue=""
                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          background: '#fff',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          outline: 'none',
                          height: '32px',
                          width: '110px',
                          fontWeight: '600'
                        }}
                      >
                        <option value="" disabled>권한 선택</option>
                        <option value="viewer">Viewer</option>
                        {currentUserInfo.role === 'master' && (
                          <>
                            <option value="admin">Admin</option>
                            <option value="master">Master</option>
                          </>
                        )}
                      </select>
                    ) : null}

                    {/* Master 유저 전용: 계정 삭제 버튼 */}
                    {currentUserInfo.role === 'master' && user.user_id !== currentUserId && (

                      <button
                        onClick={() => handleDeleteUser(user.user_id, user.name)}
                        title="계정 영구 삭제"
                        style={{
                          height: '32px',
                          padding: '0 10px',
                          borderRadius: '8px',
                          border: '1px solid #ffccc7',
                          background: '#fff2f0',
                          color: '#ff4d4f',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ff4d4f';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff2f0';
                          e.currentTarget.style.color = '#ff4d4f';
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', backgroundColor: '#f9f9f9', borderRadius: '16px' }}>
                모든 사용자가 권한을 보유하고 있습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

};

export default UserManagement;
