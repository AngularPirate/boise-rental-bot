(function () {
  var steps = document.getElementById('steps');
  document.querySelectorAll('input[name="lens"]').forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) steps.setAttribute('data-lens', r.value); });
  });
})();
