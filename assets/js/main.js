/* iRegen 홈페이지 — 움직임(바닐라 JS, 라이브러리 없음) */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- 헤더 · 스크롤 진행 ---------- */
  const hdr = $(".hdr"), prog = $(".scroll-progress");
  let lastY = 0;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    hdr.classList.toggle("scrolled", y > innerHeight * 0.6);
    hdr.classList.toggle("hide", y > lastY && y > innerHeight && !document.body.classList.contains("nav-open"));
    lastY = y;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    flowUpdate();
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* 메뉴 활성 표시 */
  const navLinks = $$(".gnb a");
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(a => { const s = $(a.getAttribute("href")); if (s) secObs.observe(s); });

  /* 모바일 메뉴 */
  const menuBtn = $(".menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$(".mnav a").forEach(a => a.addEventListener("click", () => { document.body.classList.remove("nav-open"); menuBtn.setAttribute("aria-expanded", false); }));

  /* ---------- 나타나기 ---------- */
  const revObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  $$("[data-reveal]").forEach(el => revObs.observe(el));

  /* ---------- 히어로 슬라이드 ---------- */
  const slides = $$(".hero-slide"), bar = $(".hero-bar i"), cur = $(".hero-count .cur"), heroBox = $(".hero");
  const DUR = 6500;
  let idx = 0, playing = !reduce, t0 = performance.now(), paused = 0;
  function go(n) {
    if (n === idx) return;
    const prev = slides[idx];
    prev.classList.add("is-leaving"); prev.classList.remove("is-active");
    setTimeout(() => prev.classList.remove("is-leaving"), 500);
    idx = (n + slides.length) % slides.length;
    slides[idx].classList.add("is-active");
    heroBox.classList.toggle("photo-on", slides[idx].hasAttribute("data-photo"));
    cur.textContent = String(idx + 1).padStart(2, "0");
    t0 = performance.now(); paused = 0;
  }
  function tick(now) {
    if (playing && !document.hidden) {
      const p = (now - t0) / DUR;
      bar.style.transform = `scaleX(${clamp(p, 0, 1)})`;
      if (p >= 1) go(idx + 1);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  const tgl = $('[data-hero="toggle"]');
  $('[data-hero="prev"]').addEventListener("click", () => go(idx - 1));
  $('[data-hero="next"]').addEventListener("click", () => go(idx + 1));
  tgl.addEventListener("click", () => {
    playing = !playing;
    if (playing) t0 = performance.now() - paused; else paused = performance.now() - t0;
    $(".i-pause", tgl).style.display = playing ? "" : "none";
    $(".i-play", tgl).style.display = playing ? "none" : "";
    tgl.setAttribute("aria-label", playing ? "자동 넘김 멈춤" : "자동 넘김 시작");
  });
  if (!playing) { $(".i-pause", tgl).style.display = "none"; $(".i-play", tgl).style.display = ""; }

  /* 히어로 무대: 마우스 따라 살짝 움직임 */
  const stage = $(".stage");
  if (stage && !reduce && matchMedia("(pointer:fine)").matches) {
    const chips = $$(".chip3d", stage), core = $(".stage-core", stage);
    $(".hero").addEventListener("mousemove", e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      chips.forEach(c => { const d = +c.dataset.depth || 10; c.style.translate = `calc(-50% + ${-x * d * 2}px) calc(-50% + ${-y * d * 2}px)`; });
      core.style.translate = `${x * 14}px ${y * 14}px`;
    });
  }

  /* 모바일: 장비 그림을 '장비 구성 문의' 버튼 바로 아래로(버튼과 44px 띄움). 그림 위쪽 44%는 뒷벽이라 그만큼 겹쳐 올림 */
  function placeDevMobile() {
    const ds = $(".dev-stage"), act = $(".hero-slide[data-photo] .hero-actions");
    if (!ds || !act) return;
    if (innerWidth > 760) { ds.style.top = ""; ds.style.bottom = ""; return; }
    let y = 0, el = act; while (el && el !== heroBox) { y += el.offsetTop; el = el.offsetParent; }
    ds.style.bottom = "auto";
    ds.style.top = Math.round(y + act.offsetHeight + 44 - ds.offsetHeight * 0.44) + "px";
  }
  addEventListener("resize", placeDevMobile);
  addEventListener("load", placeDevMobile);
  placeDevMobile();

  /* 장비 무대: 마우스 시차(가까운 장비일수록 더 크게) */
  const devStage = $(".dev-stage");
  if (devStage && !reduce && matchMedia("(pointer:fine)").matches) {
    $(".hero").addEventListener("mousemove", e => {
      if (!heroBox.classList.contains("photo-on")) return;
      devStage.style.setProperty("--px", ((e.clientX / innerWidth - 0.5) * -18).toFixed(2));
      devStage.style.setProperty("--py", ((e.clientY / innerHeight - 0.5) * -10).toFixed(2));
    });
  }

  /* ---------- 솔루션 허브 ---------- */
  const PRODUCTS = [
    { key: "irm", code: "IRM · INTEGRATED ERP", name: "IRM", sub: "통합 운영", title: "매장 운영의 중심, 통합 운영 시스템", desc: "상품부터 매입·매출·재고·매장·통계까지 매장 운영에 필요한 모든 데이터를 한곳에서 관리합니다. 다른 솔루션은 모두 IRM으로 이어집니다.", feats: ["상품·매입·매출·재고를 한 화면에서", "본사 상품 연동과 가격·상태 변경 공지", "점간 이동·자가사용·폐기·소분 관리", "매출·매입·순위 통계로 매장 비교"], who: ["식자재마트", "대형약국", "다점포 본사", "소형 매장"], img: "c11_laptop" },
    { key: "pos", code: "POS · CHECKOUT", name: "POS", sub: "계산대", title: "빠르고 정확한 계산대", desc: "바코드 한 번에 계산하고, 행사와 포인트, 여러 결제 수단을 한 화면에서 처리합니다. 판매는 IRM 매출과 재고에 바로 반영됩니다.", feats: ["바코드 판매와 자주 쓰는 상품 버튼·단축키", "할인·증정·2+1·제한수량 행사", "회원 포인트·복합 결제·현금영수증", "택스리펀 즉시·사후 환급"], who: ["식자재마트", "대형약국", "소형 매장"], img: "c03_thumb" },
    { key: "pda", code: "PDA · ON-SITE", name: "PDA", sub: "현장 바코드", title: "매장 곳곳의 일을 손안에서", desc: "창고와 매대 어디서든 바코드를 찍어 입고를 확인하고 재고를 셉니다. 기록은 바로 IRM에 저장됩니다.", feats: ["매입 검수·입고 처리", "재고 조사와 상품 정보 확인", "로케이션(진열 위치) 관리", "점간 이동·폐기·자가사용 처리"], who: ["식자재마트", "대형약국", "다점포"], img: "c13_check" },
    { key: "pdm", code: "PDM · PACK & LABEL", name: "PDM", sub: "소분·포장", title: "소분·포장·라벨을 한 자리에서", desc: "큰 단위로 들어온 상품을 판매 단위로 나누고, 포장과 가격 라벨 출력, 주문 상품 검수까지 이어 갑니다.", feats: ["큰 단위 → 판매 단위 소분 작업", "가격·중량 라벨 출력", "주문서 출력부터 포장·검수", "소분 결과를 IRM 재고에 반영"], who: ["식자재마트", "정육·농축산", "로컬푸드 직매장"], img: "c12_delivery" },
    { key: "scm", code: "SCM · AUTO ORDER", name: "SCM", sub: "자동발주", title: "떨어지기 전에 채우는 자동발주", desc: "재고와 판매 흐름을 보고 발주서를 자동으로 만들어 매입처에 보냅니다. 발주에 쓰던 시간을 줄이고 품절을 막습니다.", feats: ["재고 기준 자동 발주서 생성", "매입처 발주 전송·확인", "발주 계획과 입고 예정 관리", "재고는 줄이고 품절은 막는 적정 재고"], who: ["식자재마트", "대형약국", "다점포 본사"], img: "c15_idea" },
    { key: "esl", code: "ESL · SHELF LABEL", name: "ESL", sub: "전자가격표", title: "가격표를 바꾸는 일이 사라집니다", desc: "IRM에서 가격과 행사를 바꾸면 매대의 전자가격표가 자동으로 바뀝니다. 계산대 가격과 매대 가격이 늘 같습니다.", feats: ["IRM 가격·행사 변경 자동 반영", "종이 가격표 출력·교체 작업 없음", "POS 가격과 매대 가격 일치", "행사 시작·종료에 맞춘 표시"], who: ["대형약국", "식자재마트", "생활용품"], img: "c14_search" },
    { key: "pog", code: "POG · 3D PLANOGRAM", name: "POG", sub: "3D 진열", title: "매장을 3D로 그대로, 진열까지", desc: "매장 도면대로 매대를 배치해 우리 매장을 3D로 똑같이 만들고, 매대마다 상품을 진열해 둡니다. 어느 매대에 무엇이 있는지 화면 속 통로를 걸으며 확인합니다.", feats: ["도면 크기 그대로 매대 배치", "매대 템플릿·진열도 라이브러리", "3D로 통로를 걸으며 진열 확인", "PDA 로케이션과 진열 위치 연동"], who: ["식자재마트", "대형약국", "다점포 본사"], img: "c09_think" },
    { key: "kiosk", code: "KIOSK · SELF CHECKOUT", name: "키오스크", sub: "셀프 결제", title: "줄은 짧게, 계산대는 여유롭게", desc: "손님이 직접 바코드를 찍고 결제해 계산대 대기를 줄입니다. POS와 같은 상품·가격·행사를 쓰고 매출은 IRM에 함께 모입니다.", feats: ["셀프 계산·결제", "POS와 같은 상품·가격·행사", "매출을 IRM에서 한 번에 확인", "혼잡 시간대 계산대 부담 분산"], who: ["대형약국", "마트·생활용품", "동네 마트"], img: "c04_heart" },
    { key: "online", code: "ONLINE · DELIVERY", name: "온라인·배송", sub: "주문·출고", title: "온라인 주문부터 배송 완료까지", desc: "쇼핑몰·폐쇄몰·전화로 들어온 주문을 받아 주문서 출력, 소분·포장, 검수, 배송 경로 지정과 배송 완료 확인까지 이어 갑니다.", feats: ["쇼핑몰·폐쇄몰·전화 주문 접수", "주문서 출력 → 소분·포장 → 검수", "배송 경로 지정·출발·완료 확인", "온라인 매출과 재고도 IRM에서 함께"], who: ["식자재마트", "업소 배송", "로컬푸드 직매장"], img: "c07_walk" },
    { key: "gw", code: "GROUPWARE · TEAMWORK", name: "그룹웨어", sub: "업무 협업", title: "본사와 매장을 한 팀으로", desc: "전자결재·업무보고·근태·일정을 한 화면에서 처리합니다. 본사의 지시와 매장의 보고가 같은 화면에서 바로 이어집니다.", feats: ["전자결재 — 결재·참조·시행 대기를 한눈에", "업무보고와 승인 관리", "출퇴근·연차·연장근무 근태 관리", "캘린더·주소록·메일·게시판·자료실"], who: ["다점포 본사", "식자재마트", "대형약국"], img: "c20_support" },
  ];
  const ICONS = {
    pos: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    pda: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M9 7h6M9 11h6"/>',
    pdm: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/>',
    scm: '<path d="M4 17l6-6 4 4 6-8"/><path d="M14 7h6v6"/>',
    esl: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 11h4M7 14h7"/>',
    kiosk: '<rect x="6" y="2" width="12" height="15" rx="2"/><path d="M12 17v4M8 21h8"/>',
    online: '<path d="M3 7h11v8H3zM14 10h4l3 3v2h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    pog: '<path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M3 9v6l9 5 9-5V9"/><path d="M12 14v6"/>',
    gw: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M12 20c0-3.3 2.7-6 6-6"/>',
  };
  const hubMap = $(".hub-map"), hubPanel = $(".hub-panel");
  if (hubMap) {
    const spokesG = $(".spokes", hubMap), pulsesG = $(".pulses", hubMap);
    const around = PRODUCTS.slice(1), R = 38, nodes = [], spokes = [], pulses = [];
    around.forEach((p, i) => {
      const a = -Math.PI / 2 + (i / around.length) * Math.PI * 2;
      const x = 50 + Math.cos(a) * R, y = 50 + Math.sin(a) * R;
      const b = document.createElement("button");
      b.className = "hub-node"; b.type = "button"; b.style.left = x + "%"; b.style.top = y + "%";
      b.innerHTML = `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[p.key]}</svg><b>${p.name}</b><small>${p.sub}</small></span>`;
      b.setAttribute("aria-label", `${p.name} ${p.sub} 보기`);
      hubMap.appendChild(b); nodes.push(b);
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", 50); ln.setAttribute("y1", 50); ln.setAttribute("x2", x); ln.setAttribute("y2", y); ln.setAttribute("class", "spoke");
      spokesG.appendChild(ln); spokes.push(ln);
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("r", 0.9); c.setAttribute("class", "pulse"); pulsesG.appendChild(c); pulses.push({ c, x, y, off: i / around.length });
    });
    PRODUCTS.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "hub-card" + (i === 0 ? " on" : "");
      card.innerHTML = `<span class="code">${p.code}</span><h3>${p.title}</h3><p>${p.desc}</p><ul>${p.feats.map(f => `<li>${f}</li>`).join("")}</ul><div class="who">${p.who.map(w => `<span>${w}</span>`).join("")}</div><img class="mascot" src="assets/char/${p.img}.webp?v=3" alt="" loading="lazy">`;
      hubPanel.appendChild(card);
    });
    const cards = $$(".hub-card", hubPanel), center = $(".hub-center", hubMap);
    center.setAttribute("role", "button"); center.tabIndex = 0; center.style.cursor = "pointer";
    let sel = 0, auto = !reduce, autoT;
    function pick(i) {
      sel = i;
      cards.forEach((c, k) => c.classList.toggle("on", k === i));
      nodes.forEach((n, k) => n.classList.toggle("on", k + 1 === i));
      spokes.forEach((s, k) => s.classList.toggle("on", k + 1 === i));
    }
    nodes.forEach((n, k) => { n.addEventListener("click", () => { auto = false; pick(k + 1); }); n.addEventListener("mouseenter", () => { auto = false; pick(k + 1); }); });
    center.addEventListener("click", () => { auto = false; pick(0); });
    center.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); auto = false; pick(0); } });
    const hubObs = new IntersectionObserver(es => es.forEach(e => {
      clearInterval(autoT);
      if (e.isIntersecting) autoT = setInterval(() => { if (auto) pick((sel + 1) % PRODUCTS.length); }, 3600);
    }), { threshold: 0.3 });
    hubObs.observe(hubMap);
    // 중심에서 바깥으로 흐르는 점
    if (!reduce) (function pulse(now) {
      pulses.forEach(p => { const t = ((now / 2400) + p.off) % 1; p.c.setAttribute("cx", 50 + (p.x - 50) * t); p.c.setAttribute("cy", 50 + (p.y - 50) * t); p.c.setAttribute("opacity", Math.sin(t * Math.PI)); });
      requestAnimationFrame(pulse);
    })(0);
  }

  /* ---------- 업종 탭 ---------- */
  const tabs = $$(".ind-tab"), panels = $$(".ind-panel");
  function showInd(i) {
    tabs.forEach((t, k) => { t.classList.toggle("on", k === i); t.setAttribute("aria-selected", k === i); });
    panels.forEach((p, k) => p.classList.toggle("on", k === i));
  }
  tabs.forEach((t, i) => t.addEventListener("click", () => showInd(i)));
  $$("[data-ind]").forEach(a => a.addEventListener("click", () => showInd(+a.dataset.ind)));

  /* ---------- 운영 흐름(가로 스크롤) ---------- */
  const pin = $(".flow-pin"), track = $(".flow-track"), fcards = $$(".flow-card"), fline = $(".flow-line i"), walker = $(".flow-walker");
  const mqMobile = matchMedia("(max-width: 760px)");
  function flowUpdate() {
    if (!pin || mqMobile.matches) return;
    const r = pin.getBoundingClientRect(), total = pin.offsetHeight - innerHeight;
    const p = clamp(-r.top / total, 0, 1);
    const maxX = track.scrollWidth - innerWidth;
    track.style.transform = `translate3d(${-maxX * p}px,0,0)`;
    fline.style.transform = `scaleX(${p})`;
    walker.style.left = (p * 100) + "%";
    const on = Math.min(fcards.length - 1, Math.floor(p * fcards.length * 0.999));
    fcards.forEach((c, k) => c.classList.toggle("on", k === on));
  }
  addEventListener("resize", flowUpdate);

  /* ---------- 숫자 올라가기 ---------- */
  function countUp(el, dur = 1600) {
    const to = +el.dataset.count, unit = el.dataset.unit || "", t0 = performance.now();
    (function f(now) {
      const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString("ko-KR") + unit;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* ---------- 제품 목업 움직임 ---------- */
  const loops = [];
  const MOCKS = {
    dash(tile) {
      tile.classList.add("live");
      $$(".bars i", tile).forEach((b, i) => setTimeout(() => b.style.height = b.dataset.h + "%", i * 90));
      $$("[data-count]", tile).forEach(el => countUp(el));
    },
    pos(tile) {
      const rows = $$(".pos-row", tile), tot = $("[data-count]", tile);
      const run = () => {
        rows.forEach(r => r.classList.remove("in")); tot.textContent = "0원";
        rows.forEach((r, i) => setTimeout(() => r.classList.add("in"), 300 + i * 450));
        setTimeout(() => countUp(tot, 900), 300 + rows.length * 450);
      };
      run(); loops.push(setInterval(run, 6000));
    },
    esl(tile) {
      const ps = $$(".price[data-new]", tile);
      ps.forEach(p => p.dataset.old = $("span", p).textContent);
      let on = false;
      const run = () => { on = !on; ps.forEach((p, i) => setTimeout(() => { p.classList.toggle("flip", on); $("span", p).textContent = on ? p.dataset.new : p.dataset.old; }, i * 260)); };
      setTimeout(run, 700); loops.push(setInterval(run, 3200));
    },
    scm(tile) {
      const st = $$(".scm-step", tile); let k = 0;
      const run = () => { st.forEach((s, i) => s.classList.toggle("on", i <= k)); k = (k + 1) % (st.length + 1); };
      run(); loops.push(setInterval(run, 1100));
    },
    kiosk(tile) {
      const sp = $$(".kiosk-screen span:not(.pay)", tile); let k = 0;
      loops.push(setInterval(() => { sp.forEach((s, i) => s.classList.toggle("pick", i === k % sp.length || i === (k + 2) % sp.length)); k++; }, 900));
    },
    ship(tile) {
      const svg = $(".ship svg", tile); if (!svg) return;
      const on = $(".prog", svg), area = $(".area", svg), car = $(".car", svg), clip = $(".clip", svg), stops = $$(".stop", svg);
      const L = on.getTotalLength();
      on.style.strokeDasharray = `${L} ${L}`;
      // 단계마다 경로 위 길이
      const pos = stops.map(st => {
        const x = +st.dataset.x, y = +st.dataset.y; let best = 0, bd = Infinity;
        for (let l = 0; l <= L; l += 0.5) { const q = on.getPointAtLength(l), d = (q.x - x) ** 2 + (q.y - y) ** 2; if (d < bd) { bd = d; best = l; } }
        return best;
      });
      const last = pos.length - 1;
      const set = (l, lit) => {
        const q = on.getPointAtLength(l);
        on.style.strokeDashoffset = L - l;
        clip.setAttribute("width", q.x.toFixed(1));
        car.setAttribute("transform", `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
        stops.forEach((st, i) => st.classList.toggle("on", lit && l >= pos[i] - 0.5));
        car.style.opacity = lit && l < pos[last] - 0.5 ? 1 : 0;
      };
      if (reduce) { set(pos[last], true); return; }
      const MOVE = 900, HOLD = 420, END = 1800, FADE = 500;
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const legs = []; let t = 0;
      for (let i = 1; i <= last; i++) { legs.push({ t0: t, a: pos[i - 1], b: pos[i] }); t += MOVE + HOLD; }
      const total = t - HOLD + END + FADE;
      let vis = false, raf = 0; const start = performance.now();
      const frame = now => {
        raf = 0; if (!vis) return;
        const e = (now - start) % total, fading = e > total - FADE;
        let l = pos[0];
        for (const g of legs) {
          if (e >= g.t0 + MOVE) { l = g.b; continue; }
          if (e > g.t0) l = g.a + (g.b - g.a) * ease((e - g.t0) / MOVE);
          break;
        }
        set(l, !fading);
        const o = fading ? Math.max(0, 1 - (e - (total - FADE)) / FADE) : 1;
        on.style.opacity = o; area.style.opacity = o;
        raf = requestAnimationFrame(frame);
      };
      new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }).observe(tile);
    },
    pog(tile) { const s = $(".pog-shot", tile); if (s) loops.push(setInterval(() => s.classList.toggle("flip"), 3800)); },
    gw(tile) {
      const pad = n => String(n).padStart(2, "0");
      const clock = $(".clock", tile), tin = $(".t-in", tile), btn = $(".btns .in", tile);
      const tick = () => { const d = new Date(); clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
      tick(); loops.push(setInterval(tick, 1000));
      $$(".gwd-stats b", tile).forEach((b, i) => {
        const n = +b.dataset.n; let v = 0;
        setTimeout(() => { const t = setInterval(() => { v++; b.textContent = v; if (v >= n) clearInterval(t); }, 160); }, 250 + i * 120);
      });
      setTimeout(() => {
        btn.classList.add("press");
        setTimeout(() => { const d = new Date(); btn.classList.remove("press"); btn.classList.add("done"); $("em", btn).textContent = "출근 완료"; tin.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; tin.classList.add("ok"); }, 380);
      }, 1500);
      const qs = $$(".gwd-quick .grid span", tile); let k = 0;
      const run = () => { qs.forEach((q, i) => q.classList.toggle("on", i === k % qs.length)); k++; };
      setTimeout(() => { run(); loops.push(setInterval(run, 1300)); }, 2200);
    },
    pda() {}, pdm() {},
  };
  const mockObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const f = MOCKS[e.target.dataset.mock]; if (f) f(e.target);
    mockObs.unobserve(e.target);
  }), { threshold: 0.35 });
  $$("[data-mock]").forEach(t => mockObs.observe(t));

  /* ---------- 도입 절차 ---------- */
  const steps = $(".steps");
  if (steps) {
    const stObs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      steps.style.setProperty("--p", 1);
      $$(".step", steps).forEach((s, i) => setTimeout(() => s.classList.add("on"), 250 + i * 260));
      stObs.disconnect();
    }), { threshold: 0.4 });
    stObs.observe(steps);
  }

  /* ---------- 떠 있는 상담 카드 ---------- */
  const pip = $(".pip");
  // X 로 닫으면 이번 화면에서만 숨김 — 새로고침(F5)하면 다시 나옴(11-06)
  try { sessionStorage.removeItem("pipClosed"); } catch (e) {}
  $(".x", pip).addEventListener("click", () => { pip.classList.add("closed"); placeTop(); });

  /* ---------- 맨 위로: 상담 카드가 보이면 캐릭터 얼굴 왼쪽, 아니면 오른쪽 아래 ---------- */
  const toTop = $(".to-top"), pipImg = $("img", pip);
  function placeTop() {
    if (!toTop) return;
    toTop.classList.toggle("show", scrollY > innerHeight * 0.8);
    const on = pip.classList.contains("show") && !pip.classList.contains("closed");
    if (!on) { toTop.style.right = ""; toTop.style.bottom = ""; return; }
    // 움직이는 중(transform)과 상관없이 자리 계산: 카드의 고정 위치 + 그림의 offset
    const cs = getComputedStyle(pip), cw = document.documentElement.clientWidth, ch = innerHeight;
    const pl = cw - parseFloat(cs.right) - pip.offsetWidth, pt = ch - parseFloat(cs.bottom) - pip.offsetHeight;
    const il = pl + pipImg.offsetLeft, face = pt + pipImg.offsetTop + pipImg.offsetHeight * 0.36;
    const sz = toTop.offsetWidth || 48;
    toTop.style.right = Math.round(cw - il + 8) + "px";
    toTop.style.bottom = Math.round(ch - face - sz / 2) + "px";
  }
  if (toTop) toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  addEventListener("resize", placeTop);
  const heroEl = $(".hero"), ctaEl = $("#contact");
  const pipObs = new IntersectionObserver(() => {
    const hr = heroEl.getBoundingClientRect(), cr = ctaEl.getBoundingClientRect();
    pip.classList.toggle("show", hr.bottom < innerHeight * 0.3 && cr.top > innerHeight * 0.7);
  }, { threshold: [0, 0.3, 0.7, 1] });
  pipObs.observe(heroEl); pipObs.observe(ctaEl);
  addEventListener("scroll", () => {
    const hr = heroEl.getBoundingClientRect(), cr = ctaEl.getBoundingClientRect();
    pip.classList.toggle("show", hr.bottom < innerHeight * 0.3 && cr.top > innerHeight * 0.7);
    placeTop();
  }, { passive: true });
  placeTop();

  /* ---------- 문의 남기기 (11-06) ----------
     상담 신청 등록 API(home_inquiry_api.md): <form id="inquiry" data-api="주소" data-key="ApiKey" data-source="HOME">
     보내는 값(multipart/form-data, Content-Type 은 브라우저가 붙임):
       CompanyName · ContactName · Phone · Email · Title(관심 솔루션) · Content(문의 내용 + 관심 솔루션) · SourceSite · Website(봇 칸, 비움) · file(첨부 0~5개)
     답: body.Table[0].Ret — 0 접수(InquiryId) / -1·-22·-23·-24 는 MsgKr 그대로 / 그 밖·통신 실패는 '못 보냄' + 메일로 보내기
     data-api 가 비어 있으면 메일 앱(help@iregen.co.kr)을 열어 같은 내용을 채웁니다. */
  const inq = $("#inquiry");
  if (inq) {
    const say = $(".inq-msg", inq), ta = inq.elements.message, cnt = $(".cnt", inq), send = $(".inq-send", inq);
    const sendHTML = send.innerHTML;
    ta.addEventListener("input", () => { cnt.textContent = `${ta.value.length} / 1000`; });

    /* 파일 첨부 — 서버 규칙과 같게 먼저 걸러 냄(받는 형식 · 5개 · 파일당 20MB · 합쳐서 50MB) */
    const OK_EXT = "pdf hwp hwpx doc docx pptx xls xlsx csv txt jpg jpeg png gif webp bmp zip".split(" ");
    const MAX_N = 5, MAX_ONE = 20 * 1024 * 1024, MAX_ALL = 50 * 1024 * 1024;
    const fileIn = inq.elements.file, attList = $(".att-list", inq), attErr = $(".att-err", inq), att = $(".att", inq);
    let files = [];
    const size = b => b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))}KB` : `${(b / 1024 / 1024).toFixed(1)}MB`;
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const drawFiles = () => {
      attList.innerHTML = files.map((f, i) => `<li><span class="nm" title="${esc(f.name)}">${esc(f.name)}</span><em>${size(f.size)}</em><button type="button" data-i="${i}" aria-label="${esc(f.name)} 빼기">×</button></li>`).join("");
      att.classList.toggle("has", files.length > 0);
    };
    const addFiles = list => {
      const bad = [];
      for (const f of list) {
        const ext = (f.name.split(".").pop() || "").toLowerCase();
        if (files.some(g => g.name === f.name && g.size === f.size)) continue;           // 같은 파일 두 번
        if (!f.name.includes(".") || !OK_EXT.includes(ext)) bad.push(ext === "ppt" ? `${f.name}(ppt 는 pptx 로 저장해 주세요)` : `${f.name}(보낼 수 없는 형식)`);
        else if (f.size > MAX_ONE) bad.push(`${f.name}(20MB 넘음)`);
        else if (files.length >= MAX_N) bad.push(`${f.name}(5개까지)`);
        else if (files.reduce((s, g) => s + g.size, 0) + f.size > MAX_ALL) bad.push(`${f.name}(합쳐서 50MB 넘음)`);
        else files.push(f);
      }
      attErr.textContent = bad.length ? `빼 둔 파일: ${bad.join(", ")}` : "";
      drawFiles();
    };
    fileIn.addEventListener("change", () => { addFiles(fileIn.files); fileIn.value = ""; });
    attList.addEventListener("click", e => {
      const b = e.target.closest("button[data-i]"); if (!b) return;
      files.splice(+b.dataset.i, 1); attErr.textContent = ""; drawFiles(); fileIn.focus();
    });
    const drop = $(".f-msg", inq);
    ["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => {
      if (![...(e.dataTransfer?.types || [])].includes("Files")) return;
      e.preventDefault(); drop.classList.add("drag");
    }));
    ["dragleave", "drop"].forEach(t => drop.addEventListener(t, e => {
      if (t === "dragleave" && drop.contains(e.relatedTarget)) return;
      drop.classList.remove("drag");
    }));
    drop.addEventListener("drop", e => { if (e.dataTransfer?.files?.length) { e.preventDefault(); addFiles(e.dataTransfer.files); } });
    $(".more", inq).addEventListener("click", e => {
      const t = $(".agree-text", inq); t.hidden = !t.hidden;
      e.currentTarget.setAttribute("aria-expanded", String(!t.hidden));
      e.currentTarget.textContent = t.hidden ? "내용 보기" : "접기";
    });
    const rules = {
      company: el => el.value.trim() ? "" : "회사·매장명을 적어 주세요.",
      name: el => el.value.trim() ? "" : "담당자 이름을 적어 주세요.",
      phone: el => { const d = el.value.replace(/\D/g, ""); return /^[0-9+\-\s()]+$/.test(el.value.trim()) && d.length >= 8 && d.length <= 15 ? "" : "연락처를 확인해 주세요."; },
      email: el => !el.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) ? "" : "이메일 주소를 확인해 주세요.",
      message: el => el.value.trim().length >= 5 ? "" : "문의 내용을 5자 이상 적어 주세요.",
      agree: el => el.checked ? "" : "개인정보 수집·이용에 동의해 주세요.",
    };
    const check = el => {
      const box = el.closest(".f, .agree"), err = rules[el.name](el);
      box.classList.toggle("err", !!err);
      el.setAttribute("aria-invalid", err ? "true" : "false");
      let m = box.querySelector(":scope > .msg");
      if (!m) {
        m = document.createElement("small"); m.className = "msg";
        const ta2 = box.querySelector(":scope > .ta");             // 문의 내용은 입력칸 바로 아래(첨부 줄 위)
        ta2 ? ta2.after(m) : box.appendChild(m);
      }
      m.textContent = err;
      return !err;
    };
    Object.keys(rules).forEach(n => {
      const el = inq.elements[n];
      el.addEventListener(el.type === "checkbox" ? "change" : "blur", () => { if (el.type === "checkbox" || el.value) check(el); });
      el.addEventListener("input", () => { if (el.closest(".err")) check(el); });
    });
    const mailOpen = d => {   // 메일 앱으로 같은 내용(첨부는 메일에 직접)
      const body = `회사·매장명: ${d.company}\n담당자: ${d.name}\n연락처: ${d.phone}\n이메일: ${d.email || "-"}\n관심 솔루션: ${d.products.join(", ") || "-"}\n\n${d.message}\n\n(개인정보 수집·이용 동의함 · 홈페이지 문의 남기기)`
        + (files.length ? `\n(첨부할 파일: ${files.map(f => f.name).join(", ")} — 이 메일에 직접 붙여 주세요)` : "");
      location.href = `mailto:help@iregen.co.kr?subject=${encodeURIComponent("[홈페이지 문의] " + d.company)}&body=${encodeURIComponent(body)}`;
    };
    let last = null, busy = false;
    say.addEventListener("click", e => { if (e.target.closest(".mail") && last) { e.preventDefault(); mailOpen(last); } });
    const fail = (text, mail) => {
      say.className = "inq-msg bad";
      say.innerHTML = esc(text) + (mail ? ` <button type="button" class="mail">메일로 보내기</button>` : "");
    };
    inq.addEventListener("submit", async e => {
      e.preventDefault();
      if (busy) return;
      let first = null;
      Object.keys(rules).forEach(n => { const el = inq.elements[n]; if (!check(el) && !first) first = el; });
      if (first) { first.focus(); fail("빨간 칸을 확인해 주세요."); return; }
      const v = n => inq.elements[n].value.trim();
      const d = last = {
        company: v("company"), name: v("name"), phone: v("phone"), email: v("email"),
        products: $$("input[name=products]:checked", inq).map(c => c.value), message: v("message"),
      };
      if (inq.elements.Website.value) { inq.classList.add("done"); return; }   // 자동 등록(사람 눈엔 안 보이는 칸) — 보내지 않고 끝난 척
      const API = (inq.dataset.api || "").trim();   // 보낼 때마다 읽음
      if (!API) { mailOpen(d); say.className = "inq-msg"; say.textContent = "메일 앱이 열리면 [보내기]를 눌러 주세요."; return; }

      const fd = new FormData();
      fd.append("CompanyName", d.company);
      fd.append("ContactName", d.name);
      fd.append("Phone", d.phone);
      if (d.email) fd.append("Email", d.email);
      fd.append("Title", d.products.length ? `도입 상담 (${d.products.join(", ")})` : "도입 상담");
      fd.append("Content", d.message + (d.products.length ? `\n\n관심 솔루션: ${d.products.join(", ")}` : ""));
      fd.append("SourceSite", inq.dataset.source || "HOME");
      fd.append("Website", "");
      files.forEach(f => fd.append("file", f, f.name));

      busy = true; send.disabled = true; send.textContent = files.length ? "파일 올리는 중…" : "보내는 중…";
      say.textContent = ""; say.className = "inq-msg";
      const stop = new AbortController(), timer = setTimeout(() => stop.abort(), files.length ? 180000 : 30000);
      try {
        const r = await fetch(API, { method: "POST", headers: { ApiKey: inq.dataset.key || "" }, body: fd, signal: stop.signal });
        let row = null;
        try { const j = await r.json(); row = j && j.body && j.body.Table && j.body.Table[0]; } catch (_) { /* JSON 아님 */ }
        const ret = row ? Number(row.Ret) : NaN;
        if (ret === 0) {
          $(".inq-no", inq).textContent = Number(row.InquiryId) > 0 ? `접수 번호 ${row.InquiryId}` : "";   // 0 = 봇 칸 등으로 저장 안 됨
          inq.classList.add("done");
          files = []; drawFiles();
        } else if ([-1, -22, -23, -24].includes(ret) && row.MsgKr) {
          fail(row.MsgKr, ret === -24);
        } else {
          if (window.console) console.warn("문의 보내기 실패", r.status, row);
          fail("지금은 보내지 못했어요. 잠시 뒤 다시 보내 주시거나 070-4152-3621 로 전화해 주세요.", true);
        }
      } catch (err) {
        fail(err && err.name === "AbortError" ? "응답이 너무 늦어요. 잠시 뒤 다시 보내 주시거나 070-4152-3621 로 전화해 주세요."
          : "보내지 못했어요. 인터넷 연결을 확인하고 다시 보내 주시거나 070-4152-3621 로 전화해 주세요.", true);
      } finally { clearTimeout(timer); busy = false; send.disabled = false; send.innerHTML = sendHTML; }
    });
    $(".inq-again", inq).addEventListener("click", () => {
      inq.reset(); cnt.textContent = "0 / 1000"; say.textContent = ""; say.className = "inq-msg"; inq.classList.remove("done");
      files = []; drawFiles(); attErr.textContent = ""; $(".inq-no", inq).textContent = "";
      $$(".err", inq).forEach(b => b.classList.remove("err")); $$(".msg", inq).forEach(m => { m.textContent = ""; });
    });
  }

  onScroll();
})();
