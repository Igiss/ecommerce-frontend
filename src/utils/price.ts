import { Product } from '@/types/product';

/**
 * Tính giá hiển thị/giao dịch thực tế hiện tại của sản phẩm.
 * Nếu đang trong thời gian Sale hợp lệ, trả về salePrice. Ngược lại trả về giá gốc (price).
 */
export function getActivePrice(product?: Partial<Product> | null): number {
  if (!product) return 0;
  const price = product.price || 0;

  if (product.salePrice == null || product.salePrice === undefined) {
    return price;
  }

  const now = new Date();

  // Có giá sale nhưng không cài đặt ngày bắt đầu và ngày kết thúc -> Áp dụng sale vĩnh viễn
  if (!product.saleStartDate && !product.saleEndDate) {
    return product.salePrice;
  }

  // Nếu có cài ngày bắt đầu, kiểm tra xem đã đến lúc sale chưa
  if (product.saleStartDate && now < new Date(product.saleStartDate)) {
    return price;
  }

  // Nếu có cài ngày kết thúc, kiểm tra xem đã qua lúc sale chưa
  if (product.saleEndDate && now > new Date(product.saleEndDate)) {
    return price;
  }

  // Còn lại là trong hạn sale
  return product.salePrice;
}

/**
 * Kiểm tra sản phẩm có đang thuộc chiến dịch Sale active không
 */
export function isProductOnSale(product?: Partial<Product> | null): boolean {
  if (!product) return false;
  const activePrice = getActivePrice(product);
  const basePrice = product.price || 0;
  return activePrice < basePrice;
}

/**
 * Tính % giảm giá thực tế của sản phẩm
 */
export function getDiscountPercentage(product?: Partial<Product> | null): number {
  if (!product) return 0;
  const activePrice = getActivePrice(product);
  const origPrice = product.originalPrice && product.originalPrice > activePrice
    ? product.originalPrice
    : (product.price || activePrice);

  if (origPrice <= activePrice) return 0;
  return Math.round(((origPrice - activePrice) / origPrice) * 100);
}

/**
 * Tính thời gian còn lại của đợt Sale
 */
export function getSaleTimeRemaining(saleEndDate?: string | Date) {
  if (!saleEndDate) return null;
  const end = new Date(saleEndDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isExpired: false };
}
