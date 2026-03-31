const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'docs-content.js');

function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.agent' || file === 'resources' || file === 'scripts') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findMarkdownFiles(fullPath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function normalizePath(fullPath) {
  // Convert OS-specific path to relative posix path for JS keys
  const relPath = path.relative(rootDir, fullPath);
  return relPath.split(path.sep).join('/');
}

const mdFiles = findMarkdownFiles(rootDir);
let outputContent = 'window.MCCDocContent = {\n';

for (let i = 0; i < mdFiles.length; i++) {
  const filePath = mdFiles[i];
  const relativeName = normalizePath(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Convert lines to an array of strings to match the original formatting style
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const stringifiedLines = lines.map(line => `    ${JSON.stringify(line)}`).join(',\n');
  
  outputContent += `  "${relativeName}": [\n${stringifiedLines}\n  ].join("\\n")`;
  if (i < mdFiles.length - 1) {
    outputContent += ',\n';
  } else {
    outputContent += '\n';
  }
}

outputContent += '};\n';
fs.writeFileSync(outputFile, outputContent, 'utf-8');
console.log(`✅ successfully regenerated docs-content.js with ${mdFiles.length} markdown files!`);
