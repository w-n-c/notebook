import { probe } from '../../e2e/lib/look'

const out = await probe(async (page) => {
  await page.addInitScript(() => {
    ;(window as any).__log = []
    const sample = (label: string) => {
      const root = getComputedStyle(document.documentElement)
      const header = document.querySelector('header .center')
      ;(window as any).__log.push({
        label,
        t: Math.round(performance.now()),
        measureWide: root.getPropertyValue('--measure-wide').trim(),
        maxInline: header ? getComputedStyle(header).maxInlineSize : null,
        w: header ? Math.round(header.getBoundingClientRect().width) : null,
        rootFont: root.fontFamily.slice(0, 30),
        rootSize: root.fontSize,
        fonts: [...document.fonts].map((f) => `${f.family}:${f.status}`).join(' '),
      })
    }
    document.addEventListener('readystatechange', () => sample('ready-' + document.readyState))
    requestAnimationFrame(() => sample('raf1'))
    requestAnimationFrame(() => requestAnimationFrame(() => sample('raf2')))
    document.fonts.addEventListener('loadingdone', () => sample('fonts-done'))
    setTimeout(() => sample('t300'), 300)
    setTimeout(() => sample('t1000'), 1000)
  })
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  return page.evaluate(() => (window as any).__log)
})
console.log(JSON.stringify(out, null, 1))
