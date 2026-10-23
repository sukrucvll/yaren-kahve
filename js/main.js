/* ==========================================================================
   Yâren — sayfa etkileşimleri
   1) Üst menü (kaydırma durumu, mobil menü, aktif bölüm)
   2) Kaydırınca beliren öğeler
   3) İletişim formu doğrulaması
   4) Demleme rehberleri (pencere ve kaydırma; çizimler js/recipes.js)
   5) Modern etkileşimler (açılış, kelime efektleri, sayaçlar, mıknatıs, eğim)
   ========================================================================== */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const navLinks = nav.querySelectorAll("a[href^='#']");

  /* 1) Üst menü ----------------------------------------------------------- */

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  function setNavOpen(isOpen) {
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.querySelector(".sr-only").textContent = isOpen ? "Menüyü kapat" : "Menüyü aç";
  }

  navToggle.addEventListener("click", function () {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setNavOpen(false);
    });
  });

  document.addEventListener("click", function (event) {
    if (document.body.classList.contains("nav-open") && !event.target.closest(".nav-shell")) {
      setNavOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      setNavOpen(false);
      navToggle.focus();
    }
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // Görünür bölüme ait menü bağlantısını vurgula
  const sections = Array.from(navLinks)
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach(function (section) { sectionObserver.observe(section); });

  /* 2) Kaydırınca beliren öğeler ----------------------------------------- */

  const revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* 3) İletişim formu ----------------------------------------------------- */

  const form = document.getElementById("contact-form");
  const success = document.getElementById("form-success");
  const successName = document.getElementById("success-name");
  const resetButton = document.getElementById("form-reset");
  const submitButton = form.querySelector("button[type='submit']");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Her alan için sırayla denenen kurallar; ilk başarısız kuralın mesajı gösterilir
  const rules = {
    name: [
      { test: function (v) { return v.length > 0; }, message: "Lütfen adınızı yazın." },
      { test: function (v) { return v.length >= 2; }, message: "Adınız en az 2 karakter olmalı." }
    ],
    email: [
      { test: function (v) { return v.length > 0; }, message: "Lütfen e-posta adresinizi yazın." },
      { test: function (v) { return EMAIL_PATTERN.test(v); }, message: "Geçerli bir e-posta adresi girin (örn. ad@ornek.com)." }
    ],
    message: [
      { test: function (v) { return v.length > 0; }, message: "Lütfen mesajınızı yazın." },
      { test: function (v) { return v.length >= 10; }, message: "Mesajınız en az 10 karakter olmalı." }
    ]
  };

  function validateField(input) {
    const value = input.value.trim();
    const failed = rules[input.name].find(function (rule) { return !rule.test(value); });
    const field = input.closest(".field");
    const errorEl = document.getElementById(input.name + "-error");

    field.classList.remove("has-error");
    if (failed) {
      void field.offsetWidth; // sallanma animasyonunu yeniden başlatmak için
      field.classList.add("has-error");
    }
    input.setAttribute("aria-invalid", String(Boolean(failed)));
    errorEl.textContent = failed ? failed.message : "";
    return !failed;
  }

  // Kullanıcı bir alanla ilk kez işini bitirdikten sonra, yazarken anlık kontrol et
  Array.from(form.elements).forEach(function (input) {
    if (!rules[input.name]) return;
    input.addEventListener("blur", function () {
      if (input.value.trim() !== "") {
        input.dataset.touched = "true";
        validateField(input);
      }
    });
    input.addEventListener("input", function () {
      if (input.dataset.touched) validateField(input);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const inputs = Object.keys(rules).map(function (name) { return form.elements[name]; });
    const results = inputs.map(function (input) {
      input.dataset.touched = "true";
      return validateField(input);
    });
    const firstInvalid = inputs[results.indexOf(false)];

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Sunucu yok: gönderimi kısa bir gecikmeyle taklit et
    submitButton.setAttribute("aria-busy", "true");
    setTimeout(function () {
      submitButton.removeAttribute("aria-busy");
      successName.textContent = form.elements.name.value.trim().split(/\s+/)[0];
      form.hidden = true;
      success.hidden = false;
      success.focus();
    }, 700);
  });

  resetButton.addEventListener("click", function () {
    form.reset();
    Array.from(form.elements).forEach(function (input) {
      if (!rules[input.name]) return;
      delete input.dataset.touched;
      input.removeAttribute("aria-invalid");
      input.closest(".field").classList.remove("has-error");
      document.getElementById(input.name + "-error").textContent = "";
    });
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });

  /* 4) Demleme rehberleri ------------------------------------------------- */
  // Çizim kodları js/recipes.js içinde; burada pencere ve kaydırma yönetiliyor.

  const stackedLayout = window.matchMedia("(max-width: 899px)");

  function setupRecipe(dialog, render) {
    const stage = dialog.querySelector(".recipe-stage");
    const steps = dialog.querySelectorAll(".recipe-step");
    const progressBar = dialog.querySelector(".recipe-progress span");
    const counter = dialog.querySelector(".recipe-current");
    let frame = 0;

    // Okuma çizgisinin hangi adımın neresinde olduğu: 0 … adım sayısı (örn. 4.6 = 5. adımın %60'ı).
    // Mobilde sahne üstte sabit durduğu için çizgi, sahnenin altında kalan alanın ortasındadır.
    function getProgress() {
      const lineY = stackedLayout.matches
        ? stage.getBoundingClientRect().bottom + (dialog.clientHeight - stage.getBoundingClientRect().bottom) * 0.55
        : dialog.clientHeight * 0.5;

      for (let i = 0; i < steps.length; i++) {
        const rect = steps[i].getBoundingClientRect();
        if (lineY < rect.top) return i;
        if (lineY < rect.bottom) return i + (lineY - rect.top) / rect.height;
      }
      return steps.length;
    }

    function update() {
      const f = getProgress();
      const active = Math.min(steps.length - 1, Math.floor(f));

      steps.forEach(function (step, i) { step.classList.toggle("is-active", i === active); });
      counter.textContent = String(active + 1).padStart(2, "0");
      progressBar.style.transform = `scaleX(${f / steps.length})`;
      render(f);
    }

    function requestUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        update();
      });
    }

    dialog.querySelectorAll(".recipe-close, .recipe-done").forEach(function (button) {
      button.addEventListener("click", function () { dialog.close(); });
    });

    dialog.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
    });

    dialog.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () {
      if (dialog.open) requestUpdate();
    });

    return function open() {
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add("modal-open");
      update();
    };
  }

  // Her kart, aria-controls ile kendi rehber penceresini açar
  document.querySelectorAll(".recipe-trigger").forEach(function (trigger) {
    const dialog = document.getElementById(trigger.getAttribute("aria-controls"));
    const open = setupRecipe(dialog, window.brewScenes[dialog.id]());
    trigger.addEventListener("click", open);
  });

  /* 5) Modern etkileşimler ------------------------------------------------ */

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  // Açılış perdesi: bu oturumda bir daha gösterme, animasyon bitince kaldır
  const preloader = document.querySelector(".preloader");
  if (document.documentElement.classList.contains("intro-seen")) {
    preloader.remove();
  } else {
    try { sessionStorage.setItem("yaren-intro", "1"); } catch (e) { /* gizli sekme */ }
    setTimeout(function () { preloader.remove(); }, 2300);
  }

  // Metin düğümlerini kelime kelime böler; <em> gibi iç öğeleri ve kapsül fotoğrafları korur
  function splitWords(root, wrap) {
    Array.from(root.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          fragment.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wrap(part));
        });
        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains("inline-img")) {
        splitWords(node, wrap);
      }
    });
  }

  // Başlıklar: her kelime kendi maskesinin altından, sırayla yükselir
  document.querySelectorAll("[data-split]").forEach(function (title) {
    let index = 0;
    splitWords(title, function (word) {
      const outer = document.createElement("span");
      const inner = document.createElement("span");
      outer.className = "w";
      inner.textContent = word;
      inner.style.setProperty("--wi", index++);
      outer.appendChild(inner);
      return outer;
    });
  });

  // Manifesto: kaydırdıkça kelimeler sırayla koyulaşır
  const fillText = document.querySelector("[data-word-fill]");
  splitWords(fillText, function (word) {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word;
    return span;
  });
  const fillTokens = fillText.querySelectorAll(".word, .inline-img");
  let litCount = -1;

  function updateWordFill() {
    const rect = fillText.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    // Metnin üstü ekranın %80'ine geldiğinde başlar, altı ekranın ortasına geldiğinde biter
    const progress = reduceMotion ? 1 : clamp((viewHeight * 0.8 - rect.top) / (rect.height + viewHeight * 0.3), 0, 1);
    const lit = Math.round(progress * fillTokens.length);
    if (lit === litCount) return;
    litCount = lit;
    fillTokens.forEach(function (token, i) { token.classList.toggle("is-lit", i < lit); });
  }

  // İstatistikler: görünür olunca sıfırdan sayarak artar
  const countObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const target = Number(entry.target.dataset.count);
      const start = performance.now();
      requestAnimationFrame(function tick(now) {
        const t = Math.min(1, (now - start) / 1400);
        entry.target.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      });
    });
  }, { threshold: 0.6 });

  if (!reduceMotion) {
    document.querySelectorAll("[data-count]").forEach(function (counter) {
      counter.textContent = "0";
      countObserver.observe(counter);
    });
  }

  // Her karede: ilerleme çubuğu, hero derinliği, kaydırma hızına duyarlı bant
  const scrollBar = document.querySelector(".scroll-progress");
  const heroImage = document.querySelector(".bento--main .bento-bg");
  const heroCopy = document.querySelector(".hero-copy");
  const marqueeTrack = document.querySelector(".marquee-track");
  const MARQUEE_GAP = 36; // .marquee-track gap değeriyle aynı
  let marqueeX = 0;
  let lastScrollY = window.scrollY;
  let velocity = 0;

  function onFrame() {
    const y = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;

    if (!reduceMotion) {
      // Fotoğraf yavaş, metin ters yönde kayar: derinlik hissi
      if (y < window.innerHeight * 1.2) {
        heroImage.style.translate = `0 ${y * 0.18}px`;
        heroCopy.style.translate = `0 ${y * -0.08}px`;
      }

      // Bant sabit hızda akar; hızlı kaydırınca hızlanır, yukarı kaydırınca yön değiştirir ve eğilir
      velocity += (y - lastScrollY - velocity) * 0.1;
      const loopWidth = (marqueeTrack.scrollWidth + MARQUEE_GAP) / 2;
      marqueeX -= 0.6 + velocity * 0.35;
      if (marqueeX <= -loopWidth) marqueeX += loopWidth;
      if (marqueeX > 0) marqueeX -= loopWidth;
      marqueeTrack.style.transform = `translate3d(${marqueeX}px, 0, 0) skewX(${clamp(-velocity * 0.3, -12, 12)}deg)`;
    }

    lastScrollY = y;
    updateWordFill();
    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);

  if (finePointer && !reduceMotion) {
    // Mıknatıslı butonlar: imlece doğru hafifçe çekilir
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (event) {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });

    // Ürün kartları imlece göre 3B eğilir, parlama imleci izler
    document.querySelectorAll(".product-card").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        card.classList.add("is-tilting");
        card.style.transition = "transform 0.15s ease-out";
        card.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-6px)`;
        card.style.setProperty("--gx", px * 100 + "%");
        card.style.setProperty("--gy", py * 100 + "%");
      });
      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-tilting");
        card.style.transition = "transform 0.6s var(--ease)";
        card.style.transform = "";
      });
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
