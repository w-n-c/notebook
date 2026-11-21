import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
await p.goto('http://localhost:4322/')
await p.evaluate(() => document.fonts.ready)
const before = await p.evaluate(() => ({
	main: Math.round(document.querySelector('main')!.getBoundingClientRect().width),
	hero: Math.round(document.querySelector('[data-hero]')!.getBoundingClientRect().width),
	brandLeft: Math.round(document.querySelector('header a')!.getBoundingClientRect().left),
	heroLeft: Math.round(document.querySelector('[data-hero]')!.getBoundingClientRect().left),
}))
await p.addStyleTag({ content: 'main.center { inline-size: auto !important }' })
const after = await p.evaluate(() => ({
	main: Math.round(document.querySelector('main')!.getBoundingClientRect().width),
	hero: Math.round(document.querySelector('[data-hero]')!.getBoundingClientRect().width),
	brandLeft: Math.round(document.querySelector('header a')!.getBoundingClientRect().left),
	heroLeft: Math.round(document.querySelector('[data-hero]')!.getBoundingClientRect().left),
}))
console.log({ before, after })
await b.close()
