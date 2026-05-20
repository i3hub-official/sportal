// src/lib/server/upload/index.ts
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR   = 'static/uploads';
const MAX_SIZE_MB  = 2;
const MAX_BYTES    = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type UploadResult =
  | { success: true; url: string; filename: string }
  | { success: false; error: string };

// ── Ensure upload directory exists ────────────────────────────────────────────
async function ensureDir(dir: string) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

// ── Upload a photo (staff or student) ────────────────────────────────────────
export async function uploadPhoto(
  file: File,
  folder: 'staff' | 'students' | 'misc' = 'misc'
): Promise<UploadResult> {
  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}`
    };
  }

  // Validate size
  if (file.size > MAX_BYTES) {
    return { success: false, error: `File too large. Max size is ${MAX_SIZE_MB}MB.` };
  }

  const ext       = file.type.split('/')[1].replace('jpeg', 'jpg');
  const filename  = `${randomUUID()}.${ext}`;
  const dir       = path.join(UPLOAD_DIR, folder);
  const filepath  = path.join(dir, filename);

  await ensureDir(dir);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return {
    success: true,
    url:      `/uploads/${folder}/${filename}`,
    filename,
  };
}

// ── Delete a photo ────────────────────────────────────────────────────────────
export async function deletePhoto(url: string): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  const { unlink } = await import('fs/promises');
  const filepath = path.join('static', url);
  await unlink(filepath).catch(() => null); // silent fail if already deleted
}
