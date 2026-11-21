import { probe } from '../../e2e/lib/look'
const out = await probe(async (page) => {
  await page.goto('http://127.0.0.1:4399/')
  await page.waitForTimeout(400)
  return page.evaluate(() => {
    const r = (s: string) => { const el = document.querySelector(s); if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height), left: Math.round(b.left), w: Math.round(b.width) } }
    return {
      header: r('header'), main: r('main'), hero: r('[data-hero]'), social: r('main > .cluster'), footer: r('footer'),
      prompt: r('.prompt-field'), brand: r('.site-brand'), sil: r('.silhouette path'),
      scrollH: document.scrollingElement!.scrollHeight, innerH: innerHeight,
    }
  })
})
console.log(JSON.stringify(out, null, 1))
