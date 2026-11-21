import { chromium } from '@playwright/test'

const measure = async (delay: number) => {
	const browser = await chromium.launch()
	const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
	const page = await context.newPage()
	await page.addInitScript(() => {
		;(window as any).__cls = 0
		;(window as any).__sources = []
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries() as any[]) {
				if (entry.hadRecentInput) continue
				;(window as any).__cls += entry.value
				for (const s of entry.sources ?? []) {
					;(window as any).__sources.push({
						value: Math.round(entry.value * 10000) / 10000,
						node: s.node ? `${s.node.tagName?.toLowerCase()}.${(s.node.className ?? '').toString().split(' ')[0]}` : '(detached)',
					})
				}
			}
		}).observe({ type: 'layout-shift', buffered: true })
	})
	await page.route('**/*.woff2', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, delay))
		await route.continue()
	})
	await page.goto('http://localhost:4322/', { waitUntil: 'load' })
	await page.evaluate(() => document.fonts.ready)
	await page.waitForTimeout(800)
	const out = await page.evaluate(() => ({
		cls: Math.round((window as any).__cls * 10000) / 10000,
		sources: (window as any).__sources.slice(0, 8),
		mainWidth: Math.round(document.querySelector('main')!.getBoundingClientRect().width),
		heroWidth: Math.round(document.querySelector('[data-hero]')!.getBoundingClientRect().width),
	}))
	await browser.close()
	return out
}

for (const delay of [0, 300, 800]) console.log(delay, JSON.stringify(await measure(delay)))
