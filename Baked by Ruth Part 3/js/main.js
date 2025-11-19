// Make cart modal's Checkout button go to checkout.html
document.addEventListener('DOMContentLoaded', function() {
  var checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.onclick = function(e) {
      e.preventDefault();
      window.location.href = 'checkout.html';
    };
  }
});

// Simple hero slider: autoplay, pause on hover/focus, prev/next
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const slidesWrap = slider.querySelector('.slides');
  const slides = Array.from(slidesWrap.children);
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');
  let index = 0;
  let interval = null;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    slidesWrap.style.transform = `translateX(${-index * 100}%)`;
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function start() {
    if (interval) return;
    interval = setInterval(next, 3500);
  }
  function stop() {
    clearInterval(interval);
    interval = null;
  }

  // controls
  if (nextBtn) nextBtn.addEventListener('click', function() { next(); stop(); start(); });
  if (prevBtn) prevBtn.addEventListener('click', function() { prev(); stop(); start(); });

  // pause on hover/focus
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusout', start);

  // init
  goTo(0);
  start();
});

// Scroll reveal for elements with .reveal
document.addEventListener('DOMContentLoaded', function() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reveals.length === 0) {
    // fallback: reveal all
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el, i) => {
    // optional small stagger
    el.style.transitionDelay = `${Math.min(i * 80, 400)}ms`;
    io.observe(el);
  });
});
// Baked by Ruth - Main JavaScript
// Responsive mobile menu, form validation, scroll-to-top, and dark mode toggle

document.addEventListener('DOMContentLoaded', function() {
  // --- Cart System ---
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const cartCount = document.getElementById('cart-count');
  const cartItemsDiv = document.getElementById('cart-items');
  const cartTotalDiv = document.getElementById('cart-total');
  const closeCartBtn = document.getElementById('close-cart');
  const checkoutBtn = document.getElementById('checkout-btn');

  function updateCartCount() {
    if (cartCount) {
      const count = cart.reduce((sum, item) => sum + item.qty, 0);
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function renderCart() {
    if (!cartItemsDiv || !cartTotalDiv) return;
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
      cartTotalDiv.textContent = '';
      checkoutBtn.style.display = 'none';
      return;
    }
    let html = '<ul style="list-style:none;padding:0;">';
    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price * item.qty;
        let qtyLabel = '';
        if (item.name.includes('(Dozen)')) {
          qtyLabel = ' dozen';
        } else if (item.name.includes('(Tray)')) {
          qtyLabel = ' tray';
        } else if (item.name.includes('(Whole)')) {
          qtyLabel = ' whole';
        }
        html += `<li style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
          <span style="flex:1;">${item.name}</span>
          <div style="display:flex;align-items:center;gap:0.25rem;">
            <button data-idx="${idx}" class="qty-btn minus" style="background:#eee;border:none;padding:0.2rem 0.5rem;border-radius:0.3rem;font-size:1rem;cursor:pointer;">-</button>
            <input type="number" min="1" value="${item.qty}" data-idx="${idx}" class="qty-input" style="width:2.5rem;text-align:center;border:1px solid #ccc;border-radius:0.3rem;" />${qtyLabel}
            <button data-idx="${idx}" class="qty-btn plus" style="background:#eee;border:none;padding:0.2rem 0.5rem;border-radius:0.3rem;font-size:1rem;cursor:pointer;">+</button>
          </div>
          <span style="width:4rem;text-align:right;">R${item.price * item.qty}</span>
          <button data-idx="${idx}" class="remove-cart-item" style="background:none;border:none;color:#d4183d;font-size:1.2rem;cursor:pointer;">&times;</button>
        </li>`;
    });
    html += '</ul>';
    cartItemsDiv.innerHTML = html;
    cartTotalDiv.textContent = `Total: R${total}`;
    checkoutBtn.style.display = 'block';
  }

  function showCart() {
    try {
      if (cartModal) {
        // Use class toggling so CSS controls presentation; this avoids specificity issues
        cartModal.classList.add('open');
        cartModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Defensive fallback: if stylesheet failed to apply (display still none), force inline display
        var cs = window.getComputedStyle(cartModal);
        if (cs && cs.display === 'none') {
          cartModal.style.display = 'flex';
          // ensure centering
          cartModal.style.alignItems = 'center';
          cartModal.style.justifyContent = 'center';
        }
      }
    } catch (err) {
      // If anything goes wrong, avoid throwing and try a minimal inline show
      try {
        if (cartModal) {
          cartModal.style.display = 'flex';
          cartModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      } catch (e) { /* swallow */ }
    }
    renderCart();
  }
  function hideCart() {
    if (cartModal) {
      try {
        cartModal.classList.remove('open');
        cartModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // remove any inline fallback
        cartModal.style.display = '';
        cartModal.style.alignItems = '';
        cartModal.style.justifyContent = '';
      } catch (err) {
        try { cartModal.style.display = 'none'; } catch (e) { /* swallow */ }
      }
    }
  }

  // Add to Cart button logic
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const name = btn.getAttribute('data-product');
      const price = parseFloat(btn.getAttribute('data-price'));
      const existing = cart.find(item => item.name === name && item.price === price);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price, qty: 1 });
      }
      saveCart();
      updateCartCount();
      showAddToCartNotification(name);
    });


  // Add to Cart notification
  function showAddToCartNotification(productName) {
    let notif = document.getElementById('add-to-cart-notif');
    if (!notif) {
      notif = document.createElement('div');
      notif.id = 'add-to-cart-notif';
      notif.style.position = 'fixed';
      notif.style.top = '2rem';
      notif.style.right = '2rem';
      notif.style.background = '#b45309';
      notif.style.color = '#fff';
      notif.style.padding = '1rem 2rem';
      notif.style.borderRadius = '0.5rem';
      notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      notif.style.zIndex = '3000';
      notif.style.fontWeight = '600';
      notif.style.fontSize = '1rem';
      notif.style.opacity = '0';
      notif.style.transition = 'opacity 0.3s';
      document.body.appendChild(notif);
    }
    notif.textContent = `Added "${productName}" to cart!`;
    notif.style.opacity = '1';
    setTimeout(() => {
      notif.style.opacity = '0';
    }, 1800);
  }
  });

  if (cartBtn) {
    cartBtn.addEventListener('click', function(e){
      // defensive: stop event if inside a form or other control
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      showCart();
    });
  }
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', function(e){ if (e && typeof e.preventDefault === 'function') e.preventDefault(); hideCart(); });
  }
  if (cartModal) {
    cartModal.addEventListener('click', function(e) {
      if (e.target === cartModal) hideCart();
    });
  }

  // Remove item from cart
  if (cartItemsDiv) {
    cartItemsDiv.addEventListener('click', function(e) {
      // Remove item
      if (e.target.classList.contains('remove-cart-item')) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        cart.splice(idx, 1);
        saveCart();
        updateCartCount();
        renderCart();
      }
      // Quantity plus/minus
      if (e.target.classList.contains('qty-btn')) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (e.target.classList.contains('plus')) {
          cart[idx].qty += 1;
        } else if (e.target.classList.contains('minus')) {
          if (cart[idx].qty > 1) {
            cart[idx].qty -= 1;
          }
        }
        saveCart();
        updateCartCount();
        renderCart();
      }
    });
    // Listen for direct input changes
    cartItemsDiv.addEventListener('input', function(e) {
      if (e.target.classList.contains('qty-input')) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        cart[idx].qty = val;
        saveCart();
        updateCartCount();
        renderCart();
      }
    });
  }

  // Checkout button (placeholder)
  // Removed checkoutBtn event listener to allow products.html inline script to control behavior

  updateCartCount();
  // If user came from checkout and asked to open the cart, open it now
  try {
    if (localStorage.getItem('openCart') === '1') {
      localStorage.removeItem('openCart');
      showCart();
    }
  } catch (e) { /* ignore storage errors */ }
  // Mobile menu toggle
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
  }

  // Scroll to top button
  const scrollBtn = document.getElementById('scroll-top-btn');
  if (scrollBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 200) {
        scrollBtn.style.display = 'block';
      } else {
        scrollBtn.style.display = 'none';
      }
    });
    scrollBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Dark mode toggle
  const darkToggle = document.getElementById('dark-toggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark');
    });
  }

  // Simple form validation (for all forms)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    // skip enroll form — it has its own custom submit handler and flow
    if (form.id === 'enroll-form') return;
    form.addEventListener('submit', function(e) {
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#d4183d';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) {
        e.preventDefault();
        alert('Please fill in all required fields.');
      }
    });
  });
});

// Lightbox (shared)
document.addEventListener('DOMContentLoaded', function() {
  const lb = document.getElementById('site-lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('.lb-content img');
  const lbClose = lb.querySelector('.lb-close');
  const lbPrev = lb.querySelector('.lb-prev');
  const lbNext = lb.querySelector('.lb-next');
  const triggers = Array.from(document.querySelectorAll('.lb-trigger'));
  let currentIndex = -1;
  let lastFocused = null;

  function openLightbox(idx) {
    if (idx < 0 || idx >= triggers.length) return;
    const t = triggers[idx];
    const src = t.getAttribute('data-lg') || t.src;
    const alt = t.alt || '';
    lbImg.src = src;
    lbImg.alt = alt;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    currentIndex = idx;
    lastFocused = document.activeElement;
    lbClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    currentIndex = -1;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function showNext() { if (triggers.length === 0) return; openLightbox((currentIndex + 1) % triggers.length); }
  function showPrev() { if (triggers.length === 0) return; openLightbox((currentIndex - 1 + triggers.length) % triggers.length); }

  // Bind triggers
  triggers.forEach((t, i) => {
    t.addEventListener('click', function(e) { e.preventDefault(); openLightbox(i); });
    t.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function(e) { e.preventDefault(); showPrev(); });
  lbNext.addEventListener('click', function(e) { e.preventDefault(); showNext(); });

  lb.addEventListener('click', function(e) {
    if (e.target === lb) closeLightbox();
  });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
});

// Note: checkout button behavior is handled earlier in this file (redirect to checkout.html).
// Removed the products.html inline alert handler so clicking Checkout will follow the
// primary behavior (e.g., redirect) instead of showing a blocking alert.


/* Moved from enroll.html: inline enroll page script (moved verbatim) */
(function(){
  var form = document.getElementById('enroll-form');
  var success = document.getElementById('enroll-success');
  if (form && success) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      form.style.display = 'none';
      // reveal the success message accessibly
      success.hidden = false;
      success.classList.add('show');
      // move focus to the success message so screen readers announce it
      try{ success.focus(); }catch(e){}
      // Optionally, clear the form fields for privacy
      try{ form.reset(); }catch(e){}
      // after a short delay, redirect to the courses page
      setTimeout(function(){ window.location.href = 'courses.html'; }, 2200);
    });

    var back = document.getElementById('back-btn');
    if (back) {
      back.addEventListener('click', function(e){
        e.preventDefault();
        // always go to courses page as requested
        window.location.href = 'courses.html';
      });
    }
  }
})();



// Redirect event registration submissions back to events page
document.addEventListener('DOMContentLoaded', function() {
  var evForm = document.getElementById('event-register-form');
  if (!evForm) return;
  evForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // You could add form validation or AJAX here; for now just redirect
    window.location.href = 'events.html';
  });
});

(function(){
  function initCoursesSlider(){
    const slider = document.querySelector('.courses-slider');
    if(!slider) return;
    const track = slider.querySelector('.slider-track');
    const slides = Array.from(track.children);
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');
    const dotsContainer = slider.querySelector('.slider-dots');
    let current = 0;
    const total = slides.length;
    let intervalId = null;

    function updateTrack(){
      track.style.transform = `translateX(-${current*100}%)`;
    }

    function createDots(){
      dotsContainer.innerHTML = '';
      for(let i=0;i<total;i++){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slider-dot';
        btn.setAttribute('aria-label', `Go to slide ${i+1}`);
        btn.dataset.index = i;
        if(i===current) btn.classList.add('active');
        btn.addEventListener('click', ()=>{ goTo(i); pauseAuto(); });
        dotsContainer.appendChild(btn);
      }
    }

    function updateDots(){
      const dots = dotsContainer.children;
      for(let i=0;i<dots.length;i++){
        dots[i].classList.toggle('active', i===current);
      }
    }

    function goTo(index){
      current = (index + total) % total;
      updateTrack();
      updateDots();
    }

    if(prevBtn){ prevBtn.addEventListener('click', ()=>{ goTo(current-1); pauseAuto(); }); }
    if(nextBtn){ nextBtn.addEventListener('click', ()=>{ goTo(current+1); pauseAuto(); }); }

    function startAuto(){
      stopAuto();
      intervalId = setInterval(()=>{ goTo(current+1); }, 4000);
    }
    function stopAuto(){ if(intervalId){ clearInterval(intervalId); intervalId = null; } }
    function pauseAuto(){ stopAuto(); }

    slider.addEventListener('mouseenter', pauseAuto);
    slider.addEventListener('mouseleave', startAuto);
    slider.addEventListener('focusin', pauseAuto);
    slider.addEventListener('focusout', startAuto);

    // keyboard support
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft') { if(prevBtn) prevBtn.click(); }
      if(e.key === 'ArrowRight') { if(nextBtn) nextBtn.click(); }
    });

    // init
    createDots();
    updateTrack();
    startAuto();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initCoursesSlider);
  } else {
    initCoursesSlider();
  }
})();





