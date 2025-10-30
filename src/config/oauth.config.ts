import { registerAs } from '@nestjs/config';

export default registerAs('oauth', () => ({
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    redirectUri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:3000/auth/oauth/kakao/callback',
    authorizationUrl: 'https://kauth.kakao.com/oauth/authorize',
    tokenUrl: 'https://kauth.kakao.com/oauth/token',
    userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
    privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH,
    redirectUri: process.env.APPLE_REDIRECT_URI || 'http://localhost:3000/auth/oauth/apple/callback',
    authorizationUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
    successUrl: process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:3001/oauth/callback',
  },
}));

