function showTime() {
	const date = new Date();

	let today = date.toLocaleString("en", { weekday: "long" });
	let hour = date.toLocaleString("pl", { hour: "2-digit" }); // use 24h time format
	let minute = date.toLocaleString("en", { minute: "2-digit" });
	let second = date.toLocaleString("en", { second: "2-digit" });
	let day = date.toLocaleString("en", { day: "2-digit" });
	let month = date.toLocaleString("en", { month: "2-digit" });
	let year = date.toLocaleString("en", { year: "numeric" });

	minute = addZero(minute);
	second = addZero(second);

	document.getElementById(
		"date"
	).innerHTML = `「 ${today}, ${hour}:${minute}:${second} | ${month}/${day}/${year} 」`;
	setTimeout(showTime, 0);
}

function addZero(i) {
	if (i.length < 2) i = "0" + i;
	return i;
}

showTime();

function toggleFeed() {
  const container = document.getElementById('ticker-container');
  const btn = document.getElementById('feed-toggle');
  const isOpen = container.classList.contains('open');
  container.classList.toggle('open');
  btn.textContent = isOpen ? '▶ FEED' : '◀ FEED';
}

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
