import { NextResponse } from 'next/server';
import type { MoodApiResponse } from '@/types/mood';

const NOCODB_URL = 'http://192.168.50.191:33860';
const TABLE_ID = 'mvj3iz12lui2i2h';
const API_KEY = 'LehBM_s0bzNbhywtVYr_egxfe4AM3h75yLulZif3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '1000'; // Get all records
    const sort = searchParams.get('sort') || '-Datum'; // Default: sort by date, newest first

    const response = await fetch(
      `${NOCODB_URL}/api/v2/tables/${TABLE_ID}/records?limit=${limit}&sort=${sort}`,
      {
        headers: {
          'xc-token': API_KEY,
        },
        cache: 'no-store', // Always fetch fresh data
      }
    );

    if (!response.ok) {
      throw new Error(`NocoDB API error: ${response.status}`);
    }

    const data: MoodApiResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching mood data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood data' },
      { status: 500 }
    );
  }
}
