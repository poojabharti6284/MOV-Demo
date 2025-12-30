(function(){
	'use strict';

	const avatars = document.querySelectorAll('.recommended-experts .avatars .avatar');
	const largeImg = document.querySelector('.recommended-experts .expert-image');
	const quoteEl = document.querySelector('.recommended-experts .expert-quote');
	const byEl = document.querySelector('.recommended-experts .expert-by');

	if(!avatars.length) return;

	function activate(el){
		avatars.forEach(a => { a.classList.remove('active'); a.setAttribute('aria-pressed','false'); });
		el.classList.add('active');
		el.setAttribute('aria-pressed','true');
		const large = el.getAttribute('data-large');
		if(large && largeImg) largeImg.src = large;
		if(el.dataset.quote && quoteEl) quoteEl.textContent = el.dataset.quote;
		if(el.dataset.by && byEl) byEl.textContent = el.dataset.by;
	}

	avatars.forEach(a=>{
		a.setAttribute('role','button');
		if(!a.hasAttribute('tabindex')) a.setAttribute('tabindex','0');
		a.addEventListener('click', ()=> activate(a));
		a.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); activate(a); }});
	});
})();

(function(){
    'use strict';

    const thumbs = document.querySelectorAll('.product-showcase .thumbnail-row .thumb');
    const mainImg = document.querySelector('.product-showcase .main-product-image');

    if(!thumbs.length || !mainImg) return;

    function activateThumb(btn){
        thumbs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed','false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed','true');
        const src = btn.getAttribute('data-src');
        if(src) mainImg.src = src;
    }

    thumbs.forEach(t => {
        t.setAttribute('role','button');
        if(!t.hasAttribute('tabindex')) t.setAttribute('tabindex','0');
        t.addEventListener('click', ()=> activateThumb(t));
        t.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); activateThumb(t); }});
    });
})();

/* Pros slider (center snap + dots + keyboard) */
(function(){
	'use strict';
	const prev = document.querySelector('.pros-nav .prev');
	const next = document.querySelector('.pros-nav .next');
	const carousel = document.getElementById('prosCarousel');
	const dotsContainer = document.querySelector('.pros-dots');
	if(!carousel || !prev || !next || !dotsContainer) return;

	const cards = Array.from(carousel.querySelectorAll('.pro-card'));
	if(!cards.length) return;

	let activeIndex = 0;

	function cardCenterLeft(index){
		const card = cards[index];
		return card.offsetLeft + (card.offsetWidth/2) - (carousel.clientWidth/2);
	}

	function goTo(index){
		index = Math.max(0, Math.min(cards.length-1, index));
		activeIndex = index;
		carousel.scrollTo({ left: cardCenterLeft(index), behavior: 'smooth' });
		updateActive();
	}

	function updateActive(){
		cards.forEach((c,i)=> c.classList.toggle('active', i === activeIndex));
		const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
		dots.forEach((d,i)=> d.classList.toggle('active', i === activeIndex));
	}

	function nearestIndex(){
		const center = carousel.scrollLeft + (carousel.clientWidth/2);
		let best = 0, bestDist = Infinity;
		cards.forEach((c,i)=>{
			const cCenter = c.offsetLeft + (c.offsetWidth/2);
			const dist = Math.abs(cCenter - center);
			if(dist < bestDist){ bestDist = dist; best = i; }
		});
		return best;
	}

	// create dots
	cards.forEach((c,i)=>{
		const b = document.createElement('button');
		b.className = 'dot';
		b.setAttribute('aria-label','Go to slide '+(i+1));
		b.addEventListener('click', ()=> goTo(i));
		dotsContainer.appendChild(b);
	});

	// scroll settle
	let scrollTimer = null;
	carousel.addEventListener('scroll', ()=>{
		clearTimeout(scrollTimer);
		scrollTimer = setTimeout(()=>{ const idx = nearestIndex(); if(idx !== activeIndex) goTo(idx); }, 80);
	});

	prev.addEventListener('click', ()=> goTo(activeIndex - 1));
	next.addEventListener('click', ()=> goTo(activeIndex + 1));

	// keyboard navigation
	prev.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goTo(activeIndex - 1); } });
	next.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goTo(activeIndex + 1); } });

	// init
	updateActive();
	// center first card on load
	setTimeout(()=> goTo(activeIndex), 80);

	// adjust on resize
	window.addEventListener('resize', ()=> setTimeout(()=> goTo(activeIndex), 120));
})();

/* Loved By Mövers: centered carousel with auto-snap, autoplay and active highlight */
(function(){
	'use strict';
	const carousel = document.getElementById('lovedCarousel');
	const cards = carousel ? Array.from(carousel.querySelectorAll('.loved-card')) : [];
	const prevL = document.querySelector('.loved-nav.prev');
	const nextL = document.querySelector('.loved-nav.next');
	const dots = Array.from(document.querySelectorAll('.loved-dots .dot'));
	const stage = document.querySelector('.loved-stage');
	if(!carousel || !cards.length || !prevL || !nextL) return;

	let activeIndex = cards.findIndex(c=> c.classList.contains('active'));
	if(activeIndex < 0) activeIndex = Math.floor(cards.length/2);

	function cardCenterLeft(index){
		const card = cards[index];
		return card.offsetLeft + (card.offsetWidth/2) - (carousel.clientWidth/2);
	}

	function goTo(index, {instant=false} = {}){
		index = Math.max(0, Math.min(cards.length-1, index));
		activeIndex = index;
		carousel.scrollTo({ left: cardCenterLeft(index), behavior: instant ? 'auto' : 'smooth' });
		updateActive();
	}

	function updateActive(){
		cards.forEach((c,i)=> c.classList.toggle('active', i === activeIndex));
		dots.forEach((d,i)=> d.classList.toggle('active', i === activeIndex));
	}

	function nearestIndex(){
		const center = carousel.scrollLeft + (carousel.clientWidth/2);
		let best = 0, bestDist = Infinity;
		cards.forEach((c,i)=>{
			const cCenter = c.offsetLeft + (c.offsetWidth/2);
			const dist = Math.abs(cCenter - center);
			if(dist < bestDist){ bestDist = dist; best = i; }
		});
		return best;
	}

	let scrollTimer = null;
	carousel.addEventListener('scroll', ()=>{
		clearTimeout(scrollTimer);
		scrollTimer = setTimeout(()=>{ const idx = nearestIndex(); if(idx !== activeIndex) { activeIndex = idx; goTo(idx); } }, 80);
	});

	prevL.addEventListener('click', ()=>{ goTo(activeIndex - 1); restartAutoplay(); });
	nextL.addEventListener('click', ()=>{ goTo(activeIndex + 1); restartAutoplay(); });

	dots.forEach((d,i)=> d.addEventListener('click', ()=>{ goTo(i); restartAutoplay(); }));

	cards.forEach((c,i)=> c.addEventListener('click', ()=>{ goTo(i); restartAutoplay(); }));

	window.addEventListener('resize', ()=> setTimeout(()=> goTo(activeIndex), 120));

	// Autoplay
	const AUTOPLAY_DELAY = 3500; // ms
	let autoplayTimer = null;
	function startAutoplay(){
		stopAutoplay();
		autoplayTimer = setInterval(()=>{ const next = (activeIndex + 1) % cards.length; goTo(next); }, AUTOPLAY_DELAY);
	}

	function stopAutoplay(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer = null; } }

	function restartAutoplay(){ stopAutoplay(); // small delay to avoid immediate jump after interaction
		setTimeout(()=> startAutoplay(), 600);
	}

	// Pause on hover / focus and on tab background
	if(stage){
		stage.addEventListener('mouseenter', stopAutoplay);
		stage.addEventListener('mouseleave', ()=> startAutoplay());
		stage.addEventListener('touchstart', stopAutoplay, {passive:true});
		stage.addEventListener('touchend', ()=> setTimeout(()=> startAutoplay(), 800), {passive:true});
	}

	document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stopAutoplay(); else startAutoplay(); });

	// initialize
	updateActive();
	setTimeout(()=> goTo(activeIndex, {instant:true}), 60);
	startAutoplay();
})();

/* FAQs accordion toggles */
(function(){
	'use strict';
	const faqButtons = document.querySelectorAll('.faq-question');
	if(!faqButtons.length) return;

	faqButtons.forEach(btn => {
		const item = btn.closest('.faq-item');
		const answer = item.querySelector('.faq-answer');
		const toggle = btn.querySelector('.toggle');
		// ensure initial state
		answer.style.maxHeight = '0px';
		answer.hidden = true;

		btn.addEventListener('click', ()=>{
			const isOpen = item.classList.toggle('open');
			btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			toggle.textContent = isOpen ? '−' : '+';
			if(isOpen){
				answer.hidden = false;
				const h = answer.scrollHeight;
				answer.style.maxHeight = h + 'px';
			} else {
				answer.style.maxHeight = '0px';
				setTimeout(()=> answer.hidden = true, 350);
			}
		});
	});
})();

/* Subscription dropdown (product-right) */
(function(){
	'use strict';
	const dropdowns = document.querySelectorAll('.subscription-box .dropdown');
	if(!dropdowns.length) return;

	dropdowns.forEach(drop => {
		const label = drop.querySelector('.dropdown-label');
		const menu = drop.querySelector('.dropdown-menu');
		const options = menu ? Array.from(menu.querySelectorAll('[role="option"]')) : [];

		function open(){
			drop.classList.add('open');
			drop.setAttribute('aria-expanded','true');
			menu.style.display = 'block';
			// focus first option for keyboard users
			if(options.length) options[0].focus();
		}

		function close(){
			drop.classList.remove('open');
			drop.setAttribute('aria-expanded','false');
			menu.style.display = 'none';
		}

		function toggle(){
			if(drop.classList.contains('open')) close(); else open();
		}

		// click to toggle
		drop.addEventListener('click', (e)=>{ e.stopPropagation(); toggle(); });

		// option selection
		options.forEach(opt=>{
			opt.addEventListener('click', (e)=>{
				label.textContent = opt.textContent;
				options.forEach(o=> o.removeAttribute('selected'));
				opt.setAttribute('selected','');
				close();
			});

			// keyboard: Enter/Space selects
			opt.addEventListener('keydown', (e)=>{
				if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
					e.preventDefault();
					opt.click();
				}
				if(e.key === 'ArrowDown') { e.preventDefault(); const next = options.indexOf(opt)+1; if(options[next]) options[next].focus(); }
				if(e.key === 'ArrowUp') { e.preventDefault(); const prev = options.indexOf(opt)-1; if(options[prev]) options[prev].focus(); else drop.focus(); }
			});
		});

		// keyboard on toggle element
		drop.addEventListener('keydown', (e)=>{
			if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){ e.preventDefault(); toggle(); }
			if(e.key === 'Escape'){ close(); drop.focus(); }
			if(e.key === 'ArrowDown'){ e.preventDefault(); open(); }
		});

		// close when clicking outside
		document.addEventListener('click', (e)=>{ if(!drop.contains(e.target)) close(); });
	});
})();