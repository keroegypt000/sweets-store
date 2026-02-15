import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEST_IMAGE_DIR = path.join(process.cwd(), 'webdev-static-assets', 'images');

describe('Image Upload Integration', () => {
  it('should have image directories created', () => {
    expect(fs.existsSync(path.join(TEST_IMAGE_DIR, 'categories'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_IMAGE_DIR, 'products'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_IMAGE_DIR, 'banners'))).toBe(true);
  });

  it('should have multer installed', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    expect(packageJson.dependencies.multer).toBeDefined();
  });

  it('should have upload endpoint in api.ts', () => {
    const apiFile = fs.readFileSync(path.join(process.cwd(), 'server', 'api.ts'), 'utf-8');
    expect(apiFile).toContain('/upload-image');
    expect(apiFile).toContain('multer');
    expect(apiFile).toContain('diskStorage');
  });

  it('should have upload endpoint registered in index.ts', () => {
    const indexFile = fs.readFileSync(path.join(process.cwd(), 'server', '_core', 'index.ts'), 'utf-8');
    expect(indexFile).toContain('apiRouter');
    expect(indexFile).toContain('/api');
  });

  it('should have CategoryEditModal component with ImageUploader', () => {
    const modalFile = fs.readFileSync(path.join(process.cwd(), 'client', 'src', 'components', 'admin', 'CategoryEditModal.tsx'), 'utf-8');
    expect(modalFile).toContain('ImageUploader');
    expect(modalFile).toContain('formData');
  });

  it('should have ImageUploader component that sends to /api/upload-image', () => {
    const uploaderFile = fs.readFileSync(path.join(process.cwd(), 'client', 'src', 'components', 'admin', 'ImageUploader.tsx'), 'utf-8');
    expect(uploaderFile).toContain('/api/upload-image');
    expect(uploaderFile).toContain('FormData');
    expect(uploaderFile).toContain('folder');
  });
});
