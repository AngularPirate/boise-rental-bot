/* Direction C: operator's console. A filterable combobox over a representative slice of skills, plus site commands. */
(function () {
  var SKILLS = [
    { name: 'interview-guide', stage: 'Discovery', does: 'Drafts an interview guide from the research theme and the participant\'s segment.', io: 'research theme + segment → question set', human: 'I cut and reorder; I run the call.' },
    { name: 'call-scorer', stage: 'Discovery', does: 'Scores a finished interview against a shared rubric so two interviewers stay consistent.', io: 'call notes → rubric scores + gaps', human: 'Scores are a prompt for review, not a verdict.' },
    { name: 'panel-sampler', stage: 'Discovery', does: 'Proposes a stratified interview sample by tier, tenure, and engagement.', io: 'panel export → balanced shortlist', human: 'I check the mix before invites go out.' },
    { name: 'theme-synthesis', stage: 'Discovery', does: 'Clusters findings across interviews into themes with supporting quotes.', io: 'interview notes → themes + evidence', human: 'I decide which themes matter for the roadmap.' },
    { name: 'prd-from-notes', stage: 'Spec', does: 'Turns interview notes and constraints into a first-draft PRD.', io: 'notes + constraints → PRD draft', human: 'The draft is where the argument starts, not ends.' },
    { name: 'edge-case-hunter', stage: 'Spec', does: 'Walks a spec looking for missing states, odd data, and unhandled paths.', io: 'spec → list of edge cases', human: 'I decide which ones the build must handle.' },
    { name: 'decision-log', stage: 'Spec', does: 'Keeps open questions, options, and the decision with its reason in one place.', io: 'thread → question · options · decision · why', human: 'Decisions are made with engineering, then logged.' },
    { name: 'critique-rubric', stage: 'Design', does: 'Runs a structured design critique against a scored rubric.', io: 'design + goals → scored critique', human: 'The team discusses; the score starts the conversation.' },
    { name: 'prototype-on-real-data', stage: 'Design', does: 'Scaffolds an HTML or React prototype wired to realistic data shapes.', io: 'design + sample data → clickable prototype', human: 'I check it against real cases before showing anyone.' },
    { name: 'sql-sanity-check', stage: 'Data', does: 'Reviews a query for joins, filters, and counts that could quietly lie.', io: 'query → risks + suggested checks', human: 'I validate results against known clients.' },
    { name: 'sizing-query', stage: 'Data', does: 'Helps size an opportunity from production data before it reaches the roadmap.', io: 'question → query + summary', human: 'I own the number I present.' },
    { name: 'release-audit', stage: 'Data', does: 'Compares what shipped against what the spec promised, using production data.', io: 'spec + data → audit notes', human: 'Findings go back to the team, by me.' },
    { name: 'qa-plan-from-spec', stage: 'QA', does: 'Builds a QA plan from the spec: paths, states, and data to test with.', io: 'spec → test plan', human: 'Engineering and I agree on the plan before testing.' },
    { name: 'release-notes', stage: 'Release', does: 'Drafts release notes for each audience from the same source of truth.', io: 'merged changes → notes by audience', human: 'I edit for voice and accuracy.' },
    { name: 'enablement-pack', stage: 'Release', does: 'Drafts the deck, coach and client guides, and in-app guidance for a launch.', io: 'feature + audience → enablement drafts', human: 'I present it live.' },
    { name: 'launch-readout', stage: 'Reporting', does: 'Summarizes post-launch usage into a short readout for leadership.', io: 'metrics → readout draft', human: 'I check every figure before it goes out.' },
    { name: 'onboarding-guide', stage: 'Reporting', does: 'Walks a new teammate through the whole system so they can run it alone.', io: 'skills library → guided onboarding', human: 'A second team member now runs it without me.' }
  ];
  var COMMANDS = [
    { name: '/work', does: 'Jump to selected work.', href: '#work' },
    { name: '/case', does: 'Open the quality-gate story.', href: 'case-quality-gate.html' },
    { name: '/how', does: 'Jump to how I work.', href: '#how' },
    { name: '/experience', does: 'Jump to experience.', href: '#experience' },
    { name: '/building', does: 'Jump to what I\'m building.', href: '#building' },
    { name: '/contact', does: 'Jump to contact.', href: '#contact' },
    { name: '/email', does: 'Write to jaredbrodd@gmail.com.', href: 'mailto:jaredbrodd@gmail.com' }
  ];

  var input = document.getElementById('cmd');
  var list = document.getElementById('cmd-list');
  var detail = document.getElementById('cmd-detail');
  var count = document.getElementById('cmd-count');
  if (!input) return;
  var items = [], active = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function filter() {
    var q = input.value.trim().toLowerCase();
    if (q.charAt(0) === '/') {
      items = COMMANDS.filter(function (c) { return c.name.indexOf(q) === 0 || q === '/'; }).map(function (c) { return { kind: 'cmd', d: c }; });
    } else {
      items = SKILLS.filter(function (s) { return !q || (s.name + ' ' + s.stage + ' ' + s.does).toLowerCase().indexOf(q) !== -1; }).map(function (s) { return { kind: 'skill', d: s }; });
    }
    active = 0;
    render();
  }

  function render() {
    list.innerHTML = '';
    var lastStage = null;
    items.forEach(function (it, i) {
      if (it.kind === 'skill' && it.d.stage !== lastStage) {
        lastStage = it.d.stage;
        var g = document.createElement('li');
        g.className = 'console__group'; g.setAttribute('role', 'presentation'); g.textContent = lastStage;
        list.appendChild(g);
      }
      var li = document.createElement('li');
      li.id = 'opt-' + i;
      li.setAttribute('role', 'option');
      li.className = 'console__opt';
      li.setAttribute('aria-selected', i === active ? 'true' : 'false');
      li.innerHTML = '<span class="console__name">' + esc(it.d.name) + '</span><span class="console__desc">' + esc(it.d.does) + '</span>';
      li.addEventListener('mousedown', function (e) { e.preventDefault(); });
      li.addEventListener('click', function () { active = i; render(); run(); });
      list.appendChild(li);
    });
    if (!items.length) {
      var none = document.createElement('li');
      none.className = 'console__none'; none.setAttribute('role', 'presentation');
      none.textContent = input.value.trim().charAt(0) === '/' ? 'No such command. Try /work, /case, /contact.' : 'Nothing matches. Try "spec", "sql", or "release".';
      list.appendChild(none);
    }
    input.setAttribute('aria-activedescendant', items.length ? 'opt-' + active : '');
    count.textContent = items.length + (items.length === 1 ? ' result' : ' results');
    var el = document.getElementById('opt-' + active);
    if (el) el.scrollIntoView({ block: 'nearest' });
    show();
  }

  function show() {
    var it = items[active];
    if (!it) { detail.innerHTML = ''; return; }
    if (it.kind === 'cmd') {
      detail.innerHTML = '<p class="console__dname">' + esc(it.d.name) + '</p><p>' + esc(it.d.does) + '</p><p class="console__hint">Press Enter to go.</p>';
    } else {
      detail.innerHTML = '<p class="console__dname">' + esc(it.d.name) + '</p><p class="console__stage">' + esc(it.d.stage) + '</p><p>' + esc(it.d.does) + '</p>' +
        '<p class="console__io"><span>In → out</span>' + esc(it.d.io) + '</p><p class="console__human"><span>Human check</span>' + esc(it.d.human) + '</p>';
    }
  }

  function run() {
    var it = items[active];
    if (it && it.kind === 'cmd') {
      if (it.d.href.charAt(0) === '#') {
        var t = document.querySelector(it.d.href);
        if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
      } else {
        var href = it.d.href;
        var f = new URLSearchParams(location.search).get('for');
        if (f && href.indexOf('.html') !== -1) href += '?for=' + encodeURIComponent(f);
        location.href = href;
      }
    }
  }

  input.addEventListener('input', filter);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) { active = (active + 1) % items.length; render(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { active = (active - 1 + items.length) % items.length; render(); } }
    else if (e.key === 'Enter') { e.preventDefault(); run(); }
    else if (e.key === 'Escape') { input.value = ''; filter(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    e.preventDefault();
    input.focus({ preventScroll: true });
    document.getElementById('console').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  filter();
})();
