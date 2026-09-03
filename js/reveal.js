/**
 * Scroll-reveal for figure wrappers.
 *
 * The exported markup contains elements like:
 *   <div style="opacity:0;transform:translateY(24px);transition:...">
 * which were originally animated to opacity:1 by a framework's
 * "whileInView" behaviour. That JS didn't make it into the static export,
 * so without this script every wrapped figure/table stays invisible
 * forever, even though the image underneath loaded correctly.
 *
 * This restores the intended effect (fade + slide up on scroll into view)
 * and, more importantly, guarantees content is never permanently hidden:
 * if IntersectionObserver isn't available, or an element is somehow missed,
 * a timed safety net forces it visible.
 */
(function () {
  'use strict';

  function initReveal() {
    var els = Array.prototype.slice.call(
      document.querySelectorAll('div[style*="opacity:0"][style*="translateY(24px)"]')
    );
    if (els.length === 0) return;

    function reveal(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(reveal);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(function (el) { io.observe(el); });

    // Safety net: guarantee nothing stays hidden, even if an element is
    // never intersected (e.g. it's taller than the viewport) or the
    // observer misbehaves for any reason.
    window.setTimeout(function () {
      els.forEach(function (el) {
        if (getComputedStyle(el).opacity === '0') reveal(el);
      });
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
