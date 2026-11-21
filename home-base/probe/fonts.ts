import { probe } from '../../e2e/lib/look'

const out = await probe(async (page) => {
  const shifts: number[] = []
  await page.addInitScript(() => {
    ;(window as any).__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load' })
  await page.waitForTimeout(1200)
  return page.evaluate(() => {
    const el = (s: string) => document.querySelector(s)
    const fam = (s: string) => { const e = el(s); return e ? getComputedStyle(e).fontFamily.split(',')[0] : null }
    const size = (s: string) => { const e = el(s); return e ? getComputedStyle(e).fontSize : null }
    return {
      body: fam('body'), h1: fam('h1'), entry: fam('.entry-label'), speech: fam('.speech-cue'),
      speechStyle: el('.speech-cue') ? getComputedStyle(el('.speech-cue')!).fontStyle : null,
      sizes: { entry: size('.entry-label'), speech: size('.speech-cue'), body: size('body') },
      checks: {
        newsreader: document.fonts.check('16px Newsreader'),
        newsreaderItalic: document.fonts.check('italic 16px Newsreader'),
        dm: document.fonts.check('16px "DM Sans"'),
      },
      cls: (window as any).__cls,
      loaded: [...document.fonts].map((f) => `${f.family}/${f.style}/${f.status}`),
      fontsH: (() => {
        const probeEl = document.createElement('div')
        probeEl.textContent = 'Handgloves — ask away'
        probeEl.style.cssText = 'position:absolute;visibility:hidden;font-size:100px;line-height:normal;white-space:nowrap'
        document.body.append(probeEl)
        const measure = (family: string, extra = '') => {
          probeEl.style.fontFamily = family
          probeEl.style.fontSize = extra || '100px'
          const r = probeEl.getBoundingClientRect()
          return { w: Math.round(r.width), h: Math.round(r.height) }
        }
        const res = {
          newsreader: measure('Newsreader'),
          newsreaderFallback: measure("'Newsreader Fallback'"),
          dm: measure("'DM Sans'"),
          dmFallback: measure("'DM Sans Fallback'"),
        }
        probeEl.remove()
        return res
      })(),
    }
  })
})
console.log(JSON.stringify(out, null, 2))
