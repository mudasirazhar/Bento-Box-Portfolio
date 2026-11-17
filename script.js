/**
 * Top-Down Desk & Bento Box Portfolio — Interactive Engine
 * 
 * Features:
 * - GSAP Unboxing & Tray Opening Physics
 * - Web Audio API Synthesized Tactile Sound FX (Clicks, Pops, Slides)
 * - Tactile Box Objects & Floating Label Interactions
 * - Modal System with Background Depth Blur
 * - Expandable Career Timeline Drawer
 * - 1-Click Copy-to-Clipboard with Toast Feedback
 * - Full Keyboard & Escape Key Accessibility
 */

// =========================================================================
// 1. TACTILE AUDIO SYNTHESIZER (Web Audio API - Zero External Dependencies)
// =========================================================================
class TactileAudioEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Crisp mechanical click
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Cardboard Unbox Whoosh & Slide
  playUnbox() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Filtered noise buffer for cardboard friction
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();

    // Accompanying tactile pop
    setTimeout(() => {
      this.playPop();
    }, 120);
  }

  // High pleasant pop for opening objects/modals
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  // Subtle close / latch click
  playClose() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(640, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }
}

const audio = new TactileAudioEngine();


// =========================================================================
// 2. MAIN APPLICATION INITIALIZATION
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

  const boxLid = document.getElementById('box-lid');
  const openBoxTrigger = document.getElementById('open-box-trigger');
  const closeBoxNavBtn = document.getElementById('close-box-nav-btn');
  const closeBoxBottomBtn = document.getElementById('close-box-bottom-btn');
  const topNav = document.getElementById('top-nav');
  const tactileObjects = document.querySelectorAll('.tactile-object');
  
  const modalBackdrop = document.getElementById('modal-backdrop');
  const allModals = document.querySelectorAll('.portfolio-modal');
  const closeButtons = document.querySelectorAll('[data-close]');
  
  const sfxToggle = document.getElementById('sfx-toggle');
  const sfxOnIcon = document.getElementById('sfx-icon-on');
  const sfxOffIcon = document.getElementById('sfx-icon-off');

  let isBoxOpen = false;

  // -----------------------------------------------------------------------
  // SFX Toggle Handler
  // -----------------------------------------------------------------------
  if (sfxToggle) {
    sfxToggle.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      if (audio.enabled) {
        sfxOnIcon.classList.remove('hidden');
        sfxOffIcon.classList.add('hidden');
        audio.playPop();
        showToast('Sound Effects: Enabled 🔊');
      } else {
        sfxOnIcon.classList.add('hidden');
        sfxOffIcon.classList.remove('hidden');
        showToast('Sound Effects: Muted 🔇');
      }
    });
  }

  // Audio test button inside Demos Modal
  const testAudioBtn = document.getElementById('test-audio-btn');
  if (testAudioBtn) {
    testAudioBtn.addEventListener('click', () => {
      audio.playPop();
      showToast('Tactile pop synthesized via Web Audio!');
    });
  }


  // -----------------------------------------------------------------------
  // UNBOXING / OPEN BOX TRANSITION (GSAP Physics)
  // -----------------------------------------------------------------------
  function openPortfolioBox() {
    if (isBoxOpen) return;
    isBoxOpen = true;

    audio.playUnbox();

    if (window.gsap) {
      // Smooth 3D unboxing animation with GSAP
      const tl = gsap.timeline();

      tl.to(boxLid, {
        y: '-120%',
        rotationX: 25,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => {
          boxLid.style.pointerEvents = 'none';
        }
      });

      // Show top nav
      topNav.classList.remove('hidden-nav');

      // Stagger bounce entrance for interior objects
      tl.fromTo(
        tactileObjects,
        { y: 35, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.06,
          duration: 0.5,
          ease: 'back.out(1.8)'
        },
        '-=0.25'
      );

    } else {
      // Fallback if GSAP is blocked or unavailable
      boxLid.style.transform = 'translateY(-120%)';
      boxLid.style.opacity = '0';
      boxLid.style.pointerEvents = 'none';
      topNav.classList.remove('hidden-nav');
    }

    showToast('Box opened! Click any item inside to explore.');
  }

  // Close box lid function
  function closePortfolioBox() {
    if (!isBoxOpen) return;
    isBoxOpen = false;

    // Close any open modals first
    closeActiveModal();

    audio.playClose();

    topNav.classList.add('hidden-nav');

    if (window.gsap) {
      gsap.to(boxLid, {
        y: '0%',
        rotationX: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        onStart: () => {
          boxLid.style.pointerEvents = 'auto';
        }
      });
    } else {
      boxLid.style.transform = 'translateY(0%)';
      boxLid.style.opacity = '1';
      boxLid.style.pointerEvents = 'auto';
    }

    showToast('Portfolio box closed.');
  }

  // Open triggers
  if (openBoxTrigger) {
    openBoxTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openPortfolioBox();
    });
  }

  // Close triggers
  if (closeBoxNavBtn) {
    closeBoxNavBtn.addEventListener('click', closePortfolioBox);
  }
  if (closeBoxBottomBtn) {
    closeBoxBottomBtn.addEventListener('click', closePortfolioBox);
  }


  // -----------------------------------------------------------------------
  // TACTILE OBJECT INTERACTIONS (Hover & Click to Open Modals)
  // -----------------------------------------------------------------------
  tactileObjects.forEach((obj) => {
    // Sound on hover
    obj.addEventListener('mouseenter', () => {
      audio.playClick();
    });

    // Click handler
    obj.addEventListener('click', () => {
      const targetModalId = obj.getAttribute('data-target');
      if (targetModalId) {
        audio.playPop();
        openModal(targetModalId);
      }
    });

    // Keyboard accessibility (Enter or Space)
    obj.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetModalId = obj.getAttribute('data-target');
        if (targetModalId) {
          audio.playPop();
          openModal(targetModalId);
        }
      }
    });
  });

  // Top Nav direct modal triggers
  const navPillButtons = document.querySelectorAll('.nav-pill-btn[data-target]');
  navPillButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetModalId = btn.getAttribute('data-target');
      if (targetModalId) {
        audio.playPop();
        openModal(targetModalId);
      }
    });
  });


  // -----------------------------------------------------------------------
  // MODAL MANAGEMENT (Open, Close, Blur Backdrop, ESC key)
  // -----------------------------------------------------------------------
  function openModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (!targetModal) return;

    // Close any already open modals
    allModals.forEach((m) => m.classList.remove('active-modal'));

    // Show backdrop & active modal
    modalBackdrop.classList.remove('hidden');
    targetModal.classList.add('active-modal');

    // Accessibility focus
    const closeBtn = targetModal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeActiveModal() {
    let closedAny = false;
    allModals.forEach((m) => {
      if (m.classList.contains('active-modal')) {
        m.classList.remove('active-modal');
        closedAny = true;
      }
    });

    if (closedAny) {
      modalBackdrop.classList.add('hidden');
      audio.playClose();
    }
  }

  // Close button clicks
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', closeActiveModal);
  });

  // Click on background backdrop closes modal
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeActiveModal);
  }

  // Keyboard Escape key closes modal or box
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const isModalOpen = Array.from(allModals).some((m) => m.classList.contains('active-modal'));
      if (isModalOpen) {
        closeActiveModal();
      } else if (isBoxOpen) {
        closePortfolioBox();
      }
    }
  });


  // -----------------------------------------------------------------------
  // EXPANDABLE CAREER TIMELINE DRAWER (Profile Modal)
  // -----------------------------------------------------------------------
  const toggleExpBtn = document.getElementById('toggle-experience-btn');
  const expDrawer = document.getElementById('experience-drawer');

  if (toggleExpBtn && expDrawer) {
    toggleExpBtn.addEventListener('click', () => {
      audio.playClick();
      const isHidden = expDrawer.classList.contains('hidden');

      if (isHidden) {
        expDrawer.classList.remove('hidden');
        toggleExpBtn.innerHTML = '<span>Hide work history & experience ↑</span>';
      } else {
        expDrawer.classList.add('hidden');
        toggleExpBtn.innerHTML = '<span>View full work history & experience →</span>';
      }
    });
  }


  // -----------------------------------------------------------------------
  // 1-CLICK EMAIL COPY TO CLIPBOARD
  // -----------------------------------------------------------------------
  const copyEmailButtons = document.querySelectorAll('[data-email]');
  copyEmailButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-email');
      if (!email) return;

      try {
        await navigator.clipboard.writeText(email);
        audio.playPop();

        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.backgroundColor = '#10B981';

        showToast(`Copied ${email} to clipboard!`);

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
        }, 2200);
      } catch (err) {
        showToast('Unable to copy to clipboard.');
      }
    });
  });


  // -----------------------------------------------------------------------
  // CONTACT FORM SIMULATION
  // -----------------------------------------------------------------------
  const contactForm = document.getElementById('desk-contact-form');
  const formSubmitBtn = document.getElementById('form-submit-btn');

  if (contactForm && formSubmitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const msgInput = document.getElementById('contact-msg');

      if (!nameInput.value || !emailInput.value || !msgInput.value) {
        showToast('Please fill in all required fields.');
        return;
      }

      audio.playClick();
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = '<span>Transmitting...</span>';

      setTimeout(() => {
        audio.playPop();
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = '<span>Message Sent! ✓</span>';
        formSubmitBtn.style.backgroundColor = '#10B981';

        showToast(`Thank you, ${nameInput.value}! Message received.`);

        contactForm.reset();

        setTimeout(() => {
          formSubmitBtn.innerHTML = '<span>Send Message</span>';
          formSubmitBtn.style.backgroundColor = '';
          closeActiveModal();
        }, 2500);
      }, 1000);
    });
  }


  // -----------------------------------------------------------------------
  // DESK PROPS PLAYFUL MICRO-INTERACTIONS
  // -----------------------------------------------------------------------
  const interactiveProps = document.querySelectorAll('.desk-prop');
  interactiveProps.forEach((prop) => {
    prop.addEventListener('click', () => {
      audio.playClick();
      // Gentle bounce wiggle
      if (window.gsap) {
        gsap.to(prop, {
          scale: 1.05,
          yoyo: true,
          repeat: 1,
          duration: 0.15,
          ease: 'power2.out'
        });
      }
    });
  });

});


// =========================================================================
// 3. TOAST NOTIFICATION UTILITY
// =========================================================================
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('desk-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}
