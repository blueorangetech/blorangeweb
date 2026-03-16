import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const UserManagement = ({ customerUrl, currentUserInfo }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const fetchUsers = async () => {
        const token = Cookies.get('Authorization');
        if (!token) return;

        setIsLoadingUsers(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/${customerUrl}/manage/users`, {
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

    const handleManageUser = async (targetId, role, isMaster) => {
        const token = Cookies.get('Authorization');
        if (!token) return;

        const roleLabel = role === 'none' ? '제거' : (role || (isMaster ? 'Master' : '기본'));
        if (!window.confirm(`해당 사용자에게 '${roleLabel}' 권한을 부여하시겠습니까?`)) return;

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/${customerUrl}/manage/${targetId}`, {
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
                alert('권한이 성공적으로 변경되었습니다.');
                fetchUsers(); // 리스트 새로고침
            } else {
                const errorData = await response.json();
                alert(`실패: ${errorData.detail || '권한 변경 중 오류가 발생했습니다.'}`);
            }
        } catch (err) {
            console.error('Manage user error:', err);
            alert('오류가 발생했습니다.');
        }
    };

    const handleRoleChange = (userId, value) => {
        if (!value) return;

        if (value === 'viewer') handleManageUser(userId, 'viewer', false);
        else if (value === 'admin') handleManageUser(userId, 'admin', false);
        else if (value === 'master') handleManageUser(userId, '', true);
        else if (value === 'none') handleManageUser(userId, 'none', false);
    };

    const getCurrentRoleValue = (user) => {
        if (user.is_master) return 'master';
        if (user.access_list?.[customerUrl] === 'admin') return 'admin';
        if (user.access_list?.[customerUrl] === 'viewer') return 'viewer';
        return '';
    };

    return (
        <div className="management-container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left', padding: '0 20px' }}>
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
                            {allUsers.filter(u => (u.access_list && u.access_list[customerUrl]) || u.is_master).length}명
                        </span>
                    </div>

                    <div className="user-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {isLoadingUsers ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
                        ) : allUsers.filter(u => (u.access_list && u.access_list[customerUrl]) || u.is_master).length > 0 ? (
                            allUsers.filter(u => (u.access_list && u.access_list[customerUrl]) || u.is_master).map(user => (
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

                                                {/* 본인이 Admin인데 대상이 Admin인 경우 등을 위해 현재 값이 위 옵션들에 없을 때를 대비한 처리 (이미 위에서 처리됨) */}
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
                            {allUsers.filter(u => !(u.access_list && u.access_list[customerUrl]) && !u.is_master).length}명
                        </span>
                    </div>

                    <div className="user-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {isLoadingUsers ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
                        ) : allUsers.filter(u => !(u.access_list && u.access_list[customerUrl]) && !u.is_master).length > 0 ? (
                            allUsers.filter(u => !(u.access_list && u.access_list[customerUrl]) && !u.is_master).map(user => (
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
                                    <div style={{ display: 'flex', gap: '8px' }}>
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
