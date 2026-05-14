(function(){
  function q(sel, ctx) { return (ctx||document).querySelector(sel); }
  function qa(sel, ctx) { return Array.from((ctx||document).querySelectorAll(sel)); }

  function initCarousel(){
    const wrap = q('.mobile-carousel-wrap');
    if(!wrap) return;
    const carousel = q('.mobile-carousel', wrap);
    const prev = q('.carousel-prev', wrap);
    const next = q('.carousel-next', wrap);
    if(!carousel) return;

    // Buttons behavior: scroll by carousel width * 0.8
    function scrollByDir(dir){
      const amount = Math.round(carousel.clientWidth * 0.8) * dir;
      carousel.scrollBy({ left: amount, behavior: 'smooth' });
    }

    prev.addEventListener('click', ()=> scrollByDir(-1));
    next.addEventListener('click', ()=> scrollByDir(1));

    // Show/hide arrows based on scroll position
    function updateArrows(){
      const atStart = carousel.scrollLeft <= 8;
      const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8;
      prev.style.opacity = atStart ? '0.2' : '1';
      next.style.opacity = atEnd ? '0.2' : '1';
      prev.disabled = atStart;
      next.disabled = atEnd;
    }

    carousel.addEventListener('scroll', throttle(updateArrows, 100));
    window.addEventListener('resize', throttle(updateArrows, 150));
    // initial
    setTimeout(()=>{ updateArrows(); centerFirst(); }, 120);

    // enable swipe dragging (desktop touch fallback handled by browser)
    let isDown = false, startX=0, scrollLeft=0;
    carousel.addEventListener('pointerdown', (e)=>{ isDown=true; carousel.setPointerCapture(e.pointerId); startX = e.clientX; scrollLeft = carousel.scrollLeft; });
    carousel.addEventListener('pointermove', (e)=>{ if(!isDown) return; const x = e.clientX; const dx = x - startX; carousel.scrollLeft = scrollLeft - dx; });
    carousel.addEventListener('pointerup', (e)=>{ isDown=false; try{ carousel.releasePointerCapture(e.pointerId);}catch(_){} });
    carousel.addEventListener('pointerleave', ()=>{ isDown=false; });

    // keyboard support
    wrap.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft') { scrollByDir(-1); }
      if(e.key === 'ArrowRight') { scrollByDir(1); }
    });

    function centerFirst(){
      try{
        const first = carousel.children[0];
        if(!first) return;
        // prefer scrollIntoView center which respects scroll-padding
        first.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }catch(e){ /* ignore */ }
    }
    window.addEventListener('resize', throttle(()=>{ centerFirst(); updateArrows(); }, 200));
  }

  function throttle(fn, wait){ let t=null; return function(...a){ if(t) return; t=setTimeout(()=>{ fn(...a); t=null; }, wait); }; }

  document.addEventListener('DOMContentLoaded', initCarousel);
})();
