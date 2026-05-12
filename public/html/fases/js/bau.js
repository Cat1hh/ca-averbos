const chestStatusEl = document.getElementById('chest-status');
const openChestBtn = document.getElementById('open-chest-btn');
const backMapBtn = document.getElementById('back-map-btn');

async function loadChestState() {
  try {
    const progress = typeof getUserProgress === 'function' ? await getUserProgress() : null;
    if (!progress) return;

    if (progress.current_phase < 3) {
      if (chestStatusEl) chestStatusEl.textContent = 'Baú ainda bloqueado. Complete a fase 2.';
      if (openChestBtn) openChestBtn.disabled = true;
      return;
    }

    if (progress.chest_claimed) {
      if (chestStatusEl) chestStatusEl.textContent = `Baú já aberto. Vidas extras acumuladas: ${progress.bonus_lives}`;
      if (openChestBtn) {
        openChestBtn.disabled = true;
        openChestBtn.textContent = 'Baú já aberto';
      }
      return;
    }

    if (chestStatusEl) chestStatusEl.textContent = 'Baú pronto para abrir e liberar sua recompensa.';
  } catch (error) {
    console.error('Erro ao carregar estado do baú:', error);
    if (chestStatusEl) chestStatusEl.textContent = 'Não foi possível carregar o baú agora.';
  }
}

async function openChest() {
  if (!openChestBtn) return;

  openChestBtn.disabled = true;
  openChestBtn.textContent = 'Abrindo...';

  try {
    const result = typeof openChestReward === 'function' ? await openChestReward() : null;
    if (!result) {
      throw new Error('Função de abrir baú indisponível.');
    }

    if (chestStatusEl) {
      chestStatusEl.textContent = 'Recompensa recebida: 3 vidas extras e a conquista Caçador Iniciante!';
    }
    openChestBtn.textContent = 'Recompensa recebida';
  } catch (error) {
    console.error('Erro ao abrir baú:', error);
    if (chestStatusEl) chestStatusEl.textContent = error.message || 'Erro ao abrir o baú.';
    openChestBtn.disabled = false;
    openChestBtn.textContent = 'Abrir baú';
  }
}

if (openChestBtn) {
  openChestBtn.addEventListener('click', openChest);
}

if (backMapBtn) {
  backMapBtn.addEventListener('click', () => {
    window.location.href = '../tela-fases.html';
  });
}

loadChestState();
