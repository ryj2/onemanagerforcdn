/**
 * Cloudflare Workers CDN Proxy for OneManager-php
 * 
 * This worker acts as a CDN proxy to accelerate file downloads from cloud storage.
 * It fetches files from the original URL and caches them at Cloudflare's edge network.
 * 
 * Deploy this to Cloudflare Workers and configure the worker URL in OneManager settings.
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
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
  
  // Create cache key
  const cacheKey = new Request(decodedUrl, request)
  const cache = caches.default
  
  // Check cache first
  let response = await cache.match(cacheKey)
  
  if (!response) {
    // Not in cache, fetch from origin
    try {
      response = await fetch(decodedUrl, {
        cf: {
          // Cache everything, even if origin says not to
          cacheEverything: true,
          // Cache for 7 days
          cacheTtl: 604800,
        },
        headers: {
          // Preserve range requests for video streaming
          'Range': request.headers.get('Range') || '',
        }
      })
      
      // Clone response before caching
      const responseToCache = response.clone()
      
      // Modify headers for better caching
      const modifiedResponse = new Response(response.body, response)
      modifiedResponse.headers.set('Cache-Control', 'public, max-age=604800')
      modifiedResponse.headers.set('Content-Disposition', ``attachment; filename*=UTF-8''${encodeURIComponent(filename)}; filename="${filename}"`)
      
      // Cache the response
      event.waitUntil(cache.put(cacheKey, responseToCache))
      
      return modifiedResponse
    } catch (error) {
      return new Response(`Error fetching file: ${error.message}`, { status: 500 })
    }
  }
  
  // Return cached response
  return response
}

function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}
