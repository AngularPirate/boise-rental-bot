/* Direction B: the quality-gate sorter. All data synthetic and generated here. */
(function () {
  var root = document.getElementById('sorter');
  if (!root) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R = rng(20261010);

  var NAMES = ['Sam', 'Priya', 'Luis', 'Mara', 'Dev', 'Ana', 'Theo', 'Kim', 'Jo', 'Remy', 'Ines', 'Omar', 'Lena', 'Kai', 'Noor', 'Ben'];
  var GOOD = [
    ['Onboarding nudge', 'Hi {n}, you set up your first project yesterday. The next step most teams take is inviting one teammate. Want the two-minute walkthrough?'],
    ['Trial ending', 'Hi {n}, your trial ends Friday. You\'ve built 3 reports so far, and they\'ll stay put if you pick a plan. Questions? Just reply.'],
    ['Win-back', 'Hi {n}, it\'s been a few weeks. Your dashboard still has last month\'s numbers in it. Here\'s a one-click way to refresh them.'],
    ['Feature tip', 'Hi {n}, you export the same report every Monday. Scheduled exports can send it for you. Here\'s how to turn that on.']
  ];
  var BAD = [
    ['Onboarding nudge', 'Hi {n}, great job finishing setup! You\'re now ready to use our AI forecasting module.', 'Invents a feature this customer\'s plan doesn\'t have.'],
    ['Trial ending', 'Hi {n}, your trial ends soon, so here\'s 50% off for life if you upgrade today!', 'Promises a discount nobody approved.'],
    ['Win-back', 'Hi Jordan, we miss you! Come back and see what\'s new.', 'Uses the wrong first name.'],
    ['Feature tip', 'Hi {n}, as a valued enterprise customer with 400 seats...', 'Not grounded in this customer\'s data: they have 4 seats.'],
    ['Trial ending', 'LAST CHANCE {n}!!! Your account will be DELETED unless you act NOW.', 'Off-brand tone, and the claim isn\'t true.']
  ];

  var msgs = [];
  for (var i = 0; i < 200; i++) {
    // two synthetic populations: fine drafts score high, bad drafts score lower, with some overlap
    var bad = R() < 0.2;
    var s = Math.round(Math.min(99, Math.max(3, bad ? 42 + (R() + R() + R() - 1.5) * 24 : 80 + (R() + R() + R() - 1.5) * 26)));
    var n = NAMES[Math.floor(R() * NAMES.length)];
    var t = bad ? BAD[Math.floor(R() * BAD.length)] : GOOD[Math.floor(R() * GOOD.length)];
    msgs.push({ id: i, score: s, bad: bad, type: t[0], body: t[1].replace(/\{n\}/g, n), why: bad ? t[2] : 'Grounded in what this customer actually did, on-voice, no promises.' });
  }
  msgs.sort(function (a, b) { return b.score - a.score; });

  var tiles = {};
  var holders = { send: root.querySelector('[data-bin="send"]'), review: root.querySelector('[data-bin="review"]'), block: root.querySelector('[data-bin="block"]') };
  msgs.forEach(function (m) {
    var el = document.createElement('span');
    el.className = 'tile' + (m.bad ? ' tile--bad' : '');
    el.title = 'Score ' + m.score + (m.bad ? ' · bad' : '');
    el.addEventListener('click', function () { show(m); });
    tiles[m.id] = el;
  });

  var inBlock = document.getElementById('th-block'), inSend = document.getElementById('th-send');
  var outBlock = document.getElementById('out-block'), outSend = document.getElementById('out-send');
  var verdict = document.getElementById('verdict');
  var verdictTimer;

  function binOf(m, lo, hi) { return m.score >= hi ? 'send' : (m.score < lo ? 'block' : 'review'); }

  function update(source) {
    var lo = +inBlock.value, hi = +inSend.value;
    if (lo > hi) { if (source === inBlock) { hi = lo; inSend.value = hi; } else { lo = hi; inBlock.value = lo; } }
    outBlock.textContent = lo;
    outSend.textContent = hi;
    var ctl = root.querySelector('.controls'); ctl.style.setProperty('--lo', lo); ctl.style.setProperty('--hi', hi);

    var first = {};
    if (!reduce) msgs.forEach(function (m) { var r = tiles[m.id].getBoundingClientRect(); first[m.id] = r; });

    var counts = { send: 0, review: 0, block: 0 }, escaped = 0, lost = 0;
    var frag = { send: document.createDocumentFragment(), review: document.createDocumentFragment(), block: document.createDocumentFragment() };
    msgs.forEach(function (m) {
      var b = binOf(m, lo, hi); m.bin = b; counts[b]++;
      if (b === 'send' && m.bad) escaped++;
      if (b === 'block' && !m.bad) lost++;
      frag[b].appendChild(tiles[m.id]);
    });
    Object.keys(holders).forEach(function (k) { holders[k].appendChild(frag[k]); root.querySelector('[data-count="' + k + '"]').textContent = counts[k]; });
    root.querySelector('[data-stat="escaped"]').textContent = escaped;
    root.querySelector('[data-stat="review"]').textContent = counts.review;
    root.querySelector('[data-stat="lost"]').textContent = lost;
    root.querySelector('.meter--bad').classList.toggle('is-hot', escaped > 0);

    if (!reduce && source) {
      msgs.forEach(function (m) {
        var el = tiles[m.id], a = first[m.id], b = el.getBoundingClientRect();
        var dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) {
          el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 520 + (m.id % 7) * 30, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
      });
    }

    var line;
    if (counts.review === 200) line = 'A person reads all 200. Nothing bad gets out, and nothing ships without a human. That doesn\'t scale.';
    else if (escaped === 0 && counts.review <= 60) line = 'Nothing bad goes out unchecked, and a person reads ' + counts.review + ' of 200. That\'s a gate you could stage a rollout behind.';
    else if (escaped === 0) line = 'Nothing bad goes out unchecked, but a person still reads ' + counts.review + ' of 200.';
    else line = escaped + ' bad message' + (escaped === 1 ? '' : 's') + ' would reach customers with no human check' + (counts.review ? ', and a person reads ' + counts.review + '.' : '.');
    clearTimeout(verdictTimer);
    verdictTimer = setTimeout(function () { verdict.textContent = line; }, 250);
  }

  var letter = document.getElementById('letter');
  function show(m) {
    letter.hidden = false;
    document.getElementById('l-score').textContent = 'Score ' + m.score;
    document.getElementById('l-type').textContent = m.type + ' · goes to ' + ({ send: 'auto-send', review: 'human review', block: 'block' })[m.bin];
    var f = document.getElementById('l-flag');
    f.textContent = m.bad ? 'Bad' : 'Fine';
    f.className = 'letter__flag ' + (m.bad ? 'is-bad' : 'is-good');
    document.getElementById('l-body').textContent = m.body;
    document.getElementById('l-why').textContent = m.why;
    letter.classList.remove('is-in'); void letter.offsetWidth; letter.classList.add('is-in');
  }

  root.querySelectorAll('[data-peek]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var bin = btn.getAttribute('data-peek');
      var pool = msgs.filter(function (m) { return m.bin === bin; });
      if (!pool.length) { letter.hidden = false; document.getElementById('l-body').textContent = 'This pile is empty at the current setting.'; document.getElementById('l-score').textContent = ''; document.getElementById('l-type').textContent = ''; document.getElementById('l-flag').textContent = ''; document.getElementById('l-why').textContent = ''; return; }
      // in auto-send, surface an escaped bad message when there is one
      var bads = pool.filter(function (m) { return m.bad; });
      var pick = (bin === 'send' && bads.length && R() < 0.6) ? bads[Math.floor(R() * bads.length)] : pool[Math.floor(R() * pool.length)];
      show(pick);
    });
  });

  inBlock.addEventListener('input', function () { update(inBlock); });
  inSend.addEventListener('input', function () { update(inSend); });
  root.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-preset').split(',');
      inBlock.value = v[0]; inSend.value = v[1];
      update(b);
    });
  });
  update(null);
})();
