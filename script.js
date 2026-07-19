// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// ---------- Gentle hero parallax ----------
const hero = document.querySelector(".hero");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (hero && !prefersReducedMotion.matches) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 28;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 22;
    hero.style.setProperty("--mouse-x", `${x}px`);
    hero.style.setProperty("--mouse-y", `${y}px`);
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--mouse-x", "0px");
    hero.style.setProperty("--mouse-y", "0px");
  });
}

// ---------- Project tabs: sliding-door transition ----------
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const tabStage = document.querySelector(".tab-stage");
const doorLeft = document.querySelector(".door-left");

let switchingTabs = false;

function activatePanel(key) {
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === key);
  });
  tabBtns.forEach((btn) => {
    const isActive = btn.dataset.tab === key;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.tab;
    if (switchingTabs || btn.classList.contains("active")) return;
    switchingTabs = true;

    tabStage.classList.add("doors-closed");

    const onDoorsClosed = (e) => {
      if (e.propertyName !== "transform") return;
      doorLeft.removeEventListener("transitionend", onDoorsClosed);
      activatePanel(key);
      tabStage.classList.remove("doors-closed");
      switchingTabs = false;
    };
    doorLeft.addEventListener("transitionend", onDoorsClosed);
  });
});
