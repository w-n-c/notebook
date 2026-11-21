import { probe } from '../../e2e/lib/look'
const out = await probe(async (page) => {
  await page.addInitScript(() => {
    ;(window as any).__log = []
    const sample = (label: string) => {
      const switcher = document.querySelector('.switcher')
      const main = document.querySelector('main')
      const hero = document.querySelector('[data-hero]')
      const r = (el: Element | null) => el ? { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } : null
      ;(window as any).__log.push({ label, t: Math.round(performance.now()), main: r(main), hero: r(hero), switcher: r(switcher), threshold: switcher ? getComputedStyle(switcher).getPropertyValue('--threshold') : null, maxInline: switcher ? getComputedStyle(switcher).maxInlineSize : null })
    }
    requestAnimationFrame(() => sample('raf1'))
    window.addEventListener('load', () => setTimeout(() => sample('load+0'), 0))
  })
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load' })
  await page.waitForTimeout(600)
  return page.evaluate(() => (window as any).__log)
})
console.log(JSON.stringify(out, null, 1))
