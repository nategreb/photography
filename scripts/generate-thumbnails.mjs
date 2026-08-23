/**
 * Generate high-quality thumbnails from full-size images.
 * Outputs to public/images/thumbs/<gallery>/<filename>.jpg
 * Also outputs a manifest (public/images/manifest.json) with orientation data.
 * Preserves aspect ratio, resizes to max 800px wide, quality 85.
 */
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';

const FULLS_DIR = 'public/images/fulls';
const THUMBS_DIR = 'public/images/thumbs';
const MANIFEST_PATH = 'public/images/manifest.json';
const THUMB_WIDTH = 800;
const THUMB_QUALITY = 85;

// orientation: 'portrait' if height > width * 1.2, else 'landscape'
async function processGallery(galleryName) {
  const inputDir = join(FULLS_DIR, galleryName);
  const outputDir = join(THUMBS_DIR, galleryName);

  await mkdir(outputDir, { recursive: true });

  const files = await readdir(inputDir);
  const imageFiles = files.filter((f) => {
    const ext = extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`  ${galleryName}: ${imageFiles.length} images`);

  const results = [];

  for (const file of imageFiles) {
    const inputPath = join(inputDir, file);
    const outputName = basename(file, extname(file)) + '.jpg';
    const outputPath = join(outputDir, outputName);

    let metadata;
    try {
      metadata = await sharp(inputPath).metadata();
    } catch (err) {
      console.warn(`    ⚠ Can't read: ${file} — ${err.message}`);
      continue;
    }

    const w = metadata.width || 1;
    const h = metadata.height || 1;
    const orientation = h > w * 1.2 ? 'portrait' : 'landscape';

    results.push({
      filename: basename(file, extname(file)),
      file,
      orientation,
      width: w,
      height: h,
    });

    // Skip if thumbnail already exists and is newer than source
    try {
      const srcStat = await stat(inputPath);
      const thumbStat = await stat(outputPath);
      if (thumbStat.mtimeMs > srcStat.mtimeMs) {
        continue; // thumbnail is up to date
      }
    } catch {
      // thumbnail doesn't exist, generate it
    }

    try {
      await sharp(inputPath)
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
        .toFile(outputPath);
    } catch (err) {
      console.warn(`    ⚠ Failed: ${file} — ${err.message}`);
    }
  }

  return { gallery: galleryName, images: results };
}

async function main() {
  console.log('Generating thumbnails...');
  const galleries = await readdir(FULLS_DIR);
  const dirs = [];

  for (const name of galleries) {
    const s = await stat(join(FULLS_DIR, name));
    if (s.isDirectory()) dirs.push(name);
  }

  const manifest = {};
  for (const gallery of dirs) {
    const result = await processGallery(gallery);
    manifest[gallery] = result.images;
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written: ${Object.keys(manifest).length} galleries`);
  console.log('Done ✓');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
