import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '../public/models');
const MODEL_URLS = {
  'tiny_face_detector_model-weights_manifest.json': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1',
  'face_expression_model-weights_manifest.json': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json',
  'face_expression_model-shard1': 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1'
};

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('Created models directory:', MODELS_DIR);
}

// Download function
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Main download function
async function downloadModels() {
  console.log('Starting face-api.js models download...');
  
  const downloadPromises = Object.entries(MODEL_URLS).map(([filename, url]) => {
    const filepath = path.join(MODELS_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${filename} (already exists)`);
      return Promise.resolve();
    }
    
    return downloadFile(url, filepath);
  });
  
  try {
    await Promise.all(downloadPromises);
    console.log('All face-api.js models downloaded successfully!');
    
    // Create a simple index file for reference
    const indexContent = `# Face-API.js Models
This directory contains the required models for face detection functionality.

## Files:
${Object.keys(MODEL_URLS).map(filename => `- ${filename}`).join('\n')}

## Usage:
These models are automatically loaded by the anti-cheating system when needed.
`;
    
    fs.writeFileSync(path.join(MODELS_DIR, 'README.md'), indexContent);
    console.log('Created README.md in models directory');
    
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

// Alternative download using curl (if available)
function downloadWithCurl() {
  console.log('Attempting to download with curl...');
  
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }
  
  Object.entries(MODEL_URLS).forEach(([filename, url]) => {
    const filepath = path.join(MODELS_DIR, filename);
    
    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${filename} (already exists)`);
      return;
    }
    
    try {
      execSync(`curl -L -o "${filepath}" "${url}"`, { stdio: 'inherit' });
      console.log(`Downloaded: ${filename}`);
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error.message);
    }
  });
}

// Check if curl is available
function isCurlAvailable() {
  try {
    execSync('curl --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  console.log('Face-API.js Models Downloader');
  console.log('=============================');
  
  if (isCurlAvailable()) {
    console.log('Using curl for downloads...');
    downloadWithCurl();
  } else {
    console.log('Using Node.js https module for downloads...');
    await downloadModels();
  }
  
  console.log('\nDownload complete!');
  console.log(`Models are available in: ${MODELS_DIR}`);
  console.log('\nNote: Make sure your web server serves these files from the /models path.');
}

// Run the script
main().catch(console.error); 