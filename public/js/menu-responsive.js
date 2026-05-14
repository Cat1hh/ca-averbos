(function(){
  async function applyDeviceLayout(){
    try{
      const width = Math.round(window.innerWidth || document.documentElement.clientWidth);
      const resp = await fetch(`/api/device?width=${width}`);
      if(!resp.ok) return;
      const data = await resp.json();
      const r = data.recommended || {};
      // apply CSS variables
      if(r.cardMin) document.documentElement.style.setProperty('--card-min', r.cardMin + 'px');
      if(typeof r.playButtonFixed === 'boolean'){
        if(r.playButtonFixed) document.documentElement.classList.add('play-fixed');
        else document.documentElement.classList.remove('play-fixed');
      }
      // adjust module grid columns via class
      document.documentElement.style.setProperty('--card-min', (r.cardMin||220)+'px');
    }catch(e){
      console.warn('menu-responsive error', e);
    }
  }

  // Run on load and on resize (debounced)
  let t;
  window.addEventListener('resize', ()=>{ clearTimeout(t); t = setTimeout(applyDeviceLayout, 200); });
  document.addEventListener('DOMContentLoaded', applyDeviceLayout);
})();
