import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyABMVB4pYyQMil8XaQu2zf6_siHlDMCgRE",
  authDomain: "neuron5.firebaseapp.com",
  projectId: "neuron5",
  storageBucket: "neuron5.firebasestorage.app",
  messagingSenderId: "45038955818",
  appId: "1:45038955818:web:856c83eaa31dfbc747c253"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let currentUserId = "default_user";

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        document.getElementById('auth-overlay').classList.add('hidden');
        
        let profile = JSON.parse(localStorage.getItem('nexusProfile')) || {};
        if(user.email && !profile.name) {
            profile.name = user.displayName || user.email.split('@')[0];
            profile.handle = "@" + user.email.split('@')[0];
        }
        if(user.photoURL && !profile.avatarUrl) {
            profile.avatarUrl = user.photoURL;
        }
        localStorage.setItem('nexusProfile', JSON.stringify(profile));

        loadData();
        loadProfileData();
    } else {
        currentUserId = "default_user";
        document.getElementById('auth-overlay').classList.remove('hidden');
    }
});

window.firebaseAuthModules = { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, googleProvider };
window.firebaseDbModules = { db, ref, set, onValue };
window.getCurrentUserId = () => currentUserId;

let pipWindow = null;
const getWin = () => pipWindow || window;
const getDoc = () => pipWindow ? pipWindow.document : document;

const lifeAreas = [
    { id: 'health', name: 'Saúde & Físico', color: '#29FA10', keywords: ['saude', 'saúde', 'corpo', 'academia', 'treino', 'medico', 'consulta', 'atestado', 'falta', 'exame', 'remedio'] },
    { id: 'mind', name: 'Mente & Intelecto', color: '#37617A', keywords: ['estudar', 'livro', 'ler', 'curso', 'faculdade'] },
    { id: 'social', name: 'Relacionamentos', color: '#f23839', keywords: ['amor', 'namorado', 'casamento', 'mae', 'pai'] },
    { id: 'career', name: 'Carreira & Finanças', color: '#f2ca50', keywords: ['trabalho', 'emprego', 'dinheiro', 'salario', 'chefe', 'empresa', 'falta'] },
    { id: 'spirit', name: 'Espiritual & Emocional', color: '#378c4b', keywords: ['deus', 'fé', 'orar', 'meditar', 'paz'] }
];

const viewport = document.getElementById('viewport');
const world = document.getElementById('world');
const soloLinesLayer = document.getElementById('solo-lines');
const gradDefsSolo = document.getElementById('grad-defs-solo');

const mainUI = document.getElementById('mainUI');
const morphDock = document.getElementById('morphDock');
const colorList = document.getElementById('colorList');

const morphAiBar = document.getElementById('morphAiBar');
const aiQuickInput = document.getElementById('aiQuickInput');
const aiSendBtn = document.getElementById('aiSendBtn');

const popupOverlay = document.getElementById('popupOverlay');
const popupCard = document.getElementById('popupCard');
const popupTitle = document.getElementById('popupTitle');
const aiBadge = document.getElementById('aiBadge');
const aiBadgeText = document.getElementById('aiBadgeText');
const popupInput = document.getElementById('popupInput');
const btnSave = document.getElementById('btnSave');
const btnDelete = document.getElementById('btnDelete');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');

const homeBtn = document.getElementById('homeBtn');
const profileOverlay = document.getElementById('profile-overlay');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const neuralGrid = document.getElementById('neural-grid');
const statCountIdeas = document.getElementById('stat-count-ideas');

const saveProfileBtn = document.getElementById('saveProfileBtn');
const inputName = document.getElementById('input-name');
const inputHandle = document.getElementById('input-handle');
const inputBio = document.getElementById('input-bio');
const inputAvatarUrl = document.getElementById('input-avatar-url');
const inputGeminiKey = document.getElementById('input-gemini-key');
const testApiBtn = document.getElementById('testApiBtn');
const apiFeedbackBadge = document.getElementById('apiFeedbackBadge');
const pName = document.getElementById('p-name');
const pHandle = document.getElementById('p-handle');
const pBio = document.getElementById('p-bio');
const pAvatarLetter = document.getElementById('p-avatar-letter');
const avatarLargeContainer = document.getElementById('avatarLargeContainer');

const symbiosisBtn = document.getElementById('symbiosisBtn');
const radarOverlay = document.getElementById('radarOverlay');
const symbiosisDimension = document.getElementById('symbiosis-dimension');
const sphereView = document.getElementById('sphere-view');
const neuralSphere = document.getElementById('neural-sphere');
const symbiosisMapContainer = document.getElementById('symbiosis-map-container');
const symbiosisWorld = document.getElementById('symbiosis-world');
const symbiosisLinesLayer = document.getElementById('symbiosis-lines');
const gradDefsSymbiosis = document.getElementById('grad-defs-symbiosis');
const toggleViewBtn = document.getElementById('toggle-view');
const nearbyUsersOverlay = document.getElementById('nearby-users-overlay');
const usersListContent = document.getElementById('users-list-content');
const closeUsersBtn = document.getElementById('closeUsers');

let authMode = 'login';
function switchAuthMode(mode) {
    authMode = mode;
    const tabLogin = document.getElementById('tabLoginBtn');
    const tabRegister = document.getElementById('tabRegisterBtn');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');

    if(mode === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        authTitle.innerText = "Bem-vindo ao Neuron";
        authSubtitle.innerText = "Entre para acessar seu cosmos neural";
        authSubmitBtn.innerText = "Entrar";
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        authTitle.innerText = "Criar Conta";
        authSubtitle.innerText = "Comece a mapear sua mente agora";
        authSubmitBtn.innerText = "Cadastrar";
    }
}
window.switchAuthMode = switchAuthMode;

async function handleAuthSubmit() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    if(!email || !password) {
        showToast("Preencha o e-mail e a senha.");
        return;
    }
    try {
        const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = window.firebaseAuthModules;
        if(authMode === 'login') {
            await signInWithEmailAndPassword(auth, email, password);
            showToast("Login realizado com sucesso!");
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            showToast("Conta criada com sucesso!");
        }
    } catch (error) {
        showToast("Erro: " + error.message);
    }
}
window.handleAuthSubmit = handleAuthSubmit;

async function handleGoogleLogin() {
    try {
        const { auth, signInWithPopup, googleProvider } = window.firebaseAuthModules;
        await signInWithPopup(auth, googleProvider);
        showToast("Login com Google realizado!");
    } catch (error) {
        showToast("Erro no Google Login: " + error.message);
    }
}
window.handleGoogleLogin = handleGoogleLogin;

let bubblesArray = [];
let symbiosisBubblesArray = [];
let spherePoints = [];
let activeArea = lifeAreas[0];
let currentBubble = null;
let pendingCreationCoords = null; 
let isSymbiosisActive = false;
let currentSymbiosisView = 'sphere';
let worldX = 0, worldY = 0, scale = 1, isPanning = false, startPanX = 0, startPanY = 0;
let initialPinchDist = 0;
let initialScale = 1;
let sphereAnimationFrame;

function updateWorldTransform() {
    world.style.transform = `translate(${worldX}px, ${worldY}px) scale(${scale})`;
    if (scale < 0.6) getDoc().body.classList.add('zoom-out'); else getDoc().body.classList.remove('zoom-out');
}

window.switchTab = function(tabName, evt) {
    const doc = getDoc();
    doc.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(evt && evt.currentTarget) evt.currentTarget.classList.add('active');
    doc.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    doc.getElementById(`tab-${tabName}`).classList.add('active');
};

let allNewsData = {};

function stripHtml(html) {
    let tmp = getDoc().createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function buildNewsUI() {
    const container = getDoc().getElementById('news-sections-container');
    if(!container) return;
    container.innerHTML = ''; 
    lifeAreas.forEach(area => {
        container.appendChild(createCarouselHTML(area.id, area.name, area.color));
    });
}

function createCarouselHTML(id, title, color) {
    const section = getDoc().createElement('div');
    section.className = 'sidebar-news-section';
    section.innerHTML = `
        <h4 class="sidebar-news-title" style="color: ${color}">${title}</h4>
        <div class="sidebar-news-carousel">
            <div class="sidebar-news-content" id="carousel-content-${id}">
                <div class="empty-state" style="padding:10px; font-size:11px; flex: 0 0 100%;">Buscando sinais...</div>
            </div>
            <div class="news-controls">
                <button class="prev-news" data-target="${id}" title="Anterior">❮</button>
                <span class="news-indicator" id="indicator-${id}">- / -</span>
                <button class="next-news" data-target="${id}" title="Próxima">❯</button>
            </div>
        </div>
    `;
    return section;
}

async function fetchAllNews() {
    const rssSources = {
        'health': 'https://g1.globo.com/rss/g1/saude/',
        'mind': 'https://g1.globo.com/rss/g1/educacao/',
        'social': 'https://g1.globo.com/rss/g1/pop-arte/', 
        'career': 'https://g1.globo.com/rss/g1/economia/',
        'spirit': 'https://g1.globo.com/rss/g1/ciencia-e-saude/'
    };

    let delay = 0;
    lifeAreas.forEach(area => {
        setTimeout(() => {
            const rssUrl = rssSources[area.id] || `https://g1.globo.com/rss/g1/`;
            fetchAndRenderNews(area.id, rssUrl, area.name, area.color);
        }, delay);
        delay += 800;
    });
}

async function fetchAndRenderNews(id, rssUrl, areaName, areaColor) {
    const contentDiv = getDoc().getElementById(`carousel-content-${id}`);
    if(!contentDiv) return;
    try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await res.json();
        if(data.status === 'ok' && data.items.length > 0) {
            allNewsData[id] = data.items;
            renderCarouselItems(id, areaName, areaColor);
        } else {
            throw new Error("Falha ou sem resultados");
        }
    } catch(e) {
        if(getDoc().getElementById(`carousel-content-${id}`)) {
            getDoc().getElementById(`carousel-content-${id}`).innerHTML = '<div class="empty-state" style="padding:10px; font-size:11px; flex: 0 0 100%;">Mundo exterior inacessível.</div>';
        }
    }
}

function renderCarouselItems(id, areaName, areaColor) {
    const contentDiv = getDoc().getElementById(`carousel-content-${id}`);
    const items = allNewsData[id];
    if(!contentDiv || !items) return;

    contentDiv.innerHTML = '';
    items.forEach((item, index) => {
        let imgUrl = item.enclosure?.link || item.thumbnail;
        const htmlContent = item.content || item.description || "";
        if(!imgUrl && htmlContent.includes('<img')) {
            const match = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
            if(match) imgUrl = match[1];
        }
        if(!imgUrl) {
            const cleanColor = areaColor.replace('#', '');
            imgUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(areaName)}&background=${cleanColor}&color=fff&size=400`;
        }

        let rawDesc = item.description.replace(/<img[^>]*>/g, "").replace(/<br\s*[\/]?>/gi, " "); 
        let cleanDesc = stripHtml(rawDesc).trim();
        if(cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + "...";

        contentDiv.innerHTML += `
            <a href="${item.link}" target="_blank" class="s-news-card" data-index="${index}">
                <div class="s-news-img" style="background-image: url('${imgUrl}')"></div>
                <div class="s-news-info">
                    <div class="s-news-text">${item.title}</div>
                    <div class="s-news-desc">${cleanDesc}</div>
                    <div class="s-news-date">${new Date(item.pubDate).toLocaleDateString('pt-BR')}</div>
                </div>
            </a>
        `;
    });
    updateIndicator(id, 0);

    contentDiv.addEventListener('scroll', () => {
        const scrollLeft = contentDiv.scrollLeft;
        const cardElement = contentDiv.querySelector('.s-news-card');
        if(cardElement) {
            const cardWidth = cardElement.offsetWidth + 15;
            const index = Math.round(scrollLeft / cardWidth);
            updateIndicator(id, index);
        }
    });
}

function updateIndicator(id, index) {
    const indicator = getDoc().getElementById(`indicator-${id}`);
    const items = allNewsData[id];
    if(indicator && items && items.length > 0) {
        const safeIndex = Math.min(Math.max(index, 0), items.length - 1);
        indicator.innerText = `${safeIndex + 1} / ${items.length}`;
    }
}

const handleGlobalClick = (e) => {
    if(e.target.classList && e.target.classList.contains('prev-news')) {
        const id = e.target.getAttribute('data-target');
        const contentDiv = getDoc().getElementById(`carousel-content-${id}`);
        if(contentDiv) {
            const cardElement = contentDiv.querySelector('.s-news-card');
            if(cardElement) contentDiv.scrollBy({ left: -(cardElement.offsetWidth + 15), behavior: 'smooth' });
        }
    }
    if(e.target.classList && e.target.classList.contains('next-news')) {
        const id = e.target.getAttribute('data-target');
        const contentDiv = getDoc().getElementById(`carousel-content-${id}`);
        if(contentDiv) {
            const cardElement = contentDiv.querySelector('.s-news-card');
            if(cardElement) contentDiv.scrollBy({ left: cardElement.offsetWidth + 15, behavior: 'smooth' });
        }
    }
    if (!morphAiBar.contains(e.target)) {
        morphAiBar.classList.remove('open');
    }
};

document.addEventListener('click', handleGlobalClick);

homeBtn.addEventListener('click', () => {
    if(isSymbiosisActive) return;
    loadProfileData();
    renderDashboard(); 
    profileOverlay.classList.add('active');
    viewport.classList.add('blurred');
});

morphAiBar.addEventListener('click', (e) => {
    e.stopPropagation();
    morphAiBar.classList.add('open');
    setTimeout(() => aiQuickInput.focus(), 200);
});

async function handleAiBarQuery() {
    const query = aiQuickInput.value.trim();
    if (!query) return;
    showToast("Analisando consulta com IA...");
    aiQuickInput.value = "";
    morphAiBar.classList.remove('open');
}

aiSendBtn.addEventListener('click', (e) => { e.stopPropagation(); handleAiBarQuery(); });
aiQuickInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.stopPropagation(); handleAiBarQuery(); } });

closeProfileBtn.addEventListener('click', () => {
    profileOverlay.classList.remove('active');
    viewport.classList.remove('blurred');
});

function triggerAvatarChange() { getDoc().getElementById('avatarFileInput').click(); }
window.triggerAvatarChange = triggerAvatarChange;

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarUrl = e.target.result;
            let profileData = JSON.parse(localStorage.getItem('nexusProfile')) || {};
            profileData.avatarUrl = avatarUrl;
            localStorage.setItem('nexusProfile', JSON.stringify(profileData));
            inputAvatarUrl.value = avatarUrl;
            loadProfileData();
            showToast("Foto de perfil atualizada!");
        }
        reader.readAsDataURL(file);
    }
}
window.handleAvatarUpload = handleAvatarUpload;

saveProfileBtn.addEventListener('click', () => {
    let profileData = JSON.parse(localStorage.getItem('nexusProfile')) || {};
    profileData.name = inputName.value;
    profileData.handle = inputHandle.value;
    profileData.bio = inputBio.value;
    profileData.geminiKey = inputGeminiKey.value;
    if(inputAvatarUrl.value.trim() !== "") profileData.avatarUrl = inputAvatarUrl.value.trim();
    localStorage.setItem('nexusProfile', JSON.stringify(profileData));
    loadProfileData();
    showToast("Perfil e Configurações Salvas");
});

function loadProfileData() {
    const data = JSON.parse(localStorage.getItem('nexusProfile'));
    if(data) {
        pName.innerText = data.name || "Usuário Nexus";
        pHandle.innerText = data.handle || "@viajante_neural";
        pBio.innerText = data.bio || "Explorando o cosmos...";
        if(data.avatarUrl) {
            avatarLargeContainer.style.backgroundImage = `url('${data.avatarUrl}')`;
            pAvatarLetter.style.display = 'none';
        }
    }
}

function renderDashboard() {
    statCountIdeas.innerText = bubblesArray.length;
    neuralGrid.innerHTML = '';
    if(bubblesArray.length === 0) {
        neuralGrid.innerHTML = '<div class="empty-state">Nenhuma ideia criada ainda.</div>';
        return;
    }
    bubblesArray.forEach(bubble => {
        const card = getDoc().createElement('div');
        card.classList.add('thought-card');
        card.style.borderColor = bubble.area.color;
        card.innerHTML = `
            <div class="card-preview-text">${bubble.tooltip.innerText || "Sem texto..."}</div>
            <div class="card-meta"><span style="color:${bubble.area.color}">${bubble.area.name}</span></div>
        `;
        card.addEventListener('click', () => {
            profileOverlay.classList.remove('active');
            viewport.classList.remove('blurred');
            openPopup(bubble);
        });
        neuralGrid.appendChild(card);
    });
}

function loadData() {
    buildNewsUI();
    fetchAllNews();
}

function openPopup(bubble) {
    currentBubble = bubble;
    popupTitle.innerText = `Ideia • ${bubble.area.name}`;
    popupInput.value = bubble.tooltip.innerText;
    popupOverlay.classList.add('active');
}

function showToast(text) {
    toastText.innerText = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
