// Builds assets/css/app.css from assets/css/input.css with Tailwind CSS v4.
// No CLI needed: scans the HTML and JS for class names and compiles only those.
//
// Usage: npm run build:css
// (Set TAILWIND_PATH to a tailwindcss package folder to use a copy outside node_modules.)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const twDir = process.env.TAILWIND_PATH || path.join(root, 'node_modules', 'tailwindcss');
const { compile } = await import(pathToFileURL(path.join(twDir, 'dist', 'lib.mjs')).href);

const SCAN = ['index.html', 'src'];
const files = [];
const walk = (p) => {
  const abs = path.join(root, p);
  if (!fs.existsSync(abs)) return;
  if (fs.statSync(abs).isDirectory()) fs.readdirSync(abs).forEach((f) => walk(path.join(p, f)));
  else if (/\.(html|js|mjs)$/.test(abs)) files.push(abs);
};
SCAN.forEach(walk);

// Every token that could be a class name. Tailwind ignores the ones that are not.
const candidates = new Set();
for (const f of files) {
  for (const tok of fs.readFileSync(f, 'utf8').split(/[\s"'`<>{};\\]+/)) {
    if (tok && tok.length < 120) candidates.add(tok.replace(/^\$\{?/, ''));
  }
}

const inputPath = path.join(root, 'assets/css/input.css');
const compiler = await compile(fs.readFileSync(inputPath, 'utf8'), {
  base: path.dirname(inputPath),
  loadStylesheet: async (id, base) => {
    const file = id === 'tailwindcss' ? path.join(twDir, 'index.css')
      : id.startsWith('tailwindcss/') ? path.join(twDir, id.slice('tailwindcss/'.length))
      : path.resolve(base, id);
    return { path: file, base: path.dirname(file), content: fs.readFileSync(file, 'utf8') };
  },
});

let css = compiler.build([...candidates]);
// Light minify: drop comments and blank lines.
css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
const out = path.join(root, 'assets/css/app.css');
fs.writeFileSync(out, `/* Built by scripts/build-css.mjs from input.css. Do not edit by hand. */\n${css}`);
console.log(`app.css: ${(css.length / 1024).toFixed(1)} KB from ${files.length} files`);
