document.documentElement.classList.add("js");

// 문의 메일 주소: 공개 전에 실제 주소로 바꿔야 한다
const CONTACT_EMAIL = "your-email@example.com";

const SETS = [
  { key: "cafe", shop: "오늘의 온도 커피", kind: "카페", what: "가을 한정 메뉴 3가지", ask: "신메뉴 소개", time: "제작 40분", color: "#8A5A3B" },
  { key: "nail", shop: "손끝 살롱", kind: "네일숍", what: "11월 시즌 컬러 할인", ask: "이벤트 안내", time: "제작 35분", color: "#8E4A57" },
  { key: "flower", shop: "작은 들꽃", kind: "꽃집", what: "가을 꽃다발 3종 예약", ask: "예약 상품 소개", time: "제작 45분", color: "#55704A" },
  { key: "bakery", shop: "새벽 오븐", kind: "빵집", what: "빵 나오는 시간표", ask: "영업 정보", time: "제작 30분", color: "#4A5A7A" },
  { key: "scent", shop: "my_scent.lab", kind: "향수 계정", what: "향수 오래 남기는 법", ask: "정보성 콘텐츠", time: "제작 40분", color: "#6B5E50" }
];
const ALTS = ["표지", "첫 번째 소개", "두 번째 소개", "세 번째 소개", "마무리"];
const img = (k, i, lazy = true) =>
  `<img src="work/${k}-${i}.jpg" width="540" height="675" alt="${ALTS[i]} 카드"${lazy ? ' loading="lazy"' : ""}>`;

// ---- 밀착인화지: 세트마다 한 줄 ----
const sheet = document.getElementById("sheet");
const note = document.getElementById("sheet-note");
const noteDefault = note.textContent;
sheet.innerHTML = SETS.map((s, r) => `
  <div class="run rise" data-i="${r}">
    <h3>${s.shop}<span>${s.kind} · ${s.what}</span></h3>
    <div class="frames">${[0, 1, 2, 3, 4].map(i => `<a href="#p-${s.key}" aria-label="${s.shop} ${ALTS[i]}">${img(s.key, i, r > 1)}</a>`).join("")}</div>
  </div>`).join("");

sheet.querySelectorAll(".run").forEach(run => {
  const s = SETS[+run.dataset.i];
  const on = () => {
    sheet.classList.add("dim");
    run.classList.add("on");
    note.textContent = `${s.shop} — ${s.ask}, 5장 한 세트, ${s.time}`;
  };
  const off = () => {
    sheet.classList.remove("dim");
    run.classList.remove("on");
    note.textContent = noteDefault;
  };
  run.addEventListener("mouseenter", on);
  run.addEventListener("mouseleave", off);
  run.addEventListener("focusin", on);
  run.addEventListener("focusout", off);
});

// ---- 세트로 보기: 필름스트립 ----
document.getElementById("strips").innerHTML = SETS.slice(0, 3).map(s => `
  <article class="proj" id="p-${s.key}">
    <div class="film rise" tabindex="0" aria-label="${s.shop} 카드 5장, 옆으로 넘겨 보기">${[0, 1, 2, 3, 4].map(i => img(s.key, i)).join("")}</div>
    <div class="facts rise" style="--d:80ms">
      <p class="pname">${s.shop} <span>${s.kind}</span></p>
      <p>${s.what}</p>
      <p class="muted">카드 5장 · ${s.time}</p>
      <p class="muted">샘플 작업</p>
    </div>
  </article>`).join("");
// 필름스트립은 두 번째 장이 가운데 오도록 시작
document.querySelectorAll(".film").forEach(f => {
  const second = f.children[1];
  f.scrollLeft = second.offsetLeft - (f.clientWidth - second.clientWidth) / 2;
});

// ---- 우리 가게로 바꿔보기 ----
const tryName = document.getElementById("try-name");
const tryKind = document.getElementById("try-kind");
const tryImg = document.getElementById("try-img");
const tryShop = document.getElementById("try-shop");
const tryCard = document.getElementById("try-card");
const renderTry = () => {
  const s = SETS[+tryKind.value];
  tryShop.textContent = tryName.value.trim() || s.shop;
  tryCard.style.setProperty("--shop", s.color);
  const src = `work/${s.key}-blank.jpg`;
  if (!tryImg.src.endsWith(src)) {
    tryCard.classList.add("swap");
    const next = new Image();
    next.onload = () => { tryImg.src = src; tryImg.alt = `${s.kind} ${s.what} 표지 샘플`; tryCard.classList.remove("swap"); };
    next.src = src;
  }
};
tryName.addEventListener("input", renderTry);
tryKind.addEventListener("change", () => {
  // 이름을 건드리지 않았으면 업종 샘플 이름으로 바꿔준다
  if (SETS.some(s => s.shop === tryName.value)) tryName.value = SETS[+tryKind.value].shop;
  renderTry();
});

// ---- 주문 문의 ----
let plan = "기본";
const planNote = document.getElementById("o-plan-note");
document.querySelectorAll("[data-plan]").forEach(a => a.addEventListener("click", () => {
  plan = a.dataset.plan;
  planNote.textContent = `고른 상품: ${plan}`;
}));
document.getElementById("order-form").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  const shop = f.shop.value.trim();
  const insta = f.insta.value.trim();
  const subject = `[카드뉴스 문의] ${shop} · ${plan}`;
  const body = `가게 이름: ${shop}\n인스타 계정: ${insta || "(없음)"}\n원하는 상품: ${plan}\n\n알리고 싶은 내용:\n`;
  location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
const mail = document.getElementById("mail-link");
mail.href = `mailto:${CONTACT_EMAIL}`;
mail.textContent = CONTACT_EMAIL;

// ---- 사진 띠: 표지들이 천천히 흐른다 (두 번 이어 붙여 끊김 없이) ----
const covers = SETS.flatMap(s => [0, 4].map(i => `<img src="work/${s.key}-${i}.jpg" width="120" height="150" alt="" loading="lazy">`)).join("");
document.getElementById("strip-track").innerHTML = covers + covers;

// ---- 서울 시각 ----
const clock = document.getElementById("clock");
const tick = () => {
  clock.textContent = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "numeric", minute: "2-digit" }).format(new Date());
};
tick();
setInterval(tick, 30000);

// ---- 등장: 제목 → 글 → 그림 순으로 ----
document.querySelectorAll("section h2, .try-text > p, .try-form, .try-card, .row li, .plans, .launch, .answers p, .cells, .t")
  .forEach((el, n) => { el.classList.add("rise"); el.style.setProperty("--d", `${(n % 4) * 75}ms`); });
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".rise").forEach(el => io.observe(el));
