export const siteConfig = {
  name: 'Gia Dụng 24h',
  title: 'Gia Dụng 24h - Đồ Gia Dụng & Thiết Bị Nhà Bếp Thông Minh Chính Hãng',
  description: 'Gia Dụng 24h chuyên cung cấp các thiết bị gia dụng nhà bếp, đồ dùng gia đình thông minh, nồi chiên không dầu, máy pha cà phê cao cấp. Cam kết hàng chính hãng 100%, giá tốt nhất, giao hàng nhanh toàn quốc.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://giadung24h.vn',
  ogImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80',
  keywords: [
    'đồ gia dụng',
    'gia dụng 24h',
    'thiết bị nhà bếp',
    'đồ dùng gia đình thông minh',
    'nồi chiên không dầu',
    'máy pha cà phê',
    'thiết bị gia dụng cao cấp',
    'mua đồ gia dụng online'
  ],
  authors: [
    {
      name: 'Gia Dụng 24h Team',
      url: 'https://giadung24h.vn',
    },
  ],
} as const
