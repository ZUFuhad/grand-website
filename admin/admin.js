import { supabase } from '../supabase/config.js';

const login = document.querySelector('#login');
const app = document.querySelector('#app');
const projectKey = 'grandProjects';
const maxProjects = 50;
const defaultProjects = [
  ['New Year 2025', 'Radisson Blu', 'Event', '2025'], ['Australia Expo 2025', 'Mentors', 'Marketing', '2025'],
  ['City Bank × Next Block', 'CTG Rehab', 'Communication', '2025'], ['Stall Fabrication', '1st ICT Fair 2025', 'Supply', '2025'],
  ['PFEC Futsal Tournament 2025', 'PFEC', 'Event', '2025'], ['Furniture Fair 2025', 'GEC', 'Event', '2025'],
  ['Grand Opening', 'WonderLand', 'Event', '2025'], ['Business Conference', 'Nahar Agro', 'Event', '2025'],
  ['CTG IT Fair 2025', 'Chattogram', 'Event', '2025'], ['PFEC Futsal — Team & Turf', 'PFEC', 'Marketing', '2025'],
  ['M&M Eid Expo 2025', 'M&M', 'Marketing', '2025'], ['Farzana Malik — Outlet & Set', 'Farzana Malik', 'Marketing', '2025']
];
const sortProjectsAsc = arr => arr.sort((a, b) => {
  const dateA = new Date(a.date || `${a.year || '1970'}-01-01`);
  const dateB = new Date(b.date || `${b.year || '1970'}-01-01`);
  return dateA - dateB;
});
const readProjects = () => sortProjectsAsc(JSON.parse(localStorage.getItem(projectKey) || 'null') || defaultProjects.map(project => ({title: project[0], client: project[1], category: project[2], year: project[3], details: '', images: []})));
const saveProjects = projects => {
  try {
    localStorage.setItem(projectKey, JSON.stringify(sortProjectsAsc(projects)));
    return true;
  } catch (error) {
    console.error('Could not save projects:', error);
    return false;
  }
};
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
let projects = readProjects();
let editingProjectIndex = -1;
const heroSliderKey = 'grandHeroSlides';
const getHeroSlides = () => JSON.parse(localStorage.getItem(heroSliderKey) || '[]');
const saveHeroSlides = slides => localStorage.setItem(heroSliderKey, JSON.stringify(slides));
const postQueueKey = 'grandPostQueue';
const clientKey = 'grandClients';
const maxClientLogos = 1000;
const defaultClients = ['Daraz', 'Mentors', 'City Bank', 'Next Block', 'PFEC', 'WonderLand', 'Nahar Agro', 'M&M', 'Farzana Malik', 'Radisson Blu', '1st ICT Fair', 'CTG Rehab'];
let clients = JSON.parse(localStorage.getItem(clientKey) || 'null') || defaultClients.map(name => ({name, image: ''}));
const saveClients = () => {
  try {
    localStorage.setItem(clientKey, JSON.stringify(clients));
    return true;
  } catch (error) {
    console.error('Could not save client logos:', error);
    return false;
  }
};
const servicesKey = 'grandServices';
const packagesKey = 'grandPackages';
const defaultServices = [
  {name: 'Event', description: 'Corporate events, PR events, award ceremonies, decor, catering and event management.'},
  {name: 'Communication', description: 'PR, printing, branding, media coordination and brand messaging.'},
  {name: 'Marketing', description: 'Local marketing, promotion, activations and on-ground brand engagement.'},
  {name: 'Supply', description: 'Exhibition fabrication, lighting and sound, photography, security and production support.'}
];
const defaultPackages = [
  {name: 'Event Essential', description: 'Planning, production and on-ground coordination for a focused event.'},
  {name: 'Brand Activation', description: 'Creative communication, promotion and field execution for visible campaigns.'},
  {name: 'Grand Complete', description: 'End-to-end event, marketing, communication and supply support.'}
];
let services = JSON.parse(localStorage.getItem(servicesKey) || 'null') || defaultServices;
let packages = JSON.parse(localStorage.getItem(packagesKey) || 'null') || defaultPackages;
const saveOffers = () => {
  localStorage.setItem(servicesKey, JSON.stringify(services));
  localStorage.setItem(packagesKey, JSON.stringify(packages));
};
const leadershipKey = 'grandLeadership';
const defaultLeadership = {
  ceo: {name: 'Zahir Uddin Fuhad', role: 'CEO & Founder', message: 'We value what you have to say—and we build the work that makes it matter.', image: ''},
  team: [{name: 'Mahin Uddin Mazumder', role: 'Chief Operating Officer', image: ''}, {name: 'GRAND Team', role: 'Creative & Communication', image: ''}, {name: 'GRAND Team', role: 'Production & Supply', image: ''}]
};
let leadership = JSON.parse(localStorage.getItem(leadershipKey) || 'null') || defaultLeadership;
leadership.team = (leadership.team || []).map(member => ({...member, image: member.image || ''}));
const saveLeadership = () => localStorage.setItem(leadershipKey, JSON.stringify(leadership));

const remoteId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
async function uploadDataUrl(dataUrl, folder, id, extension = 'jpg') {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  const [header, encoded] = dataUrl.split(',');
  const mime = (header.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
  const path = `${folder}/${id}.${extension}`;
  const upload = await supabase.storage.from('assets').upload(path, bytes, {contentType: mime, upsert: true});
  if (upload.error) throw new Error(`Storage upload failed (${path}): ${upload.error.message}`);
  const publicUrl = supabase.storage.from('assets').getPublicUrl(path);
  return publicUrl.data.publicUrl;
}
async function persistRemoteProject(project) {
  const sessionResult = await supabase.auth.getSession();
  if (!sessionResult.data.session) {
    throw new Error('Supabase login required. Use your Auth email and password, not the legacy Grandcms login.');
  }
  const id = project.id || remoteId();
  const images = await Promise.all((project.images || []).map((image, index) => uploadDataUrl(image, 'projects', `${id}/${index}`, image.startsWith('data:image/png') ? 'png' : 'jpg')));
  const result = await supabase.from('projects').upsert({id, title: project.title, client: project.client, category: project.category, project_date: project.date || (project.year ? `${project.year}-01-01` : null), details: project.details, images}, {onConflict: 'id'});
  if (result.error) throw new Error(`Project record failed: ${result.error.message}`);
  project.id = id;
}
async function persistRemoteClient(client) {
  const sessionResult = await supabase.auth.getSession();
  if (!sessionResult.data.session) {
    throw new Error('Supabase login required. Use your Auth email and password, not the legacy Grandcms login.');
  }
  const id = client.id || remoteId();
  const image = await uploadDataUrl(client.image, 'clients', id, client.image.startsWith('data:image/png') ? 'png' : 'jpg');
  const result = await supabase.from('clients').upsert({id, name: client.name, image_url: image}, {onConflict: 'id'});
  if (result.error) throw new Error(`Client record failed: ${result.error.message}`);
  client.id = id; client.image = image;
}
async function persistRemoteLeadership() {
  const sessionResult = await supabase.auth.getSession();
  if (!sessionResult.data.session) {
    throw new Error('Supabase login required. Use your Auth email and password, not the legacy Grandcms login.');
  }
  const ceoId = leadership.ceo.id || 'ceo';
  const ceoImage = await uploadDataUrl(leadership.ceo.image, 'team', ceoId, 'jpg');
  const rows = [{id: ceoId, name: leadership.ceo.name, role: leadership.ceo.role, message: leadership.ceo.message, image_url: ceoImage}];
  for (const member of leadership.team) {
    const id = member.id || remoteId();
    const image = await uploadDataUrl(member.image, 'team', id, member.image.startsWith('data:image/png') ? 'png' : 'jpg');
    member.id = id;
    rows.push({id, name: member.name, role: member.role, image_url: image});
  }
  const result = await supabase.from('leadership').upsert(rows, {onConflict: 'id'});
  if (result.error) throw new Error(`Leadership records failed: ${result.error.message}`);
  leadership.ceo.id = ceoId; leadership.ceo.image = ceoImage;
}
async function deleteRemoteRecord(table, id, label) {
  if (!id) return;
  const result = await supabase.from(table).delete().eq('id', id);
  if (result.error) throw new Error(`${label} delete failed: ${result.error.message}`);
}
function reportRemoteError(error, label) {
  console.warn(`${label} was saved locally but could not sync to Supabase:`, error);
  alert(`${label} saved locally, but Supabase sync failed.\n\n${error.message || 'Unknown error'}\n\nLog out and sign in with the Supabase Auth email/password to upload permanently.`);
}
async function loadRemoteAdminContent() {
  try {
    const [clientResult, projectResult, leadershipResult] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('leadership').select('*')
    ]);
    if (clientResult.error) console.warn('Supabase clients unavailable:', clientResult.error.message);
    if (projectResult.error) console.warn('Supabase projects unavailable:', projectResult.error.message);
    if (leadershipResult.error) console.warn('Supabase leadership unavailable:', leadershipResult.error.message);
    if (clientResult.data?.length) clients = clientResult.data.map(row => ({id: row.id, name: row.name || row.title || 'Client', image: row.image_url || row.image || row.logo_url || ''}));
    if (projectResult.data?.length) projects = projectResult.data.map(row => {
      const images = row.images || row.image_urls || (row.image_url ? [row.image_url] : []);
      const projectDate = row.project_date || row.date || '';
      return {id: row.id, title: row.title || row.name || 'Untitled project', client: row.client || row.client_name || '', category: row.category || 'Event', date: projectDate, year: row.year || projectDate.slice(0, 4), details: row.details || row.description || '', images: Array.isArray(images) ? images : []};
    });
    if (leadershipResult.data?.length) {
      const remote = {ceo: null, team: []};
      leadershipResult.data.forEach(row => {
        const member = {id: row.id, name: row.name || '', role: row.role || '', image: row.image_url || row.image || ''};
        if (row.type === 'ceo' || row.kind === 'ceo' || row.is_ceo || row.id === 'ceo') remote.ceo = {...member, message: row.message || ''};
        else if (member.name) remote.team.push(member);
      });
      if (remote.ceo || remote.team.length) leadership = {ceo: remote.ceo || defaultLeadership.ceo, team: remote.team};
    }
    saveClients(); saveProjects(projects); saveLeadership();
    renderClients(); renderProjectList(); renderLeadership(); renderOverview();
  } catch (error) {
    console.warn('Supabase admin content unavailable; continuing with local content:', error);
  }
}

function optimizeImage(file, options = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = reader.result; };
    reader.onerror = () => reject(reader.error);
    image.onload = () => {
      const maxSize = options.projectImage ? 900 : (options.removeBackground ? 600 : 1400);
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (options.removeBackground) {
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let index = 0; index < pixels.data.length; index += 4) {
          const red = pixels.data[index];
          const green = pixels.data[index + 1];
          const blue = pixels.data[index + 2];
          const brightest = Math.max(red, green, blue);
          const darkest = Math.min(red, green, blue);
          const isLightNeutral = darkest > 175 && brightest - darkest < 65;
          const isNearWhite = red > 220 && green > 220 && blue > 220;
          if (isLightNeutral || isNearWhite) pixels.data[index + 3] = 0;
          if (options.blackLogo && pixels.data[index + 3] > 0) {
            pixels.data[index] = 0;
            pixels.data[index + 1] = 0;
            pixels.data[index + 2] = 0;
          }

          function readFileAsDataUrl(file) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(reader.error || new Error('Could not read image'));
              reader.readAsDataURL(file);
            });
          }
        }
        context.putImageData(pixels, 0, 0);
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;
        for (let y = 0; y < canvas.height; y += 1) {
          for (let x = 0; x < canvas.width; x += 1) {
            if (pixels.data[(y * canvas.width + x) * 4 + 3] > 0) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }
        if (maxX >= minX && maxY >= minY) {
          const cropped = document.createElement('canvas');
          cropped.width = maxX - minX + 1;
          cropped.height = maxY - minY + 1;
          cropped.getContext('2d').drawImage(canvas, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
          canvas.width = cropped.width;
          canvas.height = cropped.height;
          context.drawImage(cropped, 0, 0);
        }
      }
      if (options.whiteBackground) {
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';
      }
      const outputType = options.removeBackground ? 'image/png' : 'image/jpeg';
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Image optimization failed')); return; }
        const optimizedReader = new FileReader();
        optimizedReader.onload = () => resolve(optimizedReader.result);
        optimizedReader.onerror = () => reject(optimizedReader.error);
        optimizedReader.readAsDataURL(blob);
      }, outputType, options.removeBackground ? undefined : (options.projectImage ? 0.45 : 0.82));
    };
    image.onerror = () => reject(new Error('Invalid image file'));
    reader.readAsDataURL(file);
  });
}

function renderProjectList() {
  document.querySelector('#projectTotal').textContent = projects.length;
  document.querySelector('#projectList').innerHTML = projects.map((project, index) => {
    let imagesHtml = '';
    if (project.images && project.images.length) {
      const heroSlides = getHeroSlides();
      imagesHtml = `<div id="projectImages-${index}" class="project-manage-images hidden">
        <strong>Project Images</strong><br>
        <div class="project-images-grid">
          ${project.images.map((img, imgIdx) => {
            const isHero = heroSlides.some(s => s.image === img);
            return `<div class="admin-slide-thumb">
              <img src="${img}" alt="Project image">
              <button type="button" class="admin-slide-toggle ${isHero ? 'is-hero' : ''}" data-project-idx="${index}" data-img-idx="${imgIdx}">
                ${isHero ? '★ Hero Slide' : 'Set Hero Slide'}
              </button>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }
    return `<div class="project-row"><strong>${escapeHtml(project.title)}</strong><span>${escapeHtml(project.client)} · ${escapeHtml(project.category)} · ${escapeHtml(project.year)}</span><button data-edit="${index}" type="button">Edit</button><button data-manage="${index}" type="button">Manage Images</button><button data-delete="${index}" type="button">Delete</button></div>${imagesHtml}`;
  }).join('');
}

let trafficChart, countryChart;
const trafficData = {
  daily: {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    values: [12, 25, 39, 31, 48, 42, 21]
  },
  monthly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [142, 176, 158, 213]
  },
  yearly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [420, 495, 510, 545, 601, 578, 630, 684, 648, 720, 764, 812]
  }
};

function setAnalyticsStatus(message, isError = false) {
  const status = document.querySelector('#analyticsStatus');
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? '#e8a193' : '';
}

function updateVisitorTotal(view) {
  const total = document.querySelector('#visitorTotal');
  if (!total || !trafficData[view]) return;
  total.textContent = trafficData[view].values.reduce((sum, value) => sum + value, 0).toLocaleString();
}

function initCharts() {
  if (trafficChart || countryChart) return;
  if (typeof Chart === 'undefined') {
    setAnalyticsStatus('Charts could not load. Check the internet connection and reload the dashboard.', true);
    return;
  }
  Chart.defaults.color = '#a79e91';
  Chart.defaults.font.family = 'Inter, sans-serif';

  const ctxTraffic = document.getElementById('trafficChart');
  const ctxCountry = document.getElementById('countryChart');
  if (!ctxTraffic || !ctxCountry) return;

  try {
    trafficChart = new Chart(ctxTraffic, {
      type: 'bar',
      data: {
        labels: trafficData.daily.labels,
        datasets: [{
          label: 'Visitors',
          data: trafficData.daily.values,
          backgroundColor: '#c39a4a',
          borderColor: '#e6c475',
          borderWidth: 1,
          borderRadius: 5,
          borderSkipped: false,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { precision: 0 } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
    updateVisitorTotal('daily');

    countryChart = new Chart(ctxCountry, {
      type: 'doughnut',
      data: {
        labels: ['Bangladesh', 'USA', 'UK', 'Australia', 'Other'],
        datasets: [{
          data: [65, 12, 10, 8, 5],
          backgroundColor: ['#c39a4a', '#a87e2e', '#8d5f20', '#6e4714', '#4b300c'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, boxWidth: 12 } }
        }
      }
    });
    setAnalyticsStatus('Demo analytics — connect a visitor analytics service for live traffic.');
  } catch (error) {
    console.error('Could not initialise dashboard charts:', error);
    trafficChart = null;
    countryChart = null;
    setAnalyticsStatus('Charts could not be displayed. Reload the dashboard and try again.', true);
    return;
  }

  const toggles = document.querySelectorAll('#trafficToggles button');
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      toggles.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const view = e.target.dataset.view;
      toggles.forEach(t => t.setAttribute('aria-pressed', String(t === e.target)));
      if (!trafficData[view]) return;
      trafficChart.data.labels = trafficData[view].labels;
      trafficChart.data.datasets[0].data = trafficData[view].values;
      trafficChart.update();
      updateVisitorTotal(view);
    });
  });
}

function renderOverview() {
  document.querySelector('#yearsTotal').textContent = Math.max(0, new Date().getFullYear() - 2004);
  document.querySelector('#brandTotal').textContent = clients.length;
  document.querySelector('#serviceTotal').textContent = services.length;
  document.querySelector('#projectTotal').textContent = projects.length;
  if (!trafficChart) setTimeout(initCharts, 100);
}

function renderPostQueue() {
  const queue = JSON.parse(localStorage.getItem(postQueueKey) || '[]');
  document.querySelector('#postQueue').innerHTML = queue.length ? `<h3>Social publish queue</h3>${queue.slice(0, 5).map(post => `<div class="queue-row"><strong>${escapeHtml(post.title)}</strong><span>${post.platforms.join(' · ')}</span><button type="button" data-share="${encodeURIComponent(post.text)}">Open share links</button></div>`).join('')}<small>Automatic publishing needs Meta/LinkedIn API credentials and a backend. These buttons open the official sharing flows.</small>` : '';
}

function renderClients() {
  document.querySelector('#clientList').innerHTML = clients.map((client, index) => `<div class="client-admin-row">${client.image ? `<img src="${client.image}" alt="${escapeHtml(client.name)}">` : '<span class="client-placeholder">LOGO</span>'}<input value="${escapeHtml(client.name)}" data-client-name="${index}"><button type="button" data-client-save="${index}">Save</button><button type="button" data-client-delete="${index}">Remove</button></div>`).join('');
}

function renderLeadership() {
  document.querySelector('#ceoName').value = leadership.ceo.name;
  document.querySelector('#ceoRole').value = leadership.ceo.role;
  document.querySelector('#ceoMessage').value = leadership.ceo.message;
  document.querySelector('#ceoPreview').innerHTML = leadership.ceo.image ? `<img src="${leadership.ceo.image}" alt="CEO preview">` : '';
  document.querySelector('#teamList').innerHTML = leadership.team.map((member, index) => `<div class="project-row"><strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(member.role)}</span>${member.image ? `<img class="team-admin-thumb" src="${member.image}" alt="${escapeHtml(member.name)}">` : '<span>No picture</span>'}<button type="button" data-team-delete="${index}">Remove</button></div>`).join('');
}

function renderOffers() {
  document.querySelector('#serviceList').innerHTML = services.map((item, index) => `<div class="project-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.description)}</span><button type="button" data-service-delete="${index}">Remove</button></div>`).join('');
  document.querySelector('#packageList').innerHTML = packages.map((item, index) => `<div class="project-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.description)}</span><button type="button" data-package-delete="${index}">Remove</button></div>`).join('');
}

function showDashboard() {
  localStorage.grandAdmin = '1';
  login.classList.add('hidden');
  app.classList.remove('hidden');
  renderProjectList(); renderPostQueue(); renderClients(); renderLeadership(); renderOffers(); renderOverview();
}
document.querySelector('#loginBtn').onclick = async () => {
  const emailOrUsername = document.querySelector('#user').value.trim();
  const password = document.querySelector('#pass').value;
  if (emailOrUsername.includes('@')) {
    const result = await supabase.auth.signInWithPassword({email: emailOrUsername, password});
    if (!result.error) {
      showDashboard();
      return;
    }
    alert(`Supabase login failed: ${result.error.message}`);
    return;
  }
  if (emailOrUsername === 'Grandcms' && password === 'Grandcms2004') {
    showDashboard();
  } else alert('Invalid login');
};
supabase.auth.getSession().then(({data}) => {
  if (data.session) showDashboard();
  else localStorage.removeItem('grandAdmin');
}).catch(error => console.warn('Could not restore Supabase session:', error));
document.querySelector('#logout').onclick = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('grandAdmin');
  window.location.href = '../index.html';
};

const imageInput = document.querySelector('#projectImages');
const preview = document.querySelector('#imagePreview');
imageInput.addEventListener('change', () => {
  preview.innerHTML = '';
  const files = [...imageInput.files].slice(0, 20);
  if (imageInput.files.length > 20) {
    preview.insertAdjacentHTML('beforeend', '<span>Only the first 20 photos will be uploaded.</span>');
  }
  files.forEach(file => {
    optimizeImage(file, {projectImage: true}).then(result => {
      preview.insertAdjacentHTML('beforeend', `<img src="${result}" alt="${escapeHtml(file.name)}">`);
    }).catch(() => {
      preview.insertAdjacentHTML('beforeend', `<span>Could not optimize ${escapeHtml(file.name)}</span>`);
    });
  });
});

document.querySelector('#projectForm').addEventListener('submit', event => {
  event.preventDefault();
  if (editingProjectIndex < 0 && projects.length >= maxProjects) {
    alert(`Project capacity reached (${maxProjects}). Edit or remove an existing project before adding another.`);
    return;
  }
  const files = [...imageInput.files].slice(0, 20);
  const images = [];
  const failedFiles = [];
  const processFiles = files.reduce((promise, file) => promise.then(() => optimizeImage(file, {projectImage: true}).then(image => {
    images.push(image);
  }).catch(() => {
    failedFiles.push(file.name);
  })), Promise.resolve());
  processFiles.then(() => {
    if (files.length && !images.length) {
      alert('Could not read the selected images. Please use JPG, PNG or WebP files.');
      return;
    }
    const title = document.querySelector('#projectTitle').value.trim();
    const details = document.querySelector('#projectDetails').value.trim();
    if (!title || !details) {
      alert('Please enter the project title and details before publishing.');
      return;
    }
    const platforms = [...document.querySelectorAll('input[name="social"]:checked')].map(input => input.value);
    const date = document.querySelector('#projectDate').value;
    if (!date) {
      alert('Please select the project date before publishing.');
      return;
    }
    const current = editingProjectIndex >= 0 ? projects[editingProjectIndex] : null;
    const project = {title, client: document.querySelector('#projectClient').value.trim(), category: document.querySelector('#projectCategory').value, date, year: date.slice(0, 4), details, images: images.length ? images : (current?.images || [])};
    if (editingProjectIndex >= 0) projects[editingProjectIndex] = project;
    else projects.unshift(project);
    const queue = JSON.parse(localStorage.getItem(postQueueKey) || '[]');
    const previousQueue = JSON.stringify(queue);
    queue.unshift({title, text: `${title} — ${details}`, platforms, createdAt: new Date().toISOString()});
    try {
      localStorage.setItem(postQueueKey, JSON.stringify(queue));
      if (!saveProjects(projects)) throw new Error('Project storage quota exceeded');
    } catch (error) {
      if (editingProjectIndex >= 0) projects[editingProjectIndex] = current;
      else projects.shift();
      localStorage.setItem(postQueueKey, previousQueue);
      alert('Project could not be saved in this browser. Please upload fewer or smaller photos.');
      return;
    }
    renderProjectList(); renderPostQueue(); renderOverview(); event.target.reset(); preview.innerHTML = ''; editingProjectIndex = -1; document.querySelector('#projectForm button[type="submit"]').textContent = 'Publish project to website';
    persistRemoteProject(project).then(() => {
      saveProjects(projects);
    }).catch(error => reportRemoteError(error, 'Project'));
    alert(failedFiles.length ? `Project saved. Skipped ${failedFiles.length} unreadable image(s).` : 'Project saved to the website and social publish queue.');
  }).catch(error => {
    console.error('Could not publish project:', error);
    alert('Project could not be published. Please try again with fewer or smaller photos.');
  });
});

document.querySelector('#projectList').addEventListener('click', event => {
  const btn = event.target;
  const deleteIdx = btn.dataset.delete;
  const manageIdx = btn.dataset.manage;
  const projectIdx = btn.dataset.projectIdx;
  const editIdx = btn.dataset.edit;

  if (editIdx !== undefined) {
    const project = projects[Number(editIdx)];
    if (!project) return;
    editingProjectIndex = Number(editIdx);
    document.querySelector('#projectTitle').value = project.title || '';
    document.querySelector('#projectClient').value = project.client || '';
    document.querySelector('#projectCategory').value = project.category || 'Event';
    document.querySelector('#projectDate').value = project.date || `${project.year || new Date().getFullYear()}-01-01`;
    document.querySelector('#projectDetails').value = project.details || '';
    document.querySelector('#projectForm button[type="submit"]').textContent = 'Update project';
    document.querySelector('#projects').scrollIntoView({behavior: 'smooth'});
  } else if (deleteIdx !== undefined) {
    const removed = projects.splice(Number(deleteIdx), 1)[0];
    saveProjects(projects); renderProjectList(); renderOverview();
    deleteRemoteRecord('projects', removed && removed.id, 'Project').catch(error => reportRemoteError(error, 'Project'));
  } else if (manageIdx !== undefined) {
    const imgDiv = document.querySelector(`#projectImages-${manageIdx}`);
    if (imgDiv) imgDiv.classList.toggle('hidden');
  } else if (projectIdx !== undefined) {
    const imgIdx = btn.dataset.imgIdx;
    const project = projects[projectIdx];
    if (!project || !project.images || !project.images[imgIdx]) return;

    const imgData = project.images[imgIdx];
    let heroSlides = getHeroSlides();
    const existingIdx = heroSlides.findIndex(s => s.image === imgData);

    if (existingIdx >= 0) {
      heroSlides.splice(existingIdx, 1);
      btn.classList.remove('is-hero');
      btn.textContent = 'Set Hero Slide';
    } else {
      if (heroSlides.length >= 20) {
        alert('You can select up to 20 hero slides.');
        return;
      }
      heroSlides.push({ image: imgData, caption: project.title });
      btn.classList.add('is-hero');
      btn.textContent = '★ Hero Slide';
    }
    saveHeroSlides(heroSlides);
  }
});
document.querySelector('#clientForm').addEventListener('submit', event => {
  event.preventDefault();
  if (clients.length >= maxClientLogos) {
    alert(`Client logo capacity reached (${maxClientLogos}). Remove an old logo before adding another.`);
    return;
  }
  const logoInput = document.querySelector('#clientLogo');
  if (logoInput.files.length > 1) {
    logoInput.value = '';
    document.querySelector('#clientPreview').innerHTML = '<span>Upload one logo at a time.</span>';
    return;
  }
  const file = logoInput.files[0];
  if (!file) return;
  optimizeImage(file, {removeBackground: true}).catch(() => readFileAsDataUrl(file)).then(image => {
    clients.unshift({name: document.querySelector('#clientName').value.trim(), image});
    try {
      if (!saveClients()) throw new Error('Client logo storage quota exceeded');
      renderClients(); renderOverview(); event.target.reset(); document.querySelector('#clientPreview').innerHTML = '';
      persistRemoteClient(clients[0]).then(() => {
        saveClients();
        renderClients();
      }).catch(error => reportRemoteError(error, 'Client logo'));
    } catch (error) {
      clients.shift();
      alert('Logo could not be saved. Please use a smaller image.');
    }
  }).catch(() => alert('Could not read logo image.'));
});
document.querySelector('#clientLogo').addEventListener('change', event => {
  const file = event.target.files[0];
  const preview = document.querySelector('#clientPreview');
  preview.innerHTML = '';
  if (!file) return;
  optimizeImage(file, {removeBackground: true}).catch(() => readFileAsDataUrl(file)).then(image => {
    preview.innerHTML = `<img src="${image}" alt="Processed logo preview">`;
  }).catch(() => {
    preview.innerHTML = '<span>Could not read logo image.</span>';
  });
});
document.querySelector('#clientList').addEventListener('click', event => {
  const saveIndex = event.target.dataset.clientSave;
  const deleteIndex = event.target.dataset.clientDelete;
  if (saveIndex !== undefined) {
    clients[Number(saveIndex)].name = event.target.parentElement.querySelector('[data-client-name]').value.trim();
    saveClients(); renderClients(); renderOverview();
    const client = clients[Number(saveIndex)];
    if (client) persistRemoteClient(client).then(() => { saveClients(); renderClients(); }).catch(error => reportRemoteError(error, 'Client logo'));
  }
  if (deleteIndex !== undefined) {
    const removed = clients.splice(Number(deleteIndex), 1)[0];
    saveClients(); renderClients(); renderOverview();
    deleteRemoteRecord('clients', removed && removed.id, 'Client').catch(error => reportRemoteError(error, 'Client logo'));
  }
});
document.querySelector('#leadershipForm').addEventListener('submit', event => {
  event.preventDefault();
  const file = document.querySelector('#ceoImage').files[0];
  const update = image => {
    leadership.ceo = {name: document.querySelector('#ceoName').value.trim(), role: document.querySelector('#ceoRole').value.trim(), message: document.querySelector('#ceoMessage').value.trim(), image: image || leadership.ceo.image};
    saveLeadership(); renderLeadership();
    persistRemoteLeadership().then(() => { saveLeadership(); renderLeadership(); }).catch(error => reportRemoteError(error, 'CEO profile'));
    alert('CEO profile saved.');
  };
  if (file) optimizeImage(file).then(update).catch(() => alert('Could not optimize CEO image.'));
  else update('');
});
document.querySelector('#teamForm').addEventListener('submit', event => {
  event.preventDefault();
  const file = document.querySelector('#teamImage').files[0];
  const member = {name: document.querySelector('#teamName').value.trim(), role: document.querySelector('#teamRole').value.trim(), image: ''};
  const addMember = image => {
    member.image = image || '';
    leadership.team.push(member);
    saveLeadership(); renderLeadership(); event.target.reset(); document.querySelector('#teamPreview').innerHTML = '';
    persistRemoteLeadership().then(() => { saveLeadership(); renderLeadership(); }).catch(error => reportRemoteError(error, 'Team member'));
  };
  if (file) optimizeImage(file, {projectImage: true}).then(addMember).catch(() => {
    const reader = new FileReader();
    reader.onload = () => addMember(reader.result);
    reader.onerror = () => alert('Could not read team member picture.');
    reader.readAsDataURL(file);
  });
  else addMember('');
});
document.querySelector('#teamImage').addEventListener('change', event => {
  const file = event.target.files[0];
  const preview = document.querySelector('#teamPreview');
  preview.innerHTML = '';
  if (!file) return;
  optimizeImage(file, {projectImage: true}).then(image => {
    preview.innerHTML = `<img src="${image}" alt="Team member preview">`;
  }).catch(() => {
    preview.innerHTML = '<span>Picture will be saved in original format.</span>';
  });
});
document.querySelector('#teamList').addEventListener('click', event => {
  const index = event.target.dataset.teamDelete;
  if (index === undefined) return;
  const removed = leadership.team.splice(Number(index), 1)[0];
  saveLeadership(); renderLeadership();
  deleteRemoteRecord('leadership', removed && removed.id, 'Team member').catch(error => reportRemoteError(error, 'Team member'));
});
document.querySelector('#serviceForm').addEventListener('submit', event => {
  event.preventDefault();
  services.push({name: document.querySelector('#serviceName').value.trim(), description: document.querySelector('#serviceDescription').value.trim()});
  saveOffers(); renderOffers(); renderOverview(); event.target.reset();
});
document.querySelector('#packageForm').addEventListener('submit', event => {
  event.preventDefault();
  packages.push({name: document.querySelector('#packageName').value.trim(), description: document.querySelector('#packageDescription').value.trim()});
  saveOffers(); renderOffers(); event.target.reset();
});
document.querySelector('#serviceList').addEventListener('click', event => {
  const index = event.target.dataset.serviceDelete;
  if (index === undefined) return;
  services.splice(Number(index), 1); saveOffers(); renderOffers(); renderOverview();
});
document.querySelector('#packageList').addEventListener('click', event => {
  const index = event.target.dataset.packageDelete;
  if (index === undefined) return;
  packages.splice(Number(index), 1); saveOffers(); renderOffers();
});
document.querySelector('#postQueue').addEventListener('click', event => {
  const text = event.target.dataset.share;
  if (!text) return;
  const url = window.location.href.split('/admin/')[0];
  [ `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${text}`, `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, 'https://www.instagram.com/' ].forEach(link => window.open(link, '_blank', 'noopener,noreferrer'));
});
document.querySelectorAll('.save').forEach(button => {
  if (button.closest('#projectForm')) return;
  button.onclick = () => alert('Saved in this browser. Connect the data API/Git CMS for multi-device publishing.');
});

loadRemoteAdminContent();
