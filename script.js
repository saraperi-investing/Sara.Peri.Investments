
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll reveal ---- */
  const els = document.querySelectorAll('.reveal, .glow-reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold:0.12, rootMargin:'0px 0px -60px 0px'});
  els.forEach(el=>io.observe(el));

  if(!reduceMotion){

    /* ---- ambient particles ---- */
    document.querySelectorAll('[data-particles]').forEach(field=>{
      const n = parseInt(field.dataset.particles,10) || 12;
      for(let i=0;i<n;i++){
        const p = document.createElement('div');
        p.className = 'particle';
        const size = (2 + Math.random()*3) * 1.5;
        p.style.width = size+'px';
        p.style.height = size+'px';
        p.style.left = Math.random()*100+'%';
        p.style.top = 20 + Math.random()*80+'%';
        p.style.animationDuration = (6 + Math.random()*8)+'s';
        p.style.animationDelay = (Math.random()*8)+'s';
        field.appendChild(p);
      }
    });

    /* ---- spotlight follows cursor within each dark section ---- */
    document.querySelectorAll('.dark-section').forEach(sec=>{
      const spot = sec.querySelector('.spotlight');
      if(!spot) return;
      sec.addEventListener('mousemove', e=>{
        const r = sec.getBoundingClientRect();
        const x = ((e.clientX - r.left)/r.width*100).toFixed(1);
        const y = ((e.clientY - r.top)/r.height*100).toFixed(1);
        sec.style.setProperty('--sx', x+'%');
        sec.style.setProperty('--sy', y+'%');
      });
    });

    /* ---- 3D tilt + glare on cards ---- */
    document.querySelectorAll('[data-tilt]').forEach(card=>{
      let raf = null;
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width;
        const py = (e.clientY - r.top)/r.height;
        const rx = (0.5 - py) * 10;
        const ry = (px - 0.5) * 10;
        if(raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(()=>{
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
          card.style.setProperty('--gx', (px*100)+'%');
          card.style.setProperty('--gy', (py*100)+'%');
        });
      });
      card.addEventListener('mouseleave', ()=>{
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });

    /* ---- magnetic buttons ---- */
    document.querySelectorAll('.magnetic').forEach(btn=>{
      btn.addEventListener('mousemove', e=>{
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width/2) * 0.25;
        const my = (e.clientY - r.top - r.height/2) * 0.35;
        btn.style.transform = `translate(${mx}px, ${my}px)`;
      });
      btn.addEventListener('mouseleave', ()=>{ btn.style.transform = 'translate(0,0)'; });
    });

    /* ---- scroll-driven gold thread fill ---- */
    const threadWrap = document.querySelector('.thread-wrap');
    if(threadWrap){
      const line = threadWrap.querySelector('.thread-line');
      const onScroll = ()=>{
        const r = threadWrap.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = r.height + vh*0.6;
        const passed = Math.min(Math.max(vh*0.8 - r.top, 0), total);
        const pct = Math.min(100, (passed/total)*100);
        line.style.setProperty('--fill', pct+'%');
      };
      document.addEventListener('scroll', onScroll, {passive:true});
      onScroll();
    }
  }

  /* ---- FAQ accordion ---- */
  window.toggleFaq = function(btn){
    const item = btn.closest('.faq-item');
    if(!item) return;
    item.classList.toggle('open');
  };

  /* ---- instagram-post-style carousel ---- */
  (function(){
    const track = document.getElementById('spTrack');
    if(!track) return;
    const dotsWrap = document.getElementById('spDots');
    const viewport = track.closest('.sp-carousel').querySelector('.sp-viewport');
    const total = track.children.length;
    let index = 0;

    if(dotsWrap){
      for(let i=0;i<total;i++){
        const dot = document.createElement('button');
        dot.className = 't-dot' + (i===0 ? ' active' : '');
        dot.setAttribute('aria-label', `שקופית ${i+1}`);
        dot.addEventListener('click', ()=>window.spCarouselGo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function update(){
      track.style.transform = `translateX(${-index * 100}%)`;
      if(dotsWrap){
        Array.from(dotsWrap.children).forEach((d,i)=>d.classList.toggle('active', i===index));
      }
      if(viewport){
        const current = track.children[index];
        viewport.style.height = current.offsetHeight + 'px';
      }
    }
    window.addEventListener('resize', update);
    window.spCarouselGo = function(i){ index = i; update(); };
    window.spCarouselMove = function(delta){
      index = (index + delta + total) % total;
      update();
    };

    let startX = 0, isDragging = false;
    track.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; isDragging = true; }, {passive:true});
    track.addEventListener('touchend', e=>{
      if(!isDragging) return;
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      if(Math.abs(dx) > 40){
        window.spCarouselMove(dx > 0 ? -1 : 1);
      }
    }, {passive:true});

    setTimeout(update, 50);
  })();

  /* ---- testimonial carousel ---- */
  (function(){
    const track = document.getElementById('tTrack');
    if(!track) return;
    const dotsWrap = document.getElementById('tDots');
    const viewport = document.querySelector('.t-carousel-viewport');
    const total = track.children.length;
    let index = 0;

    if(dotsWrap){
      for(let i=0;i<total;i++){
        const dot = document.createElement('button');
        dot.className = 't-dot' + (i===0 ? ' active' : '');
        dot.setAttribute('aria-label', `שקופית ${i+1}`);
        dot.addEventListener('click', ()=>window.tCarouselGo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function update(){
      track.style.transform = `translateX(${-index * 100}%)`;
      if(dotsWrap){
        Array.from(dotsWrap.children).forEach((d,i)=>d.classList.toggle('active', i===index));
      }
      if(viewport){
        const current = track.children[index];
        viewport.style.height = current.offsetHeight + 'px';
      }
    }
    window.addEventListener('resize', update);
    window.tCarouselGo = function(i){ index = i; update(); };
    window.tCarouselMove = function(delta){
      index = (index + delta + total) % total;
      update();
    };

    let startX = 0, isDragging = false;
    track.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; isDragging = true; }, {passive:true});
    track.addEventListener('touchend', e=>{
      if(!isDragging) return;
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      if(Math.abs(dx) > 40){
        // swipe right (dx>0) shows previous, swipe left shows next
        window.tCarouselMove(dx > 0 ? -1 : 1);
      }
    }, {passive:true});

    update();
  })();
