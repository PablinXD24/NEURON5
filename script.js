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
let mainLoopId;
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
let allNewsFetched = false;

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
            getDoc().getElementById(`carousel-content-${id}`).innerHTML = '<div class="empty-state" style="padding:10px; font-size:11px; flex: 0 0 100%;">Mundo exterior inacessível ou sem notícias no momento.</div>';
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
        if(imgUrl && (imgUrl.includes('1x1') || imgUrl.includes('pixel') || imgUrl.includes('logger'))) {
            imgUrl = null;
        }
        if(!imgUrl) {
            const cleanColor = areaColor.replace('#', '');
            imgUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(areaName)}&background=${cleanColor}&color=fff&size=400&font-size=0.33`;
        }

        let rawDesc = item.description.replace(/<img[^>]*>/g, "").replace(/<br\s*[\/]?>/gi, " "); 
        let cleanDesc = stripHtml(rawDesc).trim();
        cleanDesc = cleanDesc.replace(/Read more.+/gi, '').trim();

        if(cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + "...";
        if(cleanDesc === item.title) cleanDesc = "Clique para ler a matéria completa...";

        contentDiv.innerHTML += `
            <a href="${item.link}" target="_blank" class="s-news-card" data-index="${index}">
                <div class="s-news-img" style="background-image: url('${imgUrl}')"></div>
                <div class="s-news-info">
                    <div class="s-news-text">${item.title}</div>
                    <div class="s-news-desc">${cleanDesc}</div>
                    <div class="s-news-date">${new Date(item.pubDate).toLocaleDateString('pt-BR')} às ${new Date(item.pubDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</div>
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
            if(cardElement) {
                const cardWidth = cardElement.offsetWidth + 15;
                contentDiv.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            }
        }
    }
    if(e.target.classList && e.target.classList.contains('next-news')) {
        const id = e.target.getAttribute('data-target');
        const contentDiv = getDoc().getElementById(`carousel-content-${id}`);
        if(contentDiv) {
            const cardElement = contentDiv.querySelector('.s-news-card');
            if(cardElement) {
                const cardWidth = cardElement.offsetWidth + 15;
                contentDiv.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        }
    }
    if (!morphAiBar.contains(e.target)) {
        morphAiBar.classList.remove('open');
    }
};

const handleGlobalTouchMove = (e) => {
    if(profileOverlay.classList.contains('active')) return;
    if (e.touches.length === 2 && initialPinchDist > 0) {
        e.preventDefault();
        const currentDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        const zoomFactor = currentDist / initialPinchDist;
        const smoothedZoomFactor = 1 + (zoomFactor - 1) * 0.35;
        const newScale = Math.min(Math.max(0.1, initialScale * smoothedZoomFactor), 5);
        const centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
        const centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
        const mouseX = centerX - worldX; 
        const mouseY = centerY - worldY;
        worldX -= mouseX * (newScale / scale - 1); 
        worldY -= mouseY * (newScale / scale - 1);
        scale = newScale; 
        updateWorldTransform();
    } else if (isPanning && !isSymbiosisActive && e.touches.length === 1) {
        e.preventDefault(); 
        const pos = getEventPos(e); 
        worldX = pos.x - startPanX; 
        worldY = pos.y - startPanY;
        updateWorldTransform();
    }
};

const handleGlobalMouseMove = (e) => {
    if (isPanning && !isSymbiosisActive) {
        e.preventDefault(); const pos = getEventPos(e); worldX = pos.x - startPanX; worldY = pos.y - startPanY;
        updateWorldTransform();
    }
};

const handleGlobalMouseUp = () => { isPanning = false; viewport.style.cursor = 'grab'; };

const handleGlobalTouchEnd = (e) => { 
    if(e.touches.length < 2) initialPinchDist = 0;
    if(e.touches.length === 0) isPanning = false; 
};

document.addEventListener('click', handleGlobalClick);
window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
window.addEventListener('mousemove', handleGlobalMouseMove);
window.addEventListener('mouseup', handleGlobalMouseUp);
window.addEventListener('touchend', handleGlobalTouchEnd);

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

    const userIdeas = bubblesArray.map(b => `[${b.area.name}]: ${b.tooltip.innerText}`).join("\n");
    const profile = JSON.parse(localStorage.getItem('nexusProfile')) || {};
    const apiKey = profile.geminiKey || ""; 

    if (!apiKey) {
        const matching = bubblesArray.filter(b => b.tooltip.innerText.toLowerCase().includes(query.toLowerCase()));
        if(matching.length > 0) {
            showToast(`Encontrado: ${matching[0].tooltip.innerText}`);
        } else {
            showToast("Insira sua Gemini API nas Configurações para respostas completas.");
        }
        return;
    }

    try {
        const prompt = `Você é o assistente inteligente do sistema de mapeamento neural.
Contexto das ideias salvas pelo usuário:
${userIdeas}

Com base nas informações do usuário e no input: "${query}", responda de forma coesa e prestativa.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error(data.error?.message || "Erro na resposta da API.");
        }

        const rawText = data.candidates[0].content.parts[0].text;
        showToast(rawText.substring(0, 100) + "...");

    } catch (error) {
        console.error("Erro na consulta da IA:", error);
        showToast("Erro ao processar consulta com IA.");
    }
}

aiSendBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleAiBarQuery();
});

aiQuickInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.stopPropagation();
        handleAiBarQuery();
    }
});

closeProfileBtn.addEventListener('click', () => {
    profileOverlay.classList.remove('active');
    viewport.classList.remove('blurred');
});

function triggerAvatarChange() {
    getDoc().getElementById('avatarFileInput').click();
}
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
    if(inputAvatarUrl.value.trim() !== "") {
        profileData.avatarUrl = inputAvatarUrl.value.trim();
    }
    localStorage.setItem('nexusProfile', JSON.stringify(profileData));
    loadProfileData();
    showToast("Perfil e Configurações Salvas");
});

async function testGeminiApiKey() {
    const apiKey = inputGeminiKey.value.trim();
    if(!apiKey) {
        apiFeedbackBadge.innerText = "Status: Chave vazia";
        apiFeedbackBadge.className = "api-feedback-badge error";
        return;
    }

    apiFeedbackBadge.innerText = "Status: Testando...";
    apiFeedbackBadge.className = "api-feedback-badge";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] })
        });

        if(response.ok) {
            apiFeedbackBadge.innerText = "Status: Chave Funcionando! ✔";
            apiFeedbackBadge.className = "api-feedback-badge success";
            showToast("Conexão com a IA estabelecida com sucesso!");
        } else {
            apiFeedbackBadge.innerText = "Status: Chave Inválida / Erro";
            apiFeedbackBadge.className = "api-feedback-badge error";
            showToast("Falha: Verifique se sua chave está correta.");
        }
    } catch(e) {
        apiFeedbackBadge.innerText = "Status: Erro de Conexão";
        apiFeedbackBadge.className = "api-feedback-badge error";
        showToast("Erro de rede ao testar a chave.");
    }
}

testApiBtn.addEventListener('click', () => {
    testGeminiApiKey();
});

function loadProfileData() {
    const data = JSON.parse(localStorage.getItem('nexusProfile'));
    if(data) {
        pName.innerText = data.name || "Usuário Nexus";
        pHandle.innerText = data.handle || "@viajante_neural";
        pBio.innerText = data.bio || "Explorando o cosmos das ideias, uma conexão de cada vez.";
        
        if(data.avatarUrl) {
            avatarLargeContainer.style.backgroundImage = `url('${data.avatarUrl}')`;
            pAvatarLetter.style.display = 'none';
        } else {
            avatarLargeContainer.style.backgroundImage = 'none';
            pAvatarLetter.style.display = 'flex';
            pAvatarLetter.innerText = (data.name ? data.name[0].toUpperCase() : 'U');
        }

        if(inputName.value === "Usuário Nexus" && data.name) inputName.value = data.name;
        if(inputHandle.value === "@viajante_neural" && data.handle) inputHandle.value = data.handle;
        if(inputBio.value.includes("Explorando") && data.bio) inputBio.value = data.bio;
        if(data.avatarUrl) inputAvatarUrl.value = data.avatarUrl;

        if(data.geminiKey) {
            inputGeminiKey.value = data.geminiKey;
            testGeminiApiKey();
        }
    }
}

function renderDashboard() {
    statCountIdeas.innerText = bubblesArray.length;
    neuralGrid.innerHTML = '';

    if(bubblesArray.length === 0) {
        neuralGrid.innerHTML = '<div class="empty-state">Nenhuma ideia criada ainda. Dê um duplo clique no mundo para começar.</div>';
        return;
    }

    bubblesArray.forEach(bubble => {
        let connectionCount = 0;
        bubblesArray.forEach(other => {
            if (bubble === other) return;
            if(bubble.area.id === other.area.id) { connectionCount++; return; }
            const hasContext = (bubble.scores && bubble.scores[other.area.id] > 0) || (other.scores && other.scores[bubble.area.id] > 0);
            if(hasContext) connectionCount++;
        });

        const card = getDoc().createElement('div');
        card.classList.add('thought-card');
        card.style.borderColor = bubble.area.color;
        
        card.innerHTML = `
            <div class="card-preview-text">${bubble.tooltip.innerText || "Sem texto..."}</div>
            <div class="card-meta">
                <span style="color:${bubble.area.color}">${bubble.area.name}</span>
                <div style="color:${bubble.area.color}">${connectionCount} conexões</div>
            </div>
        `;

        card.addEventListener('click', () => {
            profileOverlay.classList.remove('active');
            viewport.classList.remove('blurred');
            openPopup(bubble);
        });

        neuralGrid.appendChild(card);
    });
}

viewport.addEventListener('wheel', (e) => {
    if(isSymbiosisActive || profileOverlay.classList.contains('active')) return;
    e.preventDefault(); 
    const delta = e.deltaY < 0 ? 1 : -1;
    const step = 0.04;
    const newScale = Math.min(Math.max(0.1, scale + (delta * step)), 5);
    const mouseX = e.clientX - worldX; const mouseY = e.clientY - worldY;
    worldX -= mouseX * (newScale / scale - 1); worldY -= mouseY * (newScale / scale - 1);
    scale = newScale; updateWorldTransform();
}, { passive: false });

function getEventPos(e) { return (e.touches && e.touches.length > 0) ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }; }

viewport.addEventListener('mousedown', (e) => {
    if(isSymbiosisActive || profileOverlay.classList.contains('active')) return;
    if (e.target === viewport || e.target === world || e.target.id === 'solo-lines') {
        isPanning = true; const pos = getEventPos(e); startPanX = pos.x - worldX; startPanY = pos.y - worldY;
        viewport.style.cursor = 'grabbing';
    }
});

viewport.addEventListener('touchstart', (e) => {
     if(isSymbiosisActive || profileOverlay.classList.contains('active')) return;
     if (e.target !== viewport && e.target !== world && e.target.id !== 'solo-lines') return;

     if (e.touches.length === 2) {
         isPanning = false;
         initialScale = scale;
         initialPinchDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
     } else if (e.touches.length === 1) {
         isPanning = true; 
         const pos = getEventPos(e); 
         startPanX = pos.x - worldX; 
         startPanY = pos.y - worldY;
     }
}, { passive: false });

symbiosisBtn.addEventListener('click', () => { if (isSymbiosisActive) return; startDiscovery(); });

function startDiscovery() {
    symbiosisBtn.classList.add('searching'); radarOverlay.classList.add('active');
    showToast("Buscando sinais neurais próximos...");
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => { setTimeout(() => { showNearbyUsers(position.coords.latitude, position.coords.longitude); }, 2500); },
            (error) => { setTimeout(() => { showNearbyUsers(-23.55, -46.63); }, 2500); }
        );
    } else { setTimeout(() => { showNearbyUsers(-23.55, -46.63); }, 2500); }
}

function showNearbyUsers(userLat, userLon) {
    symbiosisBtn.classList.remove('searching'); radarOverlay.classList.remove('active');
    const mockUsers = [
        { id: 1, name: "Alice_Nexus", area: "mind", color: "#37617A", distance: 15 },
        { id: 2, name: "Bob_Builder", area: "career", color: "#f2ca50", distance: 42 },
        { id: 3, name: "Zen_Master", area: "spirit", color: "#378c4b", distance: 120 }
    ];
    usersListContent.innerHTML = '';
    mockUsers.forEach(user => {
        const item = getDoc().createElement('div');
        item.classList.add('user-item');
        item.innerHTML = `
            <div class="user-avatar" style="background:${user.color}">${user.name[0]}</div>
            <div class="user-info">
                <span class="user-name">${user.name}</span>
                <span class="user-meta">Foco: ${user.area.toUpperCase()} <span class="user-dist">• ${user.distance}m</span></span>
            </div>
        `;
        item.addEventListener('click', () => { closeUsersList(); activateSymbiosisMode(user); });
        usersListContent.appendChild(item);
    });
    nearbyUsersOverlay.classList.add('active');
}
function closeUsersList() { nearbyUsersOverlay.classList.remove('active'); }
closeUsersBtn.addEventListener('click', closeUsersList);

function activateSymbiosisMode(targetUser) {
    isSymbiosisActive = true;
    viewport.classList.add('blurred'); symbiosisDimension.classList.add('active');
    mainUI.classList.add('hidden-ui');
    showToast(`Conectado com ${targetUser.name}`);
    switchSymbiosisView('sphere');
    generateSymbiosisData(targetUser); 
    initSphereRotation();
}

let sphereRotationY = 0;

function initSphereRotation() {
    neuralSphere.innerHTML = '';
    spherePoints = [];
    const count = symbiosisBubblesArray.length;
    const radius = getWin().innerWidth < 600 ? 140 : 180;

    symbiosisBubblesArray.forEach((bubble, i) => {
        const node = getDoc().createElement('div');
        node.classList.add('sphere-node');
        node.style.backgroundColor = bubble.area.color;
        node.style.color = bubble.area.color;

        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = i * 2.4; 

        const x = Math.cos(theta) * r * radius;
        const yPos = y * radius;
        const z = Math.sin(theta) * r * radius;

        spherePoints.push({ element: node, x, y: yPos, z });
        neuralSphere.appendChild(node);
    });

    animateSphere();
}

function animateSphere() {
    if (!isSymbiosisActive || currentSymbiosisView !== 'sphere') {
        getWin().cancelAnimationFrame(sphereAnimationFrame);
        return;
    }
    sphereRotationY += 0.005; 
    spherePoints.forEach(point => {
        const cos = Math.cos(sphereRotationY);
        const sin = Math.sin(sphereRotationY);
        const rotatedX = point.x * cos - point.z * sin;
        const rotatedZ = point.x * sin + point.z * cos;
        const scale = (rotatedZ + 400) / 400; 
        const opacity = (rotatedZ + 200) / 400; 
        const zIndex = Math.floor(rotatedZ);

        point.element.style.transform = `translate3d(${rotatedX}px, ${point.y}px, ${rotatedZ}px) scale(${scale})`;
        point.element.style.opacity = Math.max(0.2, opacity);
        point.element.style.zIndex = zIndex + 1000;
    });
    sphereAnimationFrame = getWin().requestAnimationFrame(animateSphere);
}

function switchSymbiosisView(viewType) {
    currentSymbiosisView = viewType;
    if (viewType === 'sphere') {
        sphereView.classList.remove('hidden-view'); sphereView.classList.add('active-view');
        symbiosisMapContainer.classList.remove('active-view'); symbiosisMapContainer.classList.add('hidden-view');
        toggleViewBtn.innerHTML = '<span>Ver Mapa</span>';
        initSphereRotation();
    } else {
        sphereView.classList.remove('active-view'); sphereView.classList.add('hidden-view');
        symbiosisMapContainer.classList.remove('active-view'); symbiosisMapContainer.classList.add('active-view');
        toggleViewBtn.innerHTML = '<span>Ver Esfera</span>';
        getWin().cancelAnimationFrame(sphereAnimationFrame);
    }
}
sphereView.addEventListener('click', () => switchSymbiosisView('map'));
toggleViewBtn.addEventListener('click', () => switchSymbiosisView(currentSymbiosisView === 'sphere' ? 'map' : 'sphere'));

document.getElementById('close-symbiosis').addEventListener('click', () => {
    isSymbiosisActive = false;
    viewport.classList.remove('blurred'); symbiosisDimension.classList.remove('active');
    mainUI.classList.remove('hidden-ui');
    while (symbiosisLinesLayer.querySelectorAll('line').length > 0) symbiosisLinesLayer.removeChild(symbiosisLinesLayer.lastChild);
    gradDefsSymbiosis.innerHTML = '';
    const oldBubbles = symbiosisWorld.querySelectorAll('.circle-wrapper');
    oldBubbles.forEach(b => b.remove());
    symbiosisBubblesArray = [];
    getWin().cancelAnimationFrame(sphereAnimationFrame);
    viewport.style.pointerEvents = 'auto';
});

function generateSymbiosisData(targetUser) {
    symbiosisBubblesArray = [];
    bubblesArray.forEach(b => {
        createSymbiosisBubble(parseInt(b.wrapper.style.left) - 200, parseInt(b.wrapper.style.top), b.area, b.tooltip.innerText, b.scores);
    });
    let partnerBubbles = [];
    if(targetUser.area === "mind") partnerBubbles = [ {t: "Filosofia Quântica", a: "mind"}, {t: "Lógica Fuzzy", a: "mind"}, {t: "Café sem açúcar", a: "health"} ];
    else if (targetUser.area === "career") partnerBubbles = [ {t: "Startup Unicórnio", a: "career"}, {t: "Networking", a: "social"}, {t: "Investimento Anjo", a: "career"} ];
    else partnerBubbles = [ {t: "Meditação", a: "spirit"}, {t: "Yoga no Parque", a: "health"}, {t: "Paz Interior", a: "spirit"} ];

    partnerBubbles.forEach(async p => {
        const area = lifeAreas.find(a => a.id === p.a);
        const scores = (await analyzeFullContext(p.t)).scores;
        const rx = (Math.random() * 400) - 100;
        const ry = (Math.random() * 400) - 200;
        createSymbiosisBubble(rx, ry, area, p.t, scores);
    });
}

function createSymbiosisBubble(x, y, area, text, scores) {
    const wrapper = getDoc().createElement('div');
    wrapper.classList.add('circle-wrapper');
    wrapper.style.left = `${x}px`; wrapper.style.top = `${y}px`;
    const circle = getDoc().createElement('div');
    circle.classList.add('neon-circle');
    circle.style.backgroundColor = area.color;
    circle.style.boxShadow = `0 0 10px ${area.color}, 0 0 25px ${area.color}90`;
    circle.style.animationDuration = `${(Math.random()*3+4).toFixed(2)}s`;
    const tooltip = getDoc().createElement('div');
    tooltip.classList.add('message-tooltip'); tooltip.innerText = text;
    circle.appendChild(tooltip); wrapper.appendChild(circle); symbiosisWorld.appendChild(wrapper);
    const bubbleObj = { wrapper, circle, area, scores, id: Math.random(), tooltip }; 
    symbiosisBubblesArray.push(bubbleObj);
    setupSimpleDrag(wrapper);
}

function setupSimpleDrag(wrapper) {
    let isDragging = false; let startX, startY, initX, initY;
    const startDrag = (e) => {
        e.stopPropagation(); isDragging = true;
        const pos = getEventPos(e);
        startX = pos.x; startY = pos.y;
        initX = parseInt(wrapper.style.left); initY = parseInt(wrapper.style.top);
        const targetWin = getWin();
        if(e.type === 'mousedown') {
            targetWin.addEventListener('mousemove', moveDrag);
            targetWin.addEventListener('mouseup', endDrag);
        } else {
            targetWin.addEventListener('touchmove', moveDrag, {passive:false});
            targetWin.addEventListener('touchend', endDrag);
        }
    };
    const moveDrag = (e) => {
        if(!isDragging) return;
        const pos = getEventPos(e);
        wrapper.style.left = `${initX + (pos.x - startX)}px`;
        wrapper.style.top = `${initY + (pos.y - startY)}px`;
    };
    const endDrag = (e) => {
        isDragging = false;
        const targetWin = getWin();
        targetWin.removeEventListener('mousemove', moveDrag); targetWin.removeEventListener('mouseup', endDrag);
        targetWin.removeEventListener('touchmove', moveDrag); targetWin.removeEventListener('touchend', endDrag);
        window.removeEventListener('mousemove', moveDrag); window.removeEventListener('mouseup', endDrag);
        window.removeEventListener('touchmove', moveDrag); window.removeEventListener('touchend', endDrag);
    };
    wrapper.addEventListener('mousedown', startDrag);
    wrapper.addEventListener('touchstart', startDrag, {passive: false});
}

function createBubble(x, y, area, text = "", existingId = null, existingScores = {}) {
    const wrapper = getDoc().createElement('div'); wrapper.classList.add('circle-wrapper'); wrapper.style.left=`${x}px`; wrapper.style.top=`${y}px`;
    const circle = getDoc().createElement('div'); circle.classList.add('neon-circle'); circle.style.backgroundColor=area.color; circle.style.boxShadow=`0 0 10px ${area.color}, 0 0 25px ${area.color}90`; circle.style.animationDuration=`${(Math.random()*3+4).toFixed(2)}s`;
    const tooltip = getDoc().createElement('div'); tooltip.classList.add('message-tooltip'); tooltip.innerText=text;
    circle.appendChild(tooltip); wrapper.appendChild(circle); world.appendChild(wrapper);
    const bubbleObj = { id: existingId || (Date.now()+Math.random()), wrapper, circle, area, tooltip, scores: existingScores };
    bubblesArray.push(bubbleObj);
    setupInteraction(bubbleObj);
    return bubbleObj; 
}

function setupInteraction(bubbleObj) {
    let isDraggingBubble = false; let dragStartX, dragStartY, initialBubbleLeft, initialBubbleTop;
    const wrapper = bubbleObj.wrapper;
    
    function onBubbleStart(e) { 
        e.stopPropagation(); 
        isDraggingBubble = false; 
        const pos = getEventPos(e); 
        dragStartX = pos.x; 
        dragStartY = pos.y; 
        initialBubbleLeft = parseInt(wrapper.style.left||0); 
        initialBubbleTop = parseInt(wrapper.style.top||0); 
        const targetWin = getWin();
        if(e.type === 'mousedown') { 
            targetWin.addEventListener('mousemove', onBubbleMove); 
            targetWin.addEventListener('mouseup', onBubbleEnd); 
        } else { 
            targetWin.addEventListener('touchmove', onBubbleMove, {passive: false}); 
            targetWin.addEventListener('touchend', onBubbleEnd); 
        } 
    }
    function onBubbleMove(e) { 
        isDraggingBubble = true; 
        e.preventDefault(); 
        const pos = getEventPos(e); 
        const dx = (pos.x - dragStartX) / scale; 
        const dy = (pos.y - dragStartY) / scale; 
        wrapper.style.left = `${initialBubbleLeft + dx}px`; 
        wrapper.style.top = `${initialBubbleTop + dy}px`; 
    }
    function onBubbleEnd(e) { 
        const targetWin = getWin();
        targetWin.removeEventListener('mousemove', onBubbleMove); targetWin.removeEventListener('mouseup', onBubbleEnd);
        targetWin.removeEventListener('touchmove', onBubbleMove); targetWin.removeEventListener('touchend', onBubbleEnd);
        if (!isDraggingBubble) { openPopup(bubbleObj); } 
        else { saveToFirebase(); }
        isDraggingBubble = false; 
    }
    wrapper.addEventListener('mousedown', onBubbleStart);
    wrapper.addEventListener('touchstart', onBubbleStart, { passive: false });
}

function initMorphDock() {
    colorList.innerHTML = '';
    lifeAreas.forEach(area => {
        const container = getDoc().createElement('div');
        container.className = 'color-option-container';
        if(area.id === activeArea.id) container.classList.add('active-container');

        const option = getDoc().createElement('div');
        option.classList.add('color-option');
        option.style.backgroundColor = area.color;
        option.style.color = area.color;
        if(area.id === activeArea.id) option.classList.add('selected');

        const label = getDoc().createElement('div');
        label.classList.add('area-label');
        label.innerText = area.name;

        option.addEventListener('click', (e) => {
            e.stopPropagation();
            activeArea = area;
            morphDock.style.setProperty('--dock-glow', area.color);
            getDoc().querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
            getDoc().querySelectorAll('.color-option-container').forEach(el => el.classList.remove('active-container'));
            option.classList.add('selected');
            container.classList.add('active-container');
            morphDock.classList.remove('open');
        });

        container.appendChild(option);
        container.appendChild(label);
        colorList.appendChild(container);
    });

    morphDock.addEventListener('click', (e) => {
        if (!morphDock.classList.contains('open')) {
            e.stopPropagation();
            morphDock.classList.add('open');
        }
    });

    document.addEventListener('click', (e) => {
        if (!morphDock.contains(e.target)) {
            morphDock.classList.remove('open');
        }
    });
}
initMorphDock();

let doubleClickTimer = null;
viewport.addEventListener('dblclick', (e) => {
    if(isSymbiosisActive || profileOverlay.classList.contains('active')) return;
    if(e.target !== viewport && e.target !== world && e.target.id !== 'solo-lines') return;
    const rect = viewport.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const worldCoordX = (clickX - worldX) / scale;
    const worldCoordY = (clickY - worldY) / scale;
    pendingCreationCoords = { x: worldCoordX, y: worldCoordY };
    openPopup(null);
});

function openPopup(bubbleObj) {
    currentBubble = bubbleObj;
    if (bubbleObj) {
        popupTitle.innerText = "Editar Ideia";
        popupInput.value = bubbleObj.tooltip.innerText;
        btnDelete.style.display = "block";
        updateAiBadgeState(bubbleObj.scores);
    } else {
        popupTitle.innerText = "Nova Ideia";
        popupInput.value = "";
        btnDelete.style.display = "none";
        updateAiBadgeState(null);
    }
    popupOverlay.classList.add('active');
    setTimeout(() => popupInput.focus(), 150);
}

function updateAiBadgeState(scores) {
    if (!scores) {
        aiBadge.className = "ai-badge";
        aiBadgeText.innerText = "Aguardando IA...";
        return;
    }
    const highest = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    if(scores[highest] > 0.4) {
        const foundArea = lifeAreas.find(la => la.id === highest);
        aiBadge.className = "ai-badge ai-active";
        aiBadgeText.innerText = ` IA Conectada: ${foundArea ? foundArea.name : highest}`;
    } else {
        aiBadge.className = "ai-badge";
        aiBadgeText.innerText = "IA: Contexto neutro";
    }
}

async function analyzeFullContext(text) {
    const lower = text.toLowerCase();
    let scores = {};
    lifeAreas.forEach(a => scores[a.id] = 0.1);
    
    lifeAreas.forEach(area => {
        area.keywords.forEach(kw => {
            if (lower.includes(kw)) {
                scores[area.id] += 0.4;
            }
        });
    });

    const profile = JSON.parse(localStorage.getItem('nexusProfile')) || {};
    const apiKey = profile.geminiKey;

    if (apiKey && text.length > 3) {
        try {
            const prompt = `Analise o texto a seguir e atribua relevância de 0.0 a 1.0 para cada uma destas 5 áreas da vida: health, mind, social, career, spirit. Responda estritamente em formato JSON puro, contendo chaves para cada área. Texto: "${text}"`;
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if(rawText) {
                const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                const parsed = JSON.parse(cleanedJson);
                Object.keys(parsed).forEach(k => {
                    if(scores[k] !== undefined) scores[k] = Math.max(scores[k], parseFloat(parsed[k]));
                });
            }
        } catch(e) {
            console.log("Erro ao consultar Gemini API, usando fallback local.", e);
        }
    }

    const bestAreaId = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const chosenArea = lifeAreas.find(a => a.id === bestAreaId) || activeArea;
    return { area: chosenArea, scores };
}

popupInput.addEventListener('input', async () => {
    const text = popupInput.value.trim();
    if (text.length > 2) {
        const result = await analyzeFullContext(text);
        updateAiBadgeState(result.scores);
    } else {
        updateAiBadgeState(null);
    }
});

btnSave.addEventListener('click', async () => {
    const text = popupInput.value.trim();
    if (!text) { showToast("Escreva algo na ideia."); return; }

    popupOverlay.classList.remove('active');
    showToast("Processando com IA e salvando...");

    const analysis = await analyzeFullContext(text);

    if (currentBubble) {
        currentBubble.tooltip.innerText = text;
        currentBubble.area = analysis.area;
        currentBubble.circle.style.backgroundColor = analysis.area.color;
        currentBubble.circle.style.boxShadow = `0 0 10px ${analysis.area.color}, 0 0 25px ${analysis.area.color}90`;
        currentBubble.scores = analysis.scores;
        showToast("Ideia atualizada com sucesso!");
    } else if (pendingCreationCoords) {
        createBubble(pendingCreationCoords.x, pendingCreationCoords.y, analysis.area, text, null, analysis.scores);
        showToast("Nova ideia mapeada!");
        pendingCreationCoords = null;
    }
    saveToFirebase();
    redrawLines();
});

btnDelete.addEventListener('click', () => {
    if (currentBubble) {
        currentBubble.wrapper.remove();
        bubblesArray = bubblesArray.filter(b => b !== currentBubble);
        popupOverlay.classList.remove('active');
        saveToFirebase();
        redrawLines();
        showToast("Ideia excluída.");
    }
});

function redrawLines() {
    while (soloLinesLayer.querySelectorAll('line').length > 0) {
        soloLinesLayer.removeChild(soloLinesLayer.lastChild);
    }
    gradDefsSolo.innerHTML = '';

    for (let i = 0; i < bubblesArray.length; i++) {
        for (let j = i + 1; j < bubblesArray.length; j++) {
            const b1 = bubblesArray[i];
            const b2 = bubblesArray[j];
            
            let shouldConnect = false;
            if (b1.area.id === b2.area.id) {
                shouldConnect = true;
            } else if (b1.scores && b2.scores) {
                if (b1.scores[b2.area.id] > 0.4 || b2.scores[b1.area.id] > 0.4) {
                    shouldConnect = true;
                }
            }

            if (shouldConnect) {
                const x1 = parseInt(b1.wrapper.style.left);
                const y1 = parseInt(b1.wrapper.style.top);
                const x2 = parseInt(b2.wrapper.style.left);
                const y2 = parseInt(b2.wrapper.style.top);

                const gradId = `grad_${b1.id}_${b2.id}`;
                const grad = getDoc().createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                grad.setAttribute("id", gradId);
                grad.setAttribute("x1", `${x1}px`); grad.setAttribute("y1", `${y1}px`);
                grad.setAttribute("x2", `${x2}px`); grad.setAttribute("y2", `${y2}px`);
                grad.setAttribute("gradientUnits", "userSpaceOnUse");

                const stop1 = getDoc().createElementNS("http://www.w3.org/2000/svg", "stop");
                stop1.setAttribute("offset", "0%"); stop1.setAttribute("stop-color", b1.area.color);
                const stop2 = getDoc().createElementNS("http://www.w3.org/2000/svg", "stop");
                stop2.setAttribute("offset", "100%"); stop2.setAttribute("stop-color", b2.area.color);

                grad.appendChild(stop1); grad.appendChild(stop2);
                gradDefsSolo.appendChild(grad);

                const line = getDoc().createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", x1); line.setAttribute("y1", y1);
                line.setAttribute("x2", x2); line.setAttribute("y2", y2);
                line.setAttribute("stroke", `url(#${gradId})`);
                line.classList.add("connection-line");
                soloLinesLayer.appendChild(line);
            }
        }
    }
}

function showToast(text) {
    toastText.innerText = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

function saveToFirebase() {
    try {
        const { db, ref, set } = window.firebaseDbModules;
        const currentUserId = window.getCurrentUserId();
        if(!currentUserId || currentUserId === "default_user") return;

        const dataToSave = bubblesArray.map(b => ({
            id: b.id,
            x: parseInt(b.wrapper.style.left),
            y: parseInt(b.wrapper.style.top),
            areaId: b.area.id,
            text: b.tooltip.innerText,
            scores: b.scores
        }));
        set(ref(db, `users/${currentUserId}/bubbles`), dataToSave);
    } catch(e) {
        console.error("Erro ao salvar no Firebase:", e);
    }
}

function loadData() {
    try {
        const { db, ref, onValue } = window.firebaseDbModules;
        const currentUserId = window.getCurrentUserId();
        if(!currentUserId) return;

        onValue(ref(db, `users/${currentUserId}/bubbles`), (snapshot) => {
            const data = snapshot.val();
            bubblesArray.forEach(b => b.wrapper.remove());
            bubblesArray = [];
            
            if (data) {
                data.forEach(item => {
                    const area = lifeAreas.find(a => a.id === item.areaId) || lifeAreas[0];
                    createBubble(item.x, item.y, area, item.text, item.id, item.scores);
                });
            } else {
                createBubble(window.innerWidth / 2 - 100, window.innerHeight / 2 - 50, lifeAreas[0], "Bem-vindo ao Neuron! Dê duplo clique para criar ideias.");
                createBubble(window.innerWidth / 2 + 100, window.innerHeight / 2 + 50, lifeAreas[1], "Explore a IA e conecte suas áreas da vida.");
            }
            redrawLines();
            if(!allNewsFetched) {
                allNewsFetched = true;
                buildNewsUI();
                fetchAllNews();
            }
        }, { onlyOnce: true });
    } catch(e) {
        console.error("Erro ao carregar dados do Firebase:", e);
        if(bubblesArray.length === 0) {
            createBubble(window.innerWidth / 2 - 100, window.innerHeight / 2 - 50, lifeAreas[0], "Bem-vindo ao Neuron!");
            redrawLines();
        }
        if(!allNewsFetched) {
            allNewsFetched = true;
            buildNewsUI();
            fetchAllNews();
        }
    }
}

function mainLoop() {
    redrawLines();
    mainLoopId = requestAnimationFrame(mainLoop);
}
mainLoop();
