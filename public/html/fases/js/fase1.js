const questions = [
  {
    prompt: 'No quarto, eu vou _____ a cama.',
    options: [
      { key: 'A', text: 'arrumar', correct: true },
      { key: 'B', text: 'arrumou', correct: false },
      { key: 'C', text: 'arrumando', correct: false },
      { key: 'D', text: 'arrumarem', correct: false },
    ],
    feedback: 'Correto. No quarto, arrumar a cama faz sentido na frase.',
  },
  {
    prompt: 'No quarto, ela costuma _____ o pijama no armário.',
    options: [
      { key: 'A', text: 'guardar', correct: true },
      { key: 'B', text: 'guardou', correct: false },
      { key: 'C', text: 'guardando', correct: false },
      { key: 'D', text: 'guardei', correct: false },
    ],
    feedback: 'Correto. "Guardar" encaixa bem na ação do quarto.',
  },
  {
    prompt: 'Ontem, nós _____ os livros na estante do quarto.',
    options: [
      { key: 'A', text: 'colocamos', correct: true },
      { key: 'B', text: 'colocamosse', correct: false },
      { key: 'C', text: 'colocar', correct: false },
      { key: 'D', text: 'colocando', correct: false },
    ],
    feedback: 'Correto. O passado da ação no quarto fica natural com "colocamos".',
  },
  {
    prompt: 'Você vai _____ a janela do quarto agora?',
    options: [
      { key: 'A', text: 'fechar', correct: true },
      { key: 'B', text: 'fechou', correct: false },
      { key: 'C', text: 'fechando', correct: false },
      { key: 'D', text: 'fecha', correct: false },
    ],
    feedback: 'Correto. Depois de "vai", usamos o verbo no infinitivo: fechar.',
  },
  {
    prompt: 'Eles _____ a luminária ao lado da cama.',
    options: [
      { key: 'A', text: 'ligaram', correct: true },
      { key: 'B', text: 'ligam', correct: false },
      { key: 'C', text: 'ligar', correct: false },
      { key: 'D', text: 'ligando', correct: false },
    ],
    feedback: 'Correto. A frase pede passado: ligaram.',
  },
  {
    prompt: 'Ela está _____ a roupa no cabide do quarto.',
    options: [
      { key: 'A', text: 'pendurando', correct: true },
      { key: 'B', text: 'pendurou', correct: false },
      { key: 'C', text: 'pendura', correct: false },
      { key: 'D', text: 'pendurar', correct: false },
    ],
    feedback: 'Correto. Com "está", a forma contínua fica bem natural: pendurando.',
  },
  {
    prompt: 'Nós sempre _____ o travesseiro antes de dormir.',
    options: [
      { key: 'A', text: 'ajustamos', correct: true },
      { key: 'B', text: 'ajusta', correct: false },
      { key: 'C', text: 'ajustar', correct: false },
      { key: 'D', text: 'ajustando', correct: false },
    ],
    feedback: 'Correto. O presente habitual usa "ajustamos".',
  },
  {
    prompt: 'Você _____ o despertador antes de sair do quarto.',
    options: [
      { key: 'A', text: 'desligou', correct: true },
      { key: 'B', text: 'desliga', correct: false },
      { key: 'C', text: 'desligar', correct: false },
      { key: 'D', text: 'desligando', correct: false },
    ],
    feedback: 'Correto. A ação já aconteceu, então usamos "desligou".',
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
let currentQuestionIndex = 0;
let locked = false;
const completionBonus = 50;

function renderQuestion() {
  const question = shuffledQuestions[currentQuestionIndex];

  if (promptEl) {
    promptEl.textContent = question.prompt;
  }

  if (kickerEl) {
    kickerEl.textContent = `Quarto ${currentQuestionIndex + 1} de ${shuffledQuestions.length}`;
  }

  if (!optionsEl) {
    return;
  }

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
  if (locked) {
    return;
  }

  locked = true;
  const buttons = Array.from(optionsEl.querySelectorAll('.answer-option'));
  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add('locked');
  });

  const question = questions[currentQuestionIndex];

  if (option.correct) {
    pontos += 10;
    if (pontosEl) {
      pontosEl.textContent = pontos;
    }
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
  if (vidasEl) {
    vidasEl.textContent = vidas;
  }
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
  if (pontosEl) {
    pontosEl.textContent = pontos;
  }
  document.getElementById('pontuacaoFinal').textContent = `Pontos: ${totalPoints}`;
  if (verbsFinalEl) {
    verbsFinalEl.textContent = `Verbos concluídos: ${questions.length}`;
  }
  document.getElementById('estrelas').textContent = '⭐'.repeat(estrelas);
  if (nextButton) {
    nextButton.disabled = false;
  }
  if (typeof saveScore === 'function') {
    try {
      await saveScore(1, totalPoints, questions.length);
    } catch (error) {
      console.error('Erro ao salvar score da fase:', error);
    }
  }
  winScreen.classList.remove('hidden');
}

function perder() {
  const loseTitle = loseScreen.querySelector('h1');
  const loseText = loseScreen.querySelector('p');
  if (loseTitle) {
    loseTitle.textContent = '💤 Você errou a rotina do quarto!';
  }
  if (loseText) {
    loseText.textContent = 'Tente de novo para organizar o quarto e completar a missão.';
  }
  loseScreen.classList.remove('hidden');
}

function ganharVidas() {
  alert('📺 Assistindo anúncio...');

  setTimeout(() => {
    vidas = 3;
    if (vidasEl) {
      vidasEl.textContent = vidas;
    }
    locked = false;
    loseScreen.classList.add('hidden');
    alert('❤️ Vidas recuperadas!');
  }, 2000);
}

function reiniciar() {
  window.location.reload();
}

function voltarAoMapa() {
  window.location.href = '../tela-fases.html';
}

renderQuestion();