/**
 * YouTube 관련 상수 정의
 */

export const YOUTUBE_CONSTANTS = {
  // 기본 설정
  DEFAULT_MAX_COMMENTS: 100,
  DEFAULT_MAX_VIDEOS: 20,
  DEFAULT_SEARCH_LIMIT: 10,
  DEFAULT_LANGUAGE: 'ko',

  // 지원 언어 코드
  SUPPORTED_LANGUAGES: {
    KOREAN: 'ko',
    ENGLISH: 'en',
    JAPANESE: 'ja',
    CHINESE: 'zh',
    SPANISH: 'es',
    FRENCH: 'fr',
    GERMAN: 'de',
    RUSSIAN: 'ru',
  },

  // URL 패턴
  URL_PATTERNS: {
    WATCH: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    EMBED: /youtube\.com\/embed\/([^&\n?#]+)/,
    SHORT: /youtube\.com\/v\/([^&\n?#]+)/,
    CHANNEL: /youtube\.com\/(channel|c|user)\/([^\/\n?#]+)/,
  },

  // 에러 메시지
  ERROR_MESSAGES: {
    VIDEO_NOT_FOUND: '비디오를 찾을 수 없습니다.',
    COMMENTS_DISABLED: '댓글이 비활성화되어 있습니다.',
    TRANSCRIPT_NOT_AVAILABLE: '자막을 사용할 수 없습니다.',
    CHANNEL_NOT_FOUND: '채널을 찾을 수 없습니다.',
    INVALID_VIDEO_ID: '유효하지 않은 비디오 ID입니다.',
    RATE_LIMIT_EXCEEDED: '요청 한도를 초과했습니다.',
  },
} as const;

