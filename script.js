/* AcadMeta Demo — interações
   Ações iniciadas pelo teclado (Enter/Espaço em botão, Esc, foco por Tab)
   não animam: a skill pede resposta imediata para o teclado. */

(function () {
  'use strict';

  // click.detail === 0 quando o clique veio do teclado
  const fromKeyboard = (event) => event && event.detail === 0;

  /* ---------- Helpers de abrir/fechar com transição ---------- */

  function open(el, { instant = false } = {}) {
    if (instant) el.setAttribute('data-instant', '');
    else el.removeAttribute('data-instant');
    el.hidden = false;
    el.getBoundingClientRect(); // força o estado inicial antes de animar
    el.dataset.state = 'open';
  }

  function close(el, { instant = false } = {}) {
    if (el.dataset.state !== 'open') return;
    el.dataset.state = 'closed';

    if (instant) {
      el.setAttribute('data-instant', '');
      el.hidden = true;
      return;
    }

    el.removeAttribute('data-instant');
    const done = () => {
      // se reabriu durante a saída, não esconde
      if (el.dataset.state === 'closed') el.hidden = true;
    };
    el.addEventListener('transitionend', function onEnd(e) {
      if (e.target !== el || e.propertyName !== 'opacity') return;
      el.removeEventListener('transitionend', onEnd);
      done();
    });
    setTimeout(done, 400); // garantia caso transitionend não dispare
  }

  /* ---------- Menu mobile ---------- */

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu-mobile');

  function setMenu(isOpen, opts) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    isOpen ? open(menu, opts) : close(menu, opts);
  }

  toggle.addEventListener('click', (e) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMenu(!isOpen, { instant: fromKeyboard(e) });
  });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) setMenu(false, { instant: fromKeyboard(e) });
  });

  document.addEventListener('pointerdown', (e) => {
    if (menu.dataset.state === 'open' && !menu.contains(e.target) && !toggle.contains(e.target)) {
      setMenu(false);
    }
  });

  window.matchMedia('(min-width: 860px)').addEventListener('change', (mq) => {
    if (mq.matches) setMenu(false, { instant: true });
  });

  /* ---------- Popover (origem no gatilho) ---------- */

  const popTrigger = document.getElementById('hours-trigger');
  const popover = document.getElementById('hours-popover');

  function setPopover(isOpen, opts = {}) {
    popTrigger.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      popover.hidden = false;
      const t = popTrigger.getBoundingClientRect();
      const p = popover.getBoundingClientRect();
      const x = Math.round(t.left + t.width / 2 - p.left);
      popover.style.setProperty('--transform-origin', `${x}px top`);
      open(popover, opts);
    } else {
      close(popover, opts);
    }
  }

  popTrigger.addEventListener('click', (e) => {
    setPopover(popTrigger.getAttribute('aria-expanded') !== 'true', { instant: fromKeyboard(e) });
  });

  document.addEventListener('pointerdown', (e) => {
    if (popover.dataset.state === 'open' && !popover.contains(e.target) && !popTrigger.contains(e.target)) {
      setPopover(false);
    }
  });

  /* ---------- Tooltips: delay no primeiro, instantâneo nos seguintes ---------- */

  const OPEN_DELAY = 500;   // evita abertura acidental
  const SKIP_WINDOW = 300;  // janela para pular o delay após fechar um
  let current = null;
  let lastTip = null; // pode estar no meio do fade de saída
  let openTimer = 0;
  let lastClosedAt = 0;

  const tipOf = (trigger) => document.getElementById(trigger.getAttribute('aria-describedby'));

  function showTip(trigger, { instant = false } = {}) {
    clearTimeout(openTimer);
    const tip = tipOf(trigger);
    if (current && current !== tip) hideTip({ instant: true });
    // trocando de ícone: o anterior some na hora, sem dois tooltips em fade
    if (instant && lastTip && lastTip !== tip) {
      lastTip.setAttribute('data-instant', '');
      lastTip.removeAttribute('data-open');
    }
    instant ? tip.setAttribute('data-instant', '') : tip.removeAttribute('data-instant');
    tip.setAttribute('data-open', '');
    current = tip;
    lastTip = tip;
  }

  function hideTip({ instant = false } = {}) {
    clearTimeout(openTimer);
    if (!current) return;
    // ao trocar de ícone some na hora; ao sair do grupo, faz o fade normal
    instant ? current.setAttribute('data-instant', '') : current.removeAttribute('data-instant');
    current.removeAttribute('data-open');
    current = null;
    lastClosedAt = performance.now();
  }

  function requestTip(trigger) {
    const warm = current !== null || performance.now() - lastClosedAt < SKIP_WINDOW;
    if (warm) {
      showTip(trigger, { instant: true });
    } else {
      clearTimeout(openTimer);
      openTimer = setTimeout(() => showTip(trigger), OPEN_DELAY);
    }
  }

  document.querySelectorAll('[data-tooltip-trigger]').forEach((trigger) => {
    trigger.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') requestTip(trigger);
    });
    trigger.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') hideTip();
    });
    trigger.addEventListener('focus', () => {
      if (trigger.matches(':focus-visible')) showTip(trigger, { instant: true }); // teclado: sem animação
    });
    trigger.addEventListener('blur', () => hideTip({ instant: true }));
    // toque: abre no tap e fecha sozinho
    trigger.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse') return;
      showTip(trigger);
      clearTimeout(trigger._tipTimer);
      trigger._tipTimer = setTimeout(() => hideTip(), 1800);
    });
  });

  /* ---------- Modal ---------- */

  const modal = document.getElementById('modal-agendar');
  const panel = modal.querySelector('.modal__panel');
  const form = document.getElementById('form-agendar');
  const success = document.getElementById('form-success');
  const errorEl = document.getElementById('form-error');

  function resetForm() {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    errorEl.textContent = '';
  }

  function openModal({ instant = false } = {}) {
    setMenu(false, { instant: true });
    setPopover(false, { instant: true });
    resetForm();
    instant ? modal.setAttribute('data-instant', '') : modal.removeAttribute('data-instant');
    modal.showModal();
    modal.getBoundingClientRect();
    modal.dataset.state = 'open';
  }

  function closeModal({ instant = false } = {}) {
    if (modal.dataset.state !== 'open') return;
    modal.dataset.state = 'closed';
    if (instant) {
      modal.setAttribute('data-instant', '');
      modal.close();
      return;
    }
    modal.removeAttribute('data-instant');
    let finished = false;
    const done = () => {
      if (finished || modal.dataset.state !== 'closed') return;
      finished = true;
      modal.close();
    };
    panel.addEventListener('transitionend', function onEnd(e) {
      if (e.target !== panel || e.propertyName !== 'opacity') return;
      panel.removeEventListener('transitionend', onEnd);
      done();
    });
    setTimeout(done, 400);
  }

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => openModal({ instant: fromKeyboard(e) }));
  });

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]')) {
      closeModal({ instant: fromKeyboard(e) });
      return;
    }
    // clique fora do painel (no backdrop)
    const r = panel.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (e.target === modal && outside) closeModal();
  });

  // Esc: fecha sem animação
  modal.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeModal({ instant: true });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      errorEl.textContent = 'Preencha nome, WhatsApp e modalidade.';
      form.querySelector(':invalid').focus();
      return;
    }
    form.hidden = true;
    success.hidden = false;
    success.querySelector('button').focus();
  });

  /* ---------- Esc global para menu, popover e tooltip ---------- */

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (current) hideTip({ instant: true });
    if (popover.dataset.state === 'open') {
      setPopover(false, { instant: true });
      popTrigger.focus();
    }
    if (menu.dataset.state === 'open') {
      setMenu(false, { instant: true });
      toggle.focus();
    }
  });

  /* ---------- Entrada ao rolar: stagger e reveal ---------- */

  const revealTargets = document.querySelectorAll('[data-stagger], [data-reveal]');

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // também revela o que já ficou acima da tela (ex.: abriu a página via #âncora)
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target); // anima uma vez só
      });
    },
    { rootMargin: '0px 0px -100px 0px' }
  );

  revealTargets.forEach((el) => io.observe(el));
})();
