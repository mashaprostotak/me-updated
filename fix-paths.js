const fs = require('fs');
const path = require('path');

const pathPrefix = '/me-updated';
const publicDir = path.join(__dirname, 'public');

function fixPathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix absolute paths that should be prefixed
  // Match: href="/styles...", src="/static/...", src="/webpack-...", etc.
  
  // CSS and JS files
  content = content.replace(/(href|src)=["'](\/(?:styles|webpack|framework|app|commons|chunk|polyfill)[^"']+)["']/g, (match, attr, url) => {
    if (url.startsWith(pathPrefix) || url.startsWith('http') || url.startsWith('//')) {
      return match;
    }
    modified = true;
    return `${attr}="${pathPrefix}${url}"`;
  });
  
  // Static assets
  content = content.replace(/(href|src)=["'](\/static\/[^"']+)["']/g, (match, attr, url) => {
    if (url.startsWith(pathPrefix) || url.startsWith('http') || url.startsWith('//')) {
      return match;
    }
    modified = true;
    return `${attr}="${pathPrefix}${url}"`;
  });
  
  // Font URLs in CSS
  content = content.replace(/url\((\/static\/[^)]+)\)/g, (match, url) => {
    if (url.startsWith(pathPrefix) || url.startsWith('http') || url.startsWith('//')) {
      return match;
    }
    modified = true;
    return `url(${pathPrefix}${url})`;
  });
  
  // Manifest and icons
  content = content.replace(/(href|src)=["'](\/(?:manifest|icons|favicon)[^"']+)["']/g, (match, attr, url) => {
    if (url.startsWith(pathPrefix) || url.startsWith('http') || url.startsWith('//')) {
      return match;
    }
    modified = true;
    return `${attr}="${pathPrefix}${url}"`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed paths in: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
      fixPathsInFile(filePath);
    }
  });
}

console.log('Fixing paths with prefix:', pathPrefix);
walkDir(publicDir);
console.log('Done fixing paths!');

