export interface Product {
  id: number;
  categoryId: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: string | number;
  originalPrice?: string | number | null;
  stock: number | null;
  image?: string | null;
  images?: string | null;
  sku?: string | null;
  slug: string;
  barcode?: string | null;
  discount?: number | null;
  isActive: boolean | null;
  isFeatured: boolean | null;
  isPromotion: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  image?: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  totalAmount: string | number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string | number;
  createdAt: Date;
}
