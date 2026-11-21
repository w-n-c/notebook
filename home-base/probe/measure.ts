import { probe } from '../../e2e/lib/look'

const out = await probe(async (page) => {
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load' })
  await page.waitForTimeout(400)
  return page.evaluate(() => {
    const info = (el: Element | null, label: string) => {
      if (!el) return { label, missing: true }
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return { label, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), maxInline: s.maxInlineSize, bg: s.backgroundColor, font: s.fontFamily }
    }
    const brand = document.querySelector('.site-brand')
    const header = document.querySelector('body > header')
    const main = document.querySelector('main')
    const hero = document.querySelector('[data-hero]')
    const sw = document.querySelector('[data-hero] > .switcher, [data-hero] .switcher')
    const promptZone = document.querySelector('.prompt-zone')
    const bubble = document.querySelector('.prompt-bubble')
    const field = document.querySelector('.prompt-field')
    const input = document.querySelector('#hero-prompt')
    const stream = document.querySelector('.thought-stream')
    const item = document.querySelector('[data-combobox-item]')
    const item2 = document.querySelectorAll('[data-combobox-item]')[1]
    const speech = document.querySelector('.speech-cue')
    const sil = document.querySelector('.silhouette svg, .silhouette')
    const social = document.querySelector('main > .cluster:last-child, main ul.cluster')
    return {
      brand: info(brand, 'brand'), header: info(header, 'header'), main: info(main, 'main'),
      hero: info(hero, 'hero'), sw: info(sw, 'switcher'), promptZone: info(promptZone, 'promptZone'),
      bubble: info(bubble, 'bubble'), field: info(field, 'field'), input: info(input, 'input'),
      stream: info(stream, 'stream'), item: info(item, 'item'), item2: info(item2, 'item2'),
      speech: info(speech, 'speech'), sil: info(sil, 'sil'), social: info(social, 'social'),
      bodyFont: getComputedStyle(document.body).fontFamily,
      scrollH: document.scrollingElement!.scrollHeight, innerH: innerHeight,
      itemFont: item ? getComputedStyle(item.querySelector('span') ?? item).fontSize : null,
    }
  })
})
console.log(JSON.stringify(out, null, 2))
