/**
 * 데이터베이스의 매체 이름을 표준 명칭으로 변환합니다.
 * (예: "Naver GFA" -> "네이버", "Meta Ad" -> "메타")
 */
export const getCanonicalMedia = (mediaName) => {
    if (!mediaName) return '기타';
    const upperName = mediaName.toUpperCase();
    if (upperName.includes('GFA')) return "네이버";
    if (upperName.includes('당근')) return "당근";
    if (upperName.includes('카카오') || upperName.includes('KAKAO')) return '카카오';
    if (upperName.includes('메타') || upperName.includes('META') || upperName.includes('FACEBOOK') || upperName.includes('INSTAGRAM')) return '메타';
    if (upperName.includes('구글') || upperName.includes('GOOGLE')) return '구글';
    if (upperName.includes('유튜브') || upperName.includes('YOUTUBE')) return '유튜브';
    if (upperName.includes('크리테오') || upperName.includes('CRITEO')) return '크리테오';
    return mediaName;
};

export const mediaLogos = {
    '네이버': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Naver_Logotype.svg/250px-Naver_Logotype.svg.png',
    '카카오': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg',
    '메타': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    '구글': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    '유튜브': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
    '당근': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Daangn_Signature_RGB.jpg/250px-Daangn_Signature_RGB.jpg',
    '크리테오': 'https://www.criteo.com/kr/wp-content/themes/criteo2017/img/criteo-logo-orange.svg',
};
