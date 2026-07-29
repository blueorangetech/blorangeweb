import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 로그인 API 요청 및 쿠키 저장 공통 유틸 함수
 * 
 * @param {Object} credentials
 * @param {string} credentials.userId - 사용자 아이디
 * @param {string} credentials.password - 비밀번호
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function loginUser({ userId, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        password: password,
      }),
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      if (result.token) {
        Cookies.set('Authorization', result.token, { expires: 7 });
      }
      if (result.name) {
        Cookies.set('UserName', result.name, { expires: 7 });
      }
      return { success: true, data: result };
    } else {
      return {
        success: false,
        message: result.message || '로그인에 실패했습니다.'
      };
    }
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: '서버와 통신 중 오류가 발생했습니다.' };
  }
}

/**
 * 회원가입 API 요청 공통 유틸 함수
 * 
 * @param {Object} userInfo
 * @param {string} userInfo.userId - 사용자 아이디
 * @param {string} userInfo.name - 사용자 이름
 * @param {string} userInfo.password - 비밀번호
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function registerUser({ userId, name, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        name: name,
        password: password,
      }),
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      return { success: true, data: result };
    } else {
      return {
        success: false,
        message: result.message || '회원가입에 실패했습니다.'
      };
    }
  } catch (err) {
    console.error('Register error:', err);
    return { success: false, message: '서버와 통신 중 오류가 발생했습니다.' };
  }
}

/**
 * 로그아웃 처리 및 초기화 데이터 반환 공통 유틸 함수
 * 
 * @returns {{isLoggedIn: boolean, hasPermission: boolean, userName: string, currentUserInfo: {role: string, is_master: boolean}}}
 */
export function logoutUser() {
  Cookies.remove('Authorization');
  Cookies.remove('UserName');
  return {
    isLoggedIn: false,
    hasPermission: false,
    userName: '',
    currentUserInfo: { role: '', is_master: false }
  };
}

/**
 * 페이지별 권한 검증 및 인증 상태 체크 함수
 * 
 * @param {Object} options
 * @param {string} options.customerPath - 백엔드 인증 API 경로 (예: 'hanssem', 'hanssem_hf', 'imweb')
 * @param {boolean} [options.checkPermission=true] - 권한 검사 수행 여부 (false일 경우 권한 검사 패스)
 * @returns {Promise<{isLoggedIn: boolean, hasPermission: boolean, userName: string, currentUserInfo: {role: string, is_master: boolean}}>}
 */
export async function checkPageAuth({ customerPath = '', checkPermission = true } = {}) {
  const savedName = Cookies.get('UserName') || '';

  // 1. 권한 검사를 수행하지 않는 페이지인 경우 (checkPermission: false)
  if (!checkPermission) {
    const userName = savedName || '게스트';
    if (!savedName) {
      Cookies.set('UserName', '게스트', { expires: 7 });
    }
    return {
      isLoggedIn: true,
      hasPermission: true,
      userName: userName,
      currentUserInfo: { role: '', is_master: false }
    };
  }

  // 2. 권한 검사를 수행하는 페이지인 경우 (checkPermission: true)
  const token = Cookies.get('Authorization');

  if (!token) {
    return {
      isLoggedIn: false,
      hasPermission: false,
      userName: savedName,
      currentUserInfo: { role: '', is_master: false }
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/${customerPath}?site_id=analytics`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

    if (response.ok) {
      const data = await response.json();
      let userName = savedName;
      if (data.name) {
        userName = data.name;
        Cookies.set('UserName', data.name, { expires: 7 });
      }
      return {
        isLoggedIn: true,
        hasPermission: true,
        userName: userName,
        currentUserInfo: {
          role: data.role || '',
          is_master: data.is_master || data.role === 'master'
        }
      };
    } else {
      return {
        isLoggedIn: true,
        hasPermission: false,
        userName: savedName,
        currentUserInfo: { role: '', is_master: false }
      };
    }
  } catch (err) {
    console.error(`Auth check error for ${customerPath}:`, err);
    return {
      isLoggedIn: true,
      hasPermission: false,
      userName: savedName,
      currentUserInfo: { role: '', is_master: false }
    };
  }
}
