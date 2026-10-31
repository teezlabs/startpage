// ── Clock ─────────────────────────────────────────────────────────────────────
function showTime() {
	const date = new Date();
	const today  = date.toLocaleString("en", { weekday: "long" });
	const hour   = date.toLocaleString("pl", { hour: "2-digit" });
	let   minute = date.toLocaleString("en", { minute: "2-digit" });
	let   second = date.toLocaleString("en", { second: "2-digit" });
	const day    = date.toLocaleString("en", { day: "2-digit" });
	const month  = date.toLocaleString("en", { month: "2-digit" });
	const year   = date.toLocaleString("en", { year: "numeric" });
	minute = addZero(minute);
	second = addZero(second);
	document.getElementById("date").innerHTML =
		`「 ${today}, ${hour}:${minute}:${second} | ${month}/${day}/${year} 」`;
	setTimeout(showTime, 0);
}
function addZero(i) { return i.length < 2 ? "0" + i : i; }
showTime();

// ── Data ──────────────────────────────────────────────────────────────────────
const DEFAULT_DATA = [
  { title: '//general', links: [
    { name: 'Plex',       url: 'https://plex.tv' },
    { name: 'Gmail',      url: 'https://gmail.com/' },
    { name: 'Twitch',     url: 'https://twitch.tv' },
    { name: 'YouTube',    url: 'https://youtube.com' },
    { name: 'Soundcloud', url: 'https://soundcloud.com' },
  ]},
  { title: '//dev', links: [
    { name: 'AUR',      url: 'https://aur.archlinux.org/' },
    { name: 'GitHub',   url: 'https://github.com/teezlabs?tab=repositories' },
    { name: 'Vercel',   url: 'https://vercel.com' },
    { name: 'Supabase', url: 'https://supabase.com' },
  ]},
  { title: '//random', links: [
    { name: 'Claude',     url: 'https://claude.ai' },
    { name: 'ChatGPT',    url: 'https://chatgpt.com' },
    { name: 'FlatHub',    url: 'https://flathub.org/en' },
    { name: 'Hyprland',   url: 'https://wiki.hypr.land' },
    { name: 'Excalidraw', url: 'https://excalidraw.com' },
  ]},
  { title: '//reddit', links: [
    { name: 'reddit.com', url: 'https://reddit.com/' },
    { name: 'r/hyprland', url: 'https://reddit.com/r/hyprland/' },
    { name: 'r/unixporn', url: 'https://reddit.com/r/unixporn/' },
    { name: 'r/archlinux',url: 'https://reddit.com/r/archlinux/' },
  ]},
  { title: '//homelab', links: [
    { name: 'N8n',        url: 'https://n8n.home' },
    { name: 'TeezLabs',   url: 'https://teez.labs' },
    { name: 'NameCheap',  url: 'https://namecheap.com' },
    { name: 'Tailscale',  url: 'https://login.tailscale.com' },
    { name: 'Cloudflare', url: 'https://cloudflare.com/' },
  ]},
];

function loadData() {
  try {
    const s = localStorage.getItem('startpage-data');
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_DATA));
  } catch { return JSON.parse(JSON.stringify(DEFAULT_DATA)); }
}
function saveData() { localStorage.setItem('startpage-data', JSON.stringify(data)); }

let data = loadData();
let editMode = false;
let dragCardIndex = null;
let firstRender = true;


// ── Render ────────────────────────────────────────────────────────────────────
function renderCards() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  container.classList.toggle('cards-edit', editMode);

  // Stagger the cards in on first paint only, so edits don't replay it.
  if (firstRender) {
    firstRender = false;
    container.classList.add('cards-enter');
    setTimeout(() => container.classList.remove('cards-enter'), 1000);
  }

  data.forEach((card, ci) => {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.cssText = 'border-radius:12px;padding:12px;min-width:140px;';
    if (editMode) {
      wrap.ondragover  = (e) => cardDragOver(e, ci, wrap);
      wrap.ondragleave = () => wrap.classList.remove('drop-before', 'drop-after');
      wrap.ondrop      = (e) => cardDrop(e, ci, wrap);
    }

    // Title
    const titleRow = document.createElement('div');
    titleRow.className = 'neon-blue';
    titleRow.style.cssText = 'font-size:0.75rem;letter-spacing:0.05em;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #151520;position:relative;z-index:10;';
    if (editMode) {
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';
      titleRow.style.gap = '4px';
      const grip = document.createElement('span');
      grip.className = 'drag-handle';
      grip.textContent = '\u2807';
      grip.title = 'Drag to reorder';
      grip.draggable = true;
      grip.ondragstart = (e) => startCardDrag(e, ci, wrap);
      grip.ondragend = endCardDrag;
      const inp = document.createElement('input');
      inp.value = card.title;
      inp.className = 'edit-input';
      inp.style.width = '100%';
      inp.onchange = () => { data[ci].title = inp.value; saveData(); };
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.textContent = '\u2039';
      prev.className = 'edit-pencil';
      prev.title = 'Move left';
      prev.style.opacity = ci === 0 ? '0.2' : '1';
      prev.disabled = ci === 0;
      prev.onclick = () => moveCard(ci, -1);
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = '\u203a';
      next.className = 'edit-pencil';
      next.title = 'Move right';
      next.style.opacity = ci === data.length - 1 ? '0.2' : '1';
      next.disabled = ci === data.length - 1;
      next.onclick = () => moveCard(ci, 1);
      const del = document.createElement('button');
      del.textContent = '×';
      del.className = 'edit-x';
      del.onclick = () => { data.splice(ci, 1); saveData(); renderCards(); };
      titleRow.appendChild(grip);
      titleRow.appendChild(inp);
      titleRow.appendChild(prev);
      titleRow.appendChild(next);
      titleRow.appendChild(del);
    } else {
      titleRow.textContent = card.title;
    }
    wrap.appendChild(titleRow);

    // Links
    const ul = document.createElement('ul');
    ul.style.cssText = 'list-style:none;padding:0;margin:0;position:relative;z-index:10;';
    card.links.forEach((link, li) => {
      const row = makeLinkRow(ci, li, link, card.links.length);
      if (li > 0) row.style.marginTop = '4px';
      ul.appendChild(row);
    });

    // Add link row (edit mode only)
    if (editMode) {
      const addLi = document.createElement('li');
      addLi.style.marginTop = '6px';
      addLi.innerHTML =
        `<form id="add-form-${ci}" style="display:none;gap:4px;align-items:center;" onsubmit="submitAddLink(event,${ci})">` +
        `<input id="add-name-${ci}" class="edit-input" placeholder="name" style="width:56px" required>` +
        `<input id="add-url-${ci}" class="edit-input" placeholder="url" style="flex:1;min-width:0" required>` +
        `<button type="submit" class="edit-confirm">+</button>` +
        `<button type="button" class="edit-x" onclick="hideAddForm(${ci})">x</button>` +
        `</form>` +
        `<button id="add-btn-${ci}" class="edit-add-link" onclick="showAddForm(${ci})">+ link</button>`;
      ul.appendChild(addLi);
    }

    wrap.appendChild(ul);
    container.appendChild(wrap);
  });

  // Add card button (edit mode)
  if (editMode) {
    const addWrap = document.createElement('div');
    addWrap.className = 'card';
    addWrap.style.cssText = 'border-radius:12px;padding:12px;min-width:140px;display:flex;align-items:center;justify-content:center;';
    const btn = document.createElement('button');
    btn.className = 'edit-add-link';
    btn.textContent = '+ card';
    btn.onclick = () => { data.push({ title: '//new', links: [] }); saveData(); renderCards(); };
    addWrap.ondragover = (e) => {
      if (dragCardIndex === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearDropMarks();
      addWrap.classList.add('drop-before');
    };
    addWrap.ondragleave = () => addWrap.classList.remove('drop-before');
    addWrap.ondrop = (e) => {
      if (dragCardIndex === null) return;
      e.preventDefault();
      const from = dragCardIndex;
      endCardDrag();
      data.push(data.splice(from, 1)[0]);
      saveData(); renderCards();
    };
    addWrap.appendChild(btn);
    container.appendChild(addWrap);
  }
}

function makeLinkRow(ci, li, link, total) {
  const item = document.createElement('li');
  if (editMode) {
    item.id = `link-row-${ci}-${li}`;
    item.style.cssText = 'display:flex;align-items:center;gap:2px;';

    const chevrons = document.createElement('span');
    chevrons.style.cssText = 'display:flex;flex-direction:column;gap:0;';
    const up = document.createElement('button');
    up.textContent = '\u2303';
    up.className = 'edit-pencil';
    up.style.cssText = 'padding:0 2px;line-height:1;opacity:' + (li === 0 ? '0.2' : '1');
    up.disabled = li === 0;
    up.onclick = () => moveLink(ci, li, -1);
    const down = document.createElement('button');
    down.textContent = '\u2304';
    down.className = 'edit-pencil';
    down.style.cssText = 'padding:0 2px;line-height:1;opacity:' + (li === total - 1 ? '0.2' : '1');
    down.disabled = li === total - 1;
    down.onclick = () => moveLink(ci, li, 1);
    chevrons.appendChild(up);
    chevrons.appendChild(down);

    const a = document.createElement('a');
    a.className = 'link';
    a.style.flex = '1';
    a.textContent = link.name;
    a.title = link.url;

    const pencil = document.createElement('button');
    pencil.textContent = '\u270e';
    pencil.className = 'edit-pencil';
    pencil.onclick = () => openEditRow(ci, li);

    const del = document.createElement('button');
    del.textContent = 'x';
    del.className = 'edit-x';
    del.onclick = () => { data[ci].links.splice(li, 1); saveData(); renderCards(); };

    item.appendChild(chevrons);
    item.appendChild(a);
    item.appendChild(pencil);
    item.appendChild(del);
  } else {
    item.innerHTML = `<a class="link" href="${link.url}">${link.name}</a>`;
  }
  return item;
}

// ── Card reordering ───────────────────────────────────────────────────────────
function moveCard(ci, dir) {
  const target = ci + dir;
  if (target < 0 || target >= data.length) return;
  [data[ci], data[target]] = [data[target], data[ci]];
  saveData();
  renderCards();
}

function clearDropMarks() {
  document.querySelectorAll('#cards-container .card').forEach(c =>
    c.classList.remove('drop-before', 'drop-after'));
}

function startCardDrag(e, ci, el) {
  dragCardIndex = ci;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(ci));
  if (e.dataTransfer.setDragImage) {
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 14);
  }
  requestAnimationFrame(() => el.classList.add('dragging'));
}

function endCardDrag() {
  dragCardIndex = null;
  document.querySelectorAll('#cards-container .card').forEach(c =>
    c.classList.remove('dragging', 'drop-before', 'drop-after'));
}

// Cards wrap in a row on desktop and stack in a 2-col grid on mobile,
// so the insertion side follows the axis the layout actually uses.
function dropsAfter(e, el) {
  const r = el.getBoundingClientRect();
  return window.innerWidth < 768
    ? e.clientY > r.top + r.height / 2
    : e.clientX > r.left + r.width / 2;
}

function cardDragOver(e, ci, el) {
  if (dragCardIndex === null) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  clearDropMarks();
  if (ci === dragCardIndex) return;
  el.classList.add(dropsAfter(e, el) ? 'drop-after' : 'drop-before');
}

function cardDrop(e, ci, el) {
  if (dragCardIndex === null) return;
  e.preventDefault();
  const from = dragCardIndex;
  let to = ci + (dropsAfter(e, el) ? 1 : 0);
  endCardDrag();
  if (from === ci) return;
  const [moved] = data.splice(from, 1);
  if (to > from) to--;
  data.splice(to, 0, moved);
  saveData();
  renderCards();
}

function moveLink(ci, li, dir) {
  const links = data[ci].links;
  const target = li + dir;
  if (target < 0 || target >= links.length) return;
  [links[li], links[target]] = [links[target], links[li]];
  saveData();
  renderCards();
}

function openEditRow(ci, li) {
  const row = document.getElementById(`link-row-${ci}-${li}`);
  const link = data[ci].links[li];
  row.style.cssText = 'display:flex;align-items:center;gap:4px;';
  const form = document.createElement('form');
  form.style.cssText = 'display:flex;gap:4px;align-items:center;width:100%;';
  form.onsubmit = (e) => submitEditLink(e, ci, li);
  const nameInp = document.createElement('input');
  nameInp.value = link.name; nameInp.className = 'edit-input'; nameInp.style.width = '56px';
  nameInp.id = `en-${ci}-${li}`; nameInp.required = true;
  const urlInp = document.createElement('input');
  urlInp.value = link.url; urlInp.className = 'edit-input'; urlInp.style.cssText = 'flex:1;min-width:0;';
  urlInp.id = `eu-${ci}-${li}`; urlInp.required = true;
  const ok = document.createElement('button');
  ok.type = 'submit'; ok.className = 'edit-confirm'; ok.textContent = 'ok';
  const cancel = document.createElement('button');
  cancel.type = 'button'; cancel.className = 'edit-x'; cancel.textContent = 'x';
  cancel.onclick = () => renderCards();
  form.appendChild(nameInp); form.appendChild(urlInp);
  form.appendChild(ok); form.appendChild(cancel);
  row.innerHTML = '';
  row.appendChild(form);
}

function submitEditLink(e, ci, li) {
  e.preventDefault();
  data[ci].links[li].name = document.getElementById(`en-${ci}-${li}`).value;
  data[ci].links[li].url  = document.getElementById(`eu-${ci}-${li}`).value;
  saveData(); renderCards();
}

function showAddForm(ci) {
  document.getElementById(`add-form-${ci}`).style.display = 'flex';
  document.getElementById(`add-btn-${ci}`).style.display  = 'none';
}
function hideAddForm(ci) {
  document.getElementById(`add-form-${ci}`).style.display = 'none';
  document.getElementById(`add-btn-${ci}`).style.display  = '';
}
function submitAddLink(e, ci) {
  e.preventDefault();
  const name = document.getElementById(`add-name-${ci}`).value;
  const url  = document.getElementById(`add-url-${ci}`).value;
  data[ci].links.push({ name, url });
  saveData(); renderCards();
}

// ── Edit toggle ───────────────────────────────────────────────────────────────
function toggleEdit() {
  editMode = !editMode;
  const btn = document.getElementById('edit-toggle');
  btn.textContent = editMode ? '✓ DONE' : '✎ EDIT';
  btn.classList.toggle('active', editMode);
  renderCards();
}

// Initial render
renderCards();

// ── Feed toggle ───────────────────────────────────────────────────────────────
function toggleFeed() {
  const container = document.getElementById('ticker-container');
  const btn = document.getElementById('feed-toggle');
  const isOpen = container.classList.contains('open');
  container.classList.toggle('open');
  btn.textContent = isOpen ? '▶ FEED' : '◀ FEED';
}

// ── Reddit ticker ─────────────────────────────────────────────────────────────
async function loadRedditTicker() {
  const res = await fetch('https://www.reddit.com/r/linux+unixporn+technology.json?limit=20', {
    headers: { 'Accept': 'application/json' }
  });
  const data = await res.json();
  const posts = data.data.children.map(c => c.data);
  const el = document.getElementById('ticker-inner');
  el.innerHTML = posts.map(p =>
    `<a class="ticker-link" href="https://reddit.com${p.permalink}">${p.title}</a><span class="ticker-sep">///</span>`
  ).join('');
}
loadRedditTicker();

// ── Live wallpaper color sync ───────────────────────────────────────────────────
async function refreshWallpaperColors() {
  try {
    const res = await fetch(`colors.css?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const css = await res.text();
    const vars = {};
    for (const match of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      vars[match[1]] = match[2].trim();
    }
    for (const [name, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(`--${name}`, value);
    }
  } catch (e) {
    // colors.css may not exist yet (wallpaper sync not set up) - ignore
  }
}
refreshWallpaperColors();
setInterval(refreshWallpaperColors, 2000);
// Catch a wallpaper change made while the tab was hidden or unfocused.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshWallpaperColors();
});
window.addEventListener('focus', refreshWallpaperColors);
