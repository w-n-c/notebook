import { probe } from '../../e2e/lib/look'
const out = await probe(async (page) => {
  await page.goto('http://127.0.0.1:4399/')
  await page.waitForTimeout(400)
  return page.evaluate(() => {
    const all = [...document.querySelectorAll<HTMLElement>('*')]
    const wide = all.filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5)
    return {
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      offenders: wide.slice(0, 8).map((el) => ({ tag: el.tagName, cls: el.className?.toString().slice(0, 50), right: Math.round(el.getBoundingClientRect().right), w: Math.round(el.getBoundingClientRect().width) })),
    }
  })
}, { narrow: true })
console.log(JSON.stringify(out, null, 1))
