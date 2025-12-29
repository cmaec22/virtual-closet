import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validate file upload
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string): string {
  const extension = originalName.split('.').pop() || 'jpg';
  const uuid = randomUUID();
  return `${uuid}.${extension}`;
}

/**
 * Upload file to local file system
 * Returns the public path to the uploaded file
 */
export async function uploadImage(file: File): Promise<{ path: string; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { path: '', error: validation.error };
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const filename = generateFilename(file.name);
    const filepath = join(UPLOAD_DIR, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(filepath, buffer);

    // Return public path
    const publicPath = `/uploads/${filename}`;
    return { path: publicPath };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { path: '', error: 'Failed to upload file' };
  }
}

/**
 * Delete uploaded file
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { unlink } = await import('fs/promises');
    const filename = path.split('/').pop();
    if (!filename) return false;

    const filepath = join(UPLOAD_DIR, filename);
    if (existsSync(filepath)) {
      await unlink(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
