// Página de detalhe do verbo
(async function() {
  console.log('[VERB.JS] iniciando');
  
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function sanitize(str) {
    return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Mapeamento de formas conjugadas para infinitivo
  const conjugationMap = {
    'ajustamos': 'ajustar',
    'arrumar': 'arrumar',
    'arrumou': 'arrumar',
    'arrumando': 'arrumar',
    'arrumarem': 'arrumar',
    'colocamos': 'colocar',
    'colocamosse': 'colocar',
    'colocar': 'colocar',
    'colocando': 'colocar',
    'colocou': 'colocar',
    'coloca': 'colocar',
    'desligou': 'desligar',
    'desliga': 'desligar',
    'desligar': 'desligar',
    'desligando': 'desligar',
    'desligam': 'desligar',
    'fechar': 'fechar',
    'fechou': 'fechar',
    'fechando': 'fechar',
    'fecha': 'fechar',
    'fechei': 'fechar',
    'guardai': 'guardar',
    'guardar': 'guardar',
    'guardou': 'guardar',
    'guardando': 'guardar',
    'guardei': 'guardar',
    'guardam': 'guardar',
    'ligaram': 'ligar',
    'ligam': 'ligar',
    'ligar': 'ligar',
    'ligando': 'ligar',
    'ligou': 'ligar',
    'ligava': 'ligar',
    'pendurando': 'pendurar',
    'pendurou': 'pendurar',
    'pendura': 'pendurar',
    'pendurar': 'pendurar',
    'pendurei': 'pendurar',
    'lavar': 'lavar',
    'lavou': 'lavar',
    'lavando': 'lavar',
    'lavei': 'lavar',
    'lavamos': 'lavar',
    'lava': 'lavar',
    'servir': 'servir',
    'serviu': 'servir',
    'servido': 'servir',
    'servindo': 'servir',
    'serve': 'servir',
    'servi': 'servir',
    'serviram': 'servir',
    'mexeram': 'mexer',
    'mexem': 'mexer',
    'mexer': 'mexer',
    'mexendo': 'mexer',
    'mexi': 'mexer',
  };

  let id = getQueryParam('id');
  console.log('[VERB.JS] id original:', id);
  
  // Converter forma conjugada para infinitivo
  if (id && conjugationMap[id.toLowerCase()]) {
    id = conjugationMap[id.toLowerCase()];
    console.log('[VERB.JS] id convertido para infinitivo:', id);
  }
  
  const titleEl = document.getElementById('verb-page-title');
  const typeEl = document.getElementById('verb-type');
  const usageEl = document.getElementById('verb-usage');
  const examplesEl = document.getElementById('verb-examples-list');
  const verbonioEl = document.getElementById('verbonio-speech');

  if (!id) {
    console.warn('[VERB.JS] sem id de verbo');
    titleEl.textContent = 'Verbo não especificado';
    examplesEl.textContent = 'Nenhum verbo selecionado.';
    if (verbonioEl) {
      verbonioEl.innerHTML = '<p>Nenhum verbo foi selecionado. Volte à biblioteca e escolha um verbo para aprender!</p>';
    }
    return;
  }

  titleEl.textContent = `Carregando verbo: ${sanitize(id)}`;
  examplesEl.textContent = 'Buscando informações...';
  if (verbonioEl) {
    verbonioEl.innerHTML = '<p>Carregando...</p>';
  }

  // Dados de exemplo / fallback
  const exampleVerbs = {
    'arrumar': { infinitive: 'arrumar', translation: 'organizar, colocar em ordem', type: 'regular', usage: 'Usado para organizar e deixar tudo no seu lugar.', examples: ['No quarto, eu vou arrumar a cama.', 'Na cozinha, ela arruma a mesa para o jantar.', 'Eles arrumaram o guarda-roupa antes de sair.'] },
    'guardar': { infinitive: 'guardar', translation: 'colocar em segurança, armazenar', type: 'regular', usage: 'Usado para colocar algo em um local seguro ou longe do alcance.', examples: ['Ela costuma guardar o pijama no armário.', 'Você precisa guardar os brinquedos na caixa.', 'Eles guardaram os livros na estante.'] },
    'colocar': { infinitive: 'colocar', translation: 'pôr, posicionar algo em um lugar', type: 'regular', usage: 'Usado para posicionar objetos em um local específico.', examples: ['Ontem, nós colocamos os livros na estante do quarto.', 'Ela está colocando a sopa na tigela.', 'Você vai colocar o bolo no forno.'] },
    'fechar': { infinitive: 'fechar', translation: 'encerrar, trancar, selar', type: 'regular', usage: 'Usado para fechar portas, janelas, ou recipientes.', examples: ['Você vai fechar a janela do quarto agora?', 'Você fechou a geladeira antes de sair?', 'Eles fecham a porta todos os dias.'] },
    'ligar': { infinitive: 'ligar', translation: 'ativar, acender (aparelhos)', type: 'regular', usage: 'Usado para ligar aparelhos eletrônicos.', examples: ['Eles ligaram a luminária ao lado da cama.', 'Você vai ligar a televisão?', 'Ela liga o ventilador quando está quente.'] },
    'pendurar': { infinitive: 'pendurar', translation: 'suspender, colocar pendurado', type: 'regular', usage: 'Usado para colocar algo em um local elevado, suspenso.', examples: ['Ela está pendurando a roupa no cabide do quarto.', 'Você vai pendurar o quadro na parede?', 'Eles penduraram a toalha no banheiro.'] },
    'ajustar': { infinitive: 'ajustar', translation: 'ajeitar, acomodar, conformar', type: 'regular', usage: 'Usado para ajeitar algo até ficar confortável ou correto.', examples: ['Nós sempre ajustamos o travesseiro antes de dormir.', 'Você vai ajustar o espelho?', 'Eles ajustaram as cortinas do quarto.'] },
    'desligar': { infinitive: 'desligar', translation: 'apagar, desativar aparelhos', type: 'regular', usage: 'Usado para desligar aparelhos eletrônicos.', examples: ['Você desligou o despertador antes de sair do quarto.', 'Ela desliga a luz antes de dormir.', 'Eles desligam o ventilador quando sai da sala.'] },
    'lavar': { infinitive: 'lavar', translation: 'limpar com água', type: 'regular', usage: 'Usado para limpar objetos ou alimentos com água.', examples: ['Na cozinha, ela costuma lavar os pratos após o almoço.', 'Nós sempre lavamos a fruta antes de comer.', 'Você vai lavar as mãos antes de comer?'] },
    'servir': { infinitive: 'servir', translation: 'oferecer alimento ou bebida', type: 'irregular', usage: 'Usado para oferecer ou distribuir alimentos e bebidas.', examples: ['Você vai servir o suco na jarra agora?', 'Ela serve o café todas as manhãs.', 'Eles serviram o bolo depois do almoço.'] },
    'mexer': { infinitive: 'mexer', translation: 'misturar, remexer', type: 'regular', usage: 'Usado para misturar alimentos ou remexer algo.', examples: ['Eles mexeram a panela com cuidado.', 'Você precisa mexer a sopa enquanto aquece.', 'Ela mexe o café com a colher.'] },
  };

  let verb = exampleVerbs[String(id).toLowerCase()];

  if (!verb) {
    console.log('[VERB.JS] verbo não encontrado em exemplo, tentando carregar de fases/json');
    
    // Tenta carregar do JSON
    try {
      const res = await fetch('/data/verbs.json');
      if (res.ok) {
        const data = await res.json();
        const found = data.find(v => String(v.id || v.infinitive).toLowerCase() === String(id).toLowerCase());
        if (found) verb = found;
      }
    } catch (e) {
      console.warn('[VERB.JS] erro ao carregar verbs.json:', e);
    }
  }

  if (!verb) {
    console.warn('[VERB.JS] verbo ainda não encontrado');
    typeEl.textContent = '';
    usageEl.textContent = `Verbo "${sanitize(id)}" não encontrado na base de dados.`;
    examplesEl.textContent = '';
    if (verbonioEl) {
      verbonioEl.innerHTML = `<p>Desculpe, não encontrei informações sobre o verbo <strong>"${sanitize(id)}"</strong> na nossa base. Tente voltar à biblioteca!</p>`;
    }
    return;
  }

  console.log('[VERB.JS] verbo carregado:', verb);

  titleEl.textContent = `${sanitize(verb.infinitive)} — ${sanitize(verb.translation || '')}`;
  typeEl.textContent = `Tipo: ${sanitize(verb.type || '—')}`;
  usageEl.textContent = sanitize(verb.usage || '—');

  // Exibir exemplos
  if (verb.examples && Array.isArray(verb.examples) && verb.examples.length > 0) {
    examplesEl.innerHTML = verb.examples
      .map(ex => `<li>${sanitize(ex)}</li>`)
      .join('');
  } else {
    examplesEl.innerHTML = `<li>${sanitize(verb.usage || 'Sem exemplos disponíveis.')}</li>`;
  }

  // Fazer Verbonio falar sobre o verbo
  generateVerbonioSpeech(verb, verbonioEl);

})();

function generateVerbonioSpeech(verb, element) {
  if (!element) return;

  const verbName = sanitize(verb.infinitive || '');
  const translation = sanitize(verb.translation || '');
  const type = sanitize(verb.type || 'regular');
  const usage = sanitize(verb.usage || '');

  let speech = ``;
  
  if (translation) {
    speech += `<p><strong>${verbName}</strong> significa <strong>"${translation}"</strong>.</p>`;
  } else {
    speech += `<p>Vou te ensinar sobre <strong>${verbName}</strong>!</p>`;
  }

  speech += `<p>Este é um verbo <strong>${type}</strong>.</p>`;

  if (usage) {
    speech += `<p><strong>Quando usar:</strong> ${usage}</p>`;
  }

  // Mostrar exemplo do verbo em ação
  if (verb.examples && Array.isArray(verb.examples) && verb.examples.length > 0) {
    speech += `<p><strong>Veja como usar:</strong></p><ul style="margin: 0.5rem 0; padding-left: 1.2rem;">`;
    verb.examples.slice(0, 2).forEach(ex => {
      speech += `<li style="margin: 0.3rem 0; font-size: 0.9em;">"${sanitize(ex)}"</li>`;
    });
    speech += `</ul>`;
  }

  speech += `<p style="margin-top: 1rem; color: #ff8a5b; font-weight: 600;">Bom aprendizado! 🎓</p>`;

  element.innerHTML = speech;
}

function sanitize(str) {
  return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


