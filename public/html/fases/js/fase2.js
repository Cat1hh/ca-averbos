const questions = [
  {
    prompt: 'Na cozinha, eu vou _____ a mesa para o jantar.',
    options: [
      { key: '', text: 'arrumar', correct: true },
      { key: '', text: 'arrumou', correct: false },
      { key: '', text: 'arrumando', correct: false },
      { key: '', text: 'arrumem', correct: false },
    ],
    feedback: 'Correto. Depois de "vou", usamos o verbo no infinitivo: arrumar.',
  },
  {
    prompt: 'Na cozinha, ela costuma _____ os pratos após o almoço.',
    options: [
      { key: '', text: 'lavar', correct: true },
      { key: '', text: 'lavou', correct: false },
      { key: '', text: 'lavando', correct: false },
      { key: '', text: 'lavei', correct: false },
    ],
    feedback: 'Correto. "Lavar" combina com a ação da cozinha.',
  },
  {
    prompt: 'Ontem, nós _____ o bolo no forno.',
    options: [
      { key: '', text: 'colocamos', correct: true },
      { key: '', text: 'colocando', correct: false },
      { key: '', text: 'colocar', correct: false },
      { key: '', text: 'colocamosse', correct: false },
    ],
    feedback: 'Correto. No passado, a forma certa é colocamos.',
  },
  {
    prompt: 'Você vai _____ o suco na jarra agora?',
    options: [
      { key: '', text: 'servir', correct: true },
      { key: '', text: 'serviu', correct: false },
      { key: '', text: 'servido', correct: false },
      { key: '', text: 'servindo', correct: false },
    ],
    feedback: 'Correto. Depois de "vai", usamos o infinitivo: servir.',
  },
  {
    prompt: 'Eles _____ a panela com cuidado.',
    options: [
      { key: '', text: 'mexeram', correct: true },
      { key: '', text: 'mexem', correct: false },
      { key: '', text: 'mexer', correct: false },
      { key: '', text: 'mexendo', correct: false },
    ],
    feedback: 'Correto. A frase pede passado: mexeram.',
  },
  {
    prompt: 'Ela está _____ a sopa na tigela.',
    options: [
      { key: '', text: 'colocando', correct: true },
      { key: '', text: 'colocou', correct: false },
      { key: '', text: 'coloca', correct: false },
      { key: '', text: 'colocar', correct: false },
    ],
    feedback: 'Correto. Com "está", a forma contínua fica natural: colocando.',
  },
  {
    prompt: 'Nós sempre _____ a fruta antes de comer.',
    options: [
      { key: '', text: 'lavamos', correct: true },
      { key: '', text: 'lava', correct: false },
      { key: '', text: 'lavar', correct: false },
      { key: '', text: 'lavando', correct: false },
    ],
    feedback: 'Correto. O presente habitual usa lavamos.',
  },
  {
    prompt: 'Você _____ a geladeira antes de sair?',
    options: [
      { key: '', text: 'fechou', correct: true },
      { key: '', text: 'fecha', correct: false },
      { key: '', text: 'fechar', correct: false },
      { key: '', text: 'fechando', correct: false },
    ],
    feedback: 'Correto. A ação já aconteceu, então usamos fechou.',
  },
];

function shuffleArray(items) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

const shuffledQuestions = shuffleArray(
  questions.map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }))
);

const promptEl = document.getElementById('question-prompt');
const optionsEl = document.getElementById('question-options');
const feedbackEl = document.getElementById('question-feedback');
const kickerEl = document.querySelector('.quiz-kicker');
const vidasEl = document.getElementById('vidas');
const pontosEl = document.getElementById('pontos');
const winScreen = document.getElementById('winScreen');
const loseScreen = document.getElementById('loseScreen');
const nextButton = document.getElementById('next-mission');
const verbsFinalEl = document.getElementById('verbosFinal');

let vidas = 3;
let pontos = 0;
let verbosAprendidos = 0;
let erros = 0;
let currentQuestionIndex = 0;
let locked = false;
const completionBonus = 50;

function renderQuestion() {
  const question = shuffledQuestions[currentQuestionIndex];

  if (promptEl) {
    promptEl.textContent = question.prompt;
  }

  if (kickerEl) {
    kickerEl.textContent = `Cozinha ${currentQuestionIndex + 1} de ${shuffledQuestions.length}`;
  }

  if (!optionsEl) return;

  optionsEl.innerHTML = '';
  if (feedbackEl) {
    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
  }
  locked = false;

  question.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    button.innerHTML = `
      <span class="answer-key">${option.key}</span>
      <span class="answer-text">${option.text}</span>
    `;

    button.addEventListener('click', () => handleAnswer(option, button));
    optionsEl.appendChild(button);
  });
}

function handleAnswer(option, button) {
  if (locked) return;

  locked = true;
  const buttons = Array.from(optionsEl.querySelectorAll('.answer-option'));
  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add('locked');
  });

  const question = questions[currentQuestionIndex];

  if (option.correct) {
    pontos += 10;
    verbosAprendidos += 1;
    if (pontosEl) pontosEl.textContent = pontos;
    button.classList.add('correct');
    if (feedbackEl) {
      feedbackEl.textContent = question.feedback;
      feedbackEl.className = 'quiz-feedback success';
    }
    setTimeout(async () => {
      currentQuestionIndex += 1;
      if (currentQuestionIndex >= shuffledQuestions.length) {
        await vencer();
        return;
      }
      renderQuestion();
    }, 900);
    return;
  }

  vidas -= 1;
  erros += 1;
  pontos = Math.max(0, pontos - 1);
  verbosAprendidos = Math.max(0, verbosAprendidos - 1);
  if (pontosEl) pontosEl.textContent = pontos;
  if (vidasEl) vidasEl.textContent = vidas;
  button.classList.add('wrong');
  if (feedbackEl) {
    feedbackEl.textContent = 'Tente outra forma. Essa alternativa não completa a frase corretamente.';
    feedbackEl.className = 'quiz-feedback error';
  }

  if (vidas <= 0) {
    perder();
  } else {
    setTimeout(() => {
      buttons.forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove('locked');
      });
      locked = false;
    }, 700);
  }
}

async function vencer() {
  const estrelas = vidas === 3 ? 3 : vidas === 2 ? 2 : 1;
  const totalPoints = pontos + completionBonus;
  pontos = totalPoints;
  if (pontosEl) pontosEl.textContent = pontos;

  let finalPoints = totalPoints;
  const token = localStorage.getItem('cacaVerbosToken');

  if (token) {
    try {
      const checkResponse = await fetch('/api/score/2', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const checkData = await checkResponse.json();
      if (checkData.completed) {
        finalPoints = Math.floor(totalPoints * 0.5);
      }
    } catch (error) {
      console.error('[VENCER 2] Erro ao verificar score:', error);
    }
  }

  document.getElementById('pontuacaoFinal').textContent = `Você ganhou ${finalPoints} pontos`;
  if (verbsFinalEl) verbsFinalEl.textContent = `Verbos concluídos: ${verbosAprendidos}`;
  document.getElementById('estrelas').textContent = '⭐'.repeat(estrelas);
  if (nextButton) nextButton.disabled = false;

  if (typeof saveScore === 'function') {
    try {
      const result = await saveScore(2, totalPoints, verbosAprendidos);
      console.log('Score fase 2 salvo com sucesso:', result);
      if (typeof advanceUserProgress === 'function') {
        await advanceUserProgress(2);
      }
      if (erros === 0 && typeof updateUserStreak === 'function') {
        await updateUserStreak({ flawless: true });
      }
    } catch (error) {
      console.error('Erro ao salvar score da fase 2:', error);
    }
  }

  winScreen.classList.remove('hidden');
}

function perder() {
  const loseTitle = loseScreen.querySelector('h1');
  const loseText = loseScreen.querySelector('p');
  if (loseTitle) loseTitle.textContent = '💤 Você errou a missão da cozinha!';
  if (loseText) loseText.textContent = 'Tente de novo para organizar a cozinha e completar a missão.';
  loseScreen.classList.remove('hidden');
}

function ganharVidas() {
  if (typeof showPopup === 'function') {
    showPopup('Assistir anúncio', '📺 Assistindo anúncio...');
  }

  setTimeout(() => {
    vidas = 3;
    if (vidasEl) vidasEl.textContent = vidas;
    locked = false;
    loseScreen.classList.add('hidden');
    if (typeof showPopup === 'function') {
      showPopup('Vidas recuperadas', '❤️ Vidas recuperadas!');
    }
  }, 2000);
}

function reiniciar() {
  window.location.reload();
}

function voltarAoMapa() {
  window.location.href = '../tela-fases.html';
}

async function initializeGame() {
  try {
    const progress = typeof getUserProgress === 'function' ? await getUserProgress() : { bonus_lives: 0 };
    vidas = 3 + Number(progress.bonus_lives || 0);
    if (vidasEl) vidasEl.textContent = vidas;
  } catch (error) {
    console.error('Erro ao carregar progresso inicial da fase 2:', error);
  }

  renderQuestion();
}

initializeGame();
