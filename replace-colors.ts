import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Custom colors replacement
  content = content.replace(/from-orange-500/g, 'from-blue-600');
  content = content.replace(/to-rose-600/g, 'to-purple-600');
  content = content.replace(/via-rose-500/g, 'via-indigo-500');
  content = content.replace(/to-pink-500/g, 'to-cyan-400');
  content = content.replace(/bg-orange-500/g, 'bg-indigo-500');
  content = content.replace(/bg-orange-600/g, 'bg-indigo-600');
  content = content.replace(/text-orange-500/g, 'text-indigo-500');
  content = content.replace(/text-orange-400/g, 'text-cyan-400');
  content = content.replace(/text-orange-600/g, 'text-indigo-600');
  content = content.replace(/border-orange-500/g, 'border-indigo-500');
  content = content.replace(/border-orange-400/g, 'border-cyan-400');
  content = content.replace(/ring-orange-500/g, 'ring-indigo-500');
  content = content.replace(/rgba\(249,115,22/g, 'rgba(99,102,241'); // indigo-500 shadow
  content = content.replace(/orange-500/g, 'indigo-500'); // catch-all for any other orange-500
  content = content.replace(/rose-600/g, 'purple-600');
  content = content.replace(/rose-500/g, 'purple-500');
  content = content.replace(/rose-700/g, 'purple-700');

  fs.writeFileSync(filePath, content, 'utf-8');
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir('./src');
console.log('Done!');
