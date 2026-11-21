import { probe } from '../../e2e/lib/look'
const out = await probe(async (page) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('http://127.0.0.1:4399/')
  await page.waitForTimeout(400)
  return page.evaluate(() => {
    const path = document.querySelector('.silhouette path')
    if (!path) return { missing: true }
    const cs = getComputedStyle(path)
    return { stroke: cs.stroke, strokeWidth: cs.strokeWidth, media: matchMedia('(prefers-color-scheme: dark)').matches, box: path.getBoundingClientRect().height }
  })
})
console.log(JSON.stringify(out))
