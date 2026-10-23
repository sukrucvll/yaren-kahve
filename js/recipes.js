/* ==========================================================================
   Yâren — demleme rehberi sahneleri
   Her sahne, rehberdeki SVG'yi f değerine göre çizen bir fonksiyon döndürür.
   f: okunan adım (0 … adım sayısı), örn. 4.6 = 5. adımın %60'ı.
   1) Yardımcılar  2) Türk kahvesi  3) Espresso  4) Filtre kahve
   ========================================================================== */

window.brewScenes = (function () {
  "use strict";

  /* 1) Yardımcılar -------------------------------------------------------- */

  function clamp01(value) { return Math.min(1, Math.max(0, value)); }
  function lerp(from, to, t) { return from + (to - from) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // Bir adımın [from, to] diliminde 0'dan 1'e ilerleyen değer
  function phase(f, step, from, to) { return clamp01((f - step - from) / (to - from)); }

  // Sadece hareket sürerken görünür; başta ve sonda kısa bir geçişle
  function during(t) { return clamp01(Math.min(t, 1 - t) * 8); }

  function mixColor(from, to, t) {
    return "rgb(" + from.map(function (c, i) { return Math.round(lerp(c, to[i], t)); }).join(",") + ")";
  }

  function rotatePoint(x, y, cx, cy, degrees) {
    const rad = degrees * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return { x: cx + (x - cx) * cos - (y - cy) * sin, y: cy + (x - cx) * sin + (y - cy) * cos };
  }

  function set(el, attrs) {
    Object.keys(attrs).forEach(function (name) { el.setAttribute(name, attrs[name]); });
  }

  // "tk" → tk-xxx kimlikli öğeleri bulan kısa yol
  function parts(prefix) {
    return function (id) { return document.getElementById(prefix + "-" + id); };
  }

  // Düşen taneler gibi, ilerledikçe sırayla aşağı akan küçük parçacıklar
  function fallParticles(particles, t, distance, loops) {
    particles.forEach(function (particle, i) {
      const local = (t * loops + i / particles.length) % 1;
      set(particle, { transform: `translate(0 ${local * distance})`, opacity: during(t) });
    });
  }

  /* 2) Türk kahvesi ------------------------------------------------------- */

  function turkish() {
    const $ = parts("tk");
    const el = {
      flame: $("flame"),
      cezve: $("cezve"),
      level: $("cz-level"),
      liquid: $("cz-liquid"),
      foam: $("cz-foam"),
      bubbles: $("bubbles"),
      stir: $("stir"),
      scoop: $("scoop"),
      grains: $("grains").querySelectorAll("circle"),
      sugar: $("sugar"),
      stream: $("stream"),
      streamFlow: $("stream-flow"),
      cupCoffee: $("cup-coffee"),
      cupFoam: $("cup-foam"),
      steam: $("steam"),
      lokum: $("lokum"),
      water: $("water")
    };

    // İllüstrasyondaki sabit ölçüler (SVG koordinatları)
    const CEZVE = { bottom: 376, depth: 78, pivotX: 120, pivotY: 340, spoutX: 162, spoutY: 287 };
    const CUP = { bottom: 391, depth: 46 };
    const POUR_POSE = { x: 80, y: -20, angle: 50 }; // döküş anında ağız fincanın üstüne gelir
    const WATER_RGB = [169, 196, 201];
    const COFFEE_RGB = [74, 42, 24];

    return function render(f) {
      // Adım dilimleri: 0 su, 1 kahve, 2 şeker, 3 karıştırma, 4 köpük, 5 döküş, 6 servis
      const water = phase(f, 0, 0.1, 0.8);
      const grounds = phase(f, 1, 0.05, 0.85);
      const sugar = phase(f, 2, 0.1, 0.8);
      const stir = phase(f, 3, 0.2, 0.9);
      const foam = phase(f, 4, 0.1, 0.8);
      const lift = easeInOut(phase(f, 5, 0, 0.3));
      const pour = phase(f, 5, 0.3, 0.9);
      const settle = easeInOut(phase(f, 6, 0, 0.4));
      const serve = phase(f, 6, 0.2, 0.8);
      const heat = phase(f, 3, 0.05, 0.3) * (1 - phase(f, 5, 0, 0.15));

      // Cezve ocaktan kalkar, fincana doğru eğilir, servis adımında geri döner
      const pose = lift * (1 - settle);
      const angle = POUR_POSE.angle * pose;
      const dx = POUR_POSE.x * pose;
      const dy = POUR_POSE.y * pose;
      set(el.cezve, { transform: `translate(${dx} ${dy}) rotate(${angle} ${CEZVE.pivotX} ${CEZVE.pivotY})` });
      // Cezve eğilse de sıvının yüzeyi yatay kalsın
      set(el.level, { transform: `rotate(${-angle} ${CEZVE.pivotX} ${CEZVE.pivotY})` });

      // Cezvedeki sıvı: su dolar, kahveyle koyulaşır, köpürür, döküldükçe azalır
      const level = lerp(0.5 * water + 0.12 * foam, 0.04, pour);
      const surfaceY = CEZVE.bottom - level * CEZVE.depth;
      const foamHeight = 16 * foam * (1 - pour);
      set(el.liquid, { y: surfaceY, fill: mixColor(WATER_RGB, COFFEE_RGB, grounds) });
      set(el.foam, { y: surfaceY - foamHeight, height: foamHeight });
      set(el.bubbles, { transform: `translate(0 ${surfaceY - foamHeight / 2})`, opacity: foam * (1 - pour) });

      // Ölçü kaşığı eğilir, taneler sırayla cezveye düşer
      set(el.scoop, { opacity: during(grounds), transform: `rotate(${-35 * clamp01(grounds * 3)} 150 226)` });
      el.grains.forEach(function (grain, i) {
        const t = clamp01((grounds - i * 0.06) / 0.45);
        set(grain, { transform: `translate(0 ${t * 100})`, opacity: t > 0 && t < 1 ? 1 : 0 });
      });

      set(el.sugar, { opacity: during(sugar), transform: `translate(0 ${sugar * 125})` });
      set(el.stir, { opacity: during(stir), transform: `translate(${Math.sin(stir * Math.PI * 4) * 12} 0)` });
      set(el.flame, { opacity: heat > 0 ? 1 : 0, transform: `translate(120 390) scale(${heat}) translate(-120 -390)` });

      // Fincan dolar; akış cezvenin ağzından fincandaki yüzeye iner
      const cupSurfaceY = CUP.bottom - 0.85 * pour * CUP.depth;
      set(el.cupCoffee, { y: cupSurfaceY });
      set(el.cupFoam, { y: cupSurfaceY - 4, height: 4 * clamp01(pour * 5) });

      const spout = rotatePoint(CEZVE.spoutX, CEZVE.spoutY, CEZVE.pivotX, CEZVE.pivotY, angle);
      const sx = spout.x + dx;
      const sy = spout.y + dy;
      const streamPath = `M${sx} ${sy}Q${sx + 7} ${sy + 8} ${sx + 7} ${cupSurfaceY}`;
      set(el.stream, { d: streamPath, opacity: during(pour) });
      set(el.streamFlow, { d: streamPath, opacity: during(pour) });

      // Servis: buhar yükselir, su ve lokum masaya gelir
      set(el.steam, { opacity: serve });
      [el.lokum, el.water].forEach(function (part) {
        set(part, { opacity: serve, transform: `translate(0 ${(1 - serve) * 12})` });
      });
    };
  }

  /* 3) Espresso ----------------------------------------------------------- */

  function espresso() {
    const $ = parts("es");
    const el = {
      grinder: $("grinder"),
      beans: $("beans"),
      grounds: $("grounds").querySelectorAll("circle"),
      portafilter: $("pf"),
      mound: $("mound"),
      tamper: $("tamper"),
      needle: $("needle"),
      light: $("light"),
      timer: $("timer"),
      stream: $("stream"),
      streamFlow: $("stream-flow"),
      cup: $("cup"),
      cupCoffee: $("cup-coffee"),
      crema: $("crema"),
      steam: $("steam"),
      saucer: $("saucer"),
      water: $("water")
    };

    // Portafiltrenin durduğu üç nokta: öğütücü çatalı, tezgâh, grup başlığı
    const SPOT = {
      grinder: { x: 338, y: 330 },
      tamp: { x: 262, y: 385 },
      head: { x: 130, y: 289 }
    };
    const CUP = { x: 130, y: 378, serveX: 270, serveY: 396, depth: 26 };
    const SPOUT_Y = SPOT.head.y + 14;

    return function render(f) {
      // Adım dilimleri: 0 öğütme, 1 sıkıştırma, 2 takma, 3 çekim, 4 krema, 5 servis
      const grind = phase(f, 0, 0.1, 0.85);
      const toTamp = easeInOut(phase(f, 1, 0, 0.3));
      const press = phase(f, 1, 0.3, 0.6);
      const release = phase(f, 1, 0.7, 0.95);
      const lock = easeInOut(phase(f, 2, 0.1, 0.8));
      const extract = phase(f, 3, 0.1, 0.9);
      const crema = phase(f, 4, 0.1, 0.7);
      const serve = easeInOut(phase(f, 5, 0.05, 0.6));
      const extras = phase(f, 5, 0.4, 0.9);

      // Öğütücü çalışırken titrer, hazne azalır, öğütülen kahve portafiltreye akar
      set(el.grinder, { transform: `translate(${during(grind) * Math.sin(grind * 90) * 0.8} 0)` });
      set(el.beans, { transform: `translate(0 ${grind * 8})` });
      fallParticles(el.grounds, grind, 26, 5);

      // Portafiltre: öğütücüden tezgâha, oradan kavis çizerek grup başlığına
      let x;
      let y;
      let angle = 0;
      if (lock > 0) {
        x = lerp(SPOT.tamp.x, SPOT.head.x, lock);
        y = lerp(SPOT.tamp.y, SPOT.head.y, lock) - Math.sin(lock * Math.PI) * 40;
        angle = -12 * Math.sin(lock * Math.PI);
      } else {
        x = lerp(SPOT.grinder.x, SPOT.tamp.x, toTamp);
        y = lerp(SPOT.grinder.y, SPOT.tamp.y, toTamp) - Math.sin(toTamp * Math.PI) * 20;
      }
      set(el.portafilter, { transform: `translate(${x} ${y}) rotate(${angle})` });
      set(el.mound, { ry: lerp(9 * grind, 2, press) });

      // Tamper iner, kahveyi düzleştirir ve kalkar
      const tamperY = release > 0 ? lerp(376, 315, release) : lerp(300, 376, press);
      set(el.tamper, {
        transform: `translate(${SPOT.tamp.x} ${tamperY})`,
        opacity: clamp01(Math.min(press * 6, (1 - release) * 6))
      });

      // Çekim: basınç 9 bara çıkar, süre sayılır, iki ince akış fincanı doldurur
      const bar = 9 * phase(f, 3, 0, 0.15) * (1 - phase(f, 4, 0, 0.3));
      set(el.needle, { transform: `rotate(${-120 + bar / 12 * 240} 190 245)` });
      set(el.light, { fill: bar > 0.5 ? "#e8b06a" : "#2b1e16" });
      el.timer.textContent = String(Math.round(28 * extract)).padStart(2, "0") + " sn";

      const fill = 0.75 * extract;
      const cupX = lerp(CUP.x, CUP.serveX, serve);
      const cupY = lerp(CUP.y, CUP.serveY, serve);
      const surface = -2 - fill * CUP.depth; // fincanın kendi koordinatlarında
      set(el.cup, { transform: `translate(${cupX} ${cupY})` });
      set(el.cupCoffee, { y: surface });
      set(el.crema, { y: surface, height: Math.min(fill * CUP.depth, 2 * clamp01(extract * 3) + 2.5 * crema) });

      const flow = extract > 0 ? clamp01(extract * 10) * (1 - phase(f, 4, 0, 0.35)) : 0;
      const streamPath = `M124 ${SPOUT_Y}V${cupY + surface}M136 ${SPOUT_Y}V${cupY + surface}`;
      set(el.stream, { d: streamPath, opacity: flow });
      set(el.streamFlow, { d: streamPath, opacity: flow });

      // Servis: fincan tabağına kayar, yanına su gelir
      set(el.saucer, { opacity: clamp01(serve * 3) });
      set(el.steam, { opacity: extras });
      set(el.water, { opacity: extras, transform: `translate(0 ${(1 - extras) * 12})` });
    };
  }

  /* 4) Filtre kahve ------------------------------------------------------- */

  function filter() {
    const $ = parts("fl");
    const el = {
      baseLight: $("base-light"),
      kettle: $("kettle"),
      kettleSteam: $("kettle-steam"),
      temp: $("temp"),
      scoop: $("scoop"),
      grounds: $("grounds").querySelectorAll("circle"),
      dripper: $("dripper"),
      bed: $("bed"),
      water: $("water"),
      bubbles: $("bubbles"),
      pour: $("pour"),
      pourFlow: $("pour-flow"),
      drip: $("drip"),
      carafe: $("carafe-coffee"),
      scale: $("scale"),
      mug: $("mug"),
      mugCoffee: $("mug-coffee"),
      mugSteam: $("mug-steam")
    };

    const KETTLE = { pivotX: 95, pivotY: 360, tipX: 170, tipY: 319 };
    const POUR_POSE = { x: 33, y: -99, angle: 30 }; // döküşte ağız dripper'ın ortasına gelir
    const CONE = { bottom: 310, depth: 44 };
    const CARAFE = { bottom: 378, depth: 52 };
    const MUG = { bottom: 396, depth: 42 };

    return function render(f) {
      // Adım dilimleri: 0 ısıtma, 1 kahve, 2 bloom, 3 döküş, 4 süzülme, 5 servis
      const heat = phase(f, 0, 0.1, 0.85);
      const dose = phase(f, 1, 0.05, 0.8);
      const lift = easeInOut(phase(f, 2, 0, 0.3));
      const bloomPour = phase(f, 2, 0.3, 0.6);
      const bloom = phase(f, 2, 0.5, 1);
      const pour = phase(f, 3, 0.05, 0.9);
      const lower = easeInOut(phase(f, 4, 0, 0.3));
      const drain = phase(f, 4, 0.05, 0.9);
      const serve = phase(f, 5, 0.1, 0.8);

      // Isıtma: sıcaklık 93 °C'ye çıkar, ağızdan buhar gelir
      el.temp.textContent = Math.round(lerp(22, 93, heat)) + "°";
      set(el.baseLight, { fill: heat > 0 && heat < 1 ? "#e8b06a" : "#6f5f53" });
      set(el.kettleSteam, { opacity: clamp01((heat - 0.5) * 2) * (1 - lift) });

      // Kahve dozu filtreye dökülür
      set(el.scoop, { opacity: during(dose), transform: `rotate(${-55 * clamp01(dose * 3)} 248 231)` });
      fallParticles(el.grounds, dose, 50, 4);

      // Kahve yatağı ve üstündeki su: bloom'da kabarır, döküşte yükselir, süzülünce iner
      const bed = 0.32 * dose + 0.07 * bloom * (1 - drain);
      const waterTop = bed + 0.05 * bloomPour * (1 - bloom) + 0.5 * pour;
      const water = lerp(waterTop, bed, drain);
      const waterY = CONE.bottom - water * CONE.depth;
      set(el.bed, { y: CONE.bottom - bed * CONE.depth });
      set(el.water, { y: waterY });
      set(el.bubbles, { transform: `translate(0 ${CONE.bottom - bed * CONE.depth})`, opacity: bloom * (1 - pour) });

      // Kettle kalkar, eğilir, döküşte spiral çizer gibi sağa sola gider
      const pose = lift * (1 - lower);
      const angle = POUR_POSE.angle * pose;
      const dx = POUR_POSE.x * pose + Math.sin(pour * Math.PI * 8) * 7 * during(pour);
      const dy = POUR_POSE.y * pose;
      set(el.kettle, { transform: `translate(${dx} ${dy}) rotate(${angle} ${KETTLE.pivotX} ${KETTLE.pivotY})` });

      const tip = rotatePoint(KETTLE.tipX, KETTLE.tipY, KETTLE.pivotX, KETTLE.pivotY, angle);
      const sx = tip.x + dx;
      const sy = tip.y + dy;
      const pourPath = `M${sx} ${sy}Q${sx + 2} ${sy + 10} ${sx + 1} ${waterY}`;
      const pourOpacity = Math.max(during(bloomPour), during(pour));
      set(el.pour, { d: pourPath, opacity: pourOpacity });
      set(el.pourFlow, { d: pourPath, opacity: pourOpacity });

      // Damlalar sürahiye düşer, sürahi dolar; serviste bir kısmı fincana gider
      const carafeLevel = 0.62 * (0.45 * pour + 0.55 * drain) - 0.25 * serve;
      const carafeY = CARAFE.bottom - carafeLevel * CARAFE.depth;
      set(el.carafe, { y: carafeY });
      set(el.drip, { d: `M220 320V${carafeY}`, opacity: clamp01(pour * 8) * clamp01((1 - drain) * 6) });

      // Terazi: önce kahvenin, darası alındıktan sonra suyun ağırlığı
      const grams = f < 2 ? 15 * dose : 40 * bloomPour + 210 * pour;
      el.scale.textContent = Math.round(grams) + " g";

      // Servis: dripper kalkar, kupa dolar
      set(el.dripper, { opacity: 1 - serve, transform: `translate(0 ${-36 * serve})` });
      set(el.mug, { opacity: serve, transform: `translate(0 ${(1 - serve) * 12})` });
      set(el.mugCoffee, { y: MUG.bottom - 0.72 * serve * MUG.depth });
      set(el.mugSteam, { opacity: phase(f, 5, 0.5, 1) });
    };
  }

  // Rehber penceresinin kimliği → sahneyi kuran fonksiyon
  return {
    "recipe-turk": turkish,
    "recipe-espresso": espresso,
    "recipe-filtre": filter
  };
})();
