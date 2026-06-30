const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'postman', 'FitTrack-Auth.postman_collection.json');
const raw = fs.readFileSync(file, 'utf8');
const json = JSON.parse(raw);
const out = [];
function walk(items, depth) {
  for (const it of items) {
    out.push(`${'  '.repeat(depth)}NAME: ${it.name}`);
    if (it.request) {
      const m = it.request.method;
      const u = typeof it.request.url === 'string' ? it.request.url : (it.request.url && it.request.url.raw);
      out.push(`${'  '.repeat(depth)}  ${m} ${u}`);
      if (it.request.body && it.request.body.raw) {
        out.push(`${'  '.repeat(depth)}  BODY: ${it.request.body.raw.replace(/\s+/g, ' ')}`);
      }
    }
    if (it.event) {
      for (const ev of it.event) {
        out.push(`${'  '.repeat(depth)}  EVENT(${ev.listen}):`);
        const exec = ev.script && ev.script.exec ? ev.script.exec : [];
        for (const line of exec) out.push(`${'  '.repeat(depth)}    ${line}`);
      }
    }
    if (it.item) walk(it.item, depth + 1);
  }
}
walk(json.item, 0);
console.log(out.join('\n'));
