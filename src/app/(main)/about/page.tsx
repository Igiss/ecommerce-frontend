import { Coffee, Eye, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Về chúng tôi</h1>
        <p className="text-sm text-stone-500 mt-2">Sứ mệnh mang lại trải nghiệm cá nhân hóa độc bản trên từng sản phẩm ly cốc.</p>
      </div>

      <div className="space-y-12">
        {/* Story */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xs">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-700" />
            Câu chuyện thương hiệu
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            CupShop ra đời với ý tưởng giúp mỗi người sở hữu một chiếc cốc mang đậm cá tính riêng. Chúng tôi không chỉ bán ly cốc thông thường, mà mang lại một không gian sáng tạo tự do. Nhờ công nghệ thiết kế mô phỏng 3D trực quan, khách hàng có thể ngắm nhìn sản phẩm ở mọi góc cạnh trước khi quyết định in ấn và sản xuất.
          </p>
        </div>

        {/* Quality Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-700" />
              Công nghệ in 3D & Decal cao cấp
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Chúng tôi sử dụng máy móc in ấn hiện đại đảm bảo màu sắc sắc nét, độ bám dính cao và không bị bong tróc hay phai màu sau hàng ngàn lần rửa. Các thiết kế phẳng của bạn được map chính xác lên mặt cong của ly cốc một cách hoàn hảo.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-amber-700" />
              Sự hài lòng của khách hàng
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Mỗi sản phẩm đều qua khâu kiểm duyệt chất lượng kỹ lưỡng trước khi đóng gói gửi đi. Từ chất liệu men sứ chịu nhiệt đến khả năng cách nhiệt tuyệt đối của Inox 304, CupShop luôn hướng tới tiêu chuẩn trải nghiệm hoàn hảo nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
