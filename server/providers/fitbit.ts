export type FitbitStat = {
  statType: string;
  value: string;
  unit?: string;
  timestamp: string;
};

export async function fetchFitbitData(accessToken: string): Promise<FitbitStat[]> {
  const today = new Date().toISOString().split('T')[0];

  const stepsRes = await fetch(
    `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!stepsRes.ok) {
    throw new Error('Failed to fetch Fitbit activities');
  }
  const stepsJson = await stepsRes.json();
  const steps = stepsJson.summary?.steps || 0;

  const hrRes = await fetch(
    `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!hrRes.ok) {
    throw new Error('Failed to fetch Fitbit heart rate');
  }
  const hrJson = await hrRes.json();
  const hr = hrJson['activities-heart']?.[0]?.value?.restingHeartRate;

  const now = new Date().toISOString();
  const stats: FitbitStat[] = [
    { statType: 'steps', value: String(steps), timestamp: now },
  ];
  if (hr) {
    stats.push({ statType: 'heart_rate', value: String(hr), unit: 'bpm', timestamp: now });
  }
  return stats;
}

export async function exchangeFitbitCode(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.FITBIT_CLIENT_ID || '',
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });
  const credentials = Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`)
    .toString('base64');
  const res = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error('Failed to exchange Fitbit code');
  }
  return res.json();
}

export async function refreshFitbitToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const credentials = Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`)
    .toString('base64');
  const res = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error('Failed to refresh Fitbit token');
  }
  return res.json();
}
