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
- `radovi.html`: sedam fotografija sa filterima za izvedene radove, idejna rešenja i garaže.
- `kontakt.html`: kontakt i priprema WhatsApp upita.

Navigacija, podnožje i linkovi na početnoj vode ka novim stranicama. Linkovi sa stranica usluga prenose izabranu uslugu u kontakt formu. Sve radi i kada se HTML fajl otvori direktno.

`npm run pages` ponovo generiše osam podstranica iz `tools/build-pages.mjs`. Skice izrade, ikone usluga i spoj grede nastaju u `tools/build-drawings.mjs` iz jednostavne 3D geometrije (mere u metrima), zajedno sa redosledom i trajanjem svake linije; posle izmene pokrenite `npm run pages`. Tekstovi tih podstranica održavaju se u tom fajlu, a zajedničko zaglavlje, podnožje i obrazac preuzimaju se iz početne strane. Generisani HTML fajlovi već su spremni za korišćenje.

`npm run pages -- --inner-only` regeneriše samo podstranice i ne upisuje početnu stranu.

## Šta je uključeno

- Mobilni meni, izbor četiri usluge, galerija sa uvećanjem i česta pitanja.
- Interaktivna prezentacija tri moderne garaže na početnoj, uz izbor fotografije, opis i uvećanje. Fotografije se prvo učitavaju pa zatim smenjuju; brzi klikovi ne mogu da vrate prethodni izbor.
- Animirani ulazak naslova, diskretna dubina hero fotografije pri skrolovanju, otkrivanje garaže, postepeni ulazak koraka izrade i animirani filteri galerije. Nema automatskog listanja; poštuje se i promena podešavanja za smanjeno kretanje tokom posete.
- Kretanje je namerno smireno: jedna kriva ubrzanja i ponovljen motiv „iscrtane linije”. Usluge na početnoj se otvaraju i zatvaraju glatko, plus prelazi u minus, linija označava aktivnu uslugu, a nova fotografija se pretapa i blago smešta u okvir. Fotografije se pri skrolovanju otvaraju odozdo nagore, kao vrata garaže, tek kada se učitaju. Na podstranicama se naslov podiže red po red, fotografija se otvara, a linije opcija, vrednosti i pripreme iscrtavaju se pre teksta. Česta pitanja se glatko otvaraju. Bez JavaScript-a ili uz smanjeno kretanje sve je odmah u konačnom stanju.
- Animirane skice izrade u sekciji „Od prve ideje do vašeg dvorišta”. Svaka usluga ima svoju linijsku skicu u kodu (SVG, bez slika): nadstrešnicu, letnjikovac, garažu i baštice. Kada koraci uđu u kadar, skica se gradi jednom, u četiri faze koje prate korake: merenje sa kotama, isprekidan predlog, konstrukcija i gotov prostor sa detaljima. Linija i broj odgovarajućeg koraka pale se istovremeno. Početna i stranica Nadstrešnice prikazuju nadstrešnicu, Šta pravimo letnjikovac, a Naš pristup baštice. Bez JavaScript-a i uz smanjeno kretanje skica je odmah završena.
- Ikone usluga ispod hero dela: u traci Nadstrešnice · Letnjikovci · Garaže · Drvene baštice svaka usluga ima malu linijsku ikonu koja se iscrta posle dolaska trake. Na prelaz mišem ili fokus letvice nadstrešnice prođu talasom, krov letnjikovca se podigne i spusti, vrata garaže se podignu i otkriju automobil, a u bašticama niknu biljke. Na najužim ekranima ikona stoji iznad naziva.
- Spoj grede i stuba u sekciji „Lepo na pogled. Dobro napravljeno.”: tehnička skica u rastavljenom prikazu koja se sklapa uz skrolovanje. Greda se spusti, kosnik uđe na mesto, metalni nosač prilazi, a vijci se uvrću duž isprekidanih putanja. Kada je spoj sklopljen, pojave se nazivi delova. Bez JavaScript-a i uz smanjeno kretanje spoj je odmah sklopljen i obeležen.
- Forma priprema poruku i prikazuje pregled. Tek izborom „Otvori WhatsApp” posetilac otvara aplikaciju i sam šalje poruku. Forma nema backend i ne čuva podatke.
- Direktni poziv i Viber vode na postojeći broj 061 666 9378.
- Lokalni Manrope font, optimizovane AVIF/WebP slike, postojeća svetla paleta i podrška za smanjenu animaciju.

## Vizuali

Hero i detalj drveta generisani su ugrađenim ImageGen alatom i označeni kao idejne vizualizacije. Postojeća fotografija baštica predstavlja stvarni rad. Generisani originali su sačuvani uz optimizovane verzije. Prompts i poreklo slika su u `assets/IMAGE-SOURCES.md`.

Za nove stranice dodata su još dva ImageGen vizuala: garaža i samostalni letnjikovac. Originali i WebP slike su u `assets`; promptovi i precizne putanje nalaze se u `assets/ADDITIONAL-IMAGE-SOURCES.md`.

Tri dodatna koncepta modernih garaža koriste `assets/garaza-grafit.webp`, `assets/garaza-drvo.webp` i `assets/garaza-dupla.webp`. Svaki ima originalni PNG i manju WebP verziju. Generisani su ugrađenim ImageGen alatom i označeni kao idejne vizualizacije. Opisi promptova i poreklo nalaze se u `assets/GARAGE-IMAGE-SOURCES.md`.

## Dizajn

Nova vizuelna celina: arhitektonski, čist i premium stil. Grafitna tipografija, svetla neutralna osnova, šumskozelena akcent boja i fotografija u glavnoj ulozi. Native HTML/CSS/JS izabrani su da se sajt otvara direktno iz foldera. DESIGN_VARIANCE: 7; MOTION_INTENSITY: 6; VISUAL_DENSITY: 3. Animacije služe redosledu čitanja i povratnoj informaciji pri interakciji.

## Provera

Razvojni alati su navedeni u `package.json`. `npm run check` proverava prelom na više širina, učitavanje resursa, meni, galeriju, FAQ, izbor usluge i pripremu poruke. Ne šalje poruke niti poziva kontakt broj. Rezultati i snimci su lokalno u folderu `qa`.

`npm run check:pages` proverava svih devet stranica na širinama 320, 390, 768, 1024 i 1440 px, lokalne linkove, resurse, navigaciju, galeriju i prelazak sa usluge na kontakt. Snimci svetle i tamne teme i rezultat nalaze se u `qa/pages`. Za Lighthouse pojedinačne strane: `npm run audit -- garaze.html`.

`npm run check:presentation` proverava skice izrade (pravi objekat na svakoj stranici, izgradnja tek kada su koraci u kadru, završen crtež uz smanjeno kretanje i bez JavaScript-a), ikone usluga (iscrtavanje i otvaranje vrata garaže), sklapanje spoja uz skrolovanje, izbor garaža tastaturom, fokus u galeriji, brze uzastopne izbore uz sporo učitavanje, neuspešno učitavanje i oporavak, promenu reduced-motion podešavanja i prikaz bez JavaScript-a. Rezultati su u `qa/presentation-results.json`. Za sve provere prethodno pokrenite `npm start`.

Za javnu adresu postavite apsolutni `og:image` URL prema izabranom domenu. Node server u `tools` namenjen je lokalnom pregledu.

Završna lokalna mobilna Lighthouse provera posle dodavanja garaža i animacija: performanse 94, pristupačnost 100, dobre prakse 100, SEO 100. LCP 2,3 s, CLS 0, TBT 220 ms. Rezultati su laboratorijsko merenje lokalnog sajta; zavise od uređaja i hostinga. Izveštaj je u `qa/lighthouse.html`.

Logo koristi optimizovanu WebP masku `assets/hausmajstor-logo-mask.webp` (41 KB umesto 350 KB). Izgled i originalni PNG su sačuvani. U ovom okruženju završno Lighthouse merenje pokrenuto je preko `qa/audit-presentation.mjs`, sa privremenim Playwright pregledačem, jer standardni Chrome launcher nije uspeo da uspostavi vezu.
