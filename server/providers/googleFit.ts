import path from 'path';
import fs from 'fs/promises';

export type GoogleFitStat = {
  statType: string;
  value: string;
  unit?: string;
  timestamp: string;
};

export async function fetchGoogleFitData(_accessToken: string): Promise<GoogleFitStat[]> {
  // In this prototype we return mock data but a real implementation
  // would fetch from Google Fit using the provided access token
  const dataPath = path.resolve(__dirname, '..', '..', 'mocks', 'google-fit.json');
  const raw = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(raw) as GoogleFitStat[];
}

export async function exchangeGoogleFitCode(_code: string, _redirectUri: string) {
  // In a real implementation this would exchange the authorization code for
  // an access token using Google's OAuth endpoint
  return {
    access_token: 'mock-google-token',
    refresh_token: 'mock-google-refresh',
    expires_in: 3600,
    scope: 'https://www.googleapis.com/auth/fitness.activity.read'
  };
}

export async function refreshGoogleFitToken(_refreshToken: string) {
  // Would request a new access token from Google
  return {
    access_token: 'mock-google-token',
    expires_in: 3600,
    scope: 'https://www.googleapis.com/auth/fitness.activity.read'
  };
}
