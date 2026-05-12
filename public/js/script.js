// ===== Variáveis Globais =====
let selectedAvatar = '🦊';
let userName = 'Jogador';
let currentVolume = 70;
let selectedProfileColor = '#f5a623';
let draftProfileColor = selectedProfileColor;
let draftAvatar = selectedAvatar;
let selectedDifficulty = 'dificil';
const API_BASE = '/api/auth';

const profileColors = ['#f5a623', '#ff6b9d', '#4d96ff', '#6bcb77', '#9b59b6', '#ff8a5b', '#65c8d0', '#f4d35e'];
const featureDemoConfig = {
  niveis: {
    title: 'Niveis',
    description: 'Explore fases com dificuldade crescente e desafios rapidos para apresentacao.',
    tags: ['Fase 1', 'Fase 2', 'Boss', 'Treino']
  },
  conquistas: {
    title: 'Conquistas',
    description: 'Colecione medalhas e desbloqueie recompensas simbolicas durante a demo.',
    tags: ['Iniciante', 'Persistente', 'Velocidade', 'Mestre']
  },
  'caca-palavras': {
    title: 'Caca Palavras',
    description: 'Modo interativo para encontrar verbos com pontuacao visual em tempo real.',
    tags: ['Tema Escola', 'Tema Casa', 'Tema Esportes', 'Tema Natureza']
  },
  'verbos-irregulares': {
    title: 'Verbos Irregulares',
    description: 'Mini percurso com dicas de conjugacao e exemplos para apresentacao.',
    tags: ['Presente', 'Passado', 'Futuro', 'Desafio Relampago']
  },
  cenarios: {
    title: 'Cenarios',
    description: 'Ambientes visuais diferentes para deixar a experiencia mais dinamica.',
    tags: ['Floresta', 'Espaco', 'Cidade', 'Praia']
  }
};

let activeFeatureKey = 'niveis';
let featureProgress = 25;

const difficultyMeta = {
  facil: { label: 'Facil', emoji: '😊' },
  medio: { label: 'Medio', emoji: '🙂' },
  dificil: { label: 'Dificil', emoji: '😔' }
};

const achievementsData = [
  { name: 'Seja bem-vindo', unlocked: true },
  { name: 'Primeiro desafio', unlocked: false },
  { name: 'Explorador', unlocked: false },
  { name: 'Amigo dos verbos', unlocked: false },
  { name: 'Nivel relampago', unlocked: false },
  { name: 'Mestre da atencao', unlocked: false },
  { name: 'Colecionador', unlocked: false },
  { name: 'Super focado', unlocked: false },
  { name: 'Sem erros', unlocked: false },
  { name: 'Vencedor dourado', unlocked: false },
  { name: 'Lenda dos verbos', unlocked: false }
];

const scenarioProgressData = [
  { name: 'Cenario 1', unlocked: false },
  { name: 'Cenario 2', unlocked: false },
  { name: 'Cenario 3', unlocked: false },
  { name: 'Cenario 4', unlocked: false },
  { name: 'Cenario 5', unlocked: false },
  { name: 'Cenario 6', unlocked: false },
  { name: 'Cenario 7', unlocked: false },
  { name: 'Cenario 8', unlocked: false },
  { name: 'Cenario 9', unlocked: false },
  { name: 'Cenario 10', unlocked: false }
];

const levelsData = [
  { name: 'Nivel 1', unlocked: true },
  { name: 'Nivel 2', unlocked: false },
  { name: 'Nivel 3', unlocked: false },
  { name: 'Nivel 4', unlocked: false },
  { name: 'Nivel 5', unlocked: false },
  { name: 'Nivel 6', unlocked: false }
];

// ===== Popup global estilizado (disponível em todas as páginas) =====
function showPopup(title, message, options = {}) {
  let overlay = document.getElementById('cv-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cv-modal-overlay';
    overlay.className = 'cv-modal-overlay';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(8,10,18,0.6)';
    overlay.style.zIndex = '1200';

    const modal = document.createElement('div');
    modal.className = 'cv-modal';
    modal.style.maxWidth = '520px';
    modal.style.background = 'linear-gradient(180deg, #fffdfa 0%, #fff6ee 100%)';
    modal.style.borderRadius = '16px';
    modal.style.boxShadow = '0 30px 80px rgba(7, 10, 20, 0.6)';
    modal.style.padding = '1.25rem 1.5rem';
    modal.style.textAlign = 'left';
    modal.innerHTML = `
      <h3 id="cv-modal-title" style="margin:0 0 .25rem 0;font-size:1.1rem;color:#5a3d2b"></h3>
      <p id="cv-modal-body" style="margin:0 0 .75rem 0;color:#7a5a42;font-size:.98rem"></p>
      <div class="cv-modal-actions" style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.5rem">
        <button class="cv-btn ghost" id="cv-modal-cancel" style="padding:.6rem .9rem;border-radius:10px;border:none;font-weight:700;cursor:pointer;background:transparent;color:#5a3d2b">Fechar</button>
        <button class="cv-btn cta" id="cv-modal-ok" style="padding:.6rem .9rem;border-radius:10px;border:none;font-weight:700;cursor:pointer;background:#f5a623;color:#fff">OK</button>
      </div>`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.querySelector('#cv-modal-cancel').addEventListener('click', closePopup);
    overlay.querySelector('#cv-modal-ok').addEventListener('click', () => {
      if (options.onOk) options.onOk();
      closePopup();
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });
  }

  overlay.querySelector('#cv-modal-title').textContent = title || '';
  overlay.querySelector('#cv-modal-body').textContent = message || '';
  overlay.style.display = 'flex';
  const modalEl = overlay.querySelector('.cv-modal');
  if (modalEl) modalEl.classList.add('show');
}

function closePopup() {
  const overlay = document.getElementById('cv-modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  const modal = overlay.querySelector('.cv-modal');
  if (modal) modal.classList.remove('show');
}

// ===== Avatares =====
const avatarOptions = ['🦊', '🐱', '🐶', '🐰', '🐻', '🦁', '🐼', '🐨', '🦋', '🌈', '⭐', '🎨'];

// ===== Verbos para elementos flutuantes =====
const verbos = ['Correr', 'Pular', 'Brincar', 'Cantar', 'Dançar', 'Estudar', 'Ler', 'Escrever', 'Jogar', 'Sonhar', 'Voar', 'Nadar'];

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
  // Verifica se está em uma página que requer autenticação
  const currentPage = window.location.pathname;
  const pagesRequiringAuth = ['/menu', '/fases', '/tela-fases.html'];
  const requiresAuth = pagesRequiringAuth.some(page => currentPage.includes(page));
  
  if (requiresAuth) {
    const token = localStorage.getItem('cacaVerbosToken');
    if (!token) {
      // Sem token, redireciona para login
      window.location.href = '/login';
      return;
    }
  }
  
  initAvatarGrid();
  initFloatingElements('login-floating');
  initFloatingElements('cadastro-floating');
  initFormHandlers();
  applyStoredProfile();
  initVerbonio();
  initSettings();
  initFeatureDemo();
  initDifficultySelector();
  initForgotPasswordPopup();
  loadRanking();
  updateStreakBadge();
  updateProfileLevelBadge();
});
// ===== Funções Auxiliares =====
function getAuthToken() {
  return localStorage.getItem('cacaVerbosToken');
}

function getAuthHeader() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ===== Ranking =====
async function loadRanking() {
  const table = document.getElementById('ranking-table');
  const userPositionDiv = document.getElementById('ranking-user-position');
  if (!table) return;
  try {
    const res = await fetch('/api/ranking');
    const data = await res.json();
    if (!res.ok || !data.ranking) throw new Error('Erro ao buscar ranking.');
    const ranking = data.ranking;
    let html = '';
    let userId = null;
    try {
      const token = localStorage.getItem('cacaVerbosToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
      }
    } catch {}
    let userRowIndex = -1;
    ranking.forEach((row, i) => {
      const isUser = userId && String(row.id) === String(userId);
      if (isUser) userRowIndex = i;
      html += `<tr${isUser ? ' class="user-row"' : ''}>
        <td>${i + 1}</td>
        <td>${row.avatar ? row.avatar + ' ' : ''}${row.name}</td>
        <td>${row.total_points}</td>
        <td>${row.max_level}</td>
        <td>${row.total_verbs}</td>
      </tr>`;
    });
    table.querySelector('tbody').innerHTML = html || '<tr><td colspan="5">Nenhum dado de ranking.</td></tr>';
    if (userRowIndex >= 0) {
      userPositionDiv.textContent = `Você está na posição #${userRowIndex + 1}!`;
    } else {
      userPositionDiv.textContent = '';
    }
    console.log('✅ Ranking na tela principal atualizado');
  } catch (e) {
    console.error('❌ Erro ao carregar ranking:', e);
    const tbody = table?.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar ranking.</td></tr>';
    }
    if (userPositionDiv) userPositionDiv.textContent = 'Erro ao carregar posição';
  }
}

// ===== Grid de Avatares =====
function initAvatarGrid() {
  const grid = document.getElementById('avatar-grid');
  if (!grid) return;
  
  avatarOptions.forEach((avatar, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `avatar-option ${avatar === selectedAvatar ? 'selected' : ''}`;
    btn.textContent = avatar;
    btn.style.animationDelay = `${index * 0.05}s`;
    btn.onclick = () => selectAvatar(avatar, btn);
    grid.appendChild(btn);
  });
}

function selectAvatar(avatar, btn) {
  selectedAvatar = avatar;
  document.getElementById('selected-avatar').textContent = avatar;
  
  // Remove seleção anterior
  document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  
  // Animação de bounce
  const display = document.getElementById('selected-avatar');
  display.style.animation = 'none';
  display.offsetHeight; // Trigger reflow
  display.style.animation = 'bounce 0.5s ease-out';
}

// ===== Elementos Flutuantes =====
function initFloatingElements(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Adicionar verbos flutuantes
  verbos.forEach((verbo, i) => {
    const el = document.createElement('div');
    el.className = 'floating-verb';
    el.textContent = verbo;
    el.style.left = `${Math.random() * 90}%`;
    el.style.top = `${Math.random() * 90}%`;
    el.style.animationDelay = `${i * 0.5}s`;
    el.style.animationDuration = `${12 + Math.random() * 8}s`;
    container.appendChild(el);
  });
  
  // Adicionar estrelas
  for (let i = 0; i < 8; i++) {
    const star = document.createElement('div');
    star.className = 'floating-star';
    star.textContent = '⭐';
    star.style.left = `${Math.random() * 95}%`;
    star.style.top = `${Math.random() * 95}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    container.appendChild(star);
  }
  
  // Adicionar bolhas
  for (let i = 0; i < 6; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'floating-bubble';
    bubble.style.left = `${Math.random() * 95}%`;
    bubble.style.animationDelay = `${Math.random() * 10}s`;
    bubble.style.width = `${15 + Math.random() * 20}px`;
    bubble.style.height = bubble.style.width;
    container.appendChild(bubble);
  }
}

// ===== Handlers dos Formulários =====
function initFormHandlers() {
  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Cadastro
  const cadastroForm = document.getElementById('cadastro-form');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', handleCadastro);

    const senhaInput = document.getElementById('cadastro-senha');
    const confirmarInput = document.getElementById('cadastro-confirmar-senha');
    [senhaInput, confirmarInput].forEach((input) => {
      if (input) {
        input.addEventListener('input', clearCadastroError);
      }
    });
  }

  const forgotForm = document.getElementById('forgot-password-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', handleForgotPassword);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email')?.value?.trim() || '';
  const password = document.getElementById('login-senha')?.value || '';

  if (!email || !password) {
    showPopup('Atenção', 'Informe e-mail e senha.');
    return;
  }

  showLoading();

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha no login.');
    }

    if (data.token) {
      localStorage.setItem('cacaVerbosToken', data.token);
    }

    if (data.user) {
      userName = data.user.name || userName;
      selectedAvatar = data.user.avatar || selectedAvatar;
      selectedProfileColor = data.user.profileColor || selectedProfileColor;
      saveProfileData();
      localStorage.setItem('cacaVerbosProfileColor', selectedProfileColor);
    }

    // Limpar possível progresso salvo localmente para evitar desbloqueios antigos
    localStorage.removeItem('cacaVerbosPhase');

    hideLoading();
    showBookAnimation('menu.html');
  } catch (error) {
    hideLoading();
    showPopup('Erro', error.message || 'Erro ao realizar login.');
  }
}

async function handleCadastro(e) {
  e.preventDefault();

  const senhaInput = document.getElementById('cadastro-senha');
  const confirmarInput = document.getElementById('cadastro-confirmar-senha');
  const senha = senhaInput ? senhaInput.value : '';
  const confirmar = confirmarInput ? confirmarInput.value : '';

  clearCadastroError();

  if (senha.length < 6) {
    showCadastroError('A senha deve ter pelo menos 6 caracteres.', senhaInput);
    return;
  }

  if (senha !== confirmar) {
    showCadastroError('As senhas não conferem. Tente novamente.', confirmarInput);
    return;
  }

  const email = document.getElementById('cadastro-email')?.value?.trim() || '';
  const birthDate = document.getElementById('cadastro-data')?.value || null;

  showLoading();
  
  userName = 'Jogador';

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userName,
        email,
        birthDate,
        password: senha,
        avatar: selectedAvatar,
        profileColor: selectedProfileColor
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cadastrar.');
    }

    hideLoading();
    showSuccessModal();

    await delay(2500);
    hideSuccessModal();
    saveProfileData();
    showBookAnimation('menu.html');
  } catch (error) {
    hideLoading();
    showCadastroError(error.message || 'Erro no cadastro.', document.getElementById('cadastro-email'));
  }
}

async function handleForgotPassword(e) {
  e.preventDefault();

  const emailInput = document.getElementById('forgot-email');
  const feedback = document.getElementById('forgot-feedback');
  const email = emailInput?.value?.trim() || '';

  if (!email) {
    if (feedback) {
      feedback.textContent = 'Informe um e-mail válido.';
      feedback.classList.add('error');
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao processar solicitação.');
    }

    if (feedback) {
      feedback.textContent = data.message || 'Solicitação registrada.';
      feedback.classList.remove('error');
    }
  } catch (error) {
    if (feedback) {
      feedback.textContent = error.message || 'Erro ao enviar solicitação.';
      feedback.classList.add('error');
    }
  }
}

function showCadastroError(message, input) {
  const errorEl = document.getElementById('cadastro-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
  }

  if (input && input.parentElement) {
    input.parentElement.classList.add('invalid');
    input.focus();
  }
}

function clearCadastroError() {
  const errorEl = document.getElementById('cadastro-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('active');
  }

  document.querySelectorAll('#cadastro-form .input-group.invalid').forEach((group) => {
    group.classList.remove('invalid');
  });
}

// ===== Salvar Pontuação =====
async function saveScore(level, points, verbsCompleted = 0) {
  const token = localStorage.getItem('cacaVerbosToken');
  
  if (!token) {
    console.error('Token não encontrado - usuário não autenticado');
    throw new Error('Não autenticado');
  }
  
  try {
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      keepalive: true,
      body: JSON.stringify({ level, points, verbsCompleted })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro ao salvar score:', data.message);
      throw new Error(data.message || 'Erro ao salvar pontuação');
    }
    
    console.log('✅ Pontuação salva com sucesso!', data);
    updateProfileLevelBadge();
    
    // Recarregar ranking após salvar pontos
    setTimeout(() => {
      console.log('Recarregando ranking...');
      loadRanking();
      loadRankingData();
    }, 500);
      console.log('📊 Pontos salvos:', { level, points, pointsEarned: data.pointsEarned, isReplay: data.isReplay });
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro ao salvar pontuação:', error);
    throw error;
  }
}

// ===== Navegação =====
function showPage(pageId) {
  const routes = {
    'login-page': 'index.html',
    'cadastro-page': 'cadastro.html',
    'home-page': 'menu.html'
  };

  const targetRoute = routes[pageId];
  if (targetRoute) {
    window.location.href = targetRoute;
  }
}

// ===== Animação do Livro =====
function showBookAnimation(targetUrl = 'menu.html') {
  const bookOverlay = document.getElementById('book-animation');
  if (!bookOverlay) {
    window.location.href = targetUrl;
    return;
  }

  bookOverlay.classList.add('active');
  
  // Iniciar animação do livro após um momento
  setTimeout(() => {
    const bookCover = document.querySelector('.book-cover');
    if (bookCover) {
      bookCover.classList.add('opening');
    }
  }, 500);
  
  // Ir para a próxima página após animação
  setTimeout(() => {
    bookOverlay.classList.remove('active');
    const cover = document.querySelector('.book-cover');
    if (cover) {
      cover.classList.remove('opening');
    }
    window.location.href = targetUrl;
  }, 3000);
}

function showHomePage() {
  const homePage = document.getElementById('home-page');
  if (!homePage) {
    window.location.href = 'menu.html';
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  homePage.classList.add('active');
  
  // Atualizar avatar do usuário
  const userProfile = document.getElementById('user-profile');
  if (userProfile) {
    userProfile.querySelector('.user-avatar').textContent = selectedAvatar;
  }
}

function saveProfileData() {
  localStorage.setItem('cacaVerbosAvatar', selectedAvatar);
  localStorage.setItem('cacaVerbosUserName', userName);
}

function applyStoredProfile() {
  const storedAvatar = localStorage.getItem('cacaVerbosAvatar');
  if (storedAvatar) {
    selectedAvatar = storedAvatar;
  }

  const storedName = localStorage.getItem('cacaVerbosUserName');
  if (storedName) {
    userName = storedName;
  }

  const storedColor = localStorage.getItem('cacaVerbosProfileColor');
  if (storedColor) {
    selectedProfileColor = storedColor;
  }

  const profileAvatar = document.querySelector('#user-profile .user-avatar');
  if (profileAvatar) {
    profileAvatar.textContent = selectedAvatar;
  }

  const profileBadge = document.getElementById('user-profile');
  if (profileBadge) {
    profileBadge.style.backgroundColor = selectedProfileColor;
  }
}

function initVerbonio() {
  const storedName = localStorage.getItem('cacaVerbosUserName');
  
  // Se não tem nome salvo, mostra o modal do Verbonio
  if (!storedName || storedName === 'Jogador') {
    showVerbonioModal();
  }
}

function showVerbonioModal() {
  const modal = document.getElementById('verbonio-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    
    // Foca no input do nome
    const nameInput = document.getElementById('verbonio-name-input');
    if (nameInput) {
      nameInput.focus();
    }
  }
}

function hideVerbonioModal() {
  const modal = document.getElementById('verbonio-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
  }
}

function submitVerbonioName() {
  const nameInput = document.getElementById('verbonio-name-input');
  if (!nameInput) return;
  
  const name = nameInput.value.trim();
  
  if (name === '') {
    alert('Por favor, digite seu nome!');
    return;
  }
  
  // Salva o nome localmente
  userName = name;
  localStorage.setItem('cacaVerbosUserName', userName);
  
  // Atualiza o nome no servidor
  updateUserNameOnServer(name);
  
  // Fecha o modal
  hideVerbonioModal();
}

async function updateUserNameOnServer(name) {
  try {
    const token = getAuthToken();
    if (!token) return;
    
    const response = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
      console.error('Erro ao atualizar nome no servidor');
    }
  } catch (error) {
    console.error('Erro ao atualizar nome:', error);
  }
}

// Adicionar listener para Enter na página do menu
document.addEventListener('DOMContentLoaded', function() {
  const verbonioInput = document.getElementById('verbonio-name-input');
  if (verbonioInput) {
    verbonioInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        submitVerbonioName();
      }
    });
  }
});

function initSettings() {
  const savedVolume = localStorage.getItem('cacaVerbosVolume');
  if (savedVolume !== null) {
    currentVolume = Number(savedVolume);
  }

  const volumeInput = document.getElementById('volume-range');
  if (volumeInput) {
    volumeInput.value = String(currentVolume);
    updateVolume(currentVolume);
  }

  const overlay = document.getElementById('settings-panel');
  if (overlay) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeSettingsPanel();
      }
    });
  }

  const profileOverlay = document.getElementById('profile-panel');
  if (profileOverlay) {
    profileOverlay.addEventListener('click', (event) => {
      if (event.target === profileOverlay) {
        closeProfilePanel();
      }
    });
  }

  const logoutOverlay = document.getElementById('logout-popup');
  if (logoutOverlay) {
    logoutOverlay.addEventListener('click', (event) => {
      if (event.target === logoutOverlay) {
        closeLogoutPopup();
      }
    });
  }

  const playOverlay = document.getElementById('play-dev-popup');
  if (playOverlay) {
    playOverlay.addEventListener('click', (event) => {
      if (event.target === playOverlay) {
        closePlayDevPopup();
      }
    });
  }

  renderProfileColorOptions();
  renderProfileAvatarOptions();
}

function initFeatureDemo() {
  const overlay = document.getElementById('feature-demo-overlay');
  if (!overlay) return;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeFeatureDemo();
    }
  });
}

// ===== Biblioteca de Verbos =====
async function openVerbLibrary() {
  try {
    console.log('[VERB LIB] openVerbLibrary called');
    const modal = document.getElementById('verb-library-modal');
    if (!modal) {
      console.warn('[VERB LIB] modal element not found');
      return;
    }

    // Busca progresso do usuário para saber fases liberadas
    let currentPhase = 1;
    try {
      const res = await fetch('/api/progression', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        currentPhase = Number(data.current_phase ?? 1);
        console.log('[VERB LIB] currentPhase from API:', currentPhase, 'data:', data);
      }
    } catch (e) {
      console.warn('Não foi possível obter progresso:', e);
    }

    // Carrega verbos APENAS das fases completadas (fonte de verdade)
    let verbs = [];
    try {
      verbs = await loadVerbsFromPhases(currentPhase);
      console.log('[VERB LIB] loadVerbsFromPhases returned', verbs.length, 'verbs for currentPhase=', currentPhase);
    } catch (e) {
      console.warn('Erro ao carregar verbos das fases:', e);
      verbs = [];
    }

    // Se nenhuma fase completada, mostrar mensagem vazia
    if (!Array.isArray(verbs) || verbs.length === 0) {
      console.log('[VERB LIB] Nenhum verbo disponível - currentPhase:', currentPhase);
    }

    console.log('[VERB LIB] Renderizando', verbs.length, 'verbos com currentPhase=', currentPhase);
    renderVerbLibrary(verbs, currentPhase);

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
  } catch (e) {
    console.error('Erro ao abrir biblioteca de verbos', e);
  }
}

function closeVerbLibrary() {
  const modal = document.getElementById('verb-library-modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('active');
  const list = document.getElementById('verb-library-list');
  if (list) list.innerHTML = 'Carregando...';
  closeVerbDetail();
}

function renderVerbLibrary(verbs, currentPhase) {
  const list = document.getElementById('verb-library-list');
  if (!list) return;
  if (!Array.isArray(verbs) || verbs.length === 0) {
    list.innerHTML = '<div>Nenhum verbo encontrado.</div>';
    return;
  }

  console.log('[VERB LIB] renderVerbLibrary - currentPhase:', currentPhase, 'verbs.length:', verbs.length);

  // Agrupar por fase e ordenar
  verbs.sort((a,b) => (a.phase || 0) - (b.phase || 0) || a.infinitive.localeCompare(b.infinitive));

  const fragment = document.createDocumentFragment();
  verbs.forEach((v) => {
    const item = document.createElement('div');
    item.className = 'verb-item';
    // Um verbo fica bloqueado se sua fase é MAIOR que a fase atual
    // currentPhase = 0 significa ainda não começou nenhuma fase (novo usuário)
    // currentPhase = 1 significa completou fase 1, pode acessar fase 2
    const verbPhase = Number(v.phase || 1);
    const locked = verbPhase > Number(currentPhase || 0);
    console.log(`[VERB LIB] verb="${v.infinitive}" phase=${verbPhase} currentPhase=${currentPhase} locked=${locked}`);
    if (locked) item.classList.add('locked');

    item.innerHTML = `
      <div class="verb-title">${v.infinitive} ${locked ? '🔒' : ''} <span class="verb-sub">— ${v.translation || ''}</span></div>
      <div class="verb-sub">Fase ${v.phase || 1} • ${locked ? '🔒 bloqueado' : 'aprendido'}</div>
    `;

    if (!locked) {
      item.addEventListener('click', () => openVerbDetailPage(v));
    } else {
      item.title = 'Bloqueado: complete as fases anteriores para liberar este verbo.';
    }

    fragment.appendChild(item);
  });

  list.innerHTML = '';
  list.appendChild(fragment);
}

// Carrega verbos corretos a partir dos arquivos de fase (fase1.js, fase2.js...)
async function loadVerbsFromPhases(currentPhase) {
  const verbs = [];
  // Importante: currentPhase = 0 significa novo usuário, não carrega nada
  // currentPhase = 1 significa começou fase 1, pode ver fase 1
  // currentPhase = 2 significa completou fase 1, pode ver fases 1 e 2
  const maxPhase = Math.max(0, Number(currentPhase || 0));
  console.log('[VERB LIB] loadVerbsFromPhases - maxPhase:', maxPhase);
  
  for (let phase = 1; phase <= maxPhase; phase += 1) {
    const path = `/html/fases/js/fase${phase}.js`;
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const text = await res.text();

      // Extrair blocos de questões 'questions = [ { ... } ]' ou ocorrências de 'correct: true' com 'text'
      // Regex simples para capturar objetos options: { key: '', text: '...', correct: true }
      const optionRegex = /\{[^}]*text:\s*['"]([^'"]+)['"][^}]*correct:\s*true[^}]*\}/gmi;
      let m;
      const seen = new Set();
      while ((m = optionRegex.exec(text)) !== null) {
        const verbText = m[1].trim();
        if (!verbText) continue;
        const id = verbText.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_çãõáéíóúâêîôûàèù]/gi, '');
        if (seen.has(id)) continue;
        seen.add(id);
        verbs.push({ id, infinitive: verbText, translation: '', type: 'aprendido', usage: `Aprendido na fase ${phase}.`, phase });
      }
    } catch (e) {
      // ignora e continua
      console.warn('Erro ao ler fase', phase, e);
      continue;
    }
  }

  console.log('[VERB LIB] loadVerbsFromPhases - loaded', verbs.length, 'verbs');
  return verbs;
}

function showVerbDetail(v) {
  const detail = document.getElementById('verb-detail');
  if (!detail) return;
  document.getElementById('verb-detail-title').textContent = `${v.infinitive} — ${v.translation || ''}`;
  document.getElementById('verb-detail-type').textContent = `Tipo: ${v.type || 'regular'}`;
  document.getElementById('verb-detail-usage').textContent = `Quando usar: ${v.usage || '—'}`;
  detail.classList.remove('hidden');
}

function closeVerbDetail() {
  const detail = document.getElementById('verb-detail');
  if (!detail) return;
  detail.classList.add('hidden');
}

async function openVerbDetailPage(vOrId) {
  if (!vOrId) return;
  let verbObj = null;

  if (typeof vOrId === 'object') {
    verbObj = vOrId;
  } else {
    const id = String(vOrId);
    // tentar carregar verbo das fases e do JSON
    try {
      const verbsFromPhases = await loadVerbsFromPhases(8);
      const jsonRes = await fetch('/data/verbs.json');
      const json = jsonRes.ok ? await jsonRes.json() : [];
      const all = [...(verbsFromPhases || []), ...(json || [])];
      verbObj = all.find(x => String(x.id) === id || String((x.infinitive || '').toLowerCase().replace(/\s+/g,'_')) === id);
    } catch (e) {
      // ignore
    }
  }

  const idParam = encodeURIComponent((verbObj && verbObj.id) ? verbObj.id : (typeof vOrId === 'string' ? vOrId : ''));
  const url = `/html/verb.html?id=${idParam}`;

  const newWin = window.open(url, '_blank');
  if (!newWin) {
    // popup bloqueado — mostrar modal com detalhes como fallback
    if (verbObj) {
      showVerbDetail(verbObj);
      // abrir biblioteca modal if closed
      const libModal = document.getElementById('verb-library-modal');
      if (libModal) libModal.classList.remove('active');
    } else {
      alert('Não foi possível abrir a nova aba e detalhes não estão disponíveis.');
    }
  }
}

function initForgotPasswordPopup() {
  const forgotOverlay = document.getElementById('forgot-password-popup');
  if (!forgotOverlay) return;

  forgotOverlay.addEventListener('click', (event) => {
    if (event.target === forgotOverlay) {
      closeForgotPasswordPopup();
    }
  });
}

function openForgotPasswordPopup() {
  const overlay = document.getElementById('forgot-password-popup');
  if (!overlay) return;

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeForgotPasswordPopup() {
  const overlay = document.getElementById('forgot-password-popup');
  if (!overlay) return;

  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');

  const feedback = document.getElementById('forgot-feedback');
  if (feedback) {
    feedback.textContent = '';
    feedback.classList.remove('error');
  }
}

function initDifficultySelector() {
  const storedDifficulty = localStorage.getItem('cacaVerbosDifficulty');
  if (storedDifficulty && difficultyMeta[storedDifficulty]) {
    selectedDifficulty = storedDifficulty;
  }

  const difficultyOverlay = document.getElementById('difficulty-popup');
  if (difficultyOverlay) {
    difficultyOverlay.addEventListener('click', (event) => {
      if (event.target === difficultyOverlay) {
        closeDifficultyPopup();
      }
    });
  }

  updateDifficultyUI();
}

function openDifficultyPopup() {
  const overlay = document.getElementById('difficulty-popup');
  if (!overlay) return;

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeDifficultyPopup() {
  const overlay = document.getElementById('difficulty-popup');
  if (!overlay) return;

  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function openLogoutPopup() {
  const overlay = document.getElementById('logout-popup');
  if (!overlay) return;

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeLogoutPopup() {
  const overlay = document.getElementById('logout-popup');
  if (!overlay) return;

  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function openPlayDevPopup() {
  window.location.href = 'tela-fases.html';
}

function closePlayDevPopup() {
  const overlay = document.getElementById('play-dev-popup');
  if (!overlay) return;

  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function openProfileDetailModal() {
  const panel = document.getElementById('profile-detail-panel');
  if (!panel) return;

  updateProfileDetailModal();
  panel.classList.add('active');
  panel.setAttribute('aria-hidden', 'false');
}

function closeProfileDetailModal() {
  const panel = document.getElementById('profile-detail-panel');
  if (!panel) return;

  panel.classList.remove('active');
  panel.setAttribute('aria-hidden', 'true');
}

function updateProfileDetailModal() {
  // Carrega dados do localStorage
  const name = localStorage.getItem('cacaVerbosName') || 'Jogador';
  const avatar = localStorage.getItem('cacaVerbosAvatar') || '🦊';
  
  // Dados simulados (em produção viriam de um servidor)
  const position = localStorage.getItem('cacaVerbosPosition') || '125';
  const elo = localStorage.getItem('cacaVerbosElo') || '1200';
  const streak = localStorage.getItem('cacaVerbosStreak') || '0';
  const achievements = JSON.parse(localStorage.getItem('cacaVerbosAchievements') || '[]');

  // Atualiza nome e avatar
  document.getElementById('profile-detail-name').textContent = name;
  document.getElementById('profile-detail-avatar').textContent = avatar;

  // Atualiza ranking
  document.getElementById('profile-detail-position').textContent = position;
  document.getElementById('profile-detail-elo').textContent = elo;
  document.getElementById('profile-detail-streak').textContent = streak;

  // Atualiza conquistas
  const achievementsContainer = document.getElementById('profile-detail-achievements');
  if (achievements.length > 0) {
    achievementsContainer.innerHTML = achievements
      .map(ach => `<div class="achievement-badge"><span class="ach-icon">${ach.icon}</span><span class="ach-name">${ach.name}</span></div>`)
      .join('');
  } else {
    achievementsContainer.innerHTML = '<p class="placeholder">Nenhuma conquista desbloqueada ainda.</p>';
  }
}

function openRankingModal() {
  const modal = document.getElementById('ranking-modal');
  if (!modal) return;

  loadRankingData();
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeRankingModal() {
  const modal = document.getElementById('ranking-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function loadRankingData() {
  const table = document.getElementById('ranking-modal-table');
  if (!table) return;

  try {
    fetch('/api/ranking')
      .then(response => response.json())
      .then(data => {
        if (data.ranking) {
          const ranking = data.ranking;
          let html = '';
          ranking.forEach((row, i) => {
            html += `<tr>
              <td>${i + 1}</td>
              <td>${row.avatar ? row.avatar + ' ' : ''}${row.name}</td>
              <td>${row.total_points}</td>
              <td>${row.max_level}</td>
              <td>${row.total_verbs}</td>
            </tr>`;
          });
          table.querySelector('tbody').innerHTML = html || '<tr><td colspan="5">Nenhum dado de ranking.</td></tr>';
          console.log('✅ Ranking no modal atualizado');
        } else {
          console.warn('⚠️ Resposta do ranking vazia');
          table.querySelector('tbody').innerHTML = '<tr><td colspan="5">Nenhum dado de ranking.</td></tr>';
        }
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar ranking do modal:', error);
        table.querySelector('tbody').innerHTML = '<tr><td colspan="5">Erro ao carregar ranking.</td></tr>';
      });
  } catch (error) {
    console.error('❌ Erro ao buscar ranking:', error);
    if (table?.querySelector('tbody')) {
      table.querySelector('tbody').innerHTML = '<tr><td colspan="5">Erro ao carregar ranking.</td></tr>';
    }
  }
}

// Auto-refresh ranking quando a página ganhar foco
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('📲 Página ganhou foco - Recarregando ranking');
    setTimeout(() => {
      loadRanking();
      loadRankingData();
    }, 300);
  }
});

function openStreakModal() {
  const modal = document.getElementById('streak-modal');
  if (!modal) return;

  loadStreakData();
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeStreakModal() {
  const modal = document.getElementById('streak-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function loadStreakData() {
  const token = getAuthToken();
  
  if (token) {
    // Buscar do servidor
    fetch('/api/streak', {
      headers: getAuthHeader()
    })
    .then(res => res.json())
    .then(data => {
      const streak = data.current_streak || '0';
      document.getElementById('streak-current').textContent = streak;
      updateStreakBadge();
      
      // Gerar histórico dinâmico com base em play_logs (quando disponível) ou fallback para streak
      const historyList = document.getElementById('streak-history-list');
      const daysToShow = 7;
      const playLogs = Array.isArray(data.play_logs) ? data.play_logs : [];
      const logsMap = new Map();
      playLogs.forEach(l => logsMap.set(l.play_date, Number(l.minutes_played || 0)));

      // If no detailed logs, fall back to using last_played_date and current_streak
      const today = new Date();
      const history = [];
      for (let i = 0; i < daysToShow; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const label = i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : `${i} dias atrás`;
        const minutes = logsMap.has(iso) ? logsMap.get(iso) : null;
        const played = minutes !== null;
        history.push({ date: label, status: played ? '✅ Jogou' : '❌ Não jogou', time: played ? `${minutes} min` : '-' });
      }

      if (history.length > 0) {
        historyList.innerHTML = history
          .map(h => `
            <div class="streak-entry">
              <div class="entry-date">${h.date}</div>
              <div class="entry-status">${h.status}</div>
              <div class="entry-time">${h.time}</div>
            </div>
          `)
          .join('');
      }
    })
    .catch(err => {
      console.error('Erro ao buscar streak:', err);
      // Fallback para localStorage
      const streak = localStorage.getItem('cacaVerbosStreak') || '0';
      document.getElementById('streak-current').textContent = streak;
    });
  } else {
    // Sem token, use localStorage
    const streak = localStorage.getItem('cacaVerbosStreak') || '0';
    document.getElementById('streak-current').textContent = streak;
    // Gerar histórico local baseado no valor salvo (assume última jogada hoje)
    const streakCount = Number(streak || 0);
    const historyList = document.getElementById('streak-history-list');
    const daysToShow = 7;
    const playedDates = new Set();
    if (streakCount > 0) {
      const today = new Date();
      for (let i = 0; i < streakCount; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        playedDates.add(d.toISOString().split('T')[0]);
      }
    }

    const today = new Date();
    const history = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : `${i} dias atrás`;
      const played = playedDates.has(iso);
      history.push({ date: label, status: played ? '✅ Jogou' : '❌ Não jogou', time: '-' });
    }

    if (history.length > 0) {
      historyList.innerHTML = history
        .map(h => `
          <div class="streak-entry">
            <div class="entry-date">${h.date}</div>
            <div class="entry-status">${h.status}</div>
            <div class="entry-time">${h.time}</div>
          </div>
        `)
        .join('');
    }
  }
}

function updateStreakBadge() {
  const token = getAuthToken();
  
  if (token) {
    // Buscar do servidor
    fetch('/api/streak', {
      headers: getAuthHeader()
    })
    .then(res => res.json())
    .then(data => {
      const streak = data.current_streak || '0';
      const badge = document.getElementById('streak-badge');
      if (badge) badge.textContent = streak;
      const displayNumber = document.getElementById('streak-display-number');
      if (displayNumber) displayNumber.textContent = streak;
      localStorage.setItem('cacaVerbosStreak', streak);
    })
    .catch(() => {
      // Fallback para localStorage
      const streak = localStorage.getItem('cacaVerbosStreak') || '0';
      const badge = document.getElementById('streak-badge');
      if (badge) badge.textContent = streak;
      const displayNumber = document.getElementById('streak-display-number');
      if (displayNumber) displayNumber.textContent = streak;
    });
  } else {
    // Sem token, use localStorage
    const streak = localStorage.getItem('cacaVerbosStreak') || '0';
    const badge = document.getElementById('streak-badge');
    if (badge) badge.textContent = streak;
    const displayNumber = document.getElementById('streak-display-number');
    if (displayNumber) displayNumber.textContent = streak;
  }
}

function updateUserStreak(payload = {}) {
  const token = getAuthToken();
  
  if (!token) return Promise.reject('Sem token');
  
  return fetch('/api/streak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    updateStreakBadge();
    return data;
  });
}

async function getUserProgress() {
  const token = getAuthToken();

  if (!token) {
    return { current_phase: 1, bonus_lives: 0, chest_claimed: false, achievements: [] };
  }

  try {
    const response = await fetch('/api/progression', {
      headers: getAuthHeader(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar progresso.');
    }

    localStorage.setItem('cacaVerbosPhase', String(data.current_phase || 1));
    localStorage.setItem('cacaVerbosBonusLives', String(data.bonus_lives || 0));
    return data;
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    // Se houver token e falhar a requisição, assumir fase inicial (mais seguro para novas contas)
    return {
      current_phase: 1,
      bonus_lives: 0,
      chest_claimed: false,
      achievements: [],
    };
  }
}

async function advanceUserProgress(completedLevel) {
  const token = getAuthToken();

  if (!token) return { current_phase: 1, bonus_lives: 0, chest_claimed: false, achievements: [] };

  const response = await fetch('/api/progression/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ completedLevel }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao avançar progresso.');
  }

  localStorage.setItem('cacaVerbosPhase', String(data.current_phase || 1));
  localStorage.setItem('cacaVerbosBonusLives', String(data.bonus_lives || 0));
  return data;
}

async function openChestReward() {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Sem token');
  }

  const response = await fetch('/api/progression/chest/open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao abrir baú.');
  }

  localStorage.setItem('cacaVerbosBonusLives', String(data.bonus_lives || 0));
  return data;
}

function updateProfileLevelBadge() {
  const token = getAuthToken();
  
  if (token) {
    // Buscar nível do servidor
    fetch('/api/user/level', {
      headers: getAuthHeader()
    })
    .then(res => res.json())
    .then(data => {
      const level = data.max_level || 1;
      const badge = document.getElementById('profile-level-badge');
      if (badge) badge.textContent = level;
      localStorage.setItem('cacaVerbosLevel', level);
    })
    .catch(() => {
      // Fallback para localStorage
      const level = localStorage.getItem('cacaVerbosLevel') || '1';
      const badge = document.getElementById('profile-level-badge');
      if (badge) badge.textContent = level;
    });
  } else {
    // Sem token, use localStorage
    const level = localStorage.getItem('cacaVerbosLevel') || '1';
    const badge = document.getElementById('profile-level-badge');
    if (badge) badge.textContent = level;
  }
}

function setDifficulty(level) {
  if (!difficultyMeta[level]) return;
  selectedDifficulty = level;
  localStorage.setItem('cacaVerbosDifficulty', level);
  updateDifficultyUI();
  closeDifficultyPopup();
}

function updateDifficultyUI() {
  const options = document.querySelectorAll('.difficulty-option');
  options.forEach((option) => {
    const isActive = option.dataset.level === selectedDifficulty;
    option.classList.toggle('active', isActive);
    option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  const currentEmoji = document.getElementById('difficulty-current-emoji');
  const currentLabel = document.getElementById('difficulty-current-label');
  const meta = difficultyMeta[selectedDifficulty];

  if (currentEmoji) {
    currentEmoji.textContent = meta.emoji;
  }

  if (currentLabel) {
    currentLabel.textContent = meta.label.toUpperCase();
  }
}

function openSettingsPanel() {
  const overlay = document.getElementById('settings-panel');
  if (!overlay) return;

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeSettingsPanel() {
  const overlay = document.getElementById('settings-panel');
  if (!overlay) return;

  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function updateVolume(value) {
  currentVolume = Number(value);

  const volumeValue = document.getElementById('volume-value');
  if (volumeValue) {
    volumeValue.textContent = `${currentVolume}%`;
  }

  localStorage.setItem('cacaVerbosVolume', String(currentVolume));
}

function viewProfile() {
  closeSettingsPanel();
  openProfilePanel();
}

function openFeatureDemo(featureKey) {
  const overlay = document.getElementById('feature-demo-overlay');
  if (!overlay) return;

  const config = featureDemoConfig[featureKey] || featureDemoConfig.niveis;
  activeFeatureKey = featureKey;
  featureProgress = 25;

  const titleEl = document.getElementById('feature-demo-title');
  const descriptionEl = document.getElementById('feature-demo-description');
  const statusEl = document.getElementById('feature-demo-status');
  const tagsContainer = document.getElementById('feature-demo-tags');
  const levelsContainer = document.getElementById('feature-levels');
  const difficulty = difficultyMeta[selectedDifficulty];

  if (titleEl) {
    titleEl.textContent = config.title;
  }

  if (descriptionEl) {
    descriptionEl.textContent = config.description;
  }

  if (statusEl) {
    statusEl.textContent = `Dificuldade ${difficulty.label} ${difficulty.emoji} selecionada.`;
  }

  const achievementsContainer = document.getElementById('feature-achievements');
  if (featureKey === 'niveis') {
    if (tagsContainer) {
      tagsContainer.classList.add('hidden');
    }
    if (levelsContainer) {
      levelsContainer.classList.remove('hidden');
    }
    if (achievementsContainer) {
      achievementsContainer.classList.add('hidden');
    }
    renderProgressBoard(levelsData, 'nivel', 'niveis', '🎯', 'level-card');
    if (statusEl) {
      statusEl.textContent = `Painel de niveis no modo ${difficulty.label} ${difficulty.emoji}.`;
    }
  } else if (featureKey === 'conquistas') {
    if (tagsContainer) {
      tagsContainer.classList.add('hidden');
    }
    if (levelsContainer) {
      levelsContainer.classList.add('hidden');
    }
    renderProgressBoard(achievementsData, 'trofeu', 'trofeus', '🏆');
    if (achievementsContainer) {
      achievementsContainer.classList.remove('hidden');
    }
  } else if (featureKey === 'cenarios') {
    if (tagsContainer) {
      tagsContainer.classList.add('hidden');
    }
    if (levelsContainer) {
      levelsContainer.classList.add('hidden');
    }
    renderProgressBoard(scenarioProgressData, 'cenario', 'cenarios', '🗺️');
    if (achievementsContainer) {
      achievementsContainer.classList.remove('hidden');
    }
  } else {
    if (tagsContainer) {
      tagsContainer.classList.remove('hidden');
    }
    if (levelsContainer) {
      levelsContainer.classList.add('hidden');
    }
    if (achievementsContainer) {
      achievementsContainer.classList.add('hidden');
    }
    renderFeatureTags(config.tags);
  }

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeFeatureDemo() {
  const overlay = document.getElementById('feature-demo-overlay');
  if (!overlay) return;

  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function renderFeatureTags(tags) {
  const container = document.getElementById('feature-demo-tags');
  if (!container) return;

  container.innerHTML = '';
  tags.forEach((tag, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `feature-tag ${index === 0 ? 'active' : ''}`;
    btn.textContent = tag;
    btn.onclick = () => {
      document.querySelectorAll('.feature-tag').forEach((el) => el.classList.remove('active'));
      btn.classList.add('active');
      const statusEl = document.getElementById('feature-demo-status');
      if (statusEl) {
        statusEl.textContent = `${tag} selecionado para demonstracao.`;
      }
      featureProgress = Math.min(featureProgress + 10, 100);
    };
    container.appendChild(btn);
  });
}

function simulateFeatureAction() {
  const statusEl = document.getElementById('feature-demo-status');
  const config = featureDemoConfig[activeFeatureKey] || featureDemoConfig.niveis;
  const difficulty = difficultyMeta[selectedDifficulty];

  const responses = activeFeatureKey === 'conquistas'
    ? [
        'Atualizando painel de trofeis...',
        '1 trofeu desbloqueado e 10 bloqueados para demonstracao.',
        'Conquistas prontas para apresentacao.'
      ]
    : activeFeatureKey === 'cenarios'
      ? [
          'Carregando painel de cenarios...',
          '0 cenarios concluidos e 10 bloqueados para demonstracao.',
          'Painel de cenarios pronto para apresentacao.'
        ]
      : [
        `Preparando recursos de ${config.title} no modo ${difficulty.label}...`,
        `Animacoes de ${config.title} em execucao com dificuldade ${difficulty.emoji}!`,
        `${config.title} pronto para apresentacao (${difficulty.label}).`
      ];

  const messageIndex = Math.min(Math.floor(featureProgress / 35), 2);
  if (statusEl) {
    statusEl.textContent = responses[messageIndex];
  }

  featureProgress = Math.min(featureProgress + 25, 100);
}

function renderProgressBoard(items, singularLabel, pluralLabel, unlockedIcon = '🏆', cardClass = 'achievement-card') {
  const grid = document.getElementById('feature-achievements-grid');
  const summary = document.getElementById('feature-achievements-summary');
  const levelsGrid = document.getElementById('feature-levels-grid');
  const levelsSummary = document.getElementById('feature-levels-summary');

  const useLevelsContainer = cardClass === 'level-card';
  const targetGrid = useLevelsContainer ? levelsGrid : grid;
  const targetSummary = useLevelsContainer ? levelsSummary : summary;
  if (!targetGrid || !targetSummary) return;

  targetGrid.innerHTML = '';
  const unlockedCount = items.filter((item) => item.unlocked).length;
  const lockedCount = items.length - unlockedCount;
  const label = unlockedCount === 1 ? singularLabel : pluralLabel;
  const unlockedWord = unlockedCount === 1 ? 'desbloqueado' : 'desbloqueados';
  targetSummary.textContent = `${unlockedCount} ${label} ${unlockedWord} e ${lockedCount} bloqueados`;

  items.forEach((achievement) => {
    const card = document.createElement('div');
    card.className = `${cardClass} ${achievement.unlocked ? 'unlocked' : 'locked'}`;

    const icon = document.createElement('span');
    icon.className = 'achievement-icon';
    icon.textContent = achievement.unlocked ? unlockedIcon : '🔒';

    const name = document.createElement('span');
    name.className = 'achievement-name';
    name.textContent = achievement.name;

    card.appendChild(icon);
    card.appendChild(name);
    targetGrid.appendChild(card);
  });
}

function openProfilePanel() {
  const overlay = document.getElementById('profile-panel');
  if (!overlay) return;

  draftAvatar = selectedAvatar;
  draftProfileColor = selectedProfileColor;

  const nameInput = document.getElementById('profile-name-input');
  if (nameInput) {
    nameInput.value = userName;
  }

  renderProfileColorOptions();
  renderProfileAvatarOptions();
  updateProfilePreview();

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeProfilePanel() {
  const overlay = document.getElementById('profile-panel');
  if (!overlay) return;

  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function renderProfileColorOptions() {
  const container = document.getElementById('profile-color-options');
  if (!container) return;

  container.innerHTML = '';
  profileColors.forEach((color) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `color-option ${color === draftProfileColor ? 'selected' : ''}`;
    btn.style.backgroundColor = color;
    btn.setAttribute('aria-label', `Selecionar cor ${color}`);
    btn.onclick = () => {
      draftProfileColor = color;
      renderProfileColorOptions();
      updateProfilePreview();
    };
    container.appendChild(btn);
  });
}

function renderProfileAvatarOptions() {
  const container = document.getElementById('profile-avatar-options');
  if (!container) return;

  container.innerHTML = '';
  avatarOptions.forEach((avatar) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `profile-avatar-option ${avatar === draftAvatar ? 'selected' : ''}`;
    btn.textContent = avatar;
    btn.setAttribute('aria-label', `Selecionar avatar ${avatar}`);
    btn.onclick = () => {
      draftAvatar = avatar;
      renderProfileAvatarOptions();
      updateProfilePreview();
    };
    container.appendChild(btn);
  });
}

function updateProfilePreview() {
  const preview = document.getElementById('profile-preview');
  if (preview) {
    preview.style.backgroundColor = draftProfileColor;
  }

  const previewAvatar = document.getElementById('profile-preview-avatar');
  if (previewAvatar) {
    previewAvatar.textContent = draftAvatar;
  }
}

function saveProfileCustomizations() {
  const nameInput = document.getElementById('profile-name-input');
  const typedName = nameInput ? nameInput.value.trim() : '';

  userName = typedName || 'Jogador';
  selectedAvatar = draftAvatar;
  selectedProfileColor = draftProfileColor;

  localStorage.setItem('cacaVerbosUserName', userName);
  localStorage.setItem('cacaVerbosAvatar', selectedAvatar);
  localStorage.setItem('cacaVerbosProfileColor', selectedProfileColor);

  const profileAvatar = document.querySelector('#user-profile .user-avatar');
  if (profileAvatar) {
    profileAvatar.textContent = selectedAvatar;
  }

  const profileBadge = document.getElementById('user-profile');
  if (profileBadge) {
    profileBadge.style.backgroundColor = selectedProfileColor;
  }

  closeProfilePanel();
}

// ===== Modal de Sucesso =====
function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function hideSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

// ===== Loading =====
function showLoading() {
  const loading = document.getElementById('loading-overlay');
  if (loading) {
    loading.classList.add('active');
  }
}

function hideLoading() {
  const loading = document.getElementById('loading-overlay');
  if (loading) {
    loading.classList.remove('active');
  }
}

// ===== Toggle Password =====
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// ===== Utilitários =====
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== Logout =====
function logout() {
  closeSettingsPanel();
  openLogoutPopup();
}

function confirmLogout() {
  closeLogoutPopup();
  // Limpar TODOS os campos de perfil do usuário anterior
  localStorage.removeItem('cacaVerbosToken');
  localStorage.removeItem('cacaVerbosAvatar');
  localStorage.removeItem('cacaVerbosUserName');
  localStorage.removeItem('cacaVerbosProfileColor');
  localStorage.removeItem('cacaVerbosPhase');
  localStorage.removeItem('cacaVerbosBonusLives');
  localStorage.removeItem('cacaVerbosLevel');
  localStorage.removeItem('cacaVerbosDifficulty');
  // Reseta variáveis globais
  selectedAvatar = '🦊';
  userName = 'Jogador';
  selectedProfileColor = '#f5a623';
  window.location.href = 'index.html';
}
