/* ═══════════════════════════════════════════════════
   myHQ Training Platform — Interactions
   Shared across all chapters
   ═══════════════════════════════════════════════════ */

/* ── 2030 AMBITION CHART ─────────────────────────────────────────
   Animates bars on open, draws mint growth curve.
   ────────────────────────────────────────────────────────────── */
function initAmbitionChart() {
  const chart = document.getElementById('ambitionChart');
  if (!chart || chart.dataset.ready) return;
  chart.dataset.ready = '1';

  const MAX_VAL  = 5000;
  const cols     = chart.querySelectorAll('.ab-col');
  const barsArea = chart.querySelector('.ab-bars');
  const svg      = document.getElementById('ambitionCurve');

  // Animate bars up after a short delay
  cols.forEach((col, i) => {
    const val  = parseInt(col.dataset.val || 0);
    const pct  = val / MAX_VAL;                   // 0–1 fraction of max
    const barH = pct * 220;                        // 220px = max bar height
    const bar  = col.querySelector('.ab-bar');
    if (bar) setTimeout(() => { bar.style.height = Math.max(barH, val > 0 ? 3 : 0) + 'px'; }, 60 + i * 40);
  });

  // Draw mint growth curve after bars finish rising
  setTimeout(() => {
    if (!barsArea || !svg) return;
    const areaW = barsArea.offsetWidth;
    const areaH = barsArea.offsetHeight;

    svg.setAttribute('viewBox', `0 0 ${areaW} ${areaH}`);

    // Build data points — one per col, x = center of column
    const colArr  = Array.from(cols);
    const colW    = areaW / colArr.length;
    const padBot  = 28; // height of x-axis label area

    const pts = colArr.map((col, i) => {
      const val  = parseInt(col.dataset.val || 0);
      const barH = (val / MAX_VAL) * 220;
      const x    = colW * i + colW / 2;
      const y    = (areaH - padBot) - barH;
      return { x, y };
    });

    // Smooth cubic bezier through all points
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx  = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#ADDFB3');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    // Animate the curve drawing itself
    const len = 2000; // safe estimate
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    path.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)';
    svg.appendChild(path);
    requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
  }, 400);
}

// Hook into the timeline toggle for the ambition card
document.addEventListener('DOMContentLoaded', () => {
  const ambitionArticle = document.querySelector('.tl-item.ambition');
  if (!ambitionArticle) return;
  const toggle = ambitionArticle.querySelector('.tl-toggle');
  if (toggle) toggle.addEventListener('click', () => setTimeout(initAmbitionChart, 120));
});


/* ─── Scroll progress bar ─── */
function updateScrollProgress() {
  const sp = document.getElementById('scrollProgress');
  if (!sp) return;
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (scrolled / max) * 100 : 0;
  sp.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ─── Hero cursor glow ─── */
const heroGlow = document.getElementById('heroGlow');
const hero = document.querySelector('.hero');
if (hero && heroGlow) {
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    heroGlow.style.left = (e.clientX - r.left) + 'px';
    heroGlow.style.top  = (e.clientY - r.top)  + 'px';
  });
}

/* ─── Hero "lit" underline timing ─── */
setTimeout(() => {
  const blue = document.getElementById('heroBlue');
  if (blue) blue.classList.add('lit');
}, 800);

/* ─── Magnetic CTA button ─── */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ─── Reveal-on-scroll ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Number count-up on scroll into view ─── */
const counters = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });
counters.forEach(c => countObserver.observe(c));

/* ─── TIMELINE expand/collapse ─── */
const tlItems = document.querySelectorAll('.tl-item');
tlItems.forEach(item => {
  const head = item.querySelector('.tl-head');
  head.addEventListener('click', () => {
    const wasActive = item.classList.contains('active');
    tlItems.forEach(i => i.classList.remove('active'));
    if (!wasActive) {
      item.classList.add('active');
      if (item.classList.contains('ambition')) setTimeout(initAmbitionChart, 120);
    }
    setTimeout(updateRail, 80);
  });
});

function updateRail() {
  const fill = document.getElementById('railFill');
  const track = document.getElementById('track');
  if (!fill || !track) return;
  const active = track.querySelector('.tl-item.active');
  if (!active) { fill.style.height = '0%'; return; }
  const trackRect = track.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const pct = ((activeRect.bottom - trackRect.top) / trackRect.height) * 100;
  fill.style.height = Math.min(100, Math.max(0, pct)) + '%';
}

window.addEventListener('resize', updateRail);

/* ─── DYK toggle ─── */
const revealedDyks = new Set();
function toggleDyk(btn, ev) {
  if (ev) ev.stopPropagation();
  const wrap = btn.closest('.tl-dyk');
  if (!wrap) return;
  wrap.classList.toggle('open');
  if (wrap.classList.contains('open')) {
    revealedDyks.add(wrap.dataset.dykId);
  }
  if (revealedDyks.size >= 3) markChapterComplete();
}

let chapterMarked = false;
function markChapterComplete() {
  if (chapterMarked) return;
  chapterMarked = true;
  try { localStorage.setItem('myhq_ch2_complete','true'); } catch (e) {}
}

/* ─── Smooth scroll for nav pills ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (a.classList.contains('nav-pill')) {
      document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
      a.classList.add('active');
    }
  });
});

/* ─── Person card flip ─── */
function flipPerson(card, ev) {
  if (ev) ev.stopPropagation();
  if (!card) return;
  if (ev && ev.target.closest('.person-rear-btn, .person-rear-flip-back')) return;
  card.classList.toggle('flipped');
}

/* ─── Person card subtle tilt on mouse move ─── */
document.querySelectorAll('.person-card').forEach(card => {
  const face = card.querySelector('.person-face');
  if (!face) return;
  card.addEventListener('mousemove', e => {
    if (card.classList.contains('flipped')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    face.style.transform = `translateY(-3px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    face.style.transform = '';
  });
});

/* ═══════════════════════════════════════════
   VERTICAL OVERVIEW MODAL DATA
   ═══════════════════════════════════════════ */
const verticalData = {
  am: {
    cls: 'am',
    eyebrow: 'Vertical · Assisted Marketplace',
    title: 'Assisted Marketplace',
    tagline: 'Full-service advisory for businesses finding managed office space — end to end.',
    sections: [
      { label: 'What it is', html: '<p>The flagship enterprise vertical. AM is a <strong>high-touch advisory</strong> service: clients tell us their requirements, we shortlist spaces, run site visits, negotiate commercials, and close the deal. The client gets a free advisor; the operator pays us a brokerage on signed deals.</p>' },
      { label: 'Who it serves', html: '<p>Companies looking for managed offices — typically <strong>20 seats and above.</strong> Decision makers range from founders &amp; HR heads at startups to CFOs &amp; admin leads at mid-market enterprises.</p>' },
      { label: 'How myHQ wins', html: '<p>Real-time supply visibility, transparent pricing, and a sales team that actually knows the market. Operators get qualified demand; clients get an honest broker. That dual-sided trust is the moat.</p>' },
      { label: 'At a glance', html: '<div class="v-modal-stats"><div class="v-modal-stat"><div class="v-modal-stat-label">Deal range</div><div class="v-modal-stat-value">20–500+ seats</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Lock-in</div><div class="v-modal-stat-value">Typically 1–3 yrs</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Client cost</div><div class="v-modal-stat-value">Free</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Revenue model</div><div class="v-modal-stat-value">Operator brokerage</div></div></div>' }
    ]
  },
  vo: {
    cls: 'vo',
    eyebrow: 'Vertical · Virtual Office',
    title: 'Virtual Office',
    tagline: 'A registered business address, GST registration, and compliance — without the office.',
    sections: [
      { label: 'What it is', html: '<p>A productised vertical that gives businesses a <strong>verified business address</strong> they can use for company registration, GST filing, and statutory communication — without leasing physical space.</p>' },
      { label: 'Who it serves', html: '<p>Founders incorporating in a new state. Companies expanding into states without a physical office. Solopreneurs and digital-first businesses that need an address but no desk.</p>' },
      { label: 'Why it grew', html: '<p>VO started as a Shopify-based product. It became a real product line because the demand was relentless — every state expansion any company does in India needs an address. myHQ turned a paperwork problem into a subscription product.</p>' },
      { label: 'At a glance', html: '<div class="v-modal-stats"><div class="v-modal-stat"><div class="v-modal-stat-label">Use case</div><div class="v-modal-stat-value">Business address + GST</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Tenure</div><div class="v-modal-stat-value">Subscription</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">States covered</div><div class="v-modal-stat-value">Pan-India</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Decision time</div><div class="v-modal-stat-value">Days, not weeks</div></div></div>' }
    ]
  },
  od: {
    cls: 'od',
    eyebrow: 'Vertical · On Demand',
    title: 'On Demand',
    tagline: 'The original myHQ model — flexible workspace, bookable by the day or hour.',
    sections: [
      { label: 'What it is', html: '<p>The product that started it all. On Demand lets professionals and small teams book <strong>day passes, meeting rooms, and event spaces</strong> across myHQ\'s coworking inventory — pay for what you use, no commitments.</p>' },
      { label: 'Who it serves', html: '<p>Freelancers, hybrid teams, travelling professionals, and small companies that don\'t need a fixed office. Also occasional users — meetings, interviews, off-sites, workshops.</p>' },
      { label: 'Why it matters', html: '<p>OD is the <strong>brand storefront.</strong> It\'s how professionals first discover myHQ. Many of those individual users later become decision-makers in companies that buy AM. The funnel runs through OD.</p>' },
      { label: 'At a glance', html: '<div class="v-modal-stats"><div class="v-modal-stat"><div class="v-modal-stat-label">Booking unit</div><div class="v-modal-stat-value">Day / hour</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Lock-in</div><div class="v-modal-stat-value">Zero</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Inventory</div><div class="v-modal-stat-value">50K+ seats</div></div><div class="v-modal-stat"><div class="v-modal-stat-label">Revenue model</div><div class="v-modal-stat-value">Per-booking margin</div></div></div>' }
    ]
  }
};

function openVerticalModal(key, ev) {
  if (ev) ev.stopPropagation();
  const v = verticalData[key];
  if (!v) return;
  const overlay = document.getElementById('verticalModalOverlay');
  const box = document.getElementById('verticalModalBox');
  const sectionsHTML = v.sections.map(s =>
    `<div class="v-modal-section"><div class="v-modal-section-label">${s.label}</div>${s.html}</div>`
  ).join('');
  box.innerHTML = `
    <div class="v-modal-header ${v.cls}">
      <button class="modal-close" onclick="closeVerticalModal()" aria-label="Close">
        <svg viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="v-modal-eyebrow">${v.eyebrow}</div>
      <div class="v-modal-title">${v.title}</div>
      <div class="v-modal-tagline">${v.tagline}</div>
    </div>
    <div class="v-modal-body">${sectionsHTML}</div>
    <div class="v-modal-footer">
      <span class="v-modal-footer-icon"><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
      <span>Each vertical is covered in depth in <strong>Chapter 03 — Products &amp; Business Model.</strong></span>
    </div>
  `;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVerticalModal() {
  document.getElementById('verticalModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeVerticalModalOnBg(e) {
  if (e.target === document.getElementById('verticalModalOverlay')) closeVerticalModal();
}

/* ═══════════════════════════════════════════
   TEAM MODAL DATA
   ═══════════════════════════════════════════ */
const team = {
  utkarsh: {
    initials:'UK', name:'Utkarsh Kawatra', role:'Co-Founder & CEO',
    gradient:'linear-gradient(135deg, #1E22AA 0%, #676BE4 100%)',
    bio:'Utkarsh co-founded myHQ in 2016 with one stubborn belief: professionals deserve the freedom to work from anywhere — at the cost of a coffee. He spent time at Helion Ventures before returning to that founding conviction. While still at IIT Delhi, he also co-founded BloodConnect, an NGO now operating across 10+ cities with a 300+ person volunteer team.',
    anecdote:{text:'The first myHQ "office" was a café in Delhi that sat empty before noon. Utkarsh and Vinayak turned it into a coworking space — and charged professionals a day-pass. The café became proof of concept.',img:null},
    quote:'We started with a café that had empty seats during the day. That was our first office. Everything came from that insight.',
    facts:[{label:'Before myHQ',value:'Helion Ventures'},{label:'Founded',value:'myHQ (2016) + BloodConnect NGO (2010)'},{label:'NGO Impact',value:'BloodConnect — 300+ team, 10+ cities'},{label:'Role',value:'Co-Founder & CEO'}],
    tags:['Entrepreneurship','Business Strategy','Leadership','Angel Investor'],
    linkedin:'https://www.linkedin.com/in/utkarshkawatra/'
  },
  vinayak: {
    initials:'VA', name:'Vinayak Aggarwal', role:'Co-Founder & CTO',
    gradient:'linear-gradient(135deg, #1E22AA 0%, #676BE4 100%)',
    bio:'Vinayak leads product, technology, and marketing at myHQ. Before co-founding myHQ, he worked at Goldman Sachs as a Quant & Algorithmic Trading Strategist. He holds two patents in Machine Learning and Computer Vision.',
    anecdote:{text:'Vinayak and Utkarsh bonded over long Bengaluru commutes and dinner outings in 2015 — before either of them had quit their jobs. By the time they launched myHQ, they\'d stress-tested every version of the idea across a dozen restaurants.',img:null},
    quote:'The bond between us grew during long Bangalore traffic jams and dinner outings in 2015. That\'s where myHQ was really born.',
    facts:[{label:'Before myHQ',value:'Goldman Sachs (Quant Trading), Adobe'},{label:'Inventions',value:'2 Patents — ML & Computer Vision'},{label:'Role',value:'Co-Founder & CTO'},{label:'Focus',value:'Product, Technology, Marketing'}],
    tags:['Product','Technology','Marketing','Machine Learning','Algorithms'],
    linkedin:'https://www.linkedin.com/in/vinayak-agrawal-b2003958/'
  },
  manoj: {
    initials:'MY', name:'Manoj Kumar Yadav', role:'PnL Head — Sales',
    gradient:'linear-gradient(135deg, #1E22AA 0%, #676BE4 100%)',
    bio:'Manoj leads Sales at myHQ with 7+ years of deep experience in real estate. He started his entrepreneurial journey by co-founding SchoolLog before pivoting into commercial real estate. At myHQ, Manoj leads the end-to-end sales function.',
    anecdote:{text:'Manoj went from building a school management product to selling flexible workspaces at national scale. Two completely different worlds — connected by the same instinct: find a problem, then solve it relentlessly.',img:null},
    quote:'Real estate moves on relationships and trust. That hasn\'t changed. What\'s changed is the product — and ours is the best.',
    facts:[{label:'Before myHQ',value:'Co-founder, SchoolLog'},{label:'Experience',value:'7+ years in Real Estate'},{label:'Role',value:'PnL Head — Sales'},{label:'Focus',value:'End-to-end enterprise sales'}],
    tags:['Sales','Real Estate','Enterprise','Deal Structuring'],
    linkedin:'https://www.linkedin.com/in/manoj-yadav-b46056119/'
  },
  nitin: {
    initials:'NA', name:'Nitin Agarwal', role:'PnL Head — Virtual Office',
    gradient:'linear-gradient(135deg, #1E22AA 0%, #676BE4 100%)',
    bio:'Nitin leads Virtual Office at myHQ — one of the platform\'s fastest-growing product lines — and is a key driver of myHQ\'s international expansion through myhqspaces.com. Before myHQ he co-founded Paavan (a spiritual wellness app) and YoloBus (intercity bus ticketing).',
    anecdote:{text:'Nitin built Paavan and YoloBus before landing at myHQ. From spiritual journeys to intercity travel to flexible workspaces: a founder who genuinely doesn\'t fear the pivot.',img:null},
    quote:'Every company I built before myHQ taught me something different. Here, I get to use all of it.',
    facts:[{label:'Past Ventures',value:'Paavan (wellness), YoloBus (bus ticketing)'},{label:'Role',value:'PnL Head — Virtual Office'},{label:'Also Leading',value:'International — myhqspaces.com'},{label:'Focus',value:'Virtual Office product'}],
    tags:['Virtual Office','International','Product','Growth'],
    linkedin:'https://www.linkedin.com/in/nitinagrawal1207/'
  },
  judhajit: {
    initials:'JB', name:'Judhajit Bal', role:'PnL Head — Growth',
    gradient:'linear-gradient(135deg, #1E22AA 0%, #676BE4 100%)',
    bio:'Judhajit heads Growth at myHQ and is leading international expansion through myhqspaces.com. He brings blue-chip corporate experience (Coca-Cola) and founder-level hustle: he co-founded Maidaan, a sports-tech venture, before taking Growth at myHQ.',
    anecdote:{text:'Judhajit went from marketing Coca-Cola to building Maidaan, a sports-tech startup, before taking Growth at myHQ. Few leaders have navigated such different arenas with the same confidence.',img:null},
    quote:'Growth isn\'t a department — it\'s a mindset. Every team at myHQ owns a piece of it.',
    facts:[{label:'Past Ventures',value:'Maidaan (sports-tech startup)'},{label:'Corporate',value:'Coca-Cola India'},{label:'Role',value:'PnL Head — Growth'},{label:'Also Leading',value:'International — myhqspaces.com'}],
    tags:['Growth','International','Brand','Strategy'],
    linkedin:'https://www.linkedin.com/in/judhajit-bal-b9813296/'
  },
  malvika: {
    initials:'MS', name:'Malvika Sankrityayan', role:'Marketing Head',
    gradient:'linear-gradient(135deg, #1E22AA 0%, #676BE4 100%)',
    bio:'Malvika leads Marketing at myHQ. She joins with 5+ years of experience in real estate marketing and a background that runs through two demanding brand environments — Accredian and S&P. NMIMS-trained, she\'s now driving brand, demand, and lifecycle marketing across the myHQ stack.',
    anecdote:{text:'Two of the most credibility-heavy brands you can work for in marketing — S&P and Accredian — and now she\'s building the brand engine for India\'s fastest-growing CRE platform.',img:null},
    quote:'Marketing in real estate isn\'t about flash. It\'s about earning trust at scale — and then doing it again.',
    facts:[{label:'Before myHQ',value:'Accredian, S&P'},{label:'Education',value:'NMIMS'},{label:'Experience',value:'5+ years in Real Estate'},{label:'Role',value:'Marketing Head'}],
    tags:['Marketing','Brand','Lifecycle','Real Estate'],
    linkedin:'https://www.linkedin.com/in/malvika-sankrityayan/'
  }
};

function openModal(key) {
  const f = team[key];
  if (!f) return;
  document.getElementById('modalAvatar').textContent = f.initials;
  document.getElementById('modalAvatar').style.background = f.gradient;
  document.getElementById('modalName').textContent = f.name;
  document.getElementById('modalRole').textContent = f.role;
  const factsHTML = f.facts.map(fc=>`<div class="fact-item"><div class="fact-label">${fc.label}</div><div class="fact-value">${fc.value}</div></div>`).join('');
  const tagsHTML  = f.tags.map(t=>`<span class="modal-tag">${t}</span>`).join('');
  const anecHTML  = f.anecdote ? `<div class="modal-section-title">Behind the scenes</div><div class="modal-anecdote">${f.anecdote.img ? `<img class="anecdote-img" src="${f.anecdote.img}" alt="">` : ''}<div class="anecdote-text">${f.anecdote.text}</div></div>` : '';
  const liHTML    = f.linkedin && f.linkedin!=='#' ? `<a class="modal-linkedin" href="${f.linkedin}" target="_blank"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>View on LinkedIn</a>` : '';
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-section-title">About</div>
    <div class="modal-bio">${f.bio}</div>
    ${anecHTML}
    <div class="modal-section-title">Background</div>
    <div class="modal-facts">${factsHTML}</div>
    <div class="modal-section-title">Skills</div>
    <div class="modal-tags">${tagsHTML}</div>
    <div class="modal-section-title">In their own words</div>
    <div class="modal-quote">${f.quote}</div>
    <div class="modal-section-title">Fun fact</div>
    <div class="modal-fun-fact"><div class="modal-fun-fact-label">Coming soon</div><div class="modal-placeholder-fact">A fun fact about ${f.name.split(' ')[0]} will be added here shortly.</div></div>
    ${liHTML}
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOnBg(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeVerticalModal(); }
});

/* ─── Section observer: update nav active pill as user scrolls ─── */
const sections = [
  { id: 's-timeline', pill: 'Timeline' },
  { id: 's-team',     pill: 'Team' },
  { id: 's-org',      pill: 'Quiz' }
];
const navPills = Array.from(document.querySelectorAll('.nav-pill'));
function findPill(label) {
  return navPills.find(p => p.textContent.trim() === label);
}
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const match = sections.find(s => s.id === entry.target.id);
      if (!match) return;
      navPills.forEach(p => { if (!p.classList.contains('hub')) p.classList.remove('active'); });
      const pill = findPill(match.pill);
      if (pill) pill.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(s => {
  const el = document.getElementById(s.id);
  if (el) navObserver.observe(el);
});

/* ─── Init ─── */
updateScrollProgress();
updateRail();
