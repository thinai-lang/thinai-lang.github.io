import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const dist = 'dist';

const walk = async (directory, files = []) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(file, files);
    } else {
      files.push(file);
    }
  }
  return files;
};

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('.html'));
const idsByFile = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  idsByFile.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
}

const broken = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/href="([^"]*)"/g)) {
    const href = match[1];
    if (href === '' || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) {
      continue;
    }

    const [rawPath, fragment] = href.split('#');
    const path = decodeURIComponent(rawPath.split('?')[0]);
    if (!path) {
      if (fragment && !idsByFile.get(file)?.has(fragment)) {
        broken.push(`${href} in ${relative(dist, file)} (missing anchor)`);
      }
      continue;
    }

    const target = path.startsWith('/') ? join(dist, path) : resolve(dirname(file), path);
    let targetFile = target;
    let exists = false;
    try {
      const info = await stat(target);
      exists = true;
      if (info.isDirectory()) {
        targetFile = join(target, 'index.html');
        exists = (await stat(targetFile)).isFile();
      }
    } catch {
      try {
        targetFile = join(target, 'index.html');
        exists = (await stat(targetFile)).isFile();
      } catch {
        exists = false;
      }
    }

    if (!exists) {
      broken.push(`${href} in ${relative(dist, file)} (missing file)`);
    } else if (fragment && !idsByFile.get(targetFile)?.has(fragment)) {
      broken.push(`${href} in ${relative(dist, file)} (missing anchor)`);
    }
  }
}

if (broken.length) {
  for (const entry of broken) console.error(entry);
  console.error(`${broken.length} broken internal link(s).`);
  process.exit(1);
}

console.log(`Internal links and anchors OK (${htmlFiles.length} pages).`);
