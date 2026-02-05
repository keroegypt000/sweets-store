import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb, createImage, getImages, getImageById, deleteImage, updateImage, getImagesByUsageType, getImageStatistics, getImagesByType } from './db';

describe('Image Management', () => {
  let testImageId: number;

  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    expect(db).toBeDefined();
  });

  it('should create an image record', async () => {
    const imageData = {
      fileName: 'test-image.jpg',
      fileKey: `images/general/test-${Date.now()}.jpg`,
      url: 'https://example.com/test-image.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      altText: 'Test Image',
      description: 'A test image for unit testing',
      usageType: 'general' as const,
      uploadedBy: 1,
    };

    const result = await createImage(imageData);
    expect(result).toBeDefined();
    expect(result?.fileName).toBe('test-image.jpg');
    expect(result?.url).toBe('https://example.com/test-image.jpg');
    expect(result?.usageType).toBe('general');
    
    if (result?.id) {
      testImageId = result.id;
    }
  });

  it('should retrieve all images', async () => {
    const images = await getImages(10, 0);
    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBeGreaterThan(0);
  });

  it('should retrieve image by ID', async () => {
    if (!testImageId) {
      console.log('Skipping test: testImageId not set');
      return;
    }

    const image = await getImageById(testImageId);
    expect(image).toBeDefined();
    expect(image?.id).toBe(testImageId);
    expect(image?.fileName).toBe('test-image.jpg');
  });

  it('should retrieve images by usage type', async () => {
    const images = await getImagesByUsageType('general', 10, 0);
    expect(Array.isArray(images)).toBe(true);
    // Should have at least the test image we created
    expect(images.length).toBeGreaterThan(0);
  });

  it('should update image metadata', async () => {
    if (!testImageId) {
      console.log('Skipping test: testImageId not set');
      return;
    }

    const updatedImage = await updateImage(testImageId, {
      altText: 'Updated Alt Text',
      description: 'Updated description',
      usageType: 'product',
    });

    expect(updatedImage).toBeDefined();
    expect(updatedImage?.altText).toBe('Updated Alt Text');
    expect(updatedImage?.description).toBe('Updated description');
    expect(updatedImage?.usageType).toBe('product');
  });

  it('should delete an image', async () => {
    if (!testImageId) {
      console.log('Skipping test: testImageId not set');
      return;
    }

    const result = await deleteImage(testImageId);
    expect(result).toBe(true);

    // Verify it's deleted
    const deletedImage = await getImageById(testImageId);
    expect(deletedImage).toBeUndefined();
  });

  it('should handle image with product usage type', async () => {
    const imageData = {
      fileName: 'product-image.jpg',
      fileKey: `images/product/test-${Date.now()}.jpg`,
      url: 'https://example.com/product-image.jpg',
      mimeType: 'image/jpeg',
      fileSize: 2048,
      altText: 'Product Image',
      description: 'A product image',
      usageType: 'product' as const,
      uploadedBy: 1,
    };

    const result = await createImage(imageData);
    expect(result).toBeDefined();
    expect(result?.usageType).toBe('product');

    // Retrieve by usage type
    const productImages = await getImagesByUsageType('product', 10, 0);
    const foundImage = productImages.find(img => img.id === result?.id);
    expect(foundImage).toBeDefined();

    // Cleanup
    if (result?.id) {
      await deleteImage(result.id);
    }
  });

  it('should handle image with category usage type', async () => {
    const imageData = {
      fileName: 'category-image.jpg',
      fileKey: `images/category/test-${Date.now()}.jpg`,
      url: 'https://example.com/category-image.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1536,
      altText: 'Category Image',
      description: 'A category image',
      usageType: 'category' as const,
      uploadedBy: 1,
    };

    const result = await createImage(imageData);
    expect(result).toBeDefined();
    expect(result?.usageType).toBe('category');

    // Cleanup
    if (result?.id) {
      await deleteImage(result.id);
    }
  });

  it('should handle image with banner usage type', async () => {
    const imageData = {
      fileName: 'banner-image.jpg',
      fileKey: `images/banner/test-${Date.now()}.jpg`,
      url: 'https://example.com/banner-image.jpg',
      mimeType: 'image/jpeg',
      fileSize: 3072,
      altText: 'Banner Image',
      description: 'A banner image',
      usageType: 'banner' as const,
      uploadedBy: 1,
    };

    const result = await createImage(imageData);
    expect(result).toBeDefined();
    expect(result?.usageType).toBe('banner');

    // Cleanup
    if (result?.id) {
      await deleteImage(result.id);
    }
  });
});


describe('Image Statistics', () => {
  it('should calculate image statistics correctly', async () => {
    const stats = await getImageStatistics();
    expect(stats).toBeDefined();
    expect(stats?.totalImages).toBeGreaterThanOrEqual(0);
    expect(stats?.totalSize).toBeGreaterThanOrEqual(0);
    expect(stats?.countByType).toBeDefined();
    expect(stats?.sizeByType).toBeDefined();
    expect(stats?.usagePercentage).toBeGreaterThanOrEqual(0);
    expect(stats?.usagePercentage).toBeLessThanOrEqual(100);
  });

  it('should have correct count by type structure', async () => {
    const stats = await getImageStatistics();
    expect(stats?.countByType).toHaveProperty('product');
    expect(stats?.countByType).toHaveProperty('category');
    expect(stats?.countByType).toHaveProperty('banner');
    expect(stats?.countByType).toHaveProperty('general');
  });

  it('should have correct size by type structure', async () => {
    const stats = await getImageStatistics();
    expect(stats?.sizeByType).toHaveProperty('product');
    expect(stats?.sizeByType).toHaveProperty('category');
    expect(stats?.sizeByType).toHaveProperty('banner');
    expect(stats?.sizeByType).toHaveProperty('general');
  });

  it('should calculate storage limit correctly', async () => {
    const stats = await getImageStatistics();
    expect(stats?.storageLimit).toBe(1024 * 1024 * 1024); // 1GB
  });

  it('should retrieve images by type', async () => {
    const productImages = await getImagesByType('product');
    expect(Array.isArray(productImages)).toBe(true);
  });
});
