(function(){
  const cta = document.querySelector('.btn-play-main');
  if(!cta) return;

  // Keep the CTA always visible so the main action stays reachable.
  cta.classList.remove('hidden-cta');
})();
