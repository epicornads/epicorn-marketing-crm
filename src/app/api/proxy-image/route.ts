import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('Image URL is required', { status: 400 });
    }

    // Decode URL
    const decodedUrl = decodeURIComponent(imageUrl);

    const res = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': new URL(decodedUrl).origin
      },
      next: { revalidate: 3600 }, // Cache proxy images for 1 hour
      signal: AbortSignal.timeout(6000) // 6s timeout
    });

    if (!res.ok) {
      return new Response(`Failed to fetch image: ${res.statusText}`, { status: res.status });
    }

    const contentType = res.headers.get('Content-Type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Browser cache for 24h
      }
    });

  } catch (error: any) {
    console.error('Image proxy failed:', error);
    // Return a 1px transparent spacer gif fallback so the browser doesn't show broken image indicators
    const transparentSpacer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new Response(transparentSpacer, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store'
      }
    });
  }
}
