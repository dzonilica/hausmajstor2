import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const base = 'http://127.0.0.1:4173';
const results = [];
const report = test => { results.push({ test, status: 'passed' }); console.log(`PASS ${test}`); };
async function openShowcase(options = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, ...options });
  await page.goto(base);
  await page.locator('#garaze').scrollIntoViewIfNeeded();
  await page.locator('#garage-image').evaluate(image => image.decode());
  return page;
}
async function waitForChoice(page, title) {
  await page.waitForFunction(title => document.querySelector('#garage-project-title').textContent === title && !document.querySelector('#garage-presentation').hasAttribute('aria-busy'), title);
}

try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await openShowcase({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [key, title] of [['drvo', 'Garaža sa drvetom'], ['dupla', 'Dupla garaža'], ['grafit', 'Grafitna garaža']]) {
      await page.locator(`[data-garage="${key}"]`).focus();
      await page.keyboard.press('Enter');
      await waitForChoice(page, title);
      assert.equal(await page.locator('.garage-choice[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('#garage-image').evaluate(image => image.complete && image.naturalWidth > 0), true);
      await page.locator('.garage-stage').click();
      assert.equal(await page.locator('#gallery-dialog').isVisible(), true);
      assert((await page.locator('#gallery-dialog img').getAttribute('src')).includes(`garaza-${key}`));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.garage-stage').evaluate(button => button === document.activeElement), true);
    }
    // Opening a garage must not leave that image in the original raised-bed dialog.
    await page.locator('.work-image-button').click();
    assert.equal(await page.locator('#gallery-dialog img').getAttribute('src'), 'assets/bastice-original.jpg');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    report(`Showcase at ${width}px: keyboard, images, dialog focus, original gallery, no overflow`);
    await page.close();
  }

  const race = await openShowcase();
  await race.route('**/assets/garaza-drvo.webp', async route => {
    await new Promise(resolve => setTimeout(resolve, 650));
    await route.continue();
  });
  const slowRequest = race.waitForRequest('**/assets/garaza-drvo.webp');
  await race.locator('[data-garage="drvo"]').click();
  await slowRequest;
  await race.locator('[data-garage="dupla"]').click();
  await waitForChoice(race, 'Dupla garaža');
  await race.waitForTimeout(800);
  assert.equal(await race.locator('#garage-project-title').textContent(), 'Dupla garaža');
  assert((await race.locator('#garage-image').getAttribute('src')).includes('garaza-dupla'));
  assert((await race.locator('.garage-stage').getAttribute('data-gallery-src')).includes('garaza-dupla'));
  report('Rapid selections: delayed image cannot overwrite the latest selection or lightbox');

  await race.locator('[data-garage="grafit"]').click();
  await waitForChoice(race, 'Grafitna garaža');
  await race.emulateMedia({ reducedMotion: 'reduce' });
  await race.waitForFunction(() => !document.querySelector('.image-crossfade-out'));
  assert.equal(await race.locator('.reveal-ready:not(.is-visible)').count(), 0);
  assert.equal(await race.locator('.hero-line>span').first().evaluate(element => getComputedStyle(element).animationName), 'none');
  report('Live reduced-motion preference: pending reveals visible and transition overlays removed');
  await race.close();

  const failed = await openShowcase({ reducedMotion: 'reduce' });
  await failed.route('**/assets/garaza-drvo.webp', route => route.abort());
  await failed.locator('[data-garage="drvo"]').click();
  await failed.waitForFunction(() => document.querySelector('.garage-load-status').textContent.includes('nije učitala'));
  assert.equal(await failed.locator('#garage-project-title').textContent(), 'Grafitna garaža');
  assert.equal(await failed.locator('[data-garage="grafit"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await failed.locator('#garage-image').evaluate(image => image.complete && image.naturalWidth > 0), true);
  await failed.unroute('**/assets/garaza-drvo.webp');
  await failed.locator('[data-garage="drvo"]').click();
  await waitForChoice(failed, 'Garaža sa drvetom');
  assert.equal(await failed.locator('.garage-load-status').textContent(), '');
  report('Failed image: previous presentation survives and the next attempt recovers');
  await failed.close();

  const noJs = await openShowcase({ javaScriptEnabled: false });
  assert.equal(await noJs.locator('#garage-project-title').isVisible(), true);
  assert.equal(await noJs.locator('#garaze noscript a').getAttribute('href'), 'garaze.html');
  report('No JavaScript: initial image, text and link to all concepts remain available');
  await noJs.close();

  // Construction sketches: each process section shows its own structure, finished in every mode.
  const sketchState = page => page.locator('.build-drawing').evaluate(figure => {
    const visible = element => getComputedStyle(element).opacity === '1';
    const strokes = [...figure.querySelectorAll('.s:not(.temp)')];
    return {
      drawn: strokes.length > 40 && strokes.every(path => visible(path) && parseFloat(getComputedStyle(path).strokeDashoffset) === 0),
      labels: [...figure.querySelectorAll('text')].every(visible),
      cleared: [...figure.querySelectorAll('.temp,.p')].every(element => getComputedStyle(element).opacity === '0')
    };
  });
  const finished = { drawn: true, labels: true, cleared: true };
  const sketches = { index: 'nadstresnice', nadstresnice: 'nadstresnice', letnjikovci: 'letnjikovci', garaze: 'garaze', bastice: 'bastice', usluge: 'letnjikovci', 'o-nama': 'bastice' };
  const still = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  for (const [slug, structure] of Object.entries(sketches)) {
    await still.goto(`${base}/${slug}.html`);
    assert.equal(await still.locator('.process .build-drawing').getAttribute('data-build'), structure);
    assert.deepEqual(await sketchState(still), finished, `${slug} sketch with reduced motion`);
  }
  await still.close();
  const sketchNoJs = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  await sketchNoJs.goto(`${base}/garaze.html`);
  assert.deepEqual(await sketchState(sketchNoJs), finished);
  await sketchNoJs.close();
  const building = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  await building.goto(`${base}/garaze.html`);
  assert.equal((await sketchState(building)).drawn, false, 'Sketch waits until the steps are in view');
  await building.locator('#izrada .process-steps').scrollIntoViewIfNeeded();
  await building.waitForFunction(() => document.querySelector('#izrada').classList.contains('is-built'), null, { timeout: 8000 });
  await building.waitForTimeout(300);
  assert.deepEqual(await sketchState(building), finished);
  assert.equal(await building.locator('#izrada .step-index').evaluateAll(steps => steps.every(step => getComputedStyle(step, '::before').transform === 'matrix(1, 0, 0, 1, 0, 0)')), true);
  report('Construction sketches: correct structure per page, built in step order, complete with reduced motion and without JavaScript');
  await building.close();

  // Shortcut icons under the hero and the scroll-assembled joint in the craft section.
  const jointState = page => page.locator('.joint-drawing').evaluate(figure => ({
    moved: figure.querySelectorAll('.joint-part[transform]').length,
    notes: getComputedStyle(figure.querySelector('.joint-notes')).opacity,
    guides: [...figure.querySelectorAll('.joint-guide')].map(guide => getComputedStyle(guide).opacity).join(',')
  }));
  const assembled = { moved: 0, notes: '1', guides: '0,0,0,0' };
  const iconsDrawn = page => page.locator('.service-shortcuts .shortcut-icon .s').evaluateAll(paths => paths.length > 40 && paths.every(path => getComputedStyle(path).opacity === '1' && parseFloat(getComputedStyle(path).strokeDashoffset) === 0));
  for (const options of [{ reducedMotion: 'reduce' }, { javaScriptEnabled: false }]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, ...options });
    await page.goto(base);
    assert.equal(await page.locator('.service-shortcuts .shortcut-icon').count(), 4);
    assert.equal(await iconsDrawn(page), true);
    await page.locator('.joint-drawing').scrollIntoViewIfNeeded();
    assert.deepEqual(await jointState(page), assembled);
    await page.close();
  }
  const moving = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await moving.goto(base);
  await moving.waitForFunction(() => document.querySelector('.service-shortcuts').classList.contains('is-visible'));
  await moving.waitForTimeout(3200);
  assert.equal(await iconsDrawn(moving), true);
  await moving.locator('.service-shortcuts a[href="garaze.html"]').hover();
  await moving.waitForTimeout(900);
  assert.notEqual(await moving.locator('.icon-door').evaluate(door => getComputedStyle(door).transform), 'none', 'Garage door opens on hover');
  const scrollJoint = progress => moving.evaluate(progress => {
    const joint = document.querySelector('.joint-drawing');
    const { top, height } = joint.getBoundingClientRect();
    const target = innerHeight - height - progress * Math.max(innerHeight * 0.7 - height, 160);
    scrollTo({ top: top + scrollY - target, behavior: 'instant' });
  }, progress);
  await scrollJoint(0);
  await moving.waitForTimeout(200);
  const exploded = await jointState(moving);
  assert.equal(exploded.moved, 7, 'Every part starts away from its place');
  assert.equal(exploded.notes, '0');
  await scrollJoint(1.05);
  await moving.waitForTimeout(200);
  assert.deepEqual(await jointState(moving), assembled);
  report('Shortcut icons draw and respond to hover; the craft joint assembles with the scroll and stays assembled without motion or JavaScript');
  await moving.close();
} finally {
  await browser.close();
  await writeFile(new URL('../qa/presentation-results.json', import.meta.url), JSON.stringify(results, null, 2));
}
