const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

function normalizePagePath(href) {
  if (!href) return "";
  try {
    const url = new URL(href, window.location.href);
    let page = url.pathname.split("/").pop() || "index.html";
    if (!page) page = "index.html";
    return page.toLowerCase();
  } catch {
    return "";
  }
}

function initNavActiveState() {
  const currentPage = normalizePagePath(window.location.href) || "index.html";
  const navLinks = document.querySelectorAll(".menu a, .navbar-nav .nav-link");
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    const targetPage = normalizePagePath(link.getAttribute("href"));
    const isCurrent = targetPage === currentPage || (targetPage === "" && currentPage === "index.html");
    link.classList.toggle("is-current", isCurrent);
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function initStickyHeaderState() {
  const headers = document.querySelectorAll(".topbar, .top-nav");
  if (!headers.length) return;

  const sync = () => {
    const isScrolled = window.scrollY > 18;
    headers.forEach((header) => {
      header.classList.toggle("is-scrolled", isScrolled);
    });
  };

  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

if (menuToggle && menu) {
  const closeMenu = () => {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

function applyImageFallback(img) {
  if (!img || img.dataset.fallbackApplied === "1") return;
  const isHero = !!img.closest(".hero-photo");
  const fallbackSrc = isHero ? "assets/img/hero-fallback.svg" : "assets/img/card-fallback.svg";
  const currentSrc = img.getAttribute("src") || "";
  if (currentSrc.includes("hero-fallback.svg") || currentSrc.includes("card-fallback.svg")) return;

  img.dataset.fallbackApplied = "1";
  img.src = fallbackSrc;
  if (!img.alt || !img.alt.trim()) {
    img.alt = "Image fallback";
  }
}

function wireImageFallbacks() {
  const imgs = document.querySelectorAll("img");
  imgs.forEach((img) => {
    img.addEventListener("error", () => applyImageFallback(img), { once: true });
    if (img.complete && img.naturalWidth === 0) {
      applyImageFallback(img);
    }
  });
}

function initHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const prev = slider.querySelector("[data-hero-prev]");
  const next = slider.querySelector("[data-hero-next]");
  if (slides.length <= 1) return;

  let current = 0;
  let timer = null;
  const intervalMs = 5200;

  function setActive(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle("is-active", idx === current);
    });
    dots.forEach((dot, idx) => {
      const active = idx === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => {
      setActive(current + 1);
    }, intervalMs);
  }

  prev?.addEventListener("click", () => {
    setActive(current - 1);
    startAuto();
  });

  next?.addEventListener("click", () => {
    setActive(current + 1);
    startAuto();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      setActive(idx);
      startAuto();
    });
  });

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  setActive(0);
  startAuto();
}

function initSupportCardHover() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const cards = document.querySelectorAll([
    ".support-grid .support-item",
    ".card",
    ".mini-card",
    ".cert-item",
    ".leader-card",
    ".job-card",
    ".cv-panel",
    ".news-item",
    ".glass-solid"
  ].join(", "));
  if (!cards.length) return;

  cards.forEach((card) => {
    card.classList.add("has-hover-glow");
    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;

    const flush = () => {
      rafId = 0;
      card.style.setProperty("--hover-x", `${pendingX}px`);
      card.style.setProperty("--hover-y", `${pendingY}px`);
    };

    function updatePointerPosition(event) {
      const rect = card.getBoundingClientRect();
      pendingX = event.clientX - rect.left;
      pendingY = event.clientY - rect.top;
      if (!rafId) {
        rafId = window.requestAnimationFrame(flush);
      }
    }

    card.addEventListener("pointerenter", updatePointerPosition);
    card.addEventListener("pointermove", updatePointerPosition);
    card.addEventListener("pointerenter", () => {
      card.classList.add("is-hovering");
    });
    card.addEventListener("pointerleave", () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      card.classList.remove("is-hovering");
      card.style.removeProperty("--hover-x");
      card.style.removeProperty("--hover-y");
    });
  });
}

function initPage() {
  initNavActiveState();
  initStickyHeaderState();
  wireImageFallbacks();
  initHeroSlider();
  initSupportCardHover();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
