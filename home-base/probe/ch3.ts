import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:4322/')
await page.evaluate(() => document.fonts.ready)
const out = await page.evaluate(() => {
	const ctx = document.createElement('canvas').getContext('2d')!
	const advance = (family: string, text = '0') => {
		ctx.font = `100px ${family}`
		return Math.round(ctx.measureText(text).width * 1000) / 1000
	}
	const cssCh = (family: string) => {
		const el = document.createElement('div')
		el.style.cssText = `position:absolute;top:-9999px;font-family:${family};font-size:16px;width:100ch`
		document.body.append(el)
		const width = el.getBoundingClientRect().width
		el.remove()
		return Math.round((width / 100) * 1000) / 1000
	}
	return {
		advanceZero: {
			dm: advance("'DM Sans'"),
			dmFallback: advance("'DM Sans Fallback'"),
			newsreader: advance("'Newsreader'"),
			newsreaderFallback: advance("'Newsreader Fallback'"),
			arial: advance('Arial'),
			times: advance("'Times New Roman'"),
		},
		cssCh16: {
			dm: cssCh("'DM Sans'"),
			dmFallback: cssCh("'DM Sans Fallback'"),
			newsreader: cssCh("'Newsreader'"),
			newsreaderFallback: cssCh("'Newsreader Fallback'"),
			arial: cssCh('Arial'),
		},
	}
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
