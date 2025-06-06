export type AppleHealthStat = {
  statType: string;
  value: string;
  unit?: string;
  timestamp: string;
};

const APPLE_TOKEN_URL = process.env.APPLE_HEALTH_TOKEN_URL ||
  'https://appleid.apple.com/auth/token';
const APPLE_API_BASE = process.env.APPLE_HEALTH_API_BASE ||
  'https://api.apple.com/health/v1';

export async function exchangeAppleHealthCode(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_HEALTH_CLIENT_ID || '',
    client_secret: process.env.APPLE_HEALTH_CLIENT_SECRET || '',
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error('Failed to exchange Apple Health code');
  }

  return res.json();
}

export async function refreshAppleHealthToken(refreshToken: string) {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_HEALTH_CLIENT_ID || '',
    client_secret: process.env.APPLE_HEALTH_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error('Failed to refresh Apple Health token');
  }

  return res.json();
}

export async function fetchAppleHealthData(accessToken: string): Promise<AppleHealthStat[]> {
  const res = await fetch(`${APPLE_API_BASE}/metrics`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Apple Health data');
  }

  const data = await res.json();
  return (data.metrics || []) as AppleHealthStat[];
}
