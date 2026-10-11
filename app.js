'use strict';

const siteHeader = document.querySelector('.site-header');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
  const headerSentinel = document.createElement('span');
  headerSentinel.className = 'header-sentinel';
  headerSentinel.setAttribute('aria-hidden', 'true');
  document.body.prepend(headerSentinel);
  const headerObserver = new IntersectionObserver(([entry]) => {
    siteHeader?.classList.toggle('is-scrolled', entry.boundingClientRect.top < 0);
  });
  headerObserver.observe(headerSentinel);
} else {
  siteHeader?.classList.add('is-scrolled');
}

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const menuReducedMotion = motionPreference;
const desktopMenuViewport = window.matchMedia('(min-width: 901px)');
let menuCloseTimer;

function finishClosingMenu() {
  clearTimeout(menuCloseTimer);
  mobileNav.hidden = true;
  siteHeader.classList.remove('is-menu-open');
}

// Keep the panel and solid header visible until the closing transition finishes.
function setMenuOpen(open, immediate = false) {
  if (open === (menuToggle.getAttribute('aria-expanded') === 'true')) {
    if (!open && immediate) finishClosingMenu();
    return;
  }
  clearTimeout(menuCloseTimer);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  mobileNav.inert = !open;
  if (open) {
    mobileNav.hidden = false;
    siteHeader.classList.add('is-menu-open');
    // Establish the starting styles after removing hidden, including on rapid reopen.
    mobileNav.getBoundingClientRect();
    mobileNav.classList.add('is-visible');
  } else {
    mobileNav.classList.remove('is-visible');
    if (immediate || menuReducedMotion.matches) finishClosingMenu();
    else menuCloseTimer = setTimeout(finishClosingMenu, 400);
  }
}
function closeMenu(immediate = false) {
  setMenuOpen(false, immediate);
}

menuToggle.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileNav.querySelectorAll('a').forEach((link, index) => {
  link.style.setProperty('--menu-order', index);
  link.addEventListener('click', () => closeMenu());
});
mobileNav.addEventListener('transitionend', event => {
  if (event.target === mobileNav && event.propertyName === 'opacity' && menuToggle.getAttribute('aria-expanded') === 'false') finishClosingMenu();
});
menuReducedMotion.addEventListener('change', event => {
  if (event.matches && menuToggle.getAttribute('aria-expanded') === 'false') finishClosingMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
desktopMenuViewport.addEventListener('change', event => {
  if (event.matches) closeMenu(true);
});

const serviceVisuals = {
  nadstresnice: { image: 'assets/hero-pergola-small.webp', alt: 'Idejna vizualizacija natkrivene terase sa drvenim gredama i metalnim stubovima', caption: 'Nadstrešnica koja prirodno pripada vašem domu.', note: 'Idejna vizualizacija', position: '68% center' },
  letnjikovci: { image: 'assets/letnjikovac.webp', alt: 'Idejna vizualizacija samostalnog drvenog letnjikovca u vrtu', caption: 'Prostor za druženje i mirna popodneva.', note: 'Idejna vizualizacija', position: 'center' },
  garaze: { image: 'assets/garaza-grafit.webp', alt: 'Idejna vizualizacija grafitne garaže sa čeličnom oblogom', caption: 'Čiste linije. Prostor za automobil i dodatno odlaganje.', note: 'Idejna vizualizacija', position: 'center' },
  bastice: { image: 'assets/bastice.webp', alt: 'Naš rad: tri drvene baštice u dvorištu', caption: 'Uzdignute baštice od zaštićenog drveta.', note: 'Naš rad', position: 'center top' }
};
const serviceImage = document.querySelector('#service-image');
const serviceCaption = document.querySelector('#service-caption');

// Decode before swapping so the current image remains visible on a slow connection.
// Request tokens keep the most recent choice authoritative after rapid clicks.
const imageRequests = new WeakMap();
const runningAnimations = new Set();
function animateElement(element, keyframes, options) {
  if (motionPreference.matches || !element.animate) return;
  const animation = element.animate(keyframes, options);
  runningAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => runningAnimations.delete(animation));
  return animation;
}
motionPreference.addEventListener('change', event => {
  if (event.matches) runningAnimations.forEach(animation => animation.finish());
});
async function swapImage(image, visual) {
  const request = {};
  imageRequests.set(image, request);
  const incoming = new Image();
  if (visual.srcset) {
    incoming.sizes = image.sizes;
    incoming.srcset = visual.srcset;
  }
  incoming.src = visual.image;
  try {
    await incoming.decode();
  } catch (error) {
    if (imageRequests.get(image) !== request) return false;
    throw error;
  }
  if (imageRequests.get(image) !== request) return false;
  image.parentElement.querySelectorAll('.image-crossfade-out').forEach(old => old.remove());
  let outgoing;
  if (!motionPreference.matches && image.complete && image.naturalWidth && image.animate) {
    outgoing = image.cloneNode();
    outgoing.removeAttribute('id');
    outgoing.removeAttribute('srcset');
    outgoing.removeAttribute('sizes');
    outgoing.src = image.currentSrc || image.src;
    outgoing.alt = '';
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.className = 'image-crossfade-out';
    outgoing.style.objectPosition = getComputedStyle(image).objectPosition;
    image.parentElement.append(outgoing);
  }
  if (visual.srcset) image.srcset = visual.srcset;
  else image.removeAttribute('srcset');
  image.src = visual.image;
  image.alt = visual.alt;
  image.style.objectPosition = visual.position || 'center';
  if (outgoing) {
    const animation = animateElement(outgoing, [{ opacity: 1 }, { opacity: 0 }], { duration: 480, easing: 'ease-out' });
    if (animation) animation.finished.catch(() => {}).finally(() => outgoing.remove());
    else outgoing.remove();
    // The incoming photo settles into the frame while the previous one fades.
    animateElement(image, [{ scale: 1.035 }, { scale: 1 }], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
  return true;
}

// Panels change height smoothly; a reversed choice continues from the current height.
function setPanelOpen(panel, open) {
  if (panel.hidden === !open && !panel.getAnimations().length) return;
  const current = getComputedStyle(panel);
  const from = panel.hidden ? { height: 0, padding: 0, opacity: 0 } : { height: panel.getBoundingClientRect().height, padding: parseFloat(current.paddingBottom), opacity: Number(current.opacity) };
  panel.getAnimations().forEach(animation => animation.cancel());
  panel.hidden = false;
  if (motionPreference.matches || !panel.animate) {
    panel.hidden = !open;
    return;
  }
  const to = open ? { height: panel.getBoundingClientRect().height, padding: parseFloat(getComputedStyle(panel).paddingBottom), opacity: 1 } : { height: 0, padding: 0, opacity: 0 };
  panel.classList.add('is-animating');
  const animation = animateElement(panel, [
    { height: `${from.height}px`, paddingBottom: `${from.padding}px`, opacity: from.opacity },
    { height: `${to.height}px`, paddingBottom: `${to.padding}px`, opacity: to.opacity }
  ], { duration: open ? 520 : 360, easing: open ? 'cubic-bezier(.22,1,.36,1)' : 'cubic-bezier(.4,0,.2,1)' });
  animation.finished.then(() => {
    if (!open) panel.hidden = true;
  }).catch(() => {}).finally(() => {
    if (!panel.getAnimations().length) panel.classList.remove('is-animating');
  });
}

let serviceRequest = 0;
async function selectService(key) {
  const visual = serviceVisuals[key];
  if (!visual || !serviceImage || !serviceCaption) return;
  const request = ++serviceRequest;
  document.querySelectorAll('.service-item').forEach(item => {
    const active = item.dataset.service === key;
    item.classList.toggle('is-active', active);
    item.querySelector('.service-toggle').setAttribute('aria-expanded', String(active));
    setPanelOpen(item.querySelector('.service-description'), active);
  });
  try {
    if (!await swapImage(serviceImage, visual)) return;
    serviceImage.dataset.view = key;
    serviceImage.parentElement.classList.toggle('is-garden',key === 'bastice');
    serviceCaption.replaceChildren(document.createTextNode(visual.caption + ' '));
    const captionNote = document.createElement('span');
    captionNote.textContent = visual.note;
    serviceCaption.append(captionNote);
    animateElement(serviceCaption, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)' });
  } catch {
    if (request === serviceRequest) serviceCaption.textContent = 'Fotografija se nije učitala. Izaberite uslugu da pokušate ponovo.';
  }
}

document.querySelectorAll('.service-toggle').forEach(button => {
  button.addEventListener('click', () => selectService(button.closest('.service-item').dataset.service));
});
document.querySelectorAll('[data-select-service]').forEach(link => {
  link.addEventListener('click', () => selectService(link.dataset.selectService));
});
document.querySelectorAll('[data-inquiry]').forEach(link => {
  link.addEventListener('click', () => {
    const select = document.querySelector('#project-type');
    if (select && link.getAttribute('href').startsWith('#')) select.value = link.dataset.inquiry;
  });
});

const garageConcepts = {
  grafit: { title: 'Grafitna garaža', image: 'assets/garaza-grafit.webp', srcset: 'assets/garaza-grafit-small.webp 768w, assets/garaza-grafit.webp 1536w', alt: 'Idejna vizualizacija grafitne garaže sa čeličnom oblogom i sekcionim vratima', description: 'Sveden oblik, tamna čelična obloga i diskretno svetlo. Zaklon koji se prirodno uklapa uz savremenu kuću.' },
  drvo: { title: 'Garaža sa drvetom', image: 'assets/garaza-drvo.webp', srcset: 'assets/garaza-drvo-small.webp 768w, assets/garaza-drvo.webp 1536w', alt: 'Idejna vizualizacija garaže sa vertikalnom drvenom oblogom i grafitnim metalnim okvirom', description: 'Prirodna tekstura drveta u čvrstom metalnom okviru. Topao izgled i dodatni bočni ulaz za stvari koje koristite svakog dana.' },
  dupla: { title: 'Dupla garaža', image: 'assets/garaza-dupla.webp', srcset: 'assets/garaza-dupla-small.webp 768w, assets/garaza-dupla.webp 1536w', alt: 'Idejna vizualizacija duple garaže sa dva grafitna ulaza i toplim osvetljenjem u sumrak', description: 'Dva ulaza, jedna skladna celina. Više mesta za vozila i opremu, uz ravne linije i pažljivo postavljeno osvetljenje.' }
};
const garageShowcase = document.querySelector('[data-garage-showcase]');
if (garageShowcase) {
  const choices = [...garageShowcase.querySelectorAll('[data-garage]')];
  const presentation = garageShowcase.querySelector('#garage-presentation');
  const image = garageShowcase.querySelector('#garage-image');
  const stage = garageShowcase.querySelector('.garage-stage');
  const status = garageShowcase.querySelector('.garage-load-status');
  let selected = 'grafit';
  let latestRequest = 0;
  choices.forEach(button => button.addEventListener('click', async () => {
    const key = button.dataset.garage;
    const visual = garageConcepts[key];
    if (!visual) return;
    const request = ++latestRequest;
    presentation.setAttribute('aria-busy', 'true');
    status.textContent = '';
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    try {
      if (!await swapImage(image, visual)) return;
      selected = key;
      garageShowcase.querySelector('#garage-project-title').textContent = visual.title;
      garageShowcase.querySelector('#garage-project-description').textContent = visual.description;
      stage.dataset.gallerySrc = visual.image;
      stage.dataset.galleryAlt = visual.alt;
      stage.dataset.galleryCaption = `${visual.title}. Idejna vizualizacija.`;
      stage.setAttribute('aria-label', `Uvećaj: ${visual.title}`);
      const description = garageShowcase.querySelector('.garage-description');
      description.getAnimations().forEach(animation => animation.cancel());
      animateElement(description, [{ opacity: .25, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
    } catch {
      if (request !== latestRequest) return;
      status.textContent = 'Slika se nije učitala. Izaberite garažu da pokušate ponovo.';
      choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice.dataset.garage === selected)));
    } finally {
      if (request === latestRequest) presentation.removeAttribute('aria-busy');
    }
  }));
}

// Native dialogs provide keyboard focus containment and Escape-to-close.
function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});
document.querySelectorAll('[data-open-gallery]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = document.querySelector('#gallery-dialog');
    if (!dialog) return;
    const image = dialog.querySelector('img');
    image.src = button.dataset.gallerySrc || 'assets/bastice-original.jpg';
    image.alt = button.dataset.galleryAlt || 'Tri izrađene drvene baštice raspoređene na šljunkovitoj podlozi';
    dialog.querySelector('p').textContent = button.dataset.galleryCaption || 'Drvene baštice po meri · Haus Majstor Nemanja';
    openDialog(dialog);
  });
});

const inquiryForm = document.querySelector('#inquiry-form');
const preview = document.querySelector('#message-preview');
const copyStatus = document.querySelector('#copy-status');
inquiryForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;
  const data = new FormData(inquiryForm);
  const name = String(data.get('name') || '').trim();
  const location = String(data.get('location') || '').trim();
  for (const [id, value] of [['client-name', name], ['project-location', location]]) {
    const field = document.getElementById(id);
    field.setCustomValidity(value ? '' : 'Molimo unesite ovaj podatak.');
    if (!field.reportValidity()) return;
  }
  const details = String(data.get('message') || '').trim();
  const message = `Zdravo Nemanja!\n\nZovem se ${name}. Zanima me: ${data.get('project')}.\nLokacija: ${location}.${details ? `\n\nMoja ideja:\n${details}` : ''}\n\nVoleo/la bih da razgovaramo o mogućnostima i ponudi.`;
  preview.textContent = message;
  document.querySelector('#whatsapp-link').href = `https://wa.me/381616669378?text=${encodeURIComponent(message)}`;
  copyStatus.textContent = '';
  openDialog(document.querySelector('#message-dialog'));
});
inquiryForm?.querySelectorAll('input').forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));

const projectSelect = document.querySelector('#project-type');
const requestedProject = new URLSearchParams(window.location.search).get('usluga');
const projectNames = { nadstresnice: 'Nadstrešnica', letnjikovci: 'Letnjikovac', garaze: 'Garaža', bastice: 'Drvena baštica' };
if (projectSelect && projectNames[requestedProject]) projectSelect.value = projectNames[requestedProject];

document.querySelector('#copy-message')?.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(preview.textContent);
    copyStatus.textContent = 'Poruka je kopirana.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(preview);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Poruka je označena. Kopirajte je pomoću opcije „Kopiraj” ili Ctrl+C.';
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelectorAll('[data-gallery-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.galleryFilter;
    let shown = 0;
    document.querySelectorAll('[data-gallery-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('[data-gallery-kind]').forEach(item => {
      item.hidden = filter !== 'all' && item.dataset.galleryKind !== filter && item.dataset.galleryCategory !== filter;
      if (!item.hidden) {
        shown++;
        // Filtered items need no new scroll event to become visible.
        item.classList.add('is-visible');
        item.getAnimations().forEach(animation => animation.cancel());
        animateElement(item, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 440, delay: Math.min(shown - 1, 3) * 55, fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
    const status = document.querySelector('#gallery-status');
    if (status) status.textContent = `Broj prikazanih fotografija: ${shown}.`;
  });
});
// Reveal only after the observer is created: content stays visible if JS is unavailable.
if ('IntersectionObserver' in window && !motionPreference.matches) {
  // Clipped frames hide their photos from native lazy loading, so loading starts shortly before they arrive.
  const imagesIn = element => element.matches('img') ? [element] : [...element.querySelectorAll('img')];
  const preloadObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      imagesIn(entry.target).forEach(image => { image.loading = 'eager'; });
      preloadObserver.unobserve(entry.target);
    });
  }, { rootMargin: '900px 0px' });
  // Photographs open only once decoded, so a frame never opens on an empty image.
  // The timeout keeps content from staying hidden on a slow connection.
  const revealWhenReady = element => {
    const pending = imagesIn(element).filter(image => !image.complete);
    pending.forEach(image => { image.loading = 'eager'; });
    if (!pending.length) {
      element.classList.add('is-visible');
      return;
    }
    const decoded = Promise.all(pending.map(image => image.decode().catch(() => {})));
    Promise.race([decoded, new Promise(resolve => setTimeout(resolve, 1200))]).then(() => element.classList.add('is-visible'));
  };
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealWhenReady(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06 });
  // Items in the same row enter in reading order; each new row starts without extra delay.
  document.querySelectorAll('.process-steps,.options-grid,.garage-concept-grid,.portfolio-grid,.service-catalog,.values-grid,.related-grid,.contact-checklist,.service-help,.page-contact-band .container,.about-statement').forEach(group => {
    const style = getComputedStyle(group);
    const columns = style.display.includes('grid') ? style.gridTemplateColumns.split(' ').length : Infinity;
    group.querySelectorAll(':scope > [data-reveal]').forEach((element, index) => element.style.setProperty('--reveal-delay', `${Math.min(index % columns, 3) * 90}ms`));
  });
  document.querySelectorAll('[data-reveal]').forEach(element => {
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
    if (imagesIn(element).length) preloadObserver.observe(element);
  });
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    revealObserver.disconnect();
    document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-visible'));
  });
}

// Construction sketches build once, when the steps they illustrate come into view, so the
// drawing and the highlighted step advance together. Without JS or motion the sketch is complete.
const buildDrawings = [...document.querySelectorAll('[data-build]')];
if (buildDrawings.length && 'IntersectionObserver' in window && !motionPreference.matches) {
  const drawingFor = new Map();
  const buildObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      buildObserver.unobserve(entry.target);
      const drawing = drawingFor.get(entry.target);
      const section = drawing.closest('.process');
      drawing.classList.add('is-built');
      section?.classList.add('is-building');
      setTimeout(() => section?.classList.add('is-built'), 5300);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  buildDrawings.forEach(drawing => {
    const section = drawing.closest('.process');
    const trigger = section?.querySelector('.process-steps') || drawing;
    drawing.classList.add('build-ready');
    section?.classList.add('build-sync');
    drawingFor.set(trigger, drawing);
    buildObserver.observe(trigger);
  });
}

// The craft joint assembles with the scroll: an exploded view once it is fully on screen, a
// finished connection by the time its top reaches 30% of the viewport. Each part travels within
// its own share of that range, eased; bolts turn as they go in. Reduced motion keeps it assembled.
const joints = [...document.querySelectorAll('[data-assemble]')];
if (joints.length && 'IntersectionObserver' in window) {
  const clamp = value => Math.min(1, Math.max(0, value));
  const easeOut = value => 1 - (1 - value) ** 3;
  const windowOf = element => element.dataset.window.split(' ').map(Number);
  const assemblies = joints.map(joint => ({
    joint,
    parts: [...joint.querySelectorAll('[data-from]')].map(element => ({ element, from: element.dataset.from.split(' ').map(Number), range: windowOf(element), spin: element.dataset.spin?.split(' ').map(Number) })),
    guides: [...joint.querySelectorAll('.joint-guide')].map(element => ({ element, range: windowOf(element) })),
    notes: [...joint.querySelectorAll('.joint-notes')].map(element => ({ element, range: windowOf(element) }))
  }));
  const visible = new Set();
  let frame = 0;
  const render = () => {
    frame = 0;
    visible.forEach(({ joint, parts, guides, notes }) => {
      const { top, height } = joint.getBoundingClientRect();
      const progress = motionPreference.matches ? 1 : clamp((innerHeight - height - top) / Math.max(innerHeight * 0.7 - height, 160));
      const share = ([start, end]) => easeOut(clamp((progress - start) / (end - start)));
      parts.forEach(({ element, from: [dx, dy], range, spin }) => {
        const rest = 1 - share(range);
        if (!rest) element.removeAttribute('transform');
        else element.setAttribute('transform', `translate(${(dx * rest).toFixed(2)} ${(dy * rest).toFixed(2)})${spin ? ` rotate(${(spin[0] * rest).toFixed(1)} ${spin[1]} ${spin[2]})` : ''}`);
      });
      guides.forEach(({ element, range }) => { element.style.opacity = ((1 - share(range)) * 0.9).toFixed(3); });
      notes.forEach(({ element, range }) => { element.style.opacity = share(range).toFixed(3); });
    });
  };
  const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
  const jointObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const assembly = assemblies.find(item => item.joint === entry.target);
      if (entry.isIntersecting) visible.add(assembly);
      else visible.delete(assembly);
    });
    requestRender();
  }, { rootMargin: '0px 0px 240px 0px' });
  joints.forEach(joint => jointObserver.observe(joint));
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', requestRender);
  motionPreference.addEventListener('change', () => {
    // Joints out of view keep their last state; settle every one of them.
    assemblies.forEach(assembly => visible.add(assembly));
    render();
  });
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.desktop-nav a[href^="#"]').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}
