(function () {
  "use strict";

  /* SMIL <animateMotion> ignores the CSS prefers-reduced-motion override,
     so pause it manually for the research flow diagram. */
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("svg").forEach(function (svg) {
      if (typeof svg.pauseAnimations === "function") svg.pauseAnimations();
    });
  }

  /* Scroll-reveal for the core-value section */
  var revealTargets = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* Phone walkthrough tabs */
  var tabButtons = document.querySelectorAll(".tab-btn");
  var screens = document.querySelectorAll(".phone-content");
  var typingTimer = null;

  function restartAnimations(pane) {
    // Re-inserting a pane's markup restarts every CSS animation inside it,
    // including staggered nth-child delays, each time the tab is opened.
    pane.innerHTML = pane.innerHTML;
  }

  function runTypewriter(pane) {
    var textEl = pane.querySelector(".typed-text");
    if (!textEl) return;
    var full = textEl.getAttribute("data-typed") || "";
    textEl.textContent = "";
    var i = 0;
    clearInterval(typingTimer);
    typingTimer = setInterval(function () {
      i += 2;
      textEl.textContent = full.slice(0, i);
      if (i >= full.length) clearInterval(typingTimer);
    }, 18);
  }

  function activateTab(name) {
    tabButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === name);
    });
    screens.forEach(function (pane) {
      var isTarget = pane.getAttribute("data-screen") === name;
      pane.classList.toggle("active", isTarget);
      if (isTarget) {
        restartAnimations(pane);
        if (name === "describe") runTypewriter(pane);
      }
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activateTab(btn.getAttribute("data-tab"));
    });
  });

  /* Kick off the typewriter for the profile->describe cycle on load isn't needed
     since "profile" is the default active tab; describe animates on first click. */
})();
