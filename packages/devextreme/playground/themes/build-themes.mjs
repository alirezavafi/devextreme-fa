// Compiles the DevBox themes into artifacts/css/dx.devbox.{dark,light}.css, next
// to the stock themes, so the relative icons/ and fonts/ URLs resolve the same way.
//
// Mirrors compileFile() in packages/nx-infra-plugin/src/executors/scss-build/
// scss-build.impl.ts: sass with the data-uri() function, autoprefixer, clean-css.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const themesDir = path.dirname(fileURLToPath(import.meta.url));
const devextremeRoot = path.resolve(themesDir, '../..');
const scssRoot = path.resolve(devextremeRoot, '../devextreme-scss');
const outputDir = path.join(devextremeRoot, 'artifacts/css');

const scssRequire = createRequire(path.join(scssRoot, 'package.json'));
const sass = scssRequire('sass-embedded');
const postcss = scssRequire('postcss');
const autoprefixer = scssRequire('autoprefixer');
const CleanCss = scssRequire('clean-css');
const cleanCssOptions = scssRequire('./build/clean-css-options.json');

const toDataUri = (filePath, svgEncoding) => {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  if (ext === 'svg') {
    return `data:${svgEncoding ?? 'image/svg+xml;charset=UTF-8'},${encodeURIComponent(buffer.toString())}`;
  }
  return `data:image/${ext};base64,${buffer.toString('base64')}`;
};

const dataUri = (args) => {
  const list = args[0].asList;
  const hasEncoding = list.size === 2;
  const encoding = hasEncoding ? list.get(0).assertString().text : undefined;
  const url = list.get(hasEncoding ? 1 : 0).assertString().text;
  return new sass.SassString(`url("${toDataUri(path.resolve(scssRoot, url), encoding)}")`, { quotes: false });
};

if (!fs.existsSync(path.join(outputDir, 'icons'))) {
  throw new Error(`${outputDir} has no icons/ - build the stock themes first (see README "Run locally").`);
}

for (const source of fs.readdirSync(themesDir).filter((f) => /^dx\..+\.scss$/.test(f))) {
  const compiled = sass.compile(path.join(themesDir, source), {
    loadPaths: [path.join(scssRoot, 'scss')],
    functions: { 'data-uri($args...)': dataUri },
    silenceDeprecations: ['import'],
  });
  const prefixed = await postcss([autoprefixer()]).process(compiled.css, { from: undefined });
  const minified = new CleanCss(cleanCssOptions).minify(prefixed.css).styles;
  const outFile = path.join(outputDir, source.replace(/\.scss$/, '.css'));
  fs.writeFileSync(outFile, minified);
  console.log(`${path.relative(devextremeRoot, outFile)} (${Math.round(minified.length / 1024)} KB)`);
}
