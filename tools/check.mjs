import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
await mkdir(new URL('../qa/', import.meta.url), { recursive: true });
const report = (test, detail) => { results.push({ test, status: 'passed', detail }); console.log(`PASS ${test}: ${detail}`); };
try {
  for (const [width, height, scheme] of [[1440,1000,'light'],[1024,768,'light'],[768,1024,'light'],[390,844,'light'],[320,740,'light'],[1440,1000,'dark'],[390,844,'dark']]) {
    const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    assert(await page.locator('.hero-actions .button').isVisible());
    const cta = await page.locator('.hero-actions .button').boundingBox();
    assert(cta.y + cta.height < height, `Hero CTA outside viewport at ${width}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `Horizontal overflow at ${width}`);
    await page.evaluate(async () => {
      const images = [...document.images];
      for (const image of images) image.loading = 'eager';
      await Promise.all(images.map(image => image.decode()));
    });
    const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(anchors => anchors.map(a => a.hash).filter(hash => !document.getElementById(hash.slice(1))));
    assert.deepEqual(brokenAnchors, []);
    assert.deepEqual(errors, []);
    if (width === 1440 || width === 390) {
      await page.screenshot({ path: fileURLToPath(new URL(`../qa/${width}-${scheme}-full.png`, import.meta.url)), fullPage: true });
      await page.screenshot({ path: fileURLToPath(new URL(`../qa/${width}-${scheme}-hero.png`, import.meta.url)) });
    }
    report(`Layout ${width}x${height} ${scheme}`, 'No overflow, all assets loaded, hero CTA in viewport, internal links valid');
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width:390,height:844 }, reducedMotion:'reduce' });
  await page.goto(base);
  await page.getByRole('button', { name:'Otvori meni' }).click();
  assert.equal(await page.locator('#mobile-nav').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-nav').isVisible(), false);
  await page.getByRole('button', { name:'Otvori meni' }).click();
  await page.locator('#mobile-nav').getByRole('link', { name:'Šta pravimo' }).click();
  assert.equal(await page.locator('#mobile-nav').isVisible(), false);
  report('Mobile navigation', 'Open, Escape, navigation and close work');
  await page.goto(base);

  for (const key of ['nadstresnice','letnjikovci','garaze','bastice']) {
    await page.locator(`[data-service="${key}"] .service-toggle`).click();
    assert.equal(await page.locator(`[data-service="${key}"] button`).getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('.service-toggle[aria-expanded="true"]').count(), 1);
  }
  await page.locator('.work-copy [data-inquiry]').click();
  assert.equal(await page.locator('#project-type').inputValue(), 'Drvena baštica');
  report('Service selection', 'All four views work and project choice transfers to form');

  await page.locator('[data-open-gallery]').first().click();
  assert.equal(await page.locator('#gallery-dialog').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#gallery-dialog').isVisible(), false);
  assert.equal(await page.locator('body').evaluate(body => body.classList.contains('modal-open')), false);
  await page.locator('summary').first().click();
  assert.equal(await page.locator('details').first().getAttribute('open'), '');
  report('Gallery and FAQ', 'Image dialog opens and Escape restores scrolling; FAQ expands');

  await page.locator('.form-submit').click();
  assert.equal(await page.locator('#message-dialog').isVisible(), false);
  await page.locator('#client-name').fill('Miloš');
  await page.locator('#project-location').fill('Novi Sad');
  await page.locator('#project-message').fill('Baštica 2 × 1 m. Hrast & čelik?');
  await page.locator('.form-submit').click();
  assert.equal(await page.locator('#message-dialog').isVisible(), true);
  const message = await page.locator('#message-preview').textContent();
  assert(message.includes('Miloš') && message.includes('Novi Sad') && message.includes('Hrast & čelik?'));
  const link = new URL(await page.locator('#whatsapp-link').getAttribute('href'));
  assert.equal(link.origin, 'https://wa.me');
  assert.equal(link.pathname, '/381616669378');
  assert.equal(link.searchParams.get('text'), message);
  await page.screenshot({ path:fileURLToPath(new URL('../qa/message-mobile.png',import.meta.url)) });
  await page.keyboard.press('Escape');
  report('Inquiry form', 'Required fields enforced, preview and UTF-8 WhatsApp URL verified; no message sent');

  await page.goto(new URL('../index.html', import.meta.url).href);
  await page.getByRole('button', { name:'Otvori meni' }).click();
  assert.equal(await page.locator('#mobile-nav').isVisible(),true);
  assert.equal(await page.locator('.hero-picture img').evaluate(img => img.complete && img.naturalWidth > 0),true);
  report('Direct file opening', 'file:// version loads hero and interactive mobile menu');
  await page.close();

  const noJs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await noJs.goto(base);
  assert.equal(await noJs.locator('#intro-title').isVisible(),true);
  assert.equal(await noJs.locator('.contact-phone').isVisible(),true);
  report('Progressive rendering', 'Content and direct contact remain visible without JavaScript');
  await noJs.close();
  const animated = await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light'});
  await animated.goto(base);
  for (const id of ['usluge','pristup','radovi','kontakt']) {
    await animated.locator(`#${id}`).scrollIntoViewIfNeeded();
    await animated.locator(`#${id} [data-reveal]`).first().waitFor({state:'visible'});
    await animated.waitForFunction(id => document.querySelector(`#${id} [data-reveal]`).classList.contains('is-visible'), id);
  }
  await animated.locator('#usluge').scrollIntoViewIfNeeded();
  await animated.locator('#usluge').screenshot({path:fileURLToPath(new URL('../qa/services-desktop.png',import.meta.url))});
  await animated.locator('#radovi').scrollIntoViewIfNeeded();
  await animated.locator('#radovi').screenshot({path:fileURLToPath(new URL('../qa/work-desktop.png',import.meta.url))});
  report('Default motion', 'Section reveals become visible when scrolled into view');
  await animated.close();
} finally {
  await browser.close();
  await writeFile(new URL('../qa/check-results.json',import.meta.url),JSON.stringify(results,null,2));
}
