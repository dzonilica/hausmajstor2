import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../',import.meta.url);
const pages = ['index','usluge','nadstresnice','letnjikovci','garaze','bastice','o-nama','radovi','kontakt'];
const base = 'http://127.0.0.1:4173/';
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await mkdir(new URL('qa/pages/',root),{recursive:true});
const results=[];
const pass = message => { results.push(message); console.log('PASS '+message); };
try {
  // Crawl real HTML links, including fragments, without following contact-app links.
  for (const slug of pages) {
    const html = await readFile(new URL(slug+'.html',root),'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|tel:|viber:|mailto:|data:)/.test(match[1])) continue;
      const target = new URL(match[1],new URL(slug+'.html',root));
      const disk = new URL(target.href); disk.hash=''; disk.search='';
      await access(disk);
      if (target.hash && target.pathname.endsWith('.html')) {
        const destination = await readFile(disk,'utf8');
        assert(destination.includes(`id="${target.hash.slice(1)}"`),`Broken anchor ${slug}: ${match[1]}`);
      }
    }
  }
  pass('All links, image references and local fragments resolve across 9 pages');

  const consoleErrors=[];
  for (const width of [320,390,768,1024,1440]) {
    const page = await browser.newPage({viewport:{width,height:width>800?1000:844},colorScheme:'light',reducedMotion:'reduce'});
    page.on('pageerror',e=>consoleErrors.push(e.message));
    for (const slug of pages) {
      const response=await page.goto(base+slug+'.html');
      assert.equal(response.status(),200);
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('h1').count(),1,`${slug} requires one H1`);
      const diagnostics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,duplicates:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,ids)=>ids.indexOf(id)!==i),brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
      assert.equal(diagnostics.overflow,false,`${slug} overflows at ${width}px`);
      assert.deepEqual(diagnostics.duplicates,[],`${slug} duplicate ids`);
      assert.deepEqual(diagnostics.brokenImages,[],`${slug} broken images`);
      if (slug!=='index' && [390,1440].includes(width)) {
        await page.evaluate(async()=>{await Promise.all([...document.images].map(async img=>{img.loading='eager';await img.decode();}));});
        await page.screenshot({path:fileURLToPath(new URL(`qa/pages/${slug}-${width}.png`,root)),fullPage:true});
        if(['garaze','usluge','kontakt'].includes(slug)) await page.screenshot({path:fileURLToPath(new URL(`qa/pages/${slug}-${width}-hero.png`,root))});
      }
    }
    pass(`All 9 pages at ${width}px: one H1, no overflow, no duplicate ids or broken images`);
    await page.close();
  }
  assert.deepEqual(consoleErrors,[],'JavaScript errors');

  const dark=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'dark',reducedMotion:'reduce'});
  for(const slug of pages.slice(1)){
    await dark.goto(base+slug+'.html');
    await dark.screenshot({path:fileURLToPath(new URL(`qa/pages/${slug}-dark.png`,root))});
  }
  await dark.close(); pass('Dark theme rendered for all 8 new pages');

  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  for(const slug of pages.slice(1)){
    await page.goto(base+slug+'.html');
    await page.getByRole('button',{name:'Otvori meni'}).click();
    assert.equal(await page.locator('#mobile-nav').isVisible(),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#mobile-nav').isVisible(),false);
    assert.equal(await page.locator('.desktop-nav [aria-current="page"], .header-contact[aria-current="page"]').count(),1);
  }
  pass('Mobile menu and active navigation work on every new page');

  await page.goto(base+'radovi.html');
  await page.locator('[data-gallery-filter="real"]').click();
  assert.equal(await page.locator('[data-gallery-kind]:visible').count(),1);
  await page.locator('[data-gallery-filter="concept"]').click();
  assert.equal(await page.locator('[data-gallery-kind]:visible').count(),6);
  await page.locator('[data-gallery-filter="garaze"]').click();
  assert.equal(await page.locator('[data-gallery-kind]:visible').count(),4);
  assert.equal(await page.locator('[data-gallery-kind]:visible:not([data-gallery-category="garaze"])').count(),0);
  await page.locator('[data-gallery-filter="all"]').click();
  assert.equal(await page.locator('[data-gallery-kind]:visible').count(),7);
  for(const name of ['Drvene baštice','Nadstrešnice','Letnjikovci','Garaže','Grafitna garaža','Garaža sa drvetom','Dupla garaža']){
    const button=page.getByRole('button',{name:'Uvećaj: '+name,exact:true});
    const expected=await button.getAttribute('data-gallery-src');
    await button.click();
    assert.equal(await page.locator('#gallery-dialog').isVisible(),true);
    assert.equal(await page.locator('#gallery-dialog img').getAttribute('src'),expected);
    await page.locator('#gallery-dialog img').evaluate(image=>image.decode());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#gallery-dialog').isVisible(),false);
  }
  pass('Gallery filters and all seven enlarged photographs work');

  await page.goto(base+'garaze.html');
  assert.equal(await page.locator('.garage-concept-grid [data-open-gallery]').count(),3);
  for (const name of ['Grafitna garaža','Garaža sa drvetom','Dupla garaža']) {
    const button=page.getByRole('button',{name:'Uvećaj: '+name,exact:true});
    const expected=await button.getAttribute('data-gallery-src');
    await button.click();
    assert.equal(await page.locator('#gallery-dialog').isVisible(),true);
    assert.equal(await page.locator('#gallery-dialog img').getAttribute('src'),expected);
    await page.locator('#gallery-dialog img').evaluate(image=>image.decode());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#gallery-dialog').isVisible(),false);
  }
  pass('All three garage concepts open their correct photographs on the garage page');


  for(const [slug,name] of Object.entries({nadstresnice:'Nadstrešnica',letnjikovci:'Letnjikovac',garaze:'Garaža',bastice:'Drvena baštica'})){
    await page.goto(base+slug+'.html');
    await page.getByRole('link',{name:'Zatražite predlog'}).click();
    // The deferred script preselects the service; read the form only after the page has loaded.
    await page.waitForURL(/kontakt\.html\?usluga=/);
    assert.equal(await page.locator('#project-type').inputValue(),name);
    await page.locator('#client-name').fill('Milica');
    await page.locator('#project-location').fill('Novi Sad');
    await page.locator('.form-submit').click();
    assert.equal(await page.locator('#message-dialog').isVisible(),true);
    const text=await page.locator('#message-preview').textContent();
    assert(text.includes(name));
    const destination=new URL(await page.locator('#whatsapp-link').getAttribute('href'));
    assert.equal(destination.searchParams.get('text'),text);
    await page.keyboard.press('Escape');
  }
  pass('All four service-to-contact flows preserve the choice and prepare a valid message');

  await page.goto(new URL('garaze.html',root).href);
  await page.getByRole('link',{name:'Zatražite predlog'}).click();
  await page.waitForURL(/kontakt\.html\?usluga=/);
  assert.equal(await page.locator('#project-type').inputValue(),'Garaža');
  pass('Navigation and service selection also work directly with file://');
  await page.close();
}finally{
  await browser.close();
  await writeFile(new URL('qa/pages/results.json',root),JSON.stringify(results,null,2));
}
