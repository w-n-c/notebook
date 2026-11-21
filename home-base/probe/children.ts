import { probe } from '../../e2e/lib/look'

const out = await probe(async (page) => {
  await page.addInitScript(() => {
    ;(window as any).__log = []
    const sample = (label: string) => {
      const pick = (s: string) => {
        const el = document.querySelector(s)
        if (!el) return { s, missing: true }
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
        return { s, y: Math.round(r.y), h: Math.round(r.height), display: cs.display, pos: cs.position }
      }
      ;(window as any).__log.push({
        label,
        els: ['main', 'main > *', '[data-hero]', '.prompt-zone', '.silhouette-slot', '.stream-zone', '.drum-window', 'main > .cluster', 'main ul.cluster', 'astro-island'].map(pick),
      })
    }
    requestAnimationFrame(() => sample('raf1'))
    window.addEventListener('load', () => sample('load'))
  })
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load' })
  await page.waitForTimeout(600)
  return page.evaluate(() => (window as any).__log)
})
console.log(JSON.stringify(out, null, 1))
