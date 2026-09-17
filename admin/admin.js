const login = document.querySelector('#login');
const app = document.querySelector('#app');
const projectKey = 'grandProjects';
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
const heroSliderKey = 'grandHeroSlides';
const getHeroSlides = () => JSON.parse(localStorage.getItem(heroSliderKey) || '[]');
const saveHeroSlides = slides => localStorage.setItem(heroSliderKey, JSON.stringify(slides));
const postQueueKey = 'grandPostQueue';
const clientKey = 'grandClients';
const defaultClients = ['Daraz', 'Mentors', 'City Bank', 'Next Block', 'PFEC', 'WonderLand', 'Nahar Agro', 'M&M', 'Farzana Malik', 'Radisson Blu', '1st ICT Fair', 'CTG Rehab'];
let clients = JSON.parse(localStorage.getItem(clientKey) || 'null') || defaultClients.map(name => ({name, image: ''}));
const saveClients = () => localStorage.setItem(clientKey, JSON.stringify(clients));
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
  team: [{name: 'Mahin Uddin Mazumder', role: 'Chief Operating Officer'}, {name: 'GRAND Team', role: 'Creative & Communication'}, {name: 'GRAND Team', role: 'Production & Supply'}]
};
let leadership = JSON.parse(localStorage.getItem(leadershipKey) || 'null') || defaultLeadership;
const saveLeadership = () => localStorage.setItem(leadershipKey, JSON.stringify(leadership));

function optimizeImage(file, options = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = reader.result; };
    reader.onerror = () => reject(reader.error);
    image.onload = () => {
      const maxSize = options.projectImage ? 1400 : 1600;
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
      }, outputType, options.removeBackground ? undefined : (options.projectImage ? 0.7 : 0.82));
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
    return `<div class="project-row"><strong>${escapeHtml(project.title)}</strong><span>${escapeHtml(project.client)} · ${escapeHtml(project.category)} · ${escapeHtml(project.year)}</span><button data-manage="${index}" type="button">Manage Images</button><button data-delete="${index}" type="button">Delete</button></div>${imagesHtml}`;
  }).join('');
}

let trafficChart, countryChart;
const generateMockTraffic = (days) => Array.from({length: days}, (_, i) => Math.floor(Math.random() * 50) + 20 + Math.floor(i * (days > 30 ? 2 : 0.5)));

function initCharts() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.color = '#a79e91';
  Chart.defaults.font.family = 'Inter, sans-serif';

  const ctxTraffic = document.getElementById('trafficChart');
  const ctxCountry = document.getElementById('countryChart');
  if (!ctxTraffic || !ctxCountry) return;

  trafficChart = new Chart(ctxTraffic, {
    type: 'line',
    data: {
      labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
      datasets: [{
        label: 'Visitors',
        data: generateMockTraffic(30),
        borderColor: '#c39a4a',
        backgroundColor: 'rgba(195, 154, 74, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });

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
        legend: { position: 'bottom', labels: { padding: 20, boxWidth: 12 } }
      }
    }
  });

  const toggles = document.querySelectorAll('#trafficToggles button');
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      toggles.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const view = e.target.dataset.view;
      
      if (view === 'daily') {
        trafficChart.data.labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        trafficChart.data.datasets[0].data = generateMockTraffic(24).map(v => Math.floor(v / 3));
      } else if (view === 'monthly') {
        trafficChart.data.labels = Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
        trafficChart.data.datasets[0].data = generateMockTraffic(30);
      } else if (view === 'yearly') {
        trafficChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        trafficChart.data.datasets[0].data = generateMockTraffic(12).map(v => v * 30);
      }
      trafficChart.update();
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
  document.querySelector('#teamList').innerHTML = leadership.team.map((member, index) => `<div class="project-row"><strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(member.role)}</span><button type="button" data-team-delete="${index}">Remove</button></div>`).join('');
}

function renderOffers() {
  document.querySelector('#serviceList').innerHTML = services.map((item, index) => `<div class="project-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.description)}</span><button type="button" data-service-delete="${index}">Remove</button></div>`).join('');
  document.querySelector('#packageList').innerHTML = packages.map((item, index) => `<div class="project-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.description)}</span><button type="button" data-package-delete="${index}">Remove</button></div>`).join('');
}

document.querySelector('#loginBtn').onclick = () => {
  if (document.querySelector('#user').value === 'Grandcms' && document.querySelector('#pass').value === 'Grandcms2004') {
    localStorage.grandAdmin = '1'; login.classList.add('hidden'); app.classList.remove('hidden'); renderProjectList(); renderLeadership(); renderOffers(); renderOverview();
  } else alert('Invalid login');
};
if (localStorage.grandAdmin) { login.classList.add('hidden'); app.classList.remove('hidden'); renderProjectList(); renderPostQueue(); renderClients(); renderLeadership(); renderOffers(); renderOverview(); }
document.querySelector('#logout').onclick = () => {
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
      projects.shift();
      alert('Please enter the project title and details before publishing.');
      return;
    }
    const platforms = [...document.querySelectorAll('input[name="social"]:checked')].map(input => input.value);
    projects.unshift({title, client: document.querySelector('#projectClient').value.trim(), category: document.querySelector('#projectCategory').value, year: document.querySelector('#projectYear').value, details, images});
    const queue = JSON.parse(localStorage.getItem(postQueueKey) || '[]');
    const previousQueue = JSON.stringify(queue);
    queue.unshift({title, text: `${title} — ${details}`, platforms, createdAt: new Date().toISOString()});
    try {
      localStorage.setItem(postQueueKey, JSON.stringify(queue));
      if (!saveProjects(projects)) throw new Error('Project storage quota exceeded');
    } catch (error) {
      projects.shift();
      localStorage.setItem(postQueueKey, previousQueue);
      alert('Project could not be saved in this browser. Please upload fewer or smaller photos.');
      return;
    }
    renderProjectList(); renderPostQueue(); renderOverview(); event.target.reset(); preview.innerHTML = ''; document.querySelector('#projectYear').value = '2025'; alert(failedFiles.length ? `Project published. Skipped ${failedFiles.length} unreadable image(s).` : 'Project published to the website and social publish queue.');
  });
});

document.querySelector('#projectList').addEventListener('click', event => {
  const btn = event.target;
  const deleteIdx = btn.dataset.delete;
  const manageIdx = btn.dataset.manage;
  const projectIdx = btn.dataset.projectIdx;

  if (deleteIdx !== undefined) {
    projects.splice(Number(deleteIdx), 1); saveProjects(projects); renderProjectList(); renderOverview();
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
      heroSlides.push({ image: imgData, caption: project.title });
      btn.classList.add('is-hero');
      btn.textContent = '★ Hero Slide';
    }
    saveHeroSlides(heroSlides);
  }
});
document.querySelector('#clientForm').addEventListener('submit', event => {
  event.preventDefault();
  const logoInput = document.querySelector('#clientLogo');
  if (logoInput.files.length > 1) {
    logoInput.value = '';
    document.querySelector('#clientPreview').innerHTML = '<span>Upload one logo at a time.</span>';
    return;
  }
  const file = logoInput.files[0];
  if (!file) return;
  optimizeImage(file, {removeBackground: true}).then(image => {
    clients.unshift({name: document.querySelector('#clientName').value.trim(), image});
    saveClients(); renderClients(); renderOverview(); event.target.reset(); document.querySelector('#clientPreview').innerHTML = '';
  }).catch(() => alert('Could not optimize logo image.'));
});
document.querySelector('#clientLogo').addEventListener('change', event => {
  const file = event.target.files[0];
  const preview = document.querySelector('#clientPreview');
  preview.innerHTML = '';
  if (!file) return;
  optimizeImage(file, {removeBackground: true}).then(image => {
    preview.innerHTML = `<img src="${image}" alt="Processed logo preview">`;
  }).catch(() => {
    preview.innerHTML = '<span>Could not process logo image.</span>';
  });
});
document.querySelector('#clientList').addEventListener('click', event => {
  const saveIndex = event.target.dataset.clientSave;
  const deleteIndex = event.target.dataset.clientDelete;
  if (saveIndex !== undefined) {
    clients[Number(saveIndex)].name = event.target.parentElement.querySelector('[data-client-name]').value.trim();
    saveClients(); renderClients(); renderOverview();
  }
  if (deleteIndex !== undefined) {
    clients.splice(Number(deleteIndex), 1); saveClients(); renderClients(); renderOverview();
  }
});
document.querySelector('#leadershipForm').addEventListener('submit', event => {
  event.preventDefault();
  const file = document.querySelector('#ceoImage').files[0];
  const update = image => {
    leadership.ceo = {name: document.querySelector('#ceoName').value.trim(), role: document.querySelector('#ceoRole').value.trim(), message: document.querySelector('#ceoMessage').value.trim(), image: image || leadership.ceo.image};
    saveLeadership(); renderLeadership(); alert('CEO profile saved.');
  };
  if (file) optimizeImage(file).then(update).catch(() => alert('Could not optimize CEO image.'));
  else update('');
});
document.querySelector('#teamForm').addEventListener('submit', event => {
  event.preventDefault();
  leadership.team.push({name: document.querySelector('#teamName').value.trim(), role: document.querySelector('#teamRole').value.trim()});
  saveLeadership(); renderLeadership(); event.target.reset();
});
document.querySelector('#teamList').addEventListener('click', event => {
  const index = event.target.dataset.teamDelete;
  if (index === undefined) return;
  leadership.team.splice(Number(index), 1); saveLeadership(); renderLeadership();
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
