'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Otvori meni');
  mobileNav.hidden = true;
}

menuToggle.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'Zatvori meni' : 'Otvori meni');
  mobileNav.hidden = !willOpen;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const serviceVisuals = {
  nadstresnice: { image: 'assets/hero-pergola-small.webp', alt: 'Idejna vizualizacija natkrivene terase sa drvenim gredama i metalnim stubovima', caption: 'Nadstrešnica koja prirodno pripada vašem domu.', note: 'Idejna vizualizacija', position: '68% center' },
  letnjikovci: { image: 'assets/letnjikovac.webp', alt: 'Idejna vizualizacija samostalnog drvenog letnjikovca u vrtu', caption: 'Prostor za druženje i mirna popodneva.', note: 'Idejna vizualizacija', position: 'center' },
  garaze: { image: 'assets/garaza.webp', alt: 'Idejna vizualizacija montažne garaže sa metalnom oblogom', caption: 'Prostor za automobil i dodatno odlaganje.', note: 'Idejna vizualizacija', position: 'center' },
  bastice: { image: 'assets/bastice.webp', alt: 'Naš rad: tri drvene baštice u dvorištu', caption: 'Uzdignute baštice od zaštićenog drveta.', note: 'Naš rad', position: 'center top' }
};
const serviceImage = document.querySelector('#service-image');
const serviceCaption = document.querySelector('#service-caption');

function selectService(key) {
  const visual = serviceVisuals[key];
  if (!visual || !serviceImage || !serviceCaption) return;
  document.querySelectorAll('.service-item').forEach(item => {
    const active = item.dataset.service === key;
    item.classList.toggle('is-active', active);
    item.querySelector('.service-toggle').setAttribute('aria-expanded', String(active));
    item.querySelector('.service-description').hidden = !active;
    item.querySelector('.service-sign').textContent = active ? '−' : '+';
  });
  serviceImage.src = visual.image;
  serviceImage.alt = visual.alt;
  serviceImage.dataset.view = key;
  serviceImage.parentElement.classList.toggle('is-garden',key === 'bastice');
  serviceImage.style.objectPosition = visual.position;
  serviceCaption.replaceChildren(document.createTextNode(visual.caption + ' '));
  const captionNote = document.createElement('span');
  captionNote.textContent = visual.note;
  serviceCaption.append(captionNote);
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
    if (button.dataset.gallerySrc) {
      const image = dialog.querySelector('img');
      image.src = button.dataset.gallerySrc;
      image.alt = button.dataset.galleryAlt || '';
      dialog.querySelector('p').textContent = button.dataset.galleryCaption || '';
    }
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
      item.hidden = filter !== 'all' && item.dataset.galleryKind !== filter;
      if (!item.hidden) shown++;
    });
    const status = document.querySelector('#gallery-status');
    if (status) status.textContent = `Broj prikazanih fotografija: ${shown}.`;
  });
});
// Reveal only after the observer is created: content stays visible if JS is unavailable.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('[data-reveal]').forEach(element => {
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
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
