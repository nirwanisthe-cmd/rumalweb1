export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses?: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  subcategoryId?: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  material?: string;
  careInstructions?: string;
  images: string[];
  featuredImage: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  status: 'draft' | 'published';
  ratingAverage: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
  featured: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  paymentMethod: 'COD' | 'Bank Transfer' | 'Card';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  active: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText?: string;
  buttonLink?: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface Settings {
  storeName: string;
  logo: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  currency: string;
  deliveryFee: number;
  bankTransferInstructions: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  footerText: string;
}
