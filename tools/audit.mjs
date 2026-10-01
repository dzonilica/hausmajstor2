import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

await mkdir(new URL('../qa/', import.meta.url), {recursive:true});
await mkdir(new URL('../qa/lighthouse-profile/', import.meta.url), {recursive:true});
const route = process.argv[2] || '';
if (!/^(?:[a-z-]+\.html)?$/.test(route)) throw new Error('Expected a local HTML filename.');
const outputName = route ? `lighthouse-${route.replace('.html','')}` : 'lighthouse';
const chrome = await launch({chromePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',userDataDir:fileURLToPath(new URL('../qa/lighthouse-profile/',import.meta.url)),chromeFlags:['--headless','--no-first-run']});
try {
  const result = await lighthouse('http://127.0.0.1:4173/'+route, {port:chrome.port,output:['html','json'],onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
  await writeFile(new URL(`../qa/${outputName}.html`,import.meta.url),result.report[0]);
  await writeFile(new URL(`../qa/${outputName}.json`,import.meta.url),result.report[1]);
  console.log(JSON.stringify({scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([key,value])=>[key,value.score*100])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(key=>[key,result.lhr.audits[key].displayValue])),issues:Object.values(result.lhr.audits).filter(a=>a.score!==null && a.score<1).map(a=>({id:a.id,title:a.title}))},null,2));
} finally {await chrome.kill();}
