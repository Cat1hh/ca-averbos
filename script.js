// ===== Variáveis Globais =====
let selectedAvatar = '🦊';
let userName = 'Jogador';

// ===== Avatares =====
const avatarOptions = ['🦊', '🐱', '🐶', '🐰', '🐻', '🦁', '🐼', '🐨', '🦋', '🌈', '⭐', '🎨'];

// ===== Verbos para elementos flutuantes =====
const verbos = ['Correr', 'Pular', 'Brincar', 'Cantar', 'Dançar', 'Estudar', 'Ler', 'Escrever', 'Jogar', 'Sonhar', 'Voar', 'Nadar'];

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
  initAvatarGrid();
  initFloatingElements('login-floating');
  initFloatingElements('cadastro-floating');
  initFormHandlers();
});

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
  }
}

async function handleLogin(e) {
  e.preventDefault();
  showLoading();
  
  // Simular login
  await delay(1500);
  
  hideLoading();
  showBookAnimation();
}

async function handleCadastro(e) {
  e.preventDefault();
  showLoading();
  
  userName = document.getElementById('cadastro-nome').value || 'Jogador';
  
  // Simular cadastro
  await delay(2000);
  
  hideLoading();
  showSuccessModal();
  
  // Após sucesso, mostrar animação do livro
  await delay(3000);
  hideSuccessModal();
  showBookAnimation();
}

// ===== Navegação =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    
    // Re-animar elementos
    if (pageId === 'cadastro-page') {
      initFloatingElements('cadastro-floating');
    }
  }
}

// ===== Animação do Livro =====
function showBookAnimation() {
  const bookOverlay = document.getElementById('book-animation');
  bookOverlay.classList.add('active');
  
  // Esconder página atual
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // Iniciar animação do livro após um momento
  setTimeout(() => {
    const bookCover = document.querySelector('.book-cover');
    bookCover.classList.add('opening');
  }, 500);
  
  // Ir para home após animação
  setTimeout(() => {
    bookOverlay.classList.remove('active');
    document.querySelector('.book-cover').classList.remove('opening');
    showHomePage();
  }, 3000);
}

function showHomePage() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('home-page').classList.add('active');
  
  // Atualizar avatar do usuário
  const userProfile = document.getElementById('user-profile');
  if (userProfile) {
    userProfile.querySelector('.user-avatar').textContent = selectedAvatar;
  }
}

// ===== Modal de Sucesso =====
function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.classList.add('active');
  createConfetti();
}

function hideSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.classList.remove('active');
  document.getElementById('confetti').innerHTML = '';
}

function createConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#ff6b9d'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    container.appendChild(confetti);
  }
}

// ===== Loading =====
function showLoading() {
  document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
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
  showPage('login-page');
  // Limpar formulários
  document.getElementById('login-form').reset();
  document.getElementById('cadastro-form').reset();
  selectedAvatar = '🦊';
  userName = 'Jogador';
}
