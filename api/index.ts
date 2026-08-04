import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const pathname = url.pathname.replace(/^\/api/, ''); // Strip /api prefix if matched by vercel rewrites

  const nasaApiKey = process.env.NASA_API_KEY;

  try {
    let targetUrl = '';

    // Route matching for NOAA SWPC and NASA DONKI APIs
    if (pathname === '/dashboard/summary' || pathname === '/impact-summary' || pathname === '/solar-activity') {
      // Aggregate or fetch primary summary endpoints (example proxying planetary K-index or solar wind as summary)
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
    } else if (pathname.startsWith('/solar-wind')) {
      const type = url.searchParams.get('field') === 'mag' ? 'rtsw_mag_1m.json' : 'rtsw_wind_1m.json';
      targetUrl = `https://services.swpc.noaa.gov/json/rtsw/${type}`;
    } else if (pathname.startsWith('/magnetic-field')) {
      targetUrl = 'https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json';
    } else if (pathname === '/kp') {
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
    } else if (pathname === '/scales') {
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-scales.json';
    } else if (pathname === '/alerts') {
      targetUrl = 'https://services.swpc.noaa.gov/products/alerts.json';
    } else if (pathname.startsWith('/events')) {
      const type = url.searchParams.get('type') || 'all';
      if (nasaApiKey) {
        let endpoint = 'CME';
        if (type === 'flare') endpoint = 'FLR';
        if (type === 'gst') endpoint = 'GST';
        if (type === 'sep') endpoint = 'SEP';
        targetUrl = `https://api.nasa.gov/DONKI/${endpoint}?api_key=${nasaApiKey}`;
      } else {
        let endpoint = 'CME';
        if (type === 'flare') endpoint = 'FLR';
        if (type === 'gst') endpoint = 'GST';
        if (type === 'sep') endpoint = 'SEP';
        targetUrl = `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/${endpoint}`;
      }
    } else if (pathname.includes('/ionosphere/glotec')) {
      // Fallback or specific proxy logic if you consume GloTEC data json/products
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-scales.json';
    } else {
      return res.status(404).json({ success: false, error: `Endpoint not found: ${pathname}` });
    }

    // Fetch data from external provider
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`External provider responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}