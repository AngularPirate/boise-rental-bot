/* Per-job tailoring: ?for=<key> selects a block in jobs.json, fallback "default".
   Hooks in the page:
   [data-tailor="headline"]  innerHTML replaced (trusted, same-origin JSON)
   [data-tailor="focus"]     text replaced, hidden when empty
   [data-tailor="why"]       hidden unless the profile has a why block; fills [data-why-title] / [data-why-body]
   [data-featured]           children with [data-case] reordered to match profile.featured
   [data-skill]              gets .is-match when listed in profile.skills
   a[data-keep-for]          internal links keep the ?for= key */
(function () {
  var params = new URLSearchParams(location.search);
  var key = (params.get('for') || 'default').toLowerCase().replace(/[^a-z0-9-]/g, '');
  var src = document.documentElement.getAttribute('data-jobs') || 'jobs.json';

  function apply(profile, usedKey) {
    var h = document.querySelector('[data-tailor="headline"]');
    if (h && profile.headline) h.innerHTML = profile.headline;

    var f = document.querySelector('[data-tailor="focus"]');
    if (f) { f.textContent = profile.focus || ''; f.hidden = !profile.focus; }

    var why = document.querySelector('[data-tailor="why"]');
    if (why) {
      if (profile.why) {
        var t = why.querySelector('[data-why-title]'), b = why.querySelector('[data-why-body]');
        if (t) t.textContent = profile.why.title;
        if (b) b.textContent = profile.why.body;
        why.hidden = false;
      } else { why.hidden = true; }
    }

    document.querySelectorAll('[data-featured]').forEach(function (list) {
      (profile.featured || []).forEach(function (id) {
        var el = list.querySelector(':scope > [data-case="' + id + '"]');
        if (el) list.appendChild(el);
      });
      // anything not named keeps its order after the named ones
      Array.prototype.slice.call(list.children).forEach(function (el) {
        if ((profile.featured || []).indexOf(el.getAttribute('data-case')) === -1) list.appendChild(el);
      });
    });

    var skills = profile.skills || [];
    document.querySelectorAll('[data-skill]').forEach(function (el) {
      var on = skills.indexOf(el.getAttribute('data-skill')) !== -1;
      el.classList.toggle('is-match', on);
      var flag = el.querySelector('.match-flag');
      if (on && !flag) {
        flag = document.createElement('span');
        flag.className = 'match-flag';
        flag.textContent = usedKey === 'default' ? 'Core' : 'Matches this role';
        el.appendChild(flag);
      } else if (!on && flag) { flag.remove(); }
    });

    if (usedKey !== 'default') {
      document.querySelectorAll('a[data-keep-for]').forEach(function (a) {
        var u = new URL(a.getAttribute('href'), location.href);
        u.searchParams.set('for', usedKey);
        a.setAttribute('href', u.pathname.split('/').pop() + u.search + u.hash);
      });
    }
    document.documentElement.setAttribute('data-for', usedKey);
    document.dispatchEvent(new CustomEvent('tailor:applied', { detail: { key: usedKey, profile: profile } }));
  }

  fetch(src, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (jobs) {
      var used = jobs[key] ? key : 'default';
      apply(jobs[used], used);
    })
    .catch(function () { /* static default content stays in place */ });
})();
