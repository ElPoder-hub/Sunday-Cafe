(function () {
  'use strict'
  var $ = function (s, r) { return (r || document).querySelector(s) }
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)) }

  // год в подвале
  $('#yr').textContent = new Date().getFullYear()

  // шапка: тень при прокрутке
  var top = $('#top')
  function onScroll() { top.classList.toggle('stuck', window.scrollY > 8) }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll()

  // мобильное меню
  var burger = $('#burger'), nav = $('#nav')
  function setNav(open) {
    nav.classList.toggle('open', open)
    burger.setAttribute('aria-expanded', open)
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
  }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('open')) })
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false) }) })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false) })

  // подсветка текущего раздела
  var links = $$('a', nav), secs = links.map(function (a) { return $(a.getAttribute('href')) })
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var id = '#' + e.target.id
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === id) })
        }
      })
    }, { rootMargin: '-45% 0px -50% 0px' })
    secs.forEach(function (s) { s && io.observe(s) })
  }

  // меню-аккордеон
  var cats = $$('.cat')
  function setCat(cat, open) {
    cat.classList.toggle('open', open)
    $('.cat-btn', cat).setAttribute('aria-expanded', open)
  }
  cats.forEach(function (cat) {
    $('.cat-btn', cat).addEventListener('click', function () {
      setCat(cat, !cat.classList.contains('open'))
    })
  })
  $('#openAll').addEventListener('click', function () { cats.forEach(function (c) { if (!c.classList.contains('hide')) setCat(c, true) }) })
  $('#closeAll').addEventListener('click', function () { cats.forEach(function (c) { setCat(c, false) }) })

  // поиск по меню
  var q = $('#q'), nores = $('#nores')
  var cache = cats.map(function (cat) {
    return { cat: cat, title: $('.cat-t b', cat).textContent.toLowerCase(), items: $$('[data-s]', cat), groups: $$('.grp', cat) }
  })
  var wasOpen = null
  q.addEventListener('input', function () {
    var v = q.value.trim().toLowerCase(), any = false
    if (v && !wasOpen) wasOpen = cats.map(function (c) { return c.classList.contains('open') })
    cache.forEach(function (c) {
      if (!v) {
        c.items.forEach(function (i) { i.classList.remove('hide') })
        c.groups.forEach(function (g) { g.classList.remove('hide') })
        c.cat.classList.remove('hide'); return
      }
      var hits = 0
      c.items.forEach(function (i) {
        var m = i.getAttribute('data-s').indexOf(v) > -1
        i.classList.toggle('hide', !m); if (m) hits++
      })
      c.groups.forEach(function (g) { g.classList.toggle('hide', !$('[data-s]:not(.hide)', g)) })
      c.cat.classList.toggle('hide', !hits)
      if (hits) { any = true; setCat(c.cat, true) }
    })
    nores.hidden = !v || any
    if (!v && wasOpen) { cats.forEach(function (c, i) { setCat(c, wasOpen[i]) }); wasOpen = null }
  })

  // ссылки вида #cat-pizza открывают нужную категорию
  function openFromHash() {
    var h = location.hash
    if (h.indexOf('#cat-') === 0) {
      var c = $(h); if (c) { setCat(c, true); setTimeout(function () { c.scrollIntoView() }, 50) }
    }
  }
  window.addEventListener('hashchange', openFromHash); openFromHash()

  // галерея
  var lb = $('#lb'), lbi = $('#lbi'), lbc = $('#lbc'), idx = 0, opener = null, G = window.GALLERY || []
  function show(i) { idx = (i + G.length) % G.length; lbi.src = G[idx].src; lbi.alt = G[idx].alt; lbc.textContent = G[idx].alt }
  function openLb(i, from) { opener = from; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbx').focus() }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus() }
  $$('.g').forEach(function (b) { b.addEventListener('click', function () { openLb(+b.getAttribute('data-i'), b) }) })
  $('#lbx').addEventListener('click', closeLb)
  $('#lbp').addEventListener('click', function () { show(idx - 1) })
  $('#lbf').addEventListener('click', function () { show(idx + 1) })
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb() })
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return
    if (e.key === 'Escape') closeLb()
    else if (e.key === 'ArrowLeft') show(idx - 1)
    else if (e.key === 'ArrowRight') show(idx + 1)
    else if (e.key === 'Tab') { // фокус остаётся внутри окна
      var f = $$('button', lb), first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  })

  // окно «Позвонить»: работает, даже если браузер не открывает ссылки tel:
  var cb = $('#callbox'), cbOpener = null
  function openCall(from) { cbOpener = from; cb.hidden = false; $('#cbx').focus() }
  function closeCall() { cb.hidden = true; if (cbOpener) cbOpener.focus() }
  $$('.js-call').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); openCall(a) })
  })
  $('#cbx').addEventListener('click', closeCall)
  cb.addEventListener('click', function (e) { if (e.target === cb) closeCall() })
  document.addEventListener('keydown', function (e) { if (!cb.hidden && e.key === 'Escape') closeCall() })
  $$('.copy', cb).forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy'), done = function () { b.textContent = 'Скопировано'; setTimeout(function () { b.textContent = 'Копировать' }, 1800) }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(b.closest('li').querySelector('.cb-num'))
        var s = getSelection(); s.removeAllRanges(); s.addRange(r)
        try { document.execCommand('copy') && done() } catch (x) {}
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback)
      else fallback()
    })
  })

  // плавное появление
  var rv = $$('.sec-head,.about-txt,.about-pics,.g-grid,.c-card,.qr,.cat')
  rv.forEach(function (n) { n.classList.add('rv') })
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -8% 0px' })
    rv.forEach(function (n) { ro.observe(n) })
  } else rv.forEach(function (n) { n.classList.add('in') })
})()
