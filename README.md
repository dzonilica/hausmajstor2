# Haus Majstor Premium

Novi, samostalan sajt. Otvorite `index.html` dvoklikom. Za lokalni server: `npm start`, zatim http://127.0.0.1:4173.

Sajt radi bez obaveznog build procesa i bez mrežnih fontova ili biblioteka. Za objavljivanje su potrebni svi `.html` fajlovi iz ovog foldera, `styles.css`, `pages.css`, `app.js` i folder `assets`. Originalni sajt u nadređenom folderu nije menjan. Od njegovih fajlova preuzeta je samo fotografija `bastice.jpg`.

## Stranice

Sajt sada ima 9 povezanih stranica:

- `index.html`: početna.
- `usluge.html`: pregled svih usluga.
- `nadstresnice.html`: nadstrešnice po meri.
- `letnjikovci.html`: drveni letnjikovci.
- `garaze.html`: garaže i pomoćni objekti.
- `bastice.html`: drvene baštice.
- `o-nama.html`: Nemanja i način rada.
- `radovi.html`: galerija sa filterima za izvedene radove i idejna rešenja.
- `kontakt.html`: kontakt i priprema WhatsApp upita.

Navigacija, podnožje i linkovi na početnoj vode ka novim stranicama. Linkovi sa stranica usluga prenose izabranu uslugu u kontakt formu. Sve radi i kada se HTML fajl otvori direktno.

`npm run pages` ponovo generiše osam podstranica iz `tools/build-pages.mjs`. Tekstovi tih podstranica održavaju se u tom fajlu, a zajedničko zaglavlje, podnožje i obrazac preuzimaju se iz početne strane. Generisani HTML fajlovi već su spremni za korišćenje.

## Šta je uključeno

- Mobilni meni, izbor četiri usluge, galerija sa uvećanjem i česta pitanja.
- Forma priprema poruku i prikazuje pregled. Tek izborom „Otvori WhatsApp” posetilac otvara aplikaciju i sam šalje poruku. Forma nema backend i ne čuva podatke.
- Direktni poziv i Viber vode na postojeći broj 061 666 9378.
- Lokalni Manrope font, optimizovane AVIF/WebP slike, svetla/tamna tema prema podešavanju uređaja i podrška za smanjenu animaciju.

## Vizuali

Hero i detalj drveta generisani su ugrađenim ImageGen alatom i označeni kao idejne vizualizacije. Postojeća fotografija baštica predstavlja stvarni rad. Generisani originali su sačuvani uz optimizovane verzije. Prompts i poreklo slika su u `assets/IMAGE-SOURCES.md`.

Za nove stranice dodata su još dva ImageGen vizuala: garaža i samostalni letnjikovac. Originali i WebP slike su u `assets`; promptovi i precizne putanje nalaze se u `assets/ADDITIONAL-IMAGE-SOURCES.md`.

## Dizajn

Nova vizuelna celina: arhitektonski, čist i premium stil. Grafitna tipografija, svetla neutralna osnova, šumskozelena akcent boja i fotografija u glavnoj ulozi. Native HTML/CSS/JS izabrani su da se sajt otvara direktno iz foldera. DESIGN_VARIANCE: 7; MOTION_INTENSITY: 4; VISUAL_DENSITY: 3. Animacije služe redosledu čitanja i povratnoj informaciji pri interakciji.

## Provera

Razvojni alati su navedeni u `package.json`. `npm run check` proverava prelom na više širina, učitavanje resursa, meni, galeriju, FAQ, izbor usluge i pripremu poruke. Ne šalje poruke niti poziva kontakt broj. Rezultati i snimci su lokalno u folderu `qa`.

`npm run check:pages` proverava svih devet stranica na širinama 320, 390, 768, 1024 i 1440 px, lokalne linkove, resurse, navigaciju, galeriju i prelazak sa usluge na kontakt. Snimci svetle i tamne teme i rezultat nalaze se u `qa/pages`. Za Lighthouse pojedinačne strane: `npm run audit -- garaze.html`.

Za javnu adresu postavite apsolutni `og:image` URL prema izabranom domenu. Node server u `tools` namenjen je lokalnom pregledu.

Lokalna mobilna Lighthouse provera: performanse 97, pristupačnost 100, dobre prakse 100, SEO 100. LCP 2,1 s, CLS 0, TBT 0 ms. Rezultati su laboratorijsko merenje lokalnog sajta; zavise od uređaja i hostinga. Izveštaj je u `qa/lighthouse.html`.
