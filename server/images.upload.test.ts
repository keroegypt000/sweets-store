import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const API_BASE = 'http://localhost:3000/api';
const TEST_IMAGE_DIR = path.join(process.cwd(), 'webdev-static-assets', 'images');

describe('Image Upload API', () => {
  // Create a simple test image (1x1 pixel PNG)
  const createTestImage = (): Buffer => {
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x5b, 0x0b, 0xfb, 0xd3, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);
  };

  beforeAll(() => {
    // Ensure test image directories exist
    ['products', 'categories', 'banners'].forEach(folder => {
      const folderPath = path.join(TEST_IMAGE_DIR, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });
  });

  afterAll(() => {
    // Clean up test files
    const testFiles = fs.readdirSync(TEST_IMAGE_DIR, { recursive: true }) as string[];
    testFiles.forEach(file => {
      if (file.includes('test')) {
        const filePath = path.join(TEST_IMAGE_DIR, file);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    });
  });

  it('should upload image to categories folder', async () => {
    const form = new FormData();
    const testImage = createTestImage();
    
    form.append('file', testImage, 'test-category.png');
    form.append('folder', 'categories');

    const response = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      body: form as any,
      headers: form.getHeaders(),
    });

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(data.url).toBeDefined();
    expect(data.url).toContain('/webdev-static-assets/images/categories/');
    expect(data.filename).toBeDefined();
  });

  it('should upload image to products folder', async () => {
    const form = new FormData();
    const testImage = createTestImage();
    
    form.append('file', testImage, 'test-product.png');
    form.append('folder', 'products');

    const response = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      body: form as any,
      headers: form.getHeaders(),
    });

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(data.url).toContain('/webdev-static-assets/images/products/');
  });

  it('should create unique filenames for duplicate uploads', async () => {
    const form1 = new FormData();
    const form2 = new FormData();
    const testImage = createTestImage();
    
    form1.append('file', testImage, 'duplicate.png');
    form1.append('folder', 'categories');
    
    form2.append('file', testImage, 'duplicate.png');
    form2.append('folder', 'categories');

    const response1 = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      body: form1 as any,
      headers: form1.getHeaders(),
    });

    const response2 = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      body: form2 as any,
      headers: form2.getHeaders(),
    });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    const data1 = await response1.json() as any;
    const data2 = await response2.json() as any;

    expect(data1.filename).not.toBe(data2.filename);
  });
});
