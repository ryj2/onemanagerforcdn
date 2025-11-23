/**
 * EdgeOne ESA Worker for OneManager-php CDN Acceleration
 * 
 * This EdgeOne Edge Script acts as a CDN proxy to accelerate file downloads.
 * Similar to Cloudflare Workers but adapted for Tencent EdgeOne ESA platform.
 * 
 * Deploy this to EdgeOne ESA and configure the EdgeOne URL in OneManager settings.
 */

async function handleEvent(event) {
    const request = event.request
    const url = new URL(request.url)

    // EdgeOne ESA uses /proxy path
    if (!url.pathname.startsWith('/proxy')) {
        return new Response('Not Found', { status: 404 })
    }

    // Get the original file URL from query parameter
    const originalUrl = url.searchParams.get('url')
    const filename = url.searchParams.get('filename') || 'download'

    // Validate URL parameter
    if (!originalUrl) {
        return new Response('Missing url parameter', { status: 400 })
    }

    // Decode the URL
    let decodedUrl
    try {
        decodedUrl = decodeURIComponent(originalUrl)
    } catch (e) {
        return new Response('Invalid url parameter', { status: 400 })
    }

    // Validate URL format
    if (!isValidUrl(decodedUrl)) {
        return new Response('Invalid URL format', { status: 400 })
    }

    try {
        // Fetch from origin
        const response = await fetch(decodedUrl, {
            headers: {
                // Preserve range requests for video streaming
                'Range': request.headers.get('Range') || '',
            }
        })

        // Create new response with modified headers
        const newHeaders = new Headers(response.headers)
        newHeaders.set('Cache-Control', 'public, max-age=604800') // 7 days
        newHeaders.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}; filename="${filename}"`)

        // Add CORS headers if needed
        newHeaders.set('Access-Control-Allow-Origin', '*')
        newHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range')

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        })
    } catch (error) {
        return new Response(`Error fetching file: ${error.message}`, { status: 500 })
    }
}

function isValidUrl(string) {
    try {
        const url = new URL(string)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (_) {
        return false
    }
}

// EdgeOne ESA entry point
addEventListener('fetch', event => {
    event.respondWith(handleEvent(event))
})
