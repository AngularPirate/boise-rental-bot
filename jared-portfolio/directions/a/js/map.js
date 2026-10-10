/* Direction A: procedural contour map + workflow route. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var W = 800, H = 560;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var STAGES = [
    { id: 'discover', name: 'Discover', short: 'Interviews', x: 90, y: 400, elev: 'Trailhead',
      me: 'I lead 1:1 interviews with clients and coaches, drawn from a 600+ client panel I stratified by tier, tenure, and engagement.',
      ai: 'Skills prep the interview guide and score each call against the same rubric, so a second PM runs interviews at the same quality.',
      human: 'I run the conversation and make the synthesis calls. The repository is shared and queryable, not notes in my head.',
      proof: 'Feeds a research repository the product org uses for roadmap decisions.' },
    { id: 'sketch', name: 'Sketch', short: 'Design', x: 215, y: 250, elev: 'First climb',
      me: "I'm the team's designer. I maintain the production design system and prototype against real data instead of lorem ipsum.",
      ai: 'AI design tools and Claude Code get a working HTML or React prototype running on real data, fast.',
      human: 'Every design goes through a structured critique scored against a rubric before it moves on.',
      proof: 'Designs carried through to shipped UI, not handed off as static files.' },
    { id: 'spec', name: 'Spec', short: 'Decisions', x: 360, y: 150, elev: 'Ridge',
      me: 'I write the spec and the data model behind it, including the edge cases nobody wants to talk about yet.',
      ai: 'A spec skill turns interview notes and constraints into a first draft I then argue with.',
      human: 'Contested decisions get settled with engineering before the build, not during it.',
      proof: 'Unified progress model: four data sources, an eight-segment taxonomy, 12 decisions locked before kickoff.' },
    { id: 'data', name: 'Data', short: 'SQL', x: 500, y: 255, elev: 'Survey point',
      me: 'I query production PostgreSQL myself to size opportunities, pressure-test specs, and audit releases.',
      ai: 'Agents help me write and sanity-check queries and summarize what comes back.',
      human: 'I validate the math end to end against real clients before anyone builds on it.',
      proof: 'Read 54,000+ AI outputs across 3,400+ clients before a launch call.' },
    { id: 'pr', name: 'Pull request', short: 'Code', x: 610, y: 120, elev: 'Summit push',
      me: 'I build UI changes locally against the QA environment and open the pull request myself.',
      ai: 'I build the change with Claude Code and check it against QA before it reaches an engineer.',
      human: 'Engineers review, merge, and ship under the same branch, ticket, and review standards as everyone else.',
      proof: 'Daily work with two tech leads and an eight-person engineering team, continuous delivery.' },
    { id: 'ship', name: 'Ship', short: 'Launch', x: 720, y: 330, elev: 'Summit',
      me: 'I own the launch: release notes, guides for coaches and clients, in-app guidance, and the live demo.',
      ai: 'Release and reporting skills draft the comms and the post-launch readout from the same source of truth.',
      human: 'I present releases live to 150+ coaches and to cross-functional leadership.',
      proof: 'Shipped an in-product AI coaching assistant: 100–120 daily users, peak 223, 20–30+ minute sessions.' }
  ];

  /* Height field: a few soft hills, deterministic. */
  var HILLS = [
    [370, 140, 150, 1.0], [620, 110, 120, 0.9], [210, 240, 110, 0.65], [720, 330, 90, 0.55],
    [480, 300, 130, 0.5], [120, 120, 140, 0.45], [300, 420, 160, 0.3], [600, 470, 120, 0.25]
  ];
  function height(x, y) {
    var h = 0;
    for (var i = 0; i < HILLS.length; i++) {
      var dx = x - HILLS[i][0], dy = y - HILLS[i][1], s = HILLS[i][2];
      h += HILLS[i][3] * Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
    }
    return h + 0.02 * Math.sin(x / 37) * Math.cos(y / 29);
  }

  function contours() {
    var g = document.getElementById('contours');
    if (!g) return;
    var step = 10, cols = W / step + 1, rows = H / step + 1, field = [];
    for (var j = 0; j < rows; j++) { field[j] = []; for (var i = 0; i < cols; i++) field[j][i] = height(i * step, j * step); }
    var levels = 22, lo = 0.05, hi = 1.15;
    for (var k = 0; k < levels; k++) {
      var t = lo + (hi - lo) * k / levels, d = '';
      for (var r = 0; r < rows - 1; r++) for (var c = 0; c < cols - 1; c++) {
        var a = field[r][c], b = field[r][c + 1], cc = field[r + 1][c + 1], dd = field[r + 1][c];
        var x = c * step, y = r * step, pts = [];
        if ((a < t) !== (b < t)) pts.push([x + step * (t - a) / (b - a), y]);
        if ((b < t) !== (cc < t)) pts.push([x + step, y + step * (t - b) / (cc - b)]);
        if ((dd < t) !== (cc < t)) pts.push([x + step * (t - dd) / (cc - dd), y + step]);
        if ((a < t) !== (dd < t)) pts.push([x, y + step * (t - a) / (dd - a)]);
        if (pts.length >= 2) d += 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1) + 'L' + pts[1][0].toFixed(1) + ' ' + pts[1][1].toFixed(1);
        if (pts.length === 4) d += 'M' + pts[2][0].toFixed(1) + ' ' + pts[2][1].toFixed(1) + 'L' + pts[3][0].toFixed(1) + ' ' + pts[3][1].toFixed(1);
      }
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      if (k % 5 === 0) p.setAttribute('class', 'index');
      g.appendChild(p);
    }
  }

  function routePath() {
    var p = STAGES.map(function (s) { return [s.x, s.y]; });
    var d = 'M' + p[0][0] + ' ' + p[0][1];
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + c1.join(' ') + ',' + c2.join(' ') + ',' + p2.join(' ');
    }
    return d;
  }

  var current = 0, buttons = [], marks = [];

  function render(i, focus) {
    current = i;
    var s = STAGES[i];
    buttons.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
    marks.forEach(function (m, k) { m.classList.toggle('is-active', k === i); });
    var n = document.getElementById('notes');
    n.innerHTML =
      '<div class="notes__head"><h3 class="notes__title">' + s.name + '</h3><span class="notes__elev">Waypoint ' + (i + 1) + ' of ' + STAGES.length + ' · ' + s.elev + '</span></div>' +
      '<div class="notes__grid"><div><h4>What I do</h4><p>' + s.me + '</p></div>' +
      '<div><h4>Where AI helps</h4><p>' + s.ai + '</p></div>' +
      '<div><h4>Where a human checks</h4><p>' + s.human + '</p></div></div>' +
      '<p class="notes__evidence">' + s.proof + '</p>';
    if (!reduce) { n.classList.remove('is-fresh'); void n.offsetWidth; n.classList.add('is-fresh'); }
    if (focus) buttons[i].focus();
  }

  function build() {
    contours();
    var d = routePath();
    var route = document.getElementById('route-path');
    document.getElementById('route-shadow').setAttribute('d', d);
    route.setAttribute('d', d);
    if (!reduce && route.getTotalLength) {
      var len = Math.ceil(route.getTotalLength());
      route.style.setProperty('--len', len);
      route.style.strokeDasharray = len;
      route.classList.add('is-drawing');
      route.addEventListener('animationend', function () { route.style.strokeDasharray = ''; route.classList.remove('is-drawing'); }, { once: true });
    }

    var wg = document.getElementById('waypoints');
    var list = document.getElementById('waylist');
    STAGES.forEach(function (s, i) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'wp');
      g.setAttribute('aria-hidden', 'true');
      var tri = document.createElementNS(NS, 'path');
      tri.setAttribute('class', 'wp__mark');
      tri.setAttribute('d', 'M' + s.x + ' ' + (s.y - 13) + 'l12 21h-24z');
      var label = document.createElementNS(NS, 'text');
      label.setAttribute('class', 'wp__label');
      var right = s.x < 680;
      label.setAttribute('x', right ? s.x + 18 : s.x - 18);
      label.setAttribute('y', s.y - 14);
      label.setAttribute('text-anchor', right ? 'start' : 'end');
      label.textContent = s.name;
      g.appendChild(tri); g.appendChild(label);
      g.addEventListener('click', function () { render(i, false); });
      wg.appendChild(g);
      marks.push(g);

      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'waybtn';
      b.innerHTML = s.name + '<small>' + s.short + '</small>';
      b.addEventListener('click', function () { render(i, false); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % STAGES.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + STAGES.length) % STAGES.length;
        if (k === 'Home') n = 0;
        if (k === 'End') n = STAGES.length - 1;
        if (n !== null) { e.preventDefault(); render(n, true); }
      });
      li.appendChild(b);
      list.appendChild(li);
      buttons.push(b);
    });
    render(0, false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
