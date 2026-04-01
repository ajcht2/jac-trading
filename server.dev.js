// Local development server — proxies Yahoo Finance API
// Run with: node server.dev.js

import http from 'http'
import marketHandler from './api/market.js'
import newsHandler from './api/news.js'

const PORT = 3001

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const query = Object.fromEntries(url.searchParams)

  // Pick handler based on path
  let handler = null
  if (url.pathname.startsWith('/api/market')) handler = marketHandler
  else if (url.pathname.startsWith('/api/news')) handler = newsHandler

  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  const mockReq = { query, method: req.method }
  const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) { this.headers[key] = value },
    status(code) { this.statusCode = code; return this },
    json(data) {
      res.writeHead(this.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...this.headers,
      })
      res.end(JSON.stringify(data))
    },
  }

  try {
    await handler(mockReq, mockRes)
  } catch (err) {
    console.error('Server error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
})

server.listen(PORT, () => {
  console.log(`\n  🔥 JAC Trading API proxy running on http://localhost:${PORT}`)
  console.log(`  📊 Market: http://localhost:${PORT}/api/market?symbol=AAPL&action=quote`)
  console.log(`  📰 News:   http://localhost:${PORT}/api/news\n`)
})
