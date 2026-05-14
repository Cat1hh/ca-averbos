(function(){
  let lastScroll = 0;
  let ticking = false;
  const cta = document.querySelector('.btn-play-main');
  if(!cta) return;
  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(()=>{
        const st = window.scrollY || document.documentElement.scrollTop;
        if(st > lastScroll + 10){
          // scrolling down -> hide
          cta.classList.add('hidden-cta');
        } else if(st < lastScroll - 10){
          // scrolling up -> show
          cta.classList.remove('hidden-cta');
        }
        lastScroll = st <= 0 ? 0 : st;
        ticking = false;
      });
      ticking = true;
    }
  }
  // show again after interaction
  cta.addEventListener('touchstart', ()=> cta.classList.remove('hidden-cta'));
  window.addEventListener('scroll', onScroll, {passive:true});
})();
