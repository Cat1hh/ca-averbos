// Script de debug para openVerbLibrary
(async function() {
  console.log('=== TESTE OPENVERBLIB ARY ===');
  
  // Obter currentPhase
  let currentPhase = 1;
  try {
    const res = await fetch('/api/progression', { 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('cacaVerbosToken')}` } 
    });
    if (res.ok) {
      const data = await res.json();
      currentPhase = Number(data.current_phase || 1);
      console.log('currentPhase from API:', currentPhase);
    }
  } catch (e) {
    console.warn('API error:', e);
  }
  
  // Teste loadVerbsFromPhases logic
  const verbs = [];
  const maxPhase = Math.max(0, Number(currentPhase || 0));
  console.log('maxPhase:', maxPhase);
  
  // Simular o loop
  console.log('Loop: for (let phase = 1; phase <= maxPhase; phase++)');
  console.log('  1 <= ' + maxPhase + ' ? ' + (1 <= maxPhase));
  
  if (1 > maxPhase) {
    console.log('LOOP NAO DEVERIA EXECUTAR - verbs array permanece vazio');
  }
  
  console.log('Final verbs count:', verbs.length);
})();
