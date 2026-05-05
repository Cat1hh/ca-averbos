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
  } catch (e) {
    if (table.querySelector('tbody'))
      table.querySelector('tbody').innerHTML = '<tr><td colspan="5">Erro ao carregar ranking.</td></tr>';
    if (userPositionDiv) userPositionDiv.textContent = '';
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
    alert('Informe e-mail e senha.');
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

    hideLoading();
    showBookAnimation('menu.html');
  } catch (error) {
    hideLoading();
    alert(error.message || 'Erro ao realizar login.');
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
  
  userName = document.getElementById('cadastro-nome').value || 'Jogador';

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

// ===== Navegação =====
function showPage(pageId) {
// ===== Salvar Pontuação =====
async function saveScore(level, points, verbsCompleted = 0) {
  const token = localStorage.getItem('cacaVerbosToken');
  if (!token) {
    alert('Você precisa estar logado para salvar sua pontuação.');
    return;
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
      throw new Error(data.message || 'Erro ao salvar pontuação.');
    }
    // Pontuação salva com sucesso
    updateProfileLevelBadge();
    return data;
  } catch (error) {
    alert(error.message || 'Erro ao salvar pontuação.');
  }
}
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
    const res = fetch('/api/ranking');
    res.then(response => response.json()).then(data => {
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
      }
    }).catch(() => {
      table.querySelector('tbody').innerHTML = '<tr><td colspan="5">Erro ao carregar ranking.</td></tr>';
    });
  } catch {
    table.querySelector('tbody').innerHTML = '<tr><td colspan="5">Erro ao carregar ranking.</td></tr>';
  }
}

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
      
      // Dados simulados de histórico (em produção, viriam do servidor)
      const history = [
        { date: 'Hoje', status: '✅ Jogou', time: '45 min' },
        { date: 'Ontem', status: '✅ Jogou', time: '30 min' },
        { date: '2 dias atrás', status: '✅ Jogou', time: '60 min' },
        { date: '3 dias atrás', status: '❌ Não jogou', time: '-' },
        { date: '4 dias atrás', status: '✅ Jogou', time: '25 min' }
      ];
      
      const historyList = document.getElementById('streak-history-list');
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
    
    const history = [
      { date: 'Hoje', status: '✅ Jogou', time: '45 min' },
      { date: 'Ontem', status: '✅ Jogou', time: '30 min' },
      { date: '2 dias atrás', status: '✅ Jogou', time: '60 min' },
      { date: '3 dias atrás', status: '❌ Não jogou', time: '-' },
      { date: '4 dias atrás', status: '✅ Jogou', time: '25 min' }
    ];
    
    const historyList = document.getElementById('streak-history-list');
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

function updateUserStreak() {
  const token = getAuthToken();
  
  if (!token) return Promise.reject('Sem token');
  
  return fetch('/api/streak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  })
  .then(res => res.json())
  .then(data => {
    updateStreakBadge();
    return data;
  });
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
  localStorage.removeItem('cacaVerbosToken');
  localStorage.removeItem('cacaVerbosAvatar');
  localStorage.removeItem('cacaVerbosUserName');
  selectedAvatar = '🦊';
  userName = 'Jogador';
  window.location.href = 'index.html';
}
