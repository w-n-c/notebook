import { probe } from '../../e2e/lib/look'

const out = await probe(async (page) => {
  await page.addInitScript(() => {
    ;(window as any).__log = []
    const sample = (label: string) => {
      const main = document.querySelector('main')
      const win = document.querySelector('.drum-window')
      ;(window as any).__log.push({
        label, t: Math.round(performance.now()),
        mainH: main ? Math.round(main.getBoundingClientRect().height) : null,
        mainY: main ? Math.round(main.getBoundingClientRect().y) : null,
        winH: win ? Math.round(win.getBoundingClientRect().height) : null,
        winBlock: win ? getComputedStyle(win).blockSize : null,
        islandSsr: document.querySelector('astro-island')?.hasAttribute('ssr'),
        entries: document.querySelectorAll('[data-combobox-item]').length,
      })
    }
    requestAnimationFrame(() => sample('raf1'))
    requestAnimationFrame(() => requestAnimationFrame(() => sample('raf2')))
    document.addEventListener('DOMContentLoaded', () => sample('dcl'))
    window.addEventListener('load', () => sample('load'))
    setTimeout(() => sample('t200'), 200)
    setTimeout(() => sample('t1000'), 1000)
  })
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load' })
  await page.waitForTimeout(1200)
  return page.evaluate(() => (window as any).__log)
})
console.log(JSON.stringify(out, null, 1))
