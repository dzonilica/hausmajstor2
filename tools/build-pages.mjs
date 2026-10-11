import { readFile, writeFile } from 'node:fs/promises';
import { argv } from 'node:process';
import { buildDrawing, shortcutIcon, jointDrawing } from './build-drawings.mjs';

const root = new URL('../', import.meta.url);
const arrow = '<span aria-hidden="true">↗</span>';
// Multi-line page titles are split so each line can rise into view like the homepage headline.
const lines = title => title.split('<br>').map((line, index, all) => `<span class="hero-line"><span>${line}${index < all.length - 1 ? ' ' : ''}</span></span>`).join('');
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

const services = [
  {
    slug:'nadstresnice', name:'Nadstrešnice', singular:'Nadstrešnica', title:'Hlad koji<br>pripada domu.',
    intro:'Natkrijte terasu, ulaz ili parking. Po meri prostora, sa materijalima koji se uklapaju uz vaš dom.',
    description:'Nadstrešnice od drveta i metala po meri. Rešenja za terase, ulaze i parking, od dogovora i merenja do montaže.',
    image:'hero-pergola.webp', caption:'Idejno rešenje natkrivene terase.', alt:'Idejna vizualizacija nadstrešnice od drveta i čelika uz kuću', position:'65% center',
    heading:'Više prostora za svakodnevicu.', body:'Dobra nadstrešnica povezuje kuću i dvorište. Počinjemo od toga kako koristite prostor, gde su prolazi i odakle dolaze sunce i kiša.',
    choices:[['Terasa za svaki dan','Za sto, jutarnju kafu i druženje na otvorenom.'],['Zaštićen ulaz','Zaklon iznad vrata i pristup koji ostaje slobodan.'],['Natkriven parking','Prostor prilagođen vozilu i načinu ulaska.'],['Drvo ili metal','Izbor konstrukcije i završne obrade prema objektu.']],
    prepare:['Fotografija objekta i mesta za nadstrešnicu.','Približna širina, dubina i željena visina.','Podatak o postojećoj podlozi i pristupu prostoru.','Primer izgleda ili materijala koji vam se dopada.'],
    faqs:[['Može li nadstrešnica da bude samostalna?','Možemo da razmotrimo samostalnu konstrukciju ili rešenje uz postojeći objekat. Izbor zavisi od položaja, oslonaca i prostora koji treba natkriti.'],['Kako biramo materijal?','Upoređujemo željeni izgled, način korišćenja i održavanje. Drvo daje prirodnu teksturu, a metal omogućava drugačiji izraz konstrukcije. Konačan izbor pravimo zajedno.'],['Da li pripremate i predlog dimenzija?','Da. Vaše okvirne mere su dobar početak, a detalje usklađujemo nakon provere prostora i dogovora o nameni.'],['Šta utiče na cenu?','Dimenzije, konstrukcija, krovni pokrivač, završna obrada i uslovi montaže. Ponudu pripremamo za konkretan projekat.']]
  },
  {
    slug:'letnjikovci', name:'Letnjikovci', singular:'Letnjikovac', title:'Više života<br>na otvorenom.',
    intro:'Vaše mesto za duga popodneva i drage ljude. Drveni letnjikovac osmišljen za ritam vašeg dvorišta.',
    description:'Drveni letnjikovci i altani po meri vašeg dvorišta. Dogovor o obliku, dimenzijama, materijalima i montaži.',
    image:'letnjikovac.webp', caption:'Idejno rešenje samostalnog drvenog letnjikovca.', alt:'Idejna vizualizacija drvenog letnjikovca sa stolom i stolicama u vrtu', position:'center',
    heading:'Novo omiljeno mesto okupljanja.',body:'Letnjikovac može biti miran kutak ili središte dvorišta. Oblik i položaj biramo tako da ostane dovoljno mesta za sedenje, kretanje i pogled na zelenilo.',
    choices:[['Za porodični sto','Dimenzije planiramo prema broju mesta i prolazima.'],['Otvoren prema vrtu','Stubovi i raspored prate pogled i kretanje kroz dvorište.'],['Prirodno drvo','Tekstura, ton i zaštita drveta dogovaraju se unapred.'],['Detalji po želji','Mogućnosti ograda i bočnih ispuna razmatramo uz predlog.']],
    prepare:['Fotografija dela dvorišta gde želite letnjikovac.','Broj ljudi koji bi ga najčešće koristili.','Približne dimenzije stola i raspoloživog prostora.','Želje u vezi sa ogradom, bojom i otvorenošću.'],
    faqs:[['Kako odrediti veličinu letnjikovca?','Počinjemo od stola, broja stolica i potrebnih prolaza. Važno je da prostor bude prijatan i kada svi sede za stolom.'],['Može li izgled da se uklopi sa kućom?','Da. Oblik krova, ton drveta i jednostavnost detalja možemo uskladiti sa postojećim objektom i dvorištem.'],['Da li podloga treba da bude spremna?','Stanje i pripremu podloge definišemo pre izrade. Pošaljite fotografiju, a potrebne radove i njihov obim dogovaramo za vaš prostor.'],['Kako se drvo održava?','Održavanje zavisi od vrste drveta, izabrane zaštite i izloženosti vremenu. Pri predaji dobijate preporuke za konkretan materijal i završnu obradu.']]
  },
  {
    slug:'garaze',name:'Garaže',singular:'Garaža',title:'Pravi prostor.<br>Siguran zaklon.',
    intro:'Montažna garaža ili pomoćni objekat. Praktično rešenje koje prati vaš automobil, stvari i raspoloživ prostor.',
    description:'Montažne garaže i pomoćni objekti po meri. Planiranje dimenzija, metalne konstrukcije, obloge i pristupa za montažu.',
    image:'garaza.webp',caption:'Idejni prikaz montažne garaže.',alt:'Idejna vizualizacija kompaktne garaže sa grafitnom metalnom oblogom',position:'center',
    heading:'Mesto za više od automobila.',body:'Dobar raspored pravi razliku. Razmatramo prostor za otvaranje vrata, pristup vozilu i stvari koje želite da odložite, pa tek onda određujemo konačne mere.',
    choices:[['Prostor za vozilo','Širina i dubina prema automobilu i svakodnevnom korišćenju.'],['Dodatno odlaganje','Mesto za bicikle, alat ili sezonsku opremu.'],['Metalna konstrukcija','Konstrukcija i obloga usklađene sa namenom objekta.'],['Pristup i otvaranje','Položaj ulaza i način otvaranja dogovaramo prema prilazu.']],
    prepare:['Fotografija prilaza i mesta na kom će biti garaža.','Približne mere parcele i prostora za objekat.','Dimenzije vozila i potrebe za dodatnim odlaganjem.','Informacija o postojećoj podlozi i željenom ulazu.'],
    faqs:[['Da li garaža može da ima dodatni prostor za alat?','Može se planirati raspored sa delom za odlaganje. Potrebno je unapred navesti šta želite da smestite i koliko prostora za to imate.'],['Da li priprema podloge ulazi u cenu?','Obim ponude zavisi od stanja terena i dogovora. Pripremu podloge posebno definišemo pre početka, tako da znate šta je uključeno.'],['Koji tip vrata je moguć?','Mogućnosti razmatramo prema dimenzijama otvora, konstrukciji, raspoloživom prostoru i dobavljivoj opremi. Izbor i obuhvat ugradnje ulaze u konkretan dogovor.'],['Da li pravite i pomoćne objekte?','Razmatramo i pomoćne objekte za odlaganje, u skladu sa namenom i raspoloživim prostorom. Pošaljite osnovne mere i opis onoga što vam je potrebno.']]
  },
  {
    slug:'bastice',name:'Drvene baštice',singular:'Drvena baštica',title:'Vaša mala<br>zelena oaza.',
    intro:'Povrće, začinsko bilje ili cveće. Uzdignute drvene leje koje unose red u dvorište i zadovoljstvo u svakodnevicu.',
    description:'Uzdignute drvene baštice po meri za povrće, začinsko bilje i cveće. Dimenzije, raspored i zaštita drveta prema vašem prostoru.',
    image:'bastice.webp',caption:'Izvedeni rad: drvene baštice po meri.',alt:'Tri izrađene drvene baštice raspoređene na šljunkovitoj podlozi',position:'center top',real:true,
    heading:'Uredan vrt. Više uživanja.',body:'Povišene leje jasno odvajaju prostor za sadnju. Biramo dimenzije koje vam odgovaraju, uz dovoljno mesta da priđete biljkama i krećete se između baštica.',
    choices:[['Povrtnjak','Jedna leja ili niz baštica za ono što volite da uzgajate.'],['Začinsko bilje','Praktičan mali vrt blizu kuhinje ili terase.'],['Cvetne celine','Drveni okvir za boje i zelenilo u dvorištu.'],['Dimenzije po meri','Širina, dužina i visina prema prostoru i načinu korišćenja.']],
    prepare:['Približne mere mesta za jednu ili više baštica.','Fotografija podloge i prilaza prostoru.','Željena visina i namena baštica.','Broj leja i raspored koji zamišljate.'],
    faqs:[['Mogu li da naručim samo jednu bašticu?','Možemo da razmotrimo jednu bašticu ili više komada u istom stilu. Navedite dimenzije i mesto na kom biste je postavili.'],['Da li su zemlja i sadnice uključene?','Osnovni dogovor odnosi se na izradu drvene baštice. Zemlju, sadnice, dostavu i postavljanje treba posebno definisati u ponudi.'],['Kako se bira visina?','Prema načinu na koji želite da obrađujete leju i prostoru u kom će stajati. U razgovoru upoređujemo vaše potrebe sa dimenzijama baštice.'],['Kako je drvo zaštićeno?','Vrstu drveta, zaštitu i detalje unutrašnjeg sloja dogovaramo prema planiranoj nameni. Dajemo i preporuke za održavanje.']]
  }
];

const garageConcepts = [
  {
    "slug": "garaze",
    "name": "Grafitna garaža",
    "image": "garaza-grafit.webp",
    "smallImage": "garaza-grafit-small.webp",
    "width": 1536,
    "height": 1024,
    "alt": "Idejna vizualizacija moderne grafitne garaže sa ravnim krovom, drvenim detaljima i osvetljenim prilazom",
    "caption": "Idejna vizualizacija: grafitna garaža sa čistim linijama i toplim drvenim detaljima.",
    "position": "center"
  },
  {
    "slug": "garaze",
    "name": "Garaža sa drvetom",
    "image": "garaza-drvo.webp",
    "smallImage": "garaza-drvo-small.webp",
    "width": 1536,
    "height": 1024,
    "alt": "Idejna vizualizacija savremene garaže sa fasadom od drvenih letvica i tamnim garažnim vratima",
    "caption": "Idejna vizualizacija: garaža sa drvenom oblogom, uklopljena u zeleno dvorište.",
    "position": "center"
  },
  {
    "slug": "garaze",
    "name": "Dupla garaža",
    "image": "garaza-dupla.webp",
    "smallImage": "garaza-dupla-small.webp",
    "width": 1536,
    "height": 1024,
    "alt": "Idejna vizualizacija moderne duple garaže sa dva odvojena ulaza i ravnim krovom",
    "caption": "Idejna vizualizacija: dupla garaža sa dva ulaza i dodatnim prostorom.",
    "position": "center"
  }
];
const originalGarage = { ...services[2] };
Object.assign(services[2], {
  image: garageConcepts[0].image,
  smallImage: garageConcepts[0].smallImage,
  width: 1536,
  height: 1024,
  alt: garageConcepts[0].alt,
  caption: garageConcepts[0].caption
});

let home = await readFile(new URL('index.html',root),'utf8');
let homeHeader = home.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
const navRoutes = {usluge:'usluge.html',pristup:'o-nama.html',radovi:'radovi.html',kontakt:'kontakt.html'};
for (const [id,url] of Object.entries(navRoutes)) homeHeader = homeHeader.replaceAll(`href="#${id}"`,`href="${url}"`);
home = home.replace(/<header class="site-header">[\s\S]*?<\/header>/,homeHeader);
for (const service of services) {
  home = home.replace(`href="#usluge" data-select-service="${service.slug}"`,`href="${service.slug}.html"`);
  const oldLabel = {nadstresnice:'Razgovarajmo o nadstrešnici',letnjikovci:'Razgovarajmo o letnjikovcu',garaze:'Razgovarajmo o garaži',bastice:'Razgovarajmo o bašticama'}[service.slug];
  const newLabel = {nadstresnice:'Više o nadstrešnicama',letnjikovci:'Više o letnjikovcima',garaze:'Više o garažama',bastice:'Više o bašticama'}[service.slug];
  home = home.replace(`href="#kontakt" data-inquiry="${service.singular}">${oldLabel}`,`href="${service.slug}.html">${newLabel}`);
}
home = home.replace('href="#usluge">Istražite mogućnosti','href="usluge.html">Istražite mogućnosti');
home = home.replace('href="#pristup">Upoznajte naš način rada','href="o-nama.html">Upoznajte naš način rada');
home = home.replace('Jedan od naših radova, spreman za nove sezone.</p></div>','Jedan od naših radova, spreman za nove sezone.</p><a class="text-link heading-link" href="radovi.html">Svi radovi i ideje '+arrow+'</a></div>');

const directory = `<div class="footer-directory"><div><p>Istražite</p><a href="index.html">Početna</a><a href="usluge.html">Šta pravimo</a><a href="o-nama.html">Naš pristup</a><a href="radovi.html">Radovi i ideje</a></div><div><p>Izrada po meri</p>${services.map(s=>`<a href="${s.slug}.html">${s.name}</a>`).join('')}</div><div><p>Tu smo za vašu ideju.</p><a class="footer-phone" href="tel:+381616669378">061 666 9378 ${arrow}</a><a href="kontakt.html">Kontakt i upit ${arrow}</a><span>Srbija · dolazak na teren</span></div></div>`;
if (!home.includes('class="footer-directory"')) home = home.replace('<footer class="site-footer container">','<footer class="site-footer container">'+directory);
if (!home.includes('href="pages.css"')) home = home.replace('<link rel="stylesheet" href="styles.css">','<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="pages.css">');
// The process section opens with a construction sketch; each service page shows its own structure.
const processIntro = /(<section class="process section container"[^>]*>)\s*(?:<div class="process-intro">)?(<div class="section-heading" data-reveal><h2 id="process-title">[\s\S]*?<\/div>)(?:<figure class="build-drawing"[\s\S]*?<\/figure><\/div>)?/;
home = home.replace(processIntro,(_,open,heading)=>`${open}\n      <div class="process-intro">${heading}${buildDrawing('nadstresnice')}</div>`);
// Shortcuts under the hero carry a small drawing of each service; the craft section shows the joint.
home = home.replace(/<div class="service-shortcuts"[\s\S]*?<\/div>/,()=>`<div class="service-shortcuts" aria-label="Brzi izbor usluge" data-reveal>\n${services.map(s=>`      <a href="${s.slug}.html">${shortcutIcon(s.slug)}${s.name} ${arrow}</a>`).join('\n')}\n    </div>`);
home = home.replace(/(<div class="craft-principles">[\s\S]*?<\/div><\/div>)(?:<figure class="joint-drawing"[\s\S]*?<\/figure>)?(?=\s*<div class="signature">)/,(_,principles)=>principles+jointDrawing());
if (!argv.includes('--inner-only')) await writeFile(new URL('index.html',root),home);

const header = active => homeHeader.replaceAll('href="#pocetna"','href="index.html"').replaceAll(`href="${active}"`,`href="${active}" aria-current="page"`);
const footer = home.match(/<footer class="site-footer container">[\s\S]*?<\/footer>/)[0].replace('class="brand" href="#pocetna"','class="brand" href="index.html"').replace('class="back-top" href="#pocetna"','class="back-top" href="#sadrzaj"').replace('Hero i prikaz spoja su idejne vizualizacije.','Fotografije idejnih rešenja označene su u opisu.');
const messageDialog = home.match(/<dialog id="message-dialog"[\s\S]*?<\/dialog>/)[0];
const galleryDialog = home.match(/<dialog id="gallery-dialog"[\s\S]*?<\/dialog>/)[0].replace('aria-label="Fotografija drvenih baštica"','aria-label="Uvećana fotografija"');
const process = home.match(/<section class="process section container"[\s\S]*?<\/section>/)[0].replace('class="process section container"','class="process section container page-process" id="izrada"');
const processWith = slug => process.replace(/<figure class="build-drawing"[\s\S]*?<\/figure>/,()=>buildDrawing(slug));

function crumbs(label, service=false) {
  return `<nav class="breadcrumbs container" aria-label="Putanja stranice"><a href="index.html">Početna</a><span aria-hidden="true">/</span>${service?'<a href="usluge.html">Šta pravimo</a><span aria-hidden="true">/</span>':''}<span aria-current="page">${label}</span></nav>`;
}
function photo(service, eager=false) {
  const responsive = service.smallImage ? ` srcset="assets/${service.smallImage} 768w, assets/${service.image} 1536w" sizes="(max-width: 767px) calc(100vw - 40px), 50vw"` : '';
  return `<figure class="page-photo ${service.real?'page-photo-real':''}"><div class="page-photo-frame"><img src="assets/${service.image}"${responsive} alt="${service.alt}" width="${service.width || 1200}" height="${service.height || 900}" style="object-position:${service.position}" ${eager?'fetchpriority="high"':'loading="lazy"'}></div><figcaption>${service.caption}</figcaption></figure>`;
}
function portfolioCard(s, index=2, {sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1352px) calc(50vw - 74px), 602px", heading="h2", inquiry=false}={}) {
  const responsive = s.smallImage ? ` srcset="assets/${s.smallImage} 768w, assets/${s.image} 1536w" sizes="${sizes}"` : '';
  const link = inquiry ? `kontakt.html?usluga=${s.slug}` : `${s.slug}.html`;
  return `<article class="portfolio-item ${s.real?'portfolio-real':''}" data-gallery-kind="${s.real?'real':'concept'}" data-gallery-category="${s.slug}" data-reveal><button type="button" class="portfolio-image" data-open-gallery data-gallery-src="assets/${s.real?'bastice-original.jpg':s.image}" data-gallery-alt="${s.alt}" data-gallery-caption="${s.caption}" aria-label="Uvećaj: ${s.name}"><img src="assets/${s.smallImage || s.image}"${responsive} alt="${s.alt}" width="${s.width || 800}" height="${s.height || 600}" ${index<2?'fetchpriority="high"':'loading="lazy"'} decoding="async" style="object-position:${s.position}"></button><div class="portfolio-title"><div><p>${s.real?'IZVEDENI RAD':'IDEJNA VIZUALIZACIJA'}</p><${heading}>${s.name}</${heading}></div><a class="text-link" href="${link}">${inquiry?'Vaša ideja':'O usluzi'} ${arrow}</a></div></article>`;
}
function garageIdeas() {
  return `<section class="garage-concepts section container" id="garaze-ideje" aria-labelledby="garage-concepts-title"><div class="section-heading" data-reveal><p class="eyebrow">TRI IDEJE ZA NOVI PROSTOR</p><h2 id="garage-concepts-title">Tri stila. Vaša garaža.</h2><p>Grafit, prirodno drvo ili prostor za dva automobila. Idejne vizualizacije kao polazna tačka za vašu garažu po meri.</p></div><div class="garage-concept-grid portfolio-grid">${garageConcepts.map(s=>portfolioCard(s,2,{sizes:"(max-width: 767px) calc(100vw - 40px), (max-width: 1352px) calc(33.333vw - 61px), 390px",heading:"h3",inquiry:true})).join('')}</div></section>`;
}
function questions(items, title='Pre nego što počnemo.') {
  return `<section class="faq section container page-faq"><h2 data-reveal>${title}</h2><div class="faq-list" data-reveal>${items.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></section>`;
}
function contactBand(title='Hajde da razradimo vašu ideju.',slug='') {
  return `<section class="page-contact-band"><div class="container"><h2 data-reveal>${title}</h2><a class="button button-green" data-reveal href="kontakt.html${slug?'?usluga='+slug:''}">Razgovarajmo ${arrow}</a></div></section>`;
}
function related(exclude) {
  const index = services.findIndex(s=>s.slug===exclude);
  const items = [services[(index+1)%4],services[(index+2)%4]];
  return `<section class="related section container"><h2 data-reveal>I još poneka mogućnost.</h2><div class="related-grid">${items.map(s=>`<a href="${s.slug}.html" class="related-item" data-reveal><span class="related-image"><img src="assets/${s.image}" alt="${s.alt}" width="560" height="320" loading="lazy"></span><div><h3>${s.name}</h3>${arrow}</div><p>${s.real?'Izvedeni rad':'Idejno rešenje'}</p></a>`).join('')}</div></section>`;
}
function documentPage({title,description,active,content,dialogs='',image='hero-pergola.webp',bodyClass=''}) {
  return `<!doctype html>
<html lang="sr-Latn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f8f9f7"><title>${esc(title)} | Haus Majstor Nemanja</title><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)} | Haus Majstor Nemanja"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="sr_RS"><meta property="og:image" content="assets/${image}"><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/manrope-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="assets/manrope-latin-ext.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="pages.css"><script src="app.js" defer></script></head>
<body class="inner-page ${bodyClass}"><a class="skip-link" href="#sadrzaj">Pređi na sadržaj</a>${header(active)}<main id="sadrzaj">${content}</main>${footer}${dialogs}</body></html>`;
}

for (const s of services) {
  const content = `${crumbs(s.name,true)}
    <section class="page-hero container" aria-labelledby="page-title"><div class="page-hero-copy"><h1 id="page-title">${lines(s.title)}</h1><p>${s.intro}</p><a class="button button-green" href="kontakt.html?usluga=${s.slug}">Zatražite predlog ${arrow}</a><a class="page-secondary-link" href="#izrada">Kako izgleda izrada <span aria-hidden="true">↓</span></a></div>${photo(s,true)}</section>
    <section class="service-options section container"><div class="section-heading" data-reveal><h2>${s.heading}</h2><p>${s.body}</p></div><div class="options-grid">${s.choices.map(([title,body])=>`<article data-reveal><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></section>
    <section class="prepare-section"><div class="container prepare-grid"><div data-reveal><h2>Počnimo od<br>vašeg prostora.</h2><p>Nije vam potreban gotov projekat. Za prvi razgovor dovoljno je nekoliko osnovnih informacija.</p></div><ul class="preparation-list" data-reveal>${s.prepare.map(line=>`<li>${line}</li>`).join('')}</ul></div></section>
    ${s.slug==='garaze'?garageIdeas():''}${processWith(s.slug)}${questions(s.faqs)}${contactBand('Vaš prostor. Vaše rešenje.',s.slug)}${related(s.slug)}`;
  await writeFile(new URL(`${s.slug}.html`,root),documentPage({title:s.name+' po meri',description:s.description,active:'usluge.html',content,image:s.image,bodyClass:'service-page',dialogs:s.slug==='garaze'?galleryDialog:''}));
}

const servicesContent = `${crumbs('Šta pravimo')}<section class="page-intro container"><h1>${lines('Pravljeno za<br>vaš način života.')}</h1><p>Od male baštice do novog prostora za okupljanje. Izaberite odakle počinjemo, a detalje ćemo oblikovati zajedno.</p></section><section class="service-catalog container" aria-label="Naše usluge">${services.map((s,i)=>`<article class="catalog-item" data-reveal><a class="catalog-image" href="${s.slug}.html" aria-label="${s.name}, pogledajte detalje"><img src="assets/${s.image}" alt="${s.alt}" width="800" height="650" ${i<2?'fetchpriority="high"':'loading="lazy"'} style="object-position:${s.position}"></a><p class="image-note">${s.real?'Fotografija izvedenog rada':'Idejna vizualizacija'}</p><div class="catalog-title"><h2><a href="${s.slug}.html">${s.name}</a></h2><a class="round-link" href="${s.slug}.html" aria-label="Saznajte više: ${s.name}">${arrow}</a></div><p>${s.intro}</p></article>`).join('')}</section><section class="service-help section container"><h2 data-reveal>Još tražite pravo rešenje?</h2><p data-reveal>Pošaljite fotografiju prostora i napišite kako biste želeli da ga koristite. To je dovoljno za prvi razgovor.</p><a class="text-link" data-reveal href="kontakt.html">Opišite nam svoju ideju ${arrow}</a></section>${processWith('letnjikovci')}`;
await writeFile(new URL('usluge.html',root),documentPage({title:'Šta pravimo',description:'Istražite nadstrešnice, letnjikovce, montažne garaže i drvene baštice po meri. Haus Majstor Nemanja.',active:'usluge.html',content:servicesContent}));

const aboutPhoto={image:'detalj-drveta.webp',alt:'Idejni detalj drvene grede i metalnog spoja',position:'35% center',caption:'Pažnja prema spoju počinje mnogo pre montaže. Idejna vizualizacija.'};
const aboutContent=`${crumbs('Naš pristup')}<section class="page-hero container"><div class="page-hero-copy"><h1>${lines('Vaša ideja.<br>Naš zanat.')}</h1><p>Ja sam Nemanja. Od prvog razgovora do montaže, vaš projekat ima svog majstora.</p><a class="button button-green" href="kontakt.html">Upoznajmo vaš projekat ${arrow}</a></div>${photo(aboutPhoto,true)}</section><section class="about-statement section container"><h2 data-reveal>Pravimo stvari<br>koje ćete koristiti.</h2><div data-reveal><p>Da je terasa prijatna za sedenje. Da se vrata garaže otvaraju bez smetnje. Da baštici možete da priđete sa svih strana.</p><p>Takvi detalji određuju kako prostor zaista funkcioniše. Zato prvo slušamo šta vam treba, zatim merimo i predlažemo rešenje.</p><p>Radimo sa drvetom i metalom. Biramo materijale i završnu obradu prema nameni, uz dogovor o izgledu, ceni i roku.</p></div></section><section class="values-section"><div class="container"><h2 data-reveal>Na čemu se zasniva naš rad.</h2><div class="values-grid"><article data-reveal><h3>Razgovor pre svega.</h3><p>Vaša ideja, navike i prostor usmeravaju projekat. Postavljamo pitanja pre nego što predložimo rešenje.</p></article><article data-reveal><h3>Svaki prostor ima svoju meru.</h3><p>Prilagođavamo dimenzije i detalje stvarnim uslovima na lokaciji.</p></article><article data-reveal><h3>Dogovor bez nejasnoća.</h3><p>Preciziramo obim posla, materijale, cenu i rok pre izrade.</p></article><article data-reveal><h3>Pažnja do poslednjeg spoja.</h3><p>Prolazimo kroz izvedene detalje i razgovaramo o održavanju vašeg novog prostora.</p></article></div></div></section>${processWith('bastice')}${contactBand('Dobar početak je jedan razgovor.')}<section class="about-work-link section container"><div data-reveal><h2>Pogledajte šta pravimo.</h2><p>Upoznajte usluge i pronađite ideju za svoje dvorište.</p></div><a class="text-link" data-reveal href="radovi.html">Radovi i ideje ${arrow}</a></section>`;
await writeFile(new URL('o-nama.html',root),documentPage({title:'Naš pristup',description:'Upoznajte Nemanju i način rada Haus Majstora. Pažljivo merenje, jasan dogovor i izrada za vaš prostor.',active:'o-nama.html',content:aboutContent,image:'detalj-drveta.webp'}));

const galleryItems = [services[3],services[0],services[1],originalGarage,...garageConcepts];
const worksContent = `${crumbs('Radovi i ideje')}<section class="page-intro container"><h1>${lines('Izrađeno rukama.<br>Zamišljeno za vas.')}</h1><p>Pogledajte izvedene baštice i idejna rešenja za vaše dvorište — od nadstrešnica do modernih garaža. Uz svaku fotografiju je označeno šta prikazuje.</p></section><section class="portfolio-section container" aria-label="Galerija"><div class="gallery-filters" role="group" aria-label="Prikažite fotografije"><button type="button" data-gallery-filter="all" aria-pressed="true">Sve fotografije</button><button type="button" data-gallery-filter="real" aria-pressed="false">Izvedeni radovi</button><button type="button" data-gallery-filter="concept" aria-pressed="false">Idejna rešenja</button><button type="button" data-gallery-filter="garaze" aria-pressed="false">Garaže</button></div><p id="gallery-status" class="sr-only" role="status" aria-live="polite">Broj prikazanih fotografija: ${galleryItems.length}.</p><div class="portfolio-grid">${galleryItems.map((s,i)=>portfolioCard(s,i)).join('')}</div></section>${contactBand('Prepoznajete nešto za svoje dvorište?')}`;
await writeFile(new URL('radovi.html',root),documentPage({title:'Radovi i ideje',description:'Fotografija izvedenih drvenih baštica i označene idejne vizualizacije nadstrešnica, letnjikovaca i garaža.',active:'radovi.html',content:worksContent,dialogs:galleryDialog,image:'bastice.webp'}));

const contactSection = home.match(/<section class="contact section"[\s\S]*?<\/section>/)[0].replace('class="contact section"','class="contact section standalone-contact"').replace('class="contact-copy" data-reveal','class="contact-copy"').replace('<h2 id="contact-title">Napravimo<br>nešto vaše.</h2>',`<h1 id="contact-title">${lines('Napravimo<br>nešto vaše.')}</h1>`);
const contactContent = `${crumbs('Kontakt')}${contactSection}<section class="contact-preparation section container"><div data-reveal><h2>Za lakši prvi razgovor.</h2><p>Ne morate znati sve odgovore. Fotografija prostora je često najbolji početak.</p></div><div class="contact-checklist"><article data-reveal><h3>Vaš prostor</h3><p>Lokacija, okvirne mere i fotografija iz nekoliko uglova.</p></article><article data-reveal><h3>Vaša ideja</h3><p>Šta želite da napravite i kako planirate da koristite prostor.</p></article><article data-reveal><h3>Vaše želje</h3><p>Omiljeni materijal, završna obrada ili primer koji vam se dopada.</p></article></div></section>`;
await writeFile(new URL('kontakt.html',root),documentPage({title:'Kontakt',description:'Javite se Haus Majstoru Nemanji na 061 666 9378 ili pripremite WhatsApp upit za vaš projekat. Srbija, dolazak na teren.',active:'kontakt.html',content:contactContent,dialogs:messageDialog,bodyClass:'contact-page'}));
console.log(argv.includes('--inner-only') ? 'Created 8 inner pages.' : 'Created 8 pages and connected the homepage navigation.');
