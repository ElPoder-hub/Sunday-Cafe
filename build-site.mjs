// Генератор сайта SUNDAY: node build-site.mjs  →  index.html
// Меню берётся из ./menu-data.mjs (там правятся блюда и цены).
import fs from 'node:fs'
import * as D from './menu-data.mjs'

const C = D.contacts
const NB = ' '
const money = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const price = (p) =>
  p == null ? '' : Array.isArray(p)
    ? `<span class="pr">${money(p[0])} / ${money(p[1])}${NB}₸</span>`
    : `<span class="pr">${money(p)}${NB}₸</span>`

const kcal = (k) => k == null || k === '' ? '' : `<span class="kc">${esc(k)} ккал</span>`
const item = ([name, p, desc, k, isNew]) => `
<li class="it" data-s="${esc((name + ' ' + (desc || '')).toLowerCase())}">
  <div class="row"><span class="nm">${esc(name)}${isNew ? '<em class="new">new</em>' : ''}</span><i class="ld"></i>${price(p)}</div>
  ${desc || k != null ? `<p class="ds">${desc ? esc(cap(desc)) : ''}${kcal(k)}</p>` : ''}
</li>`

const group = (title, items, note = '') => `
<section class="grp"><h4>${title}${note ? `<small>${note}</small>` : ''}</h4><ul class="items">${items.map(item).join('')}</ul></section>`

const chips = (title, names, note) => `
<section class="grp"><h4>${title}${note ? `<small>${note}</small>` : ''}</h4><ul class="chips">${names.map((n) => `<li data-s="${esc(n.toLowerCase())}">${esc(n)}</li>`).join('')}</ul></section>`

const count = (groups) => groups.reduce((a, g) => a + g.n, 0)
const G = (title, items, note) => ({ n: items.length, html: group(title, items, note) })
const CH = (title, names, note) => ({ n: names.length, html: chips(title, names, note) })

const cats = [
  { id: 'breakfast', title: 'Завтраки', note: 'Авторские завтраки, блюда из яиц, каши и сырники', img: 'cat-breakfast', pos: '50% 45%',
    groups: [G('Завтраки', D.breakfasts), G('Блюда из яиц', D.eggs), G('Каша на молоке', D.porridge), G('Блюда из творога', D.curd)] },
  { id: 'salads', title: 'Салаты', note: 'Цезарь, с бурратой, дунганские новинки и классика', img: 'cat-salads', pos: '50% 50%',
    groups: [G('Новинки', D.saladsNew), G('Салаты', D.salads)] },
  { id: 'soups', title: 'Супы', note: 'Борщ, солянка, рамен, кукси и том ям', img: 'cat-soups', pos: '50% 50%',
    groups: [G('Супы', D.soups), G('Первые блюда', D.firstCourses)] },
  { id: 'asia', title: 'Пан-Азия', note: 'Вок с лапшой и рисом, боулы', img: 'cat-asia', pos: '50% 50%',
    groups: [G('Пан-Азия', D.panAsia), G('Боулы', D.bowls)] },
  { id: 'hot', title: 'Горячие блюда', note: 'Курица, сёмга, креветки, пельмени и гарниры', img: 'cat-hot', pos: '50% 60%',
    groups: [G('Блюда из мяса птицы', D.poultry), G('Блюда из креветок и рыбы', D.seafood), G('Прочие блюда', D.otherDishes),
      G('Вареники и пельмени', D.dumplings), G('Гарниры', D.sides)] },
  { id: 'pasta', title: 'Паста и равиоли', note: 'Болоньезе, карбонара, паста с сёмгой, равиоли', img: 'cat-ravioli', pos: '50% 50%',
    groups: [G('Паста', D.pasta), G('Равиоли', D.ravioli)] },
  { id: 'pizza', title: 'Пицца и бургеры', note: 'Пицца, хачапури, бургер и закуски', img: 'cat-pizza', pos: '50% 55%',
    groups: [G('Пицца', D.pizza), G('Бургеры и сэндвичи', D.burgers), G('Закуски', D.starters)] },
  { id: 'cold', title: 'Холодные напитки', note: 'Лимонады, ice tea, смузи, фреши и коктейли', img: 'cat-cold', pos: '50% 55%',
    groups: [G('Лимонады', D.lemonades, '0,5 л / 1 л'), G('Ice tea', D.iceTea, '400 мл / 1 л'), G('Смузи', D.smoothies),
      G('Фреш', D.fresh, '300 мл'), G('Молочные коктейли', D.shakes, '400 мл'), G('Морс и компот', D.mors, '500 мл / 1 л')] },
  { id: 'coffee', title: 'Кофе', note: 'Горячий и холодный кофе, бамбл, раф', img: 'latte-glass', pos: '50% 40%',
    groups: [G('Горячий кофе', D.coffee), G('Холодный кофе', D.coldCoffee)] },
  { id: 'tea', title: 'Чаи', note: 'Чай в чайнике и в кружке', img: 'cat-tea', pos: '50% 45%',
    groups: [G('Чай в чайнике', D.tea), G('Чай в кружке', D.mugTea)] },
]

const total = cats.reduce((a, c) => a + count(c.groups), 0)

const catHtml = cats.map((c) => `
<article class="cat" id="cat-${c.id}">
  <h3 class="cat-h">
    <button class="cat-btn" aria-expanded="false" aria-controls="panel-${c.id}" id="btn-${c.id}">
      <span class="thumb"><img src="img/${c.img}.jpg" alt="" loading="lazy" style="object-position:${c.pos}"></span>
      <span class="cat-t"><b>${c.title}</b><small>${c.note}</small></span>
      <span class="cat-n">${count(c.groups)}<span> поз.</span></span>
      <span class="chev" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
    </button>
  </h3>
  <div class="panel" id="panel-${c.id}" role="region" aria-labelledby="btn-${c.id}"><div class="panel-in"><div class="panel-grid">${c.groups.map((g) => g.html).join('')}</div></div></div>
</article>`).join('')

const igIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`
const phIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>`
const pinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`
const clockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`
const sun = `<svg class="sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.6" fill="#f3c84b"/><g stroke="#2a2a26" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.2v3M12 18.8v3M2.2 12h3M18.8 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1"/></g></svg>`

const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${C.address}, Жаркент`)
const gallery = [
  ['ext-sign-2', 'Вывеска SUNDAY у входа'], ['int-blue', 'Синий диван и зелёные стулья'], ['int-hall', 'Основной зал'],
  ['ext-door', 'Вход в кафе'], ['int-shelf', 'Столик у книжной полки'],
  ['int-hall2', 'Уютный зал с книгами'], ['ext-sign-1', 'Вывеска SUNDAY'],
]

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SUNDAY — кафе в Жаркенте, где всем рады</title>
<meta name="description" content="SUNDAY — кафе в Жаркенте: завтраки, паста, пицца, кофе и лимонады. ${C.address}, ежедневно ${C.hours.replace('Ежедневно ', '')}.">
<meta name="theme-color" content="#fbf3e1">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">К содержимому</a>

<header class="top" id="top">
  <div class="top-in">
    <a class="logo" href="#home" aria-label="SUNDAY — на главную">${sun}<span>SUN<i>DAY</i></span></a>
    <nav class="nav" id="nav" aria-label="Основное меню">
      <a href="#home">Главная</a><a href="#about">О нас</a><a href="#menu">Меню</a><a href="#gallery">Галерея</a><a href="#contacts">Контакты</a>
    </nav>
    <a class="call js-call" href="tel:${C.phones[0].tel}">${phIcon}<span>${C.phones[0].label}</span></a>
    <button class="burger" id="burger" aria-label="Открыть меню" aria-expanded="false" aria-controls="nav"><i></i><i></i><i></i></button>
  </div>
</header>

<main id="main">
<!-- ГЛАВНАЯ -->
<section class="hero" id="home">
  <div class="hero-in">
    <div class="hero-txt">
      <p class="kicker">Кафе · Жаркент</p>
      <h1>Кафе, где <em>всем</em> рады</h1>
      <blockquote class="quote">
        <p>«Приходите как есть — на завтрак, за кофе или на долгий разговор. В SUNDAY всегда найдётся свободный стол и тёплое слово».</p>
        <footer>— SUNDAY · A little taste of happiness</footer>
      </blockquote>
      <div class="cta">
        <a class="btn btn-sun" href="#menu">Смотреть меню</a>
        <a class="btn btn-line" href="#contacts">Как нас найти</a>
      </div>
      <ul class="facts">
        <li><b>${C.hours.replace('Ежедневно ', '')}</b><span>ежедневно</span></li>
        <li><b>${total}+</b><span>позиций в меню</span></li>
        <li><b>${C.address.replace('Проспект ', 'пр. ')}</b><span>Жаркент</span></li>
      </ul>
    </div>
    <div class="hero-pics">
      <figure class="p p0"><img src="img/int-hall.jpg" alt="Уютный зал кафе SUNDAY" fetchpriority="high"></figure>
      <figure class="p p1"><img src="img/ext-sign-2.jpg" alt="Вывеска SUNDAY у входа в кафе" fetchpriority="high"></figure>
      <figure class="p p2"><img src="img/int-blue.jpg" alt="Синий диван и зелёные стулья в зале"></figure>
      <figure class="p p3"><img src="img/ext-door.jpg" alt="Вход в кафе SUNDAY"></figure>
      </div>
  </div>
</section>

<!-- О НАС -->
<section class="about" id="about">
  <div class="wrap about-grid">
    <div class="about-pics">
      <figure class="a1"><img src="img/int-hall.jpg" alt="Зал кафе SUNDAY" loading="lazy"></figure>
      <figure class="a2"><img src="img/int-shelf.jpg" alt="Столик у книжной полки" loading="lazy"></figure>
    </div>
    <div class="about-txt">
      <p class="kicker">О нас</p>
      <h2>Воскресенье — <em>каждый день</em></h2>
      <p>SUNDAY — кафе в Жаркенте. Здесь можно позавтракать, пообедать, выпить кофе с друзьями или просто посидеть с книгой на мягком диване.</p>
      <p>В зале светло и по-домашнему уютно, а на входе светятся гирлянды и солнечная вывеска. У нас большое меню: завтраки, паста, пицца, горячие блюда, лимонады и кофе.</p>
      <ul class="about-list">
        <li><b>Завтраки</b><span>классические и авторские</span></li>
        <li><b>Кухня</b><span>от пасты до рамена</span></li>
        <li><b>Напитки</b><span>кофе, чай, лимонады</span></li>
      </ul>
      <a class="btn btn-sun" href="#menu">Перейти к меню</a>
    </div>
  </div>
</section>

<!-- МЕНЮ -->
<section class="menu" id="menu">
  <div class="wrap">
    <div class="sec-head">
      <p class="kicker">Меню</p>
      <h2>Что у нас <em>вкусного</em></h2>
      <p class="lead">Нажмите на стрелку рядом с категорией, чтобы открыть подробное меню. Цены указаны в тенге.</p>
    </div>
    <div class="tools">
      <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="q" type="search" placeholder="Найти блюдо, например «паста»" autocomplete="off" aria-label="Поиск по меню"></label>
      <div class="tool-btns"><button class="mini" id="openAll" type="button">Раскрыть все</button><button class="mini" id="closeAll" type="button">Свернуть все</button></div>
    </div>
    <p class="nores" id="nores" hidden>Ничего не нашли. Попробуйте другое слово.</p>
    <div class="cats" id="cats">${catHtml}</div>
    <p class="menu-note">Меню может меняться. Уточняйте наличие позиций у официанта или по телефону.</p>
  </div>
</section>

<!-- ГАЛЕРЕЯ -->
<section class="gallery" id="gallery">
  <div class="wrap">
    <div class="sec-head">
      <p class="kicker">Галерея</p>
      <h2>Загляните <em>внутрь</em></h2>
    </div>
    <div class="g-grid">
      ${gallery.map(([f, a], i) => `<button class="g g${i + 1}" type="button" data-i="${i}" aria-label="Открыть фото: ${a}"><img src="img/${f}.jpg" alt="${a}" loading="lazy"></button>`).join('')}
    </div>
  </div>
</section>

<!-- КОНТАКТЫ -->
<section class="contacts" id="contacts">
  <div class="wrap">
    <div class="sec-head light">
      <p class="kicker">Контакты</p>
      <h2>Ждём вас <em>в гости</em></h2>
    </div>
    <div class="c-grid">
      <div class="c-card">
        <ul class="c-list">
          <li>${phIcon}<div><span class="lab">Позвонить</span>${C.phones.map((p) => `<a href="tel:${p.tel}">${p.label}</a>`).join('')}</div></li>
          <li>${igIcon}<div><span class="lab">Instagram</span><a href="${C.instagramUrl}" target="_blank" rel="noopener">${C.instagramHandle}</a></div></li>
          <li>${pinIcon}<div><span class="lab">Адрес</span><a href="${mapUrl}" target="_blank" rel="noopener">${C.address}</a><span class="sm">${C.city}</span></div></li>
          <li>${clockIcon}<div><span class="lab">Часы работы</span><b>${C.hours}</b></div></li>
        </ul>
      </div>
      <a class="qr" href="${C.instagramUrl}" target="_blank" rel="noopener" aria-label="QR-код Instagram ${C.instagramHandle}">
        <img src="img/qr-instagram.svg" alt="QR-код: Instagram ${C.instagramHandle}">
        <span>Наведите камеру — откроется<br>${C.instagramHandle}</span>
      </a>
    </div>
  </div>
</section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <a class="logo" href="#home" aria-label="На главную">${sun}<span>SUN<i>DAY</i></span></a>
    <p>© <span id="yr">2026</span> SUNDAY · Жаркент · A little taste of happiness</p>
    <nav aria-label="Нижнее меню"><a href="#about">О нас</a><a href="#menu">Меню</a><a href="#gallery">Галерея</a><a href="#contacts">Контакты</a><a href="${C.instagramUrl}" target="_blank" rel="noopener">Instagram</a></nav>
  </div>
</footer>

<a class="fab js-call" href="tel:${C.phones[0].tel}" aria-label="Позвонить в SUNDAY">${phIcon}</a>

<div class="callbox" id="callbox" hidden role="dialog" aria-modal="true" aria-labelledby="cbt">
  <div class="cb-in">
    <button class="cb-x" id="cbx" type="button" aria-label="Закрыть">×</button>
    <h3 id="cbt">Позвонить в SUNDAY</h3>
    <ul>${C.phones.map((p) => `<li><span class="cb-num">${p.label}</span><span class="cb-act"><a class="btn btn-sun" href="tel:${p.tel}">Позвонить</a><button class="mini copy" type="button" data-copy="${p.label}">Копировать</button></span></li>`).join('')}</ul>
    <p>Если звонок не начался, скопируйте номер и наберите его вручную.</p>
  </div>
</div>

<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Просмотр фото">
  <button class="lb-x" id="lbx" aria-label="Закрыть">×</button>
  <button class="lb-n lb-p" id="lbp" aria-label="Назад">‹</button>
  <figure><img id="lbi" alt=""><figcaption id="lbc"></figcaption></figure>
  <button class="lb-n lb-f" id="lbf" aria-label="Вперёд">›</button>
</div>

<script>window.GALLERY=${JSON.stringify(gallery.map(([f, a]) => ({ src: `img/${f}.jpg`, alt: a })))}</script>
<script src="app.js"></script>
</body>
</html>`

fs.writeFileSync(new URL('./index.html', import.meta.url), html)
console.log('index.html', Math.round(html.length / 1024) + ' KB', 'позиций:', total)
