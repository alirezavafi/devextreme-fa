// Builds an index page for apps/demos/publish-demos.
//
// The demo bundles are per-demo pages with no entry point of their own — the
// real DevExtreme site supplies its own navigation — so a deployment of them
// is unreachable without something that lists what is there.

const fs = require('fs');
const path = require('path');

const demosRoot = process.argv[2];
const outFile = process.argv[3];

const FRAMEWORKS = ['React', 'Vue', 'Angular'];

function collect() {
  const demosDir = path.join(demosRoot, 'Demos');
  const widgets = fs.readdirSync(demosDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  return widgets.map((widget) => {
    const demos = fs.readdirSync(path.join(demosDir, widget), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((name) => name.name)
      .sort()
      .map((demo) => {
        const available = FRAMEWORKS.filter((fw) => fs.existsSync(
          path.join(demosDir, widget, demo, fw, 'index.html'),
        ));
        return { demo, available };
      })
      .filter((d) => d.available.length);
    return { widget, demos };
  }).filter((w) => w.demos.length);
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const spaced = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const widgets = collect();
const total = widgets.reduce((n, w) => n + w.demos.length, 0);
const highlights = [];
widgets.forEach(({ widget, demos }) => demos.forEach((d) => {
  if (d.demo === 'MultipleCalendars') highlights.push({ widget, ...d });
}));

const links = (widget, demo, available) => available
  .map((fw) => `<a href="./Demos/${widget}/${demo}/${fw}/index.html">${fw}</a>`)
  .join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevExtreme Multi-Calendar — Demos</title>
<style>
:root { color-scheme: light dark; --bg:#f7f7f8; --fg:#1b1b1f; --muted:#5b5b66;
  --card:#fff; --line:#e3e3e8; --accent:#7a3cff; }
@media (prefers-color-scheme: dark) { :root { --bg:#16161a; --fg:#ececf1;
  --muted:#a0a0ad; --card:#1f1f25; --line:#2e2e37; --accent:#a887ff; } }
* { box-sizing:border-box; }
body { margin:0; padding:48px 24px 72px; background:var(--bg); color:var(--fg);
  font:16px/1.6 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
main { max-width:960px; margin:0 auto; }
h1 { font-size:30px; margin:0 0 8px; letter-spacing:-0.02em; }
.lede { color:var(--muted); margin:0 0 28px; }
.lede a { color:var(--accent); }
h2 { font-size:13px; text-transform:uppercase; letter-spacing:0.08em;
  color:var(--muted); margin:36px 0 12px; }
.widget { background:var(--card); border:1px solid var(--line); border-radius:10px;
  padding:16px 20px; margin-bottom:12px; }
.widget h3 { margin:0 0 10px; font-size:16px; }
.demo { display:flex; flex-wrap:wrap; gap:8px; align-items:baseline;
  padding:5px 0; border-top:1px solid var(--line); }
.widget .demo:first-of-type { border-top:0; }
.demo .name { flex:1 1 260px; font-size:14px; }
.demo a { font-size:12px; font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
  text-decoration:none; color:var(--accent); border:1px solid var(--line);
  border-radius:20px; padding:2px 10px; }
.demo a:hover { border-color:var(--accent); }
.featured { border-color:var(--accent); }
.featured .name strong { color:var(--accent); }
footer { margin-top:48px; padding-top:20px; border-top:1px solid var(--line);
  color:var(--muted); font-size:14px; }
footer a { color:var(--accent); }
</style>
</head>
<body>
<main>
<h1>DevExtreme Multi-Calendar — Demos</h1>
<p class="lede">
${total} demo${total === 1 ? '' : 's'} built from this fork. Also worth a look: the
<a href="../">live visual tests</a>, which cover the same calendar work with every
widget on one page.
</p>

<h2>Multi-calendar demos</h2>
<div class="widget featured">
${highlights.map(({ widget, demo, available }) => `  <div class="demo">
    <span class="name"><strong>${escape(spaced(widget))}</strong> — ${escape(spaced(demo))}</span>
    ${links(widget, demo, available)}
  </div>`).join('\n')}
</div>

${highlights.length === total ? '' : `<h2>All demos</h2>
${widgets.map(({ widget, demos }) => `<div class="widget">
  <h3>${escape(spaced(widget))}</h3>
${demos.map(({ demo, available }) => `  <div class="demo">
    <span class="name">${escape(spaced(demo))}</span>
    ${links(widget, demo, available)}
  </div>`).join('\n')}
</div>`).join('\n')}`}

<footer>
Source: <a href="https://github.com/alirezavafi/devextreme-fa">github.com/alirezavafi/devextreme-fa</a>
</footer>
</main>
</body>
</html>
`;

fs.writeFileSync(outFile, html);
console.log(`Wrote ${outFile}: ${total} demos across ${widgets.length} widgets, ${highlights.length} featured.`);
