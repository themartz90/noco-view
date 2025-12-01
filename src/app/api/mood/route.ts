import { NextResponse } from 'next/server';

const NOCODB_URL = process.env.NODE_ENV === 'production'
  ? process.env.NOCODB_URL_PROD
  : process.env.NOCODB_URL_DEV;

const TABLE_ID = process.env.NOCODB_TABLE_ID_MOOD;
const API_KEY = process.env.NOCODB_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '1000';
    const sort = searchParams.get('sort') || '-Datum';

    if (!NOCODB_URL || !TABLE_ID || !API_KEY) {
      console.error('Missing environment variables:', {
        NOCODB_URL: !!NOCODB_URL,
        TABLE_ID: !!TABLE_ID,
        API_KEY: !!API_KEY,
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const url = `${NOCODB_URL}/api/v2/tables/${TABLE_ID}/records?limit=${limit}&sort=${sort}`;

    const response = await fetch(url, {
      headers: {
        'xc-token': API_KEY,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`NocoDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching mood data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood data' },
      { status: 500 }
    );
  }
}
