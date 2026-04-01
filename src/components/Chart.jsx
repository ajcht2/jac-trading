import { useEffect, useRef, useState } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'

export default function Chart({ data, range }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!containerRef.current || !data?.candles?.length) return

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const isIntraday = range === '1d' || range === '5d'

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#64748b',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(59, 130, 246, 0.3)', labelBackgroundColor: '#3b82f6' },
        horzLine: { color: 'rgba(59, 130, 246, 0.3)', labelBackgroundColor: '#3b82f6' },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: isIntraday,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: true,
      handleScale: true,
    })

    chartRef.current = chart

    // Use UTC to avoid timezone shifts when zooming
    // For daily+: use UTC business day (avoids date shifts when zooming)
    // For intraday: adjust to local timezone (Lightweight Charts shows UTC by default)
    const tzOffsetSeconds = new Date().getTimezoneOffset() * -60 // e.g. BST = +3600

    function toBusinessDay(unixTimestamp) {
      const d = new Date(unixTimestamp * 1000)
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
      }
    }

    // Build + deduplicate candles
    const seen = new Set()
    const candles = []
    for (const c of data.candles) {
      if (c.open == null || c.close == null || c.high == null || c.low == null) continue

      let time, key
      if (isIntraday) {
        // Shift timestamp to local time so chart displays correct hours
        time = c.time + tzOffsetSeconds
        key = time
      } else {
        time = toBusinessDay(c.time)
        key = `${time.year}-${time.month}-${time.day}`
      }

      if (seen.has(key)) continue
      seen.add(key)

      candles.push({
        time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume || 0,
      })
    }

    // Sort properly
    candles.sort((a, b) => {
      if (isIntraday) return a.time - b.time
      if (a.time.year !== b.time.year) return a.time.year - b.time.year
      if (a.time.month !== b.time.month) return a.time.month - b.time.month
      return a.time.day - b.time.day
    })

    // Candlestick
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })
    candleSeries.setData(candles.map(c => ({
      time: c.time, open: c.open, high: c.high, low: c.low, close: c.close,
    })))

    // Volume
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })
    volumeSeries.setData(candles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
    })))

    // Tooltip on hover
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setTooltip(null)
        return
      }
      const cd = param.seriesData.get(candleSeries)
      const vd = param.seriesData.get(volumeSeries)
      if (!cd) { setTooltip(null); return }

      const change = cd.close - cd.open
      const changePct = cd.open !== 0 ? (change / cd.open) * 100 : 0

      setTooltip({
        open: cd.open, high: cd.high, low: cd.low, close: cd.close,
        volume: vd?.value || 0, change, changePct,
        isUp: cd.close >= cd.open,
      })
    })

    chart.timeScale().fitContent()

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        chart.applyOptions({ width, height })
      }
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [data, range])

  const fmt = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'
  const fmtVol = (n) => {
    if (n == null) return '—'
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
    return n.toLocaleString()
  }

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 z-10 flex items-center gap-3 text-xs font-mono py-1 px-2 pointer-events-none min-h-[24px] flex-wrap">
        {tooltip ? (
          <>
            <span><span className="text-terminal-muted">O </span><span className={tooltip.isUp ? 'text-gain' : 'text-loss'}>{fmt(tooltip.open)}</span></span>
            <span><span className="text-terminal-muted">H </span><span className={tooltip.isUp ? 'text-gain' : 'text-loss'}>{fmt(tooltip.high)}</span></span>
            <span><span className="text-terminal-muted">L </span><span className={tooltip.isUp ? 'text-gain' : 'text-loss'}>{fmt(tooltip.low)}</span></span>
            <span><span className="text-terminal-muted">C </span><span className={tooltip.isUp ? 'text-gain' : 'text-loss'}>{fmt(tooltip.close)}</span></span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              tooltip.isUp ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
            }`}>
              {tooltip.change >= 0 ? '+' : ''}{fmt(tooltip.change)} ({tooltip.changePct >= 0 ? '+' : ''}{tooltip.changePct.toFixed(2)}%)
            </span>
            <span><span className="text-terminal-muted">Vol </span><span className="text-terminal-text">{fmtVol(tooltip.volume)}</span></span>
          </>
        ) : (
          <span className="text-terminal-muted">Hover over chart for details</span>
        )}
      </div>
      <div ref={containerRef} className="w-full" style={{ height: '600px' }} />
    </div>
  )
}
