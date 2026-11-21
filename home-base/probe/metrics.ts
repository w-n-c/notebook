import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:4322/')
await page.evaluate(() => document.fonts.ready)
const out = await page.evaluate(() => {
	const ctx = document.createElement('canvas').getContext('2d')!
	const metrics = (family: string) => {
		ctx.font = `100px ${family}`
		const zero = ctx.measureText('0').width
		const x = ctx.measureText('x').actualBoundingBoxAscent
		const cap = ctx.measureText('H').actualBoundingBoxAscent
		const asc = ctx.measureText('H').fontBoundingBoxAscent
		const desc = ctx.measureText('H').fontBoundingBoxDescent
		return {
			zero: Math.round(zero * 10) / 10,
			xHeight: Math.round(x * 10) / 10,
			capHeight: Math.round(cap * 10) / 10,
			ratio: Math.round((zero / x) * 1000) / 1000,
			asc: Math.round(asc * 10) / 10,
			desc: Math.round(desc * 10) / 10,
		}
	}
	const names = [
		"'DM Sans'", "'Newsreader'",
		'Arial', 'Helvetica', 'Liberation Sans', 'DejaVu Sans', 'Verdana', 'Tahoma',
		'Noto Sans', 'Roboto', 'Ubuntu', 'Segoe UI', 'system-ui', 'sans-serif',
		"'Times New Roman'", 'Liberation Serif', 'DejaVu Serif', 'Georgia', 'serif',
	]
	const result: Record<string, unknown> = {}
	for (const name of names) result[name] = metrics(name)
	return result
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
