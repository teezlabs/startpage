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


// ── Render ────────────────────────────────────────────────────────────────────
function renderCards() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  container.classList.toggle('cards-edit', editMode);

  data.forEach((card, ci) => {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.cssText = 'border-radius:12px;padding:12px;min-width:140px;';

    // Title
    const titleRow = document.createElement('div');
    titleRow.className = 'neon-blue';
    titleRow.style.cssText = 'font-size:0.75rem;letter-spacing:0.05em;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #151520;position:relative;z-index:10;';
    if (editMode) {
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';
      titleRow.style.gap = '4px';
      const inp = document.createElement('input');
      inp.value = card.title;
      inp.className = 'edit-input';
      inp.style.width = '100%';
      inp.onchange = () => { data[ci].title = inp.value; saveData(); };
      const del = document.createElement('button');
      del.textContent = '×';
      del.className = 'edit-x';
      del.onclick = () => { data.splice(ci, 1); saveData(); renderCards(); };
      titleRow.appendChild(inp);
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
    item.innerHTML = `<a class="link" href="${link.url}" target="_blank">${link.name}</a>`;
  }
  return item;
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
    `<a class="ticker-link" href="https://reddit.com${p.permalink}" target="_blank">${p.title}</a><span class="ticker-sep">///</span>`
  ).join('');
}
loadRedditTicker();
