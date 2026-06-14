// Liquid-glass segmented nav: a glass droplet that slides between tabs.
(function () {
  function init() {
    var nav = document.querySelector('.seg-nav');
    if (!nav) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    if (!links.length) return;

    var pill = document.createElement('span');
    pill.className = 'seg-pill';
    nav.insertBefore(pill, nav.firstChild);
    nav.classList.add('seg-nav--js');

    var active = nav.querySelector('a.active') || links[0];

    function moveTo(el, squish) {
      var navBox = nav.getBoundingClientRect();
      var box = el.getBoundingClientRect();
      pill.style.left = (box.left - navBox.left) + 'px';
      pill.style.width = box.width + 'px';
      if (squish) {
        pill.classList.remove('squish');
        void pill.offsetWidth; // restart the keyframe
        pill.classList.add('squish');
      }
    }

    // place the droplet under the active tab without animating in
    var prev = pill.style.transition;
    pill.style.transition = 'none';
    moveTo(active, false);
    // force a reflow, then restore transitions so it settles with a wobble
    requestAnimationFrame(function () {
      pill.style.transition = prev;
      moveTo(active, true);
    });

    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { moveTo(a, true); });
      // slide toward the target before the page navigates
      a.addEventListener('click', function () { moveTo(a, true); });
    });

    nav.addEventListener('mouseleave', function () { moveTo(active, true); });
    window.addEventListener('resize', function () { moveTo(active, false); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
