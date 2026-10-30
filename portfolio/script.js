document.documentElement.classList.add("js");

// 문의 메일 주소: 공개 전에 실제 주소로 바꿔야 한다
const CONTACT_EMAIL = "your-email@example.com";

const SETS = [
  { key: "cafe", shop: "오늘의 온도 커피", kind: "카페", what: "가을 한정 메뉴 3가지", time: "제작 40분", color: "#8A5A3B" },
  { key: "nail", shop: "손끝 살롱", kind: "네일숍", what: "11월 시즌 컬러 할인", time: "제작 35분", color: "#7E2F40" },
  { key: "flower", shop: "작은 들꽃", kind: "꽃집", what: "가을 꽃다발 3종 예약", time: "제작 45분", color: "#4F6B43" },
  { key: "bakery", shop: "새벽 오븐", kind: "빵집", what: "빵 나오는 시간표", time: "제작 30분", color: "#26375E" },
  { key: "scent", shop: "my_scent.lab", kind: "향수·공방", what: "향수 오래 남기는 법", time: "제작 40분", color: "#2B2622" }
];
const ROLES = ["표지", "소개 하나", "소개 둘", "소개 셋", "마무리"];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- 1. 우리 가게로 만들어보기 ----
const tryName = document.getElementById("try-name");
const tryImg = document.getElementById("try-img");
const tryShop = document.getElementById("try-shop");
const tryCard = document.getElementById("try-card");
const kindBtns = [...document.querySelectorAll("#try-kinds button")];
let kind = 0;
const renderTry = () => {
  const s = SETS[kind];
  tryShop.textContent = tryName.value.trim() || s.shop;
  tryCard.style.setProperty("--shop", s.color);
  tryCard.style.setProperty("--frame", s.color);
  const src = `work/${s.key}-blank.jpg`;
  if (!tryImg.src.endsWith(src)) {
    tryCard.classList.add("swap");
    const next = new Image();
    next.onload = () => { tryImg.src = src; tryImg.alt = `${s.kind} ${s.what} 표지 샘플`; tryCard.classList.remove("swap"); };
    next.src = src;
  }
};
const pickKind = k => {
  // 이름을 건드리지 않았으면 업종 샘플 이름으로 바꿔준다
  if (SETS.some(s => s.shop === tryName.value)) tryName.value = SETS[k].shop;
  kind = k;
  kindBtns.forEach((b, i) => { b.setAttribute("aria-checked", String(i === k)); b.tabIndex = i === k ? 0 : -1; });
  renderTry();
};
kindBtns.forEach((b, i) => {
  b.addEventListener("click", () => pickKind(i));
  b.addEventListener("keydown", e => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const n = (i + d + kindBtns.length) % kindBtns.length;
    pickKind(n);
    kindBtns[n].focus();
  });
});
kindBtns.forEach((b, i) => { b.tabIndex = i === 0 ? 0 : -1; });
tryName.addEventListener("input", renderTry);

// ---- 2. 다섯 장 세트 ----
const tabs = document.getElementById("set-tabs");
const spread = document.getElementById("spread");
const setNote = document.getElementById("set-note");
tabs.innerHTML = SETS.map((s, i) =>
  `<button type="button" role="tab" id="tab-${s.key}" aria-controls="spread" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${s.kind}</button>`).join("");
const tabBtns = [...tabs.children];
spread.setAttribute("role", "tabpanel");
const showSet = (i, animate = true) => {
  const s = SETS[i];
  tabBtns.forEach((b, j) => { b.setAttribute("aria-selected", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
  spread.setAttribute("aria-labelledby", `tab-${s.key}`);
  const fill = () => {
    spread.innerHTML = ROLES.map((r, n) =>
      `<figure><img src="work/${s.key}-${n}.jpg" width="540" height="675" alt="${s.shop} ${r} 카드" loading="lazy"><figcaption>${r}</figcaption></figure>`).join("");
    setNote.textContent = `${s.shop} · ${s.what} · 카드 5장, ${s.time}`;
    spread.classList.remove("fade");
  };
  if (animate && !reduced) { spread.classList.add("fade"); setTimeout(fill, 220); } else fill();
};
tabBtns.forEach((b, i) => {
  b.addEventListener("click", () => showSet(i));
  b.addEventListener("keydown", e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const n = (i + d + tabBtns.length) % tabBtns.length;
    showSet(n);
    tabBtns[n].focus();
  });
});
showSet(0, false);

// ---- 3. 휴대폰 속 피드: 카페 세트로 채운 3x3 ----
document.getElementById("ig-grid").innerHTML = ["cafe-0", "cafe-1", "cafe-2", "cafe-3", "cafe-4", "cafe-0", "cafe-2", "cafe-4", "cafe-1"]
  .map((f, n) => `<img src="work/${f}.jpg" width="540" height="675" alt="${n === 0 ? "카페 카드뉴스로 채운 피드" : ""}" loading="lazy">`).join("");

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

// ---- 첫 화면 카드: 포인터를 따라 살짝 기운다 ----
const fan = document.getElementById("fan");
if (!reduced && matchMedia("(pointer: fine)").matches) {
  fan.addEventListener("pointermove", e => {
    const r = fan.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    fan.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  });
  fan.addEventListener("pointerleave", () => { fan.style.transform = ""; });
  fan.style.transition = "transform .4s cubic-bezier(.2,.8,.2,1)";
  fan.style.transformStyle = "preserve-3d";
}

// ---- 등장: 제목 → 글 → 그림 순으로 ----
document.querySelectorAll(".prologue, .ch-head > *, .panel, .feats > div, .phone, .plan, .launch, .finale > *")
  .forEach((el, n) => { el.classList.add("rise"); el.style.setProperty("--d", `${(n % 4) * 80}ms`); });
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".rise").forEach(el => io.observe(el));
