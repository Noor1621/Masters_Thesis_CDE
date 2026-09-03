/**
 * Multi-Year Snow Variability Tool.
 */
(function () {
  'use strict';
  var DATASETS = {"interannual_accum":{"path":"pics/interannual_accum_hr.jpg","label":"Interannual Snow Change — Accumulation"},"interannual_deple":{"path":"pics/interannual_deple_hr.jpg","label":"Interannual Snow Change — Depletion"},"lst_accum":{"path":"pics/lst_accum_hr.jpg","label":"LST — Accumulation Season"},"lst_deple":{"path":"pics/lst_deple_hr.jpg","label":"LST — Depletion Season"},"snow_accum":{"path":"pics/snow_class_accum_hr.jpg","label":"Snow Classification — Accumulation Season"},"snow_deple":{"path":"pics/snow_class_deple_hr.jpg","label":"Snow Classification — Depletion Season"}};

  function init() {
    var section = document.querySelector('.compare-tool');
    if (!section) return;
    var leftSelect = section.querySelector('[data-role="left-select"]');
    var rightSelect = section.querySelector('[data-role="right-select"]');
    var swapBtn = section.querySelector('[data-role="swap-btn"]');
    var slider = section.querySelector('.compare-slider');
    if (!leftSelect || !rightSelect || !slider) return;

    var leftImg = slider.querySelector('.compare-img-left');
    var rightImg = slider.querySelector('.compare-img-right');
    var leftLabel = slider.querySelector('.compare-label-left');
    var rightLabel = slider.querySelector('.compare-label-right');
    var caption = section.querySelector('[data-role="caption"]');

    function render() {
      var left = DATASETS[leftSelect.value];
      var right = DATASETS[rightSelect.value];
      if (!left || !right) return;
      leftImg.src = left.path;
      rightImg.src = right.path;
      leftImg.alt = left.label;
      rightImg.alt = right.label;
      leftLabel.textContent = left.label;

      // Give the overlay a visible height while preserving each JPEG's
      // original aspect ratio. If the two source maps differ in height,
      // the taller source ratio defines the viewport so neither image is
      // cropped or distorted.
      function syncStageRatio() {
        if (!leftImg.naturalWidth || !leftImg.naturalHeight || !rightImg.naturalWidth || !rightImg.naturalHeight) return;
        var leftRatio = leftImg.naturalWidth / leftImg.naturalHeight;
        var rightRatio = rightImg.naturalWidth / rightImg.naturalHeight;
        var ratio = Math.min(leftRatio, rightRatio);
        slider.style.aspectRatio = ratio.toFixed(6);
      }
      leftImg.addEventListener('load', syncStageRatio, { once: true });
      rightImg.addEventListener('load', syncStageRatio, { once: true });
      syncStageRatio();
      rightLabel.textContent = right.label;
      caption.textContent = left.label + ' vs ' + right.label + '.';
      if (slider.__compareSlider) slider.__compareSlider.reset();
    }

    leftSelect.addEventListener('change', render);
    rightSelect.addEventListener('change', render);
    if (swapBtn) swapBtn.addEventListener('click', function () {
      var tmp = leftSelect.value;
      leftSelect.value = rightSelect.value;
      rightSelect.value = tmp;
      render();
    });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
