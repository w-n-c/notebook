import { probe } from '../../e2e/lib/look'
const out = await probe(async (page) => {
  await page.goto('http://127.0.0.1:4399/')
  await page.waitForTimeout(400)
  const before = await page.evaluate(() => ({
    clear: [...document.querySelectorAll('button')].map((b) => b.textContent?.trim()),
    field: (() => { const el = document.querySelector('.prompt-field'); if (!el) return null; const r = el.getBoundingClientRect(); return { h: r.height, radius: getComputedStyle(el).borderTopLeftRadius } })(),
    inputPad: (() => { const el = document.querySelector('#hero-prompt'); return el ? getComputedStyle(el).paddingBlock : null })(),
    btn: (() => { const el = document.querySelector('.prompt-submit'); if (!el) return null; const r = el.getBoundingClientRect(); return { w: r.width, h: r.height } })(),
  }))
  await page.locator('#hero-prompt').fill('zzqx')
  await page.waitForTimeout(300)
  const after = await page.evaluate(() => ({
    value: (document.querySelector('#hero-prompt') as HTMLInputElement)?.value,
    clear: [...document.querySelectorAll('button')].map((b) => b.textContent?.trim()),
    hasClearNode: Boolean([...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Clear')),
  }))
  await page.locator('#hero-prompt').press('Enter')
  await page.waitForTimeout(300)
  const submitted = await page.evaluate(() => ({
    url: location.pathname,
    value: (document.querySelector('#hero-prompt') as HTMLInputElement)?.value,
    clear: [...document.querySelectorAll('button')].map((b) => b.textContent?.trim()),
    speech: document.querySelector('.speech-cue')?.textContent,
  }))
  return { before, after, submitted }
})
console.log(JSON.stringify(out, null, 1))
