import { chromium } from '@playwright/test'

const run = async () => {
	const browser = await chromium.launch()
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
	await page.goto('http://localhost:4322/')
	await page.evaluate(() => document.fonts.ready)
	const out = await page.evaluate(() => {
		const ch = (family: string, size = 16) => {
			const el = document.createElement('span')
			el.style.cssText = `position:absolute;font-family:${family};font-size:${size}px;width:100ch;height:0`
			document.body.append(el)
			const width = el.getBoundingClientRect().width / 100
			el.remove()
			return Math.round(width * 1000) / 1000
		}
		const zero = (family: string) => {
			const el = document.createElement('span')
			el.style.cssText = `position:absolute;font-family:${family};font-size:100px;white-space:pre`
			el.textContent = '0'
			document.body.append(el)
			const width = el.getBoundingClientRect().width
			el.remove()
			return Math.round(width * 1000) / 1000
		}
		return {
			dm: ch("'DM Sans'"),
			dmZero: zero("'DM Sans'"),
			dmFallback: ch("'DM Sans Fallback'"),
			dmFallbackZero: zero("'DM Sans Fallback'"),
			newsreader: ch("'Newsreader'"),
			newsreaderZero: zero("'Newsreader'"),
			newsreaderFallback: ch("'Newsreader Fallback'"),
			newsreaderFallbackZero: zero("'Newsreader Fallback'"),
			newsreaderFallbackItalic: ch("'Newsreader Fallback', serif"),
			arial: zero('Arial'),
			helvetica: zero('Helvetica'),
			liberationSans: zero("'Liberation Sans'"),
			systemUi: zero('system-ui'),
			times: zero("'Times New Roman'"),
			liberationSerif: zero("'Liberation Serif'"),
			georgia: zero('Georgia'),
			serif: zero('serif'),
			sansSerif: zero('sans-serif'),
		}
	})
	console.log(JSON.stringify(out, null, 2))
	await browser.close()
}

run()
