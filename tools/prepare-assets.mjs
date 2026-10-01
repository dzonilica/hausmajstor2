import sharp from 'sharp';
import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const assets = new URL('../assets/', import.meta.url);
const file = name => fileURLToPath(new URL(name, assets));
await Promise.all([
  sharp(file('hero-pergola-original.png')).resize({width:1600,withoutEnlargement:true}).webp({quality:76,effort:6}).toFile(file('hero-pergola.webp')),
  sharp(file('hero-pergola-original.png')).resize({width:960,withoutEnlargement:true}).webp({quality:73,effort:6}).toFile(file('hero-pergola-small.webp')),
  sharp(file('hero-pergola-original.png')).resize({width:1600,withoutEnlargement:true}).avif({quality:52,effort:6}).toFile(file('hero-pergola.avif')),
  sharp(file('hero-pergola-original.png')).resize({width:960,withoutEnlargement:true}).avif({quality:48,effort:6}).toFile(file('hero-pergola-small.avif')),
  sharp(file('detalj-drveta-original.png')).resize({width:1100,withoutEnlargement:true}).webp({quality:76,effort:6}).toFile(file('detalj-drveta.webp')),
  sharp(file('bastice-original.jpg')).resize({width:1000,withoutEnlargement:true}).webp({quality:76,effort:6}).toFile(file('bastice.webp')),
  sharp(file('garaza-original.png')).resize({width:1200,withoutEnlargement:true}).webp({quality:77,effort:6}).toFile(file('garaza.webp')),
  sharp(file('letnjikovac-original.png')).resize({width:1200,withoutEnlargement:true}).webp({quality:77,effort:6}).toFile(file('letnjikovac.webp')),
  copyFile(new URL('../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',import.meta.url),file('manrope-latin.woff2')),
  copyFile(new URL('../node_modules/@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2',import.meta.url),file('manrope-latin-ext.woff2')),
  copyFile(new URL('../node_modules/@fontsource-variable/manrope/LICENSE',import.meta.url),file('FONT-LICENSE.txt'))
]);
console.log('Web assets ready.');
