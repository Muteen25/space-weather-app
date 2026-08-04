import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '', `https://${req.headers.host}`);
  // Clean up pathname by removing leading /api or trailing slashes
  let pathname = url.pathname.replace(/^\/api/, '');
  if (pathname.endsWith('/') && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }

  const nasaApiKey = process.env.NASA_API_KEY;

  try {
    let targetUrl = '';

    if (pathname === '/dashboard/summary' || pathname === '/impact-summary' || pathname === '/solar-activity') {
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
    } else if (pathname.includes('/solar-wind')) {
      const field = url.searchParams.get('field');
      const type = field === 'mag' ? 'rtsw_mag_1m.json' : 'rtsw_wind_1m.json';
      targetUrl = `https://services.swpc.noaa.gov/json/rtsw/${type}`;
    } else if (pathname.includes('/magnetic-field')) {
      targetUrl = 'https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json';
    } else if (pathname === '/kp') {
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
    } else if (pathname === '/scales') {
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-scales.json';
    } else if (pathname === '/alerts') {
      targetUrl = 'https://services.swpc.noaa.gov/products/alerts.json';
    } else if (pathname.includes('/events')) {
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
      targetUrl = 'https://services.swpc.noaa.gov/products/noaa-scales.json';
    } else {
      return res.status(404).json({ 
        success: false, 
        error: `Endpoint not found`, 
        receivedPath: pathname,
        fullUrl: req.url 
      });
    }

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