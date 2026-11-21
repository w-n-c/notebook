import { probe } from '../../e2e/lib/look'

const out = await probe(async (page) => {
  await page.addInitScript(() => {
    ;(window as any).__shifts = []
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) {
        if (e.hadRecentInput) continue
        ;(window as any).__shifts.push({
          value: Math.round(e.value * 10000) / 10000,
          time: Math.round(e.startTime),
          sources: (e.sources ?? []).map((s: any) => ({
            tag: s.node?.tagName,
            cls: s.node?.className?.toString().slice(0, 40),
            px: s.previousRect && Math.round(s.previousRect.x) + ',' + Math.round(s.previousRect.y) + ' ' + Math.round(s.previousRect.width) + 'x' + Math.round(s.previousRect.height),
            cx: s.currentRect && Math.round(s.currentRect.x) + ',' + Math.round(s.currentRect.y) + ' ' + Math.round(s.currentRect.width) + 'x' + Math.round(s.currentRect.height),
          })),
        })
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  return page.evaluate(() => ({ shifts: (window as any).__shifts, total: (window as any).__shifts.reduce((a: number, s: any) => a + s.value, 0) }))
})
console.log(JSON.stringify(out, null, 1))
