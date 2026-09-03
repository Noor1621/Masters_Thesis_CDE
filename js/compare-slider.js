/**
 * Before/After comparison slider.
 *
 * Markup contract (see results.html / year-compare.html):
 *   <div class="compare-slider" data-slider-id="N">
 *     <img class="compare-img-right">                 <-- base layer, full width, fixed
 *     <div class="compare-fill" style="width:50%">
 *       <img class="compare-img-left" style="width:200%">  <-- revealed layer
 *     </div>
 *     <div class="compare-handle-line">...</div>
 *   </div>
 *
 * The critical bit that a naive implementation gets wrong: the "left" image
 * lives inside a clipping div (.compare-fill) that is only `pct`% wide. For
 * the left image to stay pixel-aligned with the full-width right image as
 * the handle moves, its own width has to be re-derived every time:
 *
 *     leftImage.width (in px) must always equal the container's full width
 *     => leftImage width% = 100 / (pct / 100) = 10000 / pct
 *
 * A fixed "width:200%" (correct only when pct === 50) is what makes a swipe
 * comparison visibly "swim" out of registration as soon as you drag it —
 * that's the bug this fixes.
 */
(function () {
  'use strict';

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function initSlider(container) {
    var fill = container.querySelector('.compare-fill');
    var leftImg = fill ? fill.querySelector('img') : null;
    var handle = container.querySelector('.compare-handle-line');
    if (!fill || !leftImg || !handle) return;

    var pct = 50;
    var dragging = false;

    function apply() {
      fill.style.width = pct + '%';
      // Keep the revealed image pixel-aligned with the full-width base image
      // at every slider position, not just at 50%.
      leftImg.style.width = (10000 / pct).toFixed(4) + '%';
      handle.style.left = pct + '%';
      container.setAttribute('aria-valuenow', String(Math.round(pct)));
    }

    function setPct(newPct) {
      pct = clamp(newPct, 1, 99);
      apply();
    }

    function pctFromClientX(clientX) {
      var rect = container.getBoundingClientRect();
      if (rect.width === 0) return pct;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onPointerDown(e) {
      dragging = true;
      container.classList.add('is-dragging');
      if (container.setPointerCapture && e.pointerId !== undefined) {
        try { container.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
      setPct(pctFromClientX(e.clientX));
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setPct(pctFromClientX(e.clientX));
      e.preventDefault();
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      container.classList.remove('is-dragging');
      if (container.releasePointerCapture && e.pointerId !== undefined) {
        try { container.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
    }

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('pointerleave', function (e) {
      // Only stop dragging on leave if the pointer wasn't captured
      // (older browsers without setPointerCapture support).
      if (!container.hasPointerCapture || !e.pointerId || !container.hasPointerCapture(e.pointerId)) {
        onPointerUp(e);
      }
    });

    // Keyboard accessibility.
    container.setAttribute('tabindex', container.getAttribute('tabindex') || '0');
    container.setAttribute('role', 'slider');
    container.setAttribute('aria-label', container.getAttribute('aria-label') || 'Comparison slider');
    container.setAttribute('aria-valuemin', '0');
    container.setAttribute('aria-valuemax', '100');
    container.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft') { setPct(pct - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setPct(pct + step); e.preventDefault(); }
      else if (e.key === 'Home') { setPct(1); e.preventDefault(); }
      else if (e.key === 'End') { setPct(99); e.preventDefault(); }
    });

    apply();

    // Expose a small API so other scripts (e.g. the year-compare tool) can
    // reset/re-sync the slider after swapping images, and so it can be
    // re-initialized cleanly if the image set changes.
    container.__compareSlider = {
      setPct: setPct,
      getPct: function () { return pct; },
      reset: function () { setPct(50); }
    };
  }

  function init() {
    var containers = document.querySelectorAll('.compare-slider');
    containers.forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
