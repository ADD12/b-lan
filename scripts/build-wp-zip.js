import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginSourceDir = path.resolve(__dirname, '../b-lan-wp-plugin');
const publicDir = path.resolve(__dirname, '../public');
const outputZipPath = path.resolve(publicDir, 'b-lan-plugin-v3.zip');

// Recursive function to get all files in a directory
function getFilesRecursive(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursive(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function createWpZip() {
  console.log('--- STARTING B-LAN WORDPRESS PLUGIN ZIP GENERATION (V.3) ---');
  console.log('Source directory:', pluginSourceDir);

  if (!fs.existsSync(pluginSourceDir)) {
    console.error('Error: Source directory does not exist!');
    process.exit(1);
  }

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Created directory:', publicDir);
  }

  const zip = new JSZip();
  const allFiles = getFilesRecursive(pluginSourceDir);

  for (const filePath of allFiles) {
    const relativePath = path.relative(pluginSourceDir, filePath);
    // WordPress plugins must be contained within a folder named after the plugin when unzipped
    const zipPath = path.join('b-lan-plugin', relativePath).replace(/\\/g, '/');
    const fileContent = fs.readFileSync(filePath);
    zip.file(zipPath, fileContent);
    console.log(`Adding file to ZIP: ${zipPath}`);
  }

  try {
    const content = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    const zipBuffer = content;
    const outputFiles = [
      path.resolve(publicDir, 'b-lan-plugin-v3.2.1.zip'),
      path.resolve(publicDir, 'b-lan-plugin-v3.2.0.zip'),
      path.resolve(publicDir, 'b-lan-plugin-v3.2.0-php8.3.13.zip'),
      path.resolve(publicDir, 'b-lan-plugin-v3.zip')
    ];

    for (const outPath of outputFiles) {
      fs.writeFileSync(outPath, zipBuffer);
      console.log(`Success! WordPress plugin ZIP saved to: ${outPath}`);
    }
    console.log('--- ZIP GENERATION COMPLETE ---');
  } catch (error) {
    console.error('Error generating ZIP:', error);
    process.exit(1);
  }
}

createWpZip();
