(function(){
  async function applyDeviceLayout(){
    try{
      const width = Math.round(window.innerWidth || document.documentElement.clientWidth);

      // Try API first, but gracefully fallback to local heuristics
      let recommended = null;
      try{
        const resp = await fetch(`/api/device?width=${width}`);
        const contentType = resp.headers.get('content-type') || '';
        if(resp.ok && contentType.includes('application/json')){
          const data = await resp.json();
          recommended = data.recommended || null;
        }
      }catch(err){
        // ignore API error and fallback
      }

      if(!recommended){
        // Local heuristic
        if(width <= 480) recommended = { cardMin: 180, columns: 1, playButtonFixed: true };
        else if(width <= 900) recommended = { cardMin: 220, columns: 2, playButtonFixed: true };
        else recommended = { cardMin: 260, columns: 3, playButtonFixed: false };
      }

      const r = recommended;
      if(r.cardMin) document.documentElement.style.setProperty('--card-min', r.cardMin + 'px');
      if(typeof r.playButtonFixed === 'boolean'){
        if(r.playButtonFixed) document.documentElement.classList.add('play-fixed');
        else document.documentElement.classList.remove('play-fixed');
      }
    }catch(e){
      console.warn('menu-responsive error', e);
    }
  }

  // Run on load and on resize (debounced)
  let t;
  window.addEventListener('resize', ()=>{ clearTimeout(t); t = setTimeout(applyDeviceLayout, 200); });
  document.addEventListener('DOMContentLoaded', applyDeviceLayout);
})();
