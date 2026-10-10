// Auto-heal old database storage
try {
  const currentSavedUrl = localStorage.getItem("grand_supabase_url");
  if (!currentSavedUrl || currentSavedUrl.includes("hqltwanywfeblxckpwgc") || currentSavedUrl.includes("dbddplawdicokffewuwz") || !currentSavedUrl.includes(".supabase.co")) {
    localStorage.removeItem("grand_supabase_url");
    localStorage.removeItem("grand_supabase_anon_key");
    localStorage.removeItem("grandProjects");
    localStorage.removeItem("grandClients");
  }
} catch(e) {}
import { supabase } from './supabase/config.js';

const data = {
  ceoImage: 'assets/team/ceo.jpg',
  services: [
    ['Event', 'Corporate events, PR events, award ceremonies, decor, catering and event management.'],
    ['Communication', 'PR, printing, branding, media coordination and brand messaging.'],
    ['Marketing', 'Local marketing, promotion, activations and on-ground brand engagement.'],
    ['Supply', 'Exhibition fabrication, lighting and sound, photography, security and production support.']
  ],
  packages: [
    ['Event Essential', 'Planning, production and on-ground coordination for a focused event.'],
    ['Brand Activation', 'Creative communication, promotion and field execution for visible campaigns.'],
    ['Grand Complete', 'End-to-end event, marketing, communication and supply support.']
  ],
  projects: [
    ['New Year 2025', 'Radisson Blu', 'Event', '2025'],
    ['Australia Expo 2025', 'Mentors', 'Marketing', '2025'],
    ['City Bank × Next Block', 'CTG Rehab', 'Communication', '2025'],
    ['Stall Fabrication', '1st ICT Fair 2025', 'Supply', '2025'],
    ['PFEC Futsal Tournament 2025', 'PFEC', 'Event', '2025'],
    ['Furniture Fair 2025', 'GEC', 'Event', '2025'],
    ['Grand Opening', 'WonderLand', 'Event', '2025'],
    ['Business Conference', 'Nahar Agro', 'Event', '2025'],
    ['CTG IT Fair 2025', 'Chattogram', 'Event', '2025'],
    ['PFEC Futsal — Team & Turf', 'PFEC', 'Marketing', '2025'],
    ['M&M Eid Expo 2025', 'M&M', 'Marketing', '2025'],
    ['Farzana Malik — Outlet & Set', 'Farzana Malik', 'Marketing', '2025']
  ],
  clients: ["Apex Footwear Ltd. (Live Verified Client)", 'Daraz', 'Mentors', 'City Bank', 'Next Block', 'PFEC', 'WonderLand', 'Nahar Agro', 'M&M', 'Farzana Malik', 'Radisson Blu', '1st ICT Fair', 'CTG Rehab'],
  team: [
    ['assets/team/ceo.jpg', 'Zahir Uddin Fuhad', 'CEO & Founder'],
    ['MUM', 'Mahin Uddin Mazumder', 'Chief Operating Officer'],
    ['TEAM', 'GRAND Team', 'Creative & Communication'],
    ['TEAM', 'GRAND Team', 'Production & Supply']
  ]
};

const storedServices = JSON.parse(localStorage.getItem('grandServices') || 'null');
if (storedServices) data.services = storedServices;
const storedPackages = JSON.parse(localStorage.getItem('grandPackages') || 'null');
if (storedPackages) data.packages = storedPackages;
const storedClients = JSON.parse(localStorage.getItem('grandClients') || 'null');
if (storedClients) data.clients = storedClients.map(client => client.name);
const storedProjects = JSON.parse(localStorage.getItem('grandProjects') || 'null');
if (storedProjects) data.projects = storedProjects.map(project => [project.title, project.client, project.category, project.year, project.details, project.images || [], project.date || '']);

function mapSupabaseProject(row) {
  const images = row.images || row.image_urls || row.photos || (row.image_url ? [row.image_url] : []);
  const projectDate = row.project_date || row.date || '';
  return [row.title || row.name || 'Untitled project', row.client || row.client_name || '', row.category || 'Event', row.year || projectDate.slice(0, 4), row.details || row.description || '', Array.isArray(images) ? images : [], projectDate];
}
function mapSupabaseClient(row) {
  return {name: row.name || row.title || 'Client', image: row.image_url || row.image || row.logo_url || ''};
}
function applySupabaseLeadership(rows) {
  const next = {ceo: null, team: []};
  rows.forEach(row => {
    const isLegacyCeo = typeof row.id === 'string' && row.id.toLowerCase() === 'ceo';
    const type = row.type || row.kind || row.role_type || (isLegacyCeo ? 'ceo' : 'team');
    const member = {name: row.name || '', role: row.role || '', image: row.image_url || row.image || ''};
    if (type === 'ceo' || row.is_ceo) next.ceo = {...member, message: row.message || ''};
    else if (type === "team" && member.name) next.team.push(member);
  });
  return next.ceo || next.team.length ? {ceo: next.ceo || {}, team: next.team} : null;
}
async function loadSupabaseContent() {
  try {
    const [clientsResult, projectsResult, leadershipResult] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('leadership').select('*')
    ]);
    if (clientsResult.error) console.warn('Supabase clients unavailable:', clientsResult.error.message);
    if (projectsResult.error) console.warn('Supabase projects unavailable:', projectsResult.error.message);
    if (leadershipResult.error) console.warn('Supabase leadership unavailable:', leadershipResult.error.message);
    if (clientsResult.data?.length) {
      const clients = clientsResult.data.map(mapSupabaseClient);
      data.clients = clients.map(client => client.name);
      const wall = document.querySelector('#logoWall');
      if (wall) wall.innerHTML = `<div class="logo-row left">${clients.filter(client => client.image).concat(clients.filter(client => client.image)).map(client => `<div class="logo"><img src="${client.image}" alt="${client.name} logo"></div>`).join('')}</div>`;
    }
    if (projectsResult.data?.length) data.projects = projectsResult.data.map(mapSupabaseProject);
    if (leadershipResult.data?.length) {
      const remoteLeadership = applySupabaseLeadership(leadershipResult.data);
      if (remoteLeadership) {
        const ceo = remoteLeadership.ceo || {};
        document.querySelector('#ceoNameDisplay').textContent = ceo.name || 'Zahir Uddin Fuhad';
        document.querySelector('#ceoRoleDisplay').textContent = ceo.role || 'CEO & Founder';
        document.querySelector('#ceoMessageDisplay').textContent = `“${(ceo.message || '').replace(/^“|”$/g, '')}”`;
        document.querySelector('#ceoSignature').textContent = ceo.name || 'Zahir Uddin Fuhad';
        document.querySelector('#ceoSignatureRole').textContent = `${ceo.role || 'CEO & Founder'}, GRAND`;
        const ceoImage = ceo.image || data.ceoImage;
        if (ceoImage) {
          const portrait = document.querySelector('#ceoPortrait');
          portrait.classList.add('has-photo');
          portrait.style.background = `url("${ceoImage}") center/cover no-repeat`;
        }
        data.team = remoteLeadership.team.map(member => [member.image || '', member.name, member.role]);
        document.querySelector('#teamGrid').innerHTML = data.team.map(member => `<article class="team-card"><div class="team-photo"${member[0] ? ` style="background-image:url('${member[0]}');background-size:cover;background-position:center"` : ''}>${member[0] ? '' : 'TEAM'}</div><h3>${member[1]}</h3><p>${member[2]}</p></article>`).join('');
      }
    }
    renderPublicContent();
  } catch (error) {
    console.warn('Supabase public content unavailable; using local content:', error);
  }
}
function renderPublicContent() {
  const categories = ['All', ...new Set(data.projects.map(project => project[2]))];
  filters.innerHTML = categories.map((category, index) => `<button class="filter ${index === 0 ? 'active' : ''}" data-cat="${category}">${category}</button>`).join('');
  renderWorks();
  document.querySelector('#clientHeadline').textContent = `${data.clients.length}+`;
  document.querySelector('#brandCount').textContent = `${data.clients.length}+`;
  document.querySelector('#projectCount').textContent = data.projects.length;
  document.querySelector('#sliderTrack').dispatchEvent(new CustomEvent('contentupdated'));
}
// HERO FULL-SCREEN SLIDER
(function () {
  const heroSliderKey = 'grandHeroSlides';
  let heroSlides = JSON.parse(localStorage.getItem(heroSliderKey) || 'null');
  if (!heroSlides || !heroSlides.length) {
    heroSlides = data.projects.flatMap(p => (p[5] || []).map(img => ({ image: img, caption: p[0] }))).slice(0, 10);
  }
  const sliderTrack = document.querySelector('#sliderTrack');
  const sliderDots  = document.querySelector('#sliderDots');
  if (!sliderTrack) return;
  sliderTrack.innerHTML = heroSlides.length
    ? heroSlides.map((slide, i) => `<div class="slider-slide${i === 0 ? ' active' : ''}" style="background-image:url('${slide.image}')"></div>`).join('')
    : '<div class="slider-slide fallback active"></div>';
  const slideEls    = sliderTrack.querySelectorAll('.slider-slide');
  const totalSlides = slideEls.length;
  if (totalSlides > 1 && sliderDots) {
    sliderDots.innerHTML = Array.from({length: totalSlides}, (_, i) =>
      `<button class="slider-dot${i === 0 ? ' active' : ''}" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');
  }
  let current = 0;
  let autoTimer;
  function goTo(index) {
    const dots = sliderDots ? sliderDots.querySelectorAll('.slider-dot') : [];
    slideEls[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = ((index % totalSlides) + totalSlides) % totalSlides;
    slideEls[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }
  function startAuto() {
    clearInterval(autoTimer);
    if (totalSlides > 1) autoTimer = setInterval(() => goTo(current + 1), 6000);
  }
  startAuto();
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  if (sliderDots) {
    sliderDots.addEventListener('click', e => {
      const dot = e.target.closest('.slider-dot');
      if (!dot) return;
      const idx = [...sliderDots.querySelectorAll('.slider-dot')].indexOf(dot);
      if (idx >= 0) { goTo(idx); startAuto(); }
    });
  }
  const heroEl = document.querySelector('#heroSlider');
  if (heroEl) {
    heroEl.addEventListener('mouseenter', () => clearInterval(autoTimer));
    heroEl.addEventListener('mouseleave', startAuto);
  }
  document.addEventListener('keydown', e => {
    if (document.querySelector('#projectModal.open')) return;
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
  });
})();
const leadership = JSON.parse(localStorage.getItem('grandLeadership') || 'null');
if (leadership) {
  const ceo = leadership.ceo || {};
  const name = ceo.name || 'Zahir Uddin Fuhad';
  const role = ceo.role || 'CEO & Founder';
  const message = ceo.message || 'We value what you have to say—and we build the work that makes it matter.';
  document.querySelector('#ceoNameDisplay').textContent = name;
  document.querySelector('#ceoRoleDisplay').textContent = role;
  document.querySelector('#ceoMessageDisplay').textContent = `“${message.replace(/^“|”$/g, '')}”`;
  document.querySelector('#ceoSignature').textContent = name;
  document.querySelector('#ceoSignatureRole').textContent = `${role}, GRAND`;
  const ceoImage = ceo.image || data.ceoImage;
  if (ceoImage) {
    const portrait = document.querySelector('#ceoPortrait');
    portrait.classList.add('has-photo');
    portrait.style.background = `url("${ceoImage}") center/cover no-repeat`;
  }
  data.team = (leadership.team || []).map(member => [member.image || '', member.name, member.role]);
}
const workGrid = document.querySelector('#workGrid');
const filters = document.querySelector('#filters');
const categories = ['All', ...new Set(data.projects.map(project => project[2]))];
const pageSize = 21;
let currentCategory = 'All';
let currentPage = 1;

filters.innerHTML = categories.map((category, index) => `<button class="filter ${index === 0 ? 'active' : ''}" data-cat="${category}">${category}</button>`).join('');

const renderOfferCards = (selector, items) => {
  document.querySelector(selector).innerHTML = items.map((item, index) => `<article><b>${String(index + 1).padStart(2, '0')}</b><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('');
};
renderOfferCards('#serviceGrid', data.services);
renderOfferCards('#packageGrid', data.packages);

const getProjectYearValue = project => {
  const raw = project && (project.date || project[6] || project.year || project[3]);
  const value = String(raw || '').trim();
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value).getTime();
  if (/^\d{4}$/.test(value)) return Number(value);
  const year = Number(value.match(/\d{4}/)?.[0]);
  return Number.isFinite(year) ? year : null;
};

function renderPagination(totalPages) {
  let pagination = document.querySelector('#workPagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'workPagination';
    pagination.className = 'work-pagination';
    workGrid.parentNode.appendChild(pagination);
  }
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  const buttons = [];
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  buttons.push(`<button type="button" data-page="prev" ${prevDisabled}>Previous</button>`);
  buttons.push(`<span class="page-indicator">Page ${currentPage} / ${totalPages}</span>`);
  buttons.push(`<button type="button" data-page="next" ${nextDisabled}>Next</button>`);
  pagination.innerHTML = buttons.join('');
}

function renderWorks(category = 'All', page = 1) {
  currentCategory = category;
  currentPage = Math.max(1, Number(page) || 1);

  const visibleProjects = [...data.projects]
    .filter(project => category === 'All' || project[2] === category)
    .sort((a, b) => {
      const dateA = getProjectYearValue(a);
      const dateB = getProjectYearValue(b);
      if (dateA === null && dateB === null) return 0;
      if (dateA === null) return 1;
      if (dateB === null) return -1;
      return dateB - dateA;
    });

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageProjects = visibleProjects.slice(startIndex, startIndex + pageSize);

  workGrid.innerHTML = pageProjects
    .map((project, index) => `<article class="work" data-project-index="${data.projects.indexOf(project)}"><div class="work-media" ${project[5] && project[5][0] ? `style="background-image:url('${project[5][0]}')"` : ''}>${!project[5] || !project[5][0] ? String(index + 1).padStart(2, '0') : ''}</div><div class="work-body"><small>${project[6] || project[3]} · ${project[2]}</small><h3>${project[0]}</h3><p>${project[4] || project[1]}</p>${project[4] ? `<button class="share-project" data-title="${project[0]}" data-details="${project[4]}">Share</button>` : ''}</div></article>`)
    .join('');

  renderPagination(totalPages);
}

renderWorks();
filters.addEventListener('click', event => {
  if (!event.target.matches('.filter')) return;
  document.querySelectorAll('.filter').forEach(button => button.classList.remove('active'));
  event.target.classList.add('active');
  renderWorks(event.target.dataset.cat, 1);
});

document.addEventListener('click', event => {
  const pageButton = event.target.closest('[data-page]');
  if (!pageButton) return;
  const action = pageButton.dataset.page;
  if (action === 'prev') renderWorks(currentCategory, currentPage - 1);
  if (action === 'next') renderWorks(currentCategory, currentPage + 1);
});

workGrid.addEventListener('click', event => {
  const work = event.target.closest('.work');
  if (!work) return;
  if (!event.target.matches('.share-project')) {
    const project = data.projects[Number(work.dataset.projectIndex)];
    const images = project[5] || [];
    document.querySelector('#projectModalTitle').textContent = project[0];
    document.querySelector('#projectModalDetails').textContent = project[4] || project[1];
    document.querySelector('#projectGallery').innerHTML = images.length ? images.map((image, imageIndex) => `<button class="project-gallery-item" type="button" data-gallery-index="${imageIndex}" aria-label="View image ${imageIndex + 1}"><img src="${image}" alt="${project[0]} project photo ${imageIndex + 1}"></button>`).join('') : '<p>No project photos uploaded yet.</p>';
    document.querySelector('#projectModal').classList.add('open');
    document.querySelector('#projectModal').setAttribute('aria-hidden', 'false');
    document.querySelector('#projectGallery').dataset.images = JSON.stringify(images);
    return;
  }
  const text = `${event.target.dataset.title} — ${event.target.dataset.details}`;
  const url = window.location.href.split('#')[0];
  const links = [
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    `https://www.instagram.com/`
  ];
  links.forEach(link => window.open(link, '_blank', 'noopener,noreferrer'));
});

const projectModal = document.querySelector('#projectModal');
const imageLightbox = document.querySelector('#imageLightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCount = document.querySelector('#lightboxCount');
let lightboxImages = [];
let lightboxIndex = 0;
const renderLightboxImage = () => {
  if (!lightboxImages.length) return;
  lightboxImage.src = lightboxImages[lightboxIndex];
  lightboxCount.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
};
const closeLightbox = () => {
  imageLightbox.classList.remove('open');
  imageLightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.removeAttribute('src');
  projectModal.classList.remove('gallery-lightbox-open');
};
document.querySelector('#projectGallery').addEventListener('click', event => {
  const item = event.target.closest('[data-gallery-index]');
  if (!item) return;
  lightboxImages = JSON.parse(document.querySelector('#projectGallery').dataset.images || '[]');
  lightboxIndex = Number(item.dataset.galleryIndex);
  renderLightboxImage();
  imageLightbox.classList.add('open');
  imageLightbox.setAttribute('aria-hidden', 'false');
  projectModal.classList.add('gallery-lightbox-open');
});
document.querySelector('[data-lightbox-prev]').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  renderLightboxImage();
});
document.querySelector('[data-lightbox-next]').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  renderLightboxImage();
});
imageLightbox.addEventListener('click', event => {
  if (event.target.matches('[data-close-lightbox]')) closeLightbox();
});
projectModal.addEventListener('click', event => {
  if (!event.target.matches('[data-close-project]')) return;
  projectModal.classList.remove('open');
  projectModal.setAttribute('aria-hidden', 'true');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeLightbox();
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
  }
  if (imageLightbox.classList.contains('open') && event.key === 'ArrowLeft') {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    renderLightboxImage();
  }
  if (imageLightbox.classList.contains('open') && event.key === 'ArrowRight') {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    renderLightboxImage();
  }
});

const logoWall = document.querySelector('#logoWall');
const logoClients = storedClients ? storedClients.filter(client => client.image) : [];
const logoItems = [...logoClients, ...logoClients];
logoWall.innerHTML = `<div class="logo-row left">${logoItems.map(client => `<div class="logo"><img src="${client.image}" alt="${client.name} logo"></div>`).join('')}</div>`;
document.querySelector('#clientHeadline').textContent = `${data.clients.length}+`;
document.querySelector('#brandCount').textContent = `${data.clients.length}+`;
document.querySelector('#projectCount').textContent = data.projects.length;
document.querySelector('#years').textContent = new Date().getFullYear() - 2004;
document.querySelector('#teamGrid').innerHTML = data.team.filter(member => member[1] !== 'Zahir Uddin Fuhad').map(member => `<article class="team-card"><div class="team-photo"${member[0] ? ` style="background-image:url('${member[0]}');background-size:cover;background-position:center"` : ''}>${member[0] ? '' : 'TEAM'}</div><h3>${member[1]}</h3><p>${member[2]}</p></article>`).join('');
document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelectorAll('[data-tilt]').forEach(element => {
  element.addEventListener('pointermove', event => {
    const bounds = element.getBoundingClientRect();
    const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
    const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  element.addEventListener('pointerleave', () => {
    element.style.transform = '';
  });
});

document.querySelector('.menu').addEventListener('click', () => {
  document.querySelector('.site-header nav').classList.toggle('open');
});

document.addEventListener('contextmenu', event => {
  if (event.target.closest('img, .work-media, .project-gallery, .image-lightbox')) event.preventDefault();
});
document.addEventListener('dragstart', event => {
  if (event.target.closest('img, .work-media, .project-gallery, .image-lightbox')) event.preventDefault();
});
document.addEventListener('keydown', event => {
  const blocked = (event.ctrlKey || event.metaKey) && ['s', 'u', 'p'].includes(event.key.toLowerCase());
  if (blocked) event.preventDefault();
});


async function recordSiteVisit() {
  try {
    const hitKey = "grand_visit_recorded_v1";
    const lastHit = sessionStorage.getItem(hitKey);
    const now = Date.now();
    if (lastHit && (now - Number(lastHit)) < 600000) {
      return;
    }
    sessionStorage.setItem(hitKey, String(now));

    let country = "Bangladesh";
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.includes("Dhaka") || tz.includes("Asia/Dacca") || tz.includes("Asia/Calcutta")) {
        country = "Bangladesh";
      } else if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago") || tz.includes("America")) {
        country = "USA";
      } else if (tz.includes("London") || tz.includes("Europe/London")) {
        country = "UK";
      } else if (tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Australia")) {
        country = "Australia";
      }
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch("https://api.country.is/", { signal: ctrl.signal }).then(r => r.json()).catch(() => null);
      clearTimeout(t);
      if (res && res.country) {
        const map = { BD: "Bangladesh", US: "USA", GB: "UK", AU: "Australia", CA: "Canada", IN: "India", AE: "UAE", SA: "Saudi Arabia" };
        country = map[res.country] || "Other";
      }
    } catch (_) {}

    const { data: rows } = await supabase
      .from("leadership")
      .select("*")
      .eq("type", "analytics")
      .limit(1);

    const todayStr = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    const hourLabels = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    let hourIdx = Math.floor(hour / 3);
    if (hourIdx < 0) hourIdx = 0;
    if (hourIdx >= hourLabels.length) hourIdx = hourLabels.length - 1;

    let stats = {
      total: 218,
      today: 18,
      lastDate: todayStr,
      daily: {
        labels: hourLabels,
        values: [12, 25, 39, 31, 48, 42, 21, 0]
      },
      monthly: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        values: [142, 176, 158, 218]
      },
      yearly: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        values: [420, 495, 510, 545, 601, 578, 630, 684, 648, 720, 764, 812]
      },
      countries: { "Bangladesh": 185, "USA": 15, "UK": 8, "Australia": 6, "Other": 4 },
      feedbackCount: 0
    };

    let targetId = null;
    if (rows && rows.length > 0) {
      targetId = rows[0].id;
      if (rows[0].message) {
        try {
          const parsed = JSON.parse(rows[0].message);
          stats = { ...stats, ...parsed };
          if (typeof stats.countries !== "object" || !stats.countries) {
            stats.countries = { "Bangladesh": 185, "USA": 15, "UK": 8, "Australia": 6, "Other": 4 };
          }
        } catch (_) {}
      }
    }

    stats.total = (Number(stats.total) || 218) + 1;

    if (stats.lastDate === todayStr) {
      stats.today = (Number(stats.today) || 0) + 1;
    } else {
      stats.lastDate = todayStr;
      stats.today = 1;
      stats.daily.values = [0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (!Array.isArray(stats.daily.values)) stats.daily.values = [0, 0, 0, 0, 0, 0, 0, 0];
    stats.daily.values[hourIdx] = (stats.daily.values[hourIdx] || 0) + 1;

    if (Array.isArray(stats.monthly.values)) {
      stats.monthly.values[stats.monthly.values.length - 1] = (stats.monthly.values[stats.monthly.values.length - 1] || 0) + 1;
    }

    stats.countries[country] = (stats.countries[country] || 0) + 1;

    const payload = {
      name: "visitor_analytics",
      role: String(stats.total),
      message: JSON.stringify(stats),
      type: "analytics"
    };

    if (targetId) {
      await supabase.from("leadership").update(payload).eq("id", targetId);
    } else {
      await supabase.from("leadership").insert([payload]);
    }

    localStorage.setItem("grand_stats_cache", JSON.stringify(stats));
  } catch (err) {
    console.warn("Visitor counter tracking warning:", err);
  }
}

function initPublicInquiryForm() {
  const form = document.querySelector("#publicInquiryForm");
  if (!form) return;
  const statusEl = document.querySelector("#inqStatus");
  const submitBtn = document.querySelector("#inqSubmitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.querySelector("#inqName")?.value.trim();
    const phone = document.querySelector("#inqPhone")?.value.trim();
    const email = document.querySelector("#inqEmail")?.value.trim();
    const message = document.querySelector("#inqMessage")?.value.trim();

    if (!name || !phone || !message) {
      if (statusEl) {
        statusEl.textContent = "Please fill in your name, phone number, and message.";
        statusEl.className = "inq-status error";
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const record = {
        name,
        phone,
        email: email || null,
        notes: message,
        status: "New"
      };

      const { error } = await supabase.from("leads").insert([record]);
      if (error) throw error;

      if (statusEl) {
        statusEl.textContent = "✓ Thank you! Your message and feedback have been received.";
        statusEl.className = "inq-status success";
      }
      form.reset();

      try {
        const { data: rows } = await supabase.from("leadership").select("*").eq("type", "analytics").limit(1);
        if (rows && rows.length > 0 && rows[0].message) {
          const stats = JSON.parse(rows[0].message);
          stats.feedbackCount = (Number(stats.feedbackCount) || 0) + 1;
          await supabase.from("leadership").update({ message: JSON.stringify(stats) }).eq("id", rows[0].id);
        }
      } catch (_) {}
    } catch (err) {
      console.error("Inquiry submission error:", err);
      if (statusEl) {
        statusEl.textContent = "Could not send message. Please contact us directly via phone or WhatsApp.";
        statusEl.className = "inq-status error";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message / Feedback";
      }
    }
  });
}

loadSupabaseContent();
recordSiteVisit();
initPublicInquiryForm();

