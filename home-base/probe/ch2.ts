import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:4322/')
await page.evaluate(() => document.fonts.ready)
const out = await page.evaluate(() => {
	const probe = (family: string) => {
		const el = document.createElement('span')
		el.style.position = 'absolute'
		el.style.fontFamily = family
		el.style.fontSize = '100px'
		el.style.whiteSpace = 'pre'
		el.style.width = '100ch'
		el.textContent = '0'.repeat(100)
		document.body.append(el)
		const width = el.getBoundingClientRect().width
		const familyResolved = getComputedStyle(el).fontFamily
		el.remove()
		return { ch: Math.round((width / 100) * 1000) / 1000, familyResolved }
	}
	return {
		dm: probe("'DM Sans'"),
		dmFallback: probe("'DM Sans Fallback'"),
		newsreader: probe("'Newsreader'"),
		newsreaderFallback: probe("'Newsreader Fallback'"),
		initial: probe('initial'),
	}
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
