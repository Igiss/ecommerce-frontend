import type { Metadata } from 'next'
import {
  Sparkles,
  Award,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  Star,
  Check,
  Zap,
  Flame,
  Home as HomeIcon,
  Smile
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Giới thiệu về Gia Dụng 24h',
  description: 'Tìm hiểu về Gia Dụng 24h - Thương hiệu cung cấp thiết bị gia dụng nhà bếp & đồ dùng gia đình thông minh uy tín, chất lượng hàng đầu Việt Nam.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50/40">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 border-b border-stone-200/50">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/15 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl -z-10 animate-pulse duration-[10s]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-bold text-amber-800 uppercase tracking-widest border border-amber-200/50">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                Câu chuyện thương hiệu
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight">
                Về Gia Dụng 24h - <br />
                <span className="bg-gradient-to-r from-amber-800 via-amber-700 to-orange-600 bg-clip-text text-transparent">
                  Tiện Nghi & Công Nghệ Hiện Đại
                </span>
              </h1>
              <p className="text-base sm:text-lg text-stone-650 leading-relaxed font-medium">
                Tại Gia Dụng 24h, chúng tôi mang tới giải pháp không gian sống tiện nghi, hiện đại cho mọi gia đình Việt. Những thiết bị gia dụng nhà bếp thông minh và đồ dùng gia đình chất lượng cao giúp tiết kiệm thời gian, nâng tầm chất lượng cuộc sống hàng ngày.
              </p>
              <p className="text-sm text-stone-500 leading-relaxed">
                Bằng việc hợp tác trực tiếp với các nhà sản xuất thiết bị gia dụng hàng đầu và ứng dụng công nghệ thương mại điện tử thế hệ mới, Gia Dụng 24h cam kết mang tới cho khách hàng những sản phẩm chính hãng 100%, thiết kế tinh tế và trải nghiệm mua sắm an tâm nhất.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/products"
                  className="group rounded-xl bg-amber-800 hover:bg-amber-950 transition-all px-7 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg active:scale-98 flex items-center gap-2"
                >
                  Khám phá sản phẩm
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#tim-hieu-them"
                  className="rounded-xl border border-stone-300 bg-white hover:bg-stone-50 transition-all px-7 py-4 text-xs font-bold uppercase tracking-wider text-stone-700 active:scale-98"
                >
                  Tìm hiểu sứ mệnh
                </a>
              </div>
            </div>

            {/* Right Column Image with Interactive Elements */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[440px] aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] rounded-3xl p-3 bg-white shadow-2xl border border-stone-200/50 overflow-visible group">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/5 to-orange-600/5 rounded-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"
                  alt="Không gian bếp hiện đại và thiết bị gia dụng"
                  className="h-full w-full object-cover rounded-2xl shadow-inner transition-transform duration-500 group-hover:scale-[1.02]"
                />
                
                {/* Floating reviews badge */}
                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md border border-stone-100 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-bounce duration-[4s]">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                    <Star className="h-5 w-5 fill-amber-550 text-amber-550" />
                  </div>
                  <div>
                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Đánh giá 5 sao</p>
                    <p className="text-xs font-black text-stone-850">4.9/5 từ 10,000+ Khách hàng</p>
                  </div>
                </div>

                {/* Floating guarantee badge */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md border border-stone-100 shadow-xl rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Cam kết chính hãng</p>
                    <p className="text-xs font-black text-stone-850">Bảo hành 1 đổi 1 toàn quốc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Strip */}
      <section className="relative z-10 -mt-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/90 backdrop-blur-md border border-stone-200/60 p-8 rounded-3xl shadow-xl shadow-stone-200/50">
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-800">50,000+</p>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Đơn hàng hoàn thành</p>
          </div>
          <div className="text-center space-y-1 border-l border-stone-200/60">
            <p className="text-3xl sm:text-4xl font-black text-amber-800">99.5%</p>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Khách hàng hài lòng</p>
          </div>
          <div className="text-center space-y-1 border-l border-stone-200/60">
            <p className="text-3xl sm:text-4xl font-black text-amber-800">100+</p>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Thương hiệu & Đối tác</p>
          </div>
          <div className="text-center space-y-1 border-l border-stone-200/60">
            <p className="text-3xl sm:text-4xl font-black text-amber-800">24/7</p>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Hỗ trợ & Bảo hành</p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section id="tim-hieu-them" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/40">
            Giá trị cốt lõi
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Điểm chạm tạo nên sự khác biệt
          </h2>
          <p className="text-sm sm:text-base text-stone-500 leading-relaxed">
            Gia Dụng 24h tự hào mang tới các sản phẩm gia dụng chất lượng cao, cam kết tiêu chuẩn an toàn sức khỏe để đồng hành cùng bạn trong từng bữa ăn và không gian sống gia đình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Smart Home Tech */}
          <div className="group rounded-3xl border border-stone-200/80 bg-white p-8 shadow-xs hover:shadow-xl hover:border-amber-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">Công Nghệ Thông Minh</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Trang bị bảng điều khiển cảm ứng, hẹn giờ thông minh và công nghệ tiết kiệm điện tối ưu cho các thiết bị nhà bếp hiện đại.
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-amber-850 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Khám phá thêm <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 2: Safe Quality Material */}
          <div className="group rounded-3xl border border-stone-200/80 bg-white p-8 shadow-xs hover:shadow-xl hover:border-amber-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">An Toàn Cho Sức Khỏe</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tất cả sản phẩm xoong nồi, máy móc gia dụng đều sử dụng chất liệu Inox 304, chống dính Teflon an toàn, không chứa chất bpa độc hại.
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-amber-850 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Tiêu chuẩn chất lượng <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 3: Modern Aesthetic Design */}
          <div className="group rounded-3xl border border-stone-200/80 bg-white p-8 shadow-xs hover:shadow-xl hover:border-amber-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 mb-6 group-hover:scale-110 transition-transform">
                <HomeIcon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">Thiết Kế Sang Trọng</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Phong cách tối giản chuẩn Châu Âu với các tông màu trung tính sang trọng, phù hợp tôn vinh vẻ đẹp của mọi căn bếp gia đình.
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-amber-850 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Bộ sưu tập bếp <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 4: Logistic Delivery */}
          <div className="group rounded-3xl border border-stone-200/80 bg-white p-8 shadow-xs hover:shadow-xl hover:border-amber-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 mb-6 group-hover:scale-110 transition-transform">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">Vận Chuyển Chống Vỡ</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Giải pháp đóng gói chuyên dụng 4 lớp chống sốc. Cam kết 1 đổi 1 và bồi thường 100% nếu phát sinh hư hỏng do vận chuyển.
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-amber-850 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Chính sách vận chuyển <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Brand History Timeline Section */}
      <section className="bg-stone-100/60 border-y border-stone-200/40 py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/40">
              Lịch sử phát triển
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Hành trình khẳng định vị thế
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              Nhìn lại những cột mốc đáng nhớ trên hành trình mang đồ gia dụng thông minh tới hàng triệu gia đình Việt.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Center line for desktop timeline */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-700/60 via-amber-700/20 to-amber-750/5 -translate-x-1/2" />

            <div className="space-y-16">
              {/* Timeline Item 1 - Left */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center">
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                  <span className="h-10 w-10 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center shadow-lg border-4 border-stone-50">
                    24
                  </span>
                </div>
                <div className="ml-12 md:ml-0 w-full md:w-[calc(50%-2rem)] md:text-right md:pr-4">
                  <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
                    <span className="inline-block text-[9px] font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md">Năm 2024</span>
                    <h4 className="text-base font-extrabold text-stone-900">Thành lập thương hiệu Gia Dụng 24h</h4>
                    <p className="text-xs text-stone-550 leading-relaxed">
                      Bắt đầu xây dựng chuỗi cung ứng các thiết bị gia dụng nhà bếp thông minh chính hãng với tiêu chí mang lại trải nghiệm nấu nướng tiện lợi và an toàn.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-[calc(50%+2rem)]" />
              </div>

              {/* Timeline Item 2 - Right */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center">
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                  <span className="h-10 w-10 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center shadow-lg border-4 border-stone-50">
                    25
                  </span>
                </div>
                <div className="hidden md:block w-[calc(50%-2rem)]" />
                <div className="ml-12 md:ml-8 w-full md:w-[calc(50%-2rem)] pl-4">
                  <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
                    <span className="inline-block text-[9px] font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md">Năm 2025</span>
                    <h4 className="text-base font-extrabold text-stone-900">Hợp tác 100+ Nhà sản xuất hàng đầu</h4>
                    <p className="text-xs text-stone-550 leading-relaxed">
                      Mở rộng kho vận và kết nối trực tiếp với hơn 100 thương hiệu gia dụng lớn, mang tới danh mục sản phẩm đa dạng từ nồi chiên, máy pha cà phê đến đồ dùng gia đình.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Item 3 - Left */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center">
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                  <span className="h-10 w-10 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center shadow-lg border-4 border-stone-50">
                    26
                  </span>
                </div>
                <div className="ml-12 md:ml-0 w-full md:w-[calc(50%-2rem)] md:text-right md:pr-4">
                  <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
                    <span className="inline-block text-[9px] font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md">Năm 2026</span>
                    <h4 className="text-base font-extrabold text-stone-900">Mô hình E-Commerce thông minh đa nền tảng</h4>
                    <p className="text-xs text-stone-550 leading-relaxed">
                      Nâng cấp hệ sinh thái thương mại điện tử tích hợp Trợ lý AI tư vấn và quản lý Banner động, kết nối trực tiếp Người mua, Chủ xưởng và Đơn vị giao hàng hỏa tốc.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-[calc(50%+2rem)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Promises / Why Trust Us */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center font-sans">
          {/* Text Left */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/40">
              Cam kết của Gia Dụng 24h
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              An tâm mua sắm, trọn vẹn niềm tin
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              Chúng tôi hiểu rằng mỗi thiết bị gia dụng mua về là sự đầu tư cho sức khỏe và tiện nghi của cả gia đình. Vì thế, Gia Dụng 24h tự tin đặt ra những tiêu chuẩn dịch vụ khắt khe nhất để bảo vệ quyền lợi người tiêu dùng:
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-stone-900">Đồng kiểm hàng khi thanh toán</h4>
                  <p className="text-xs text-stone-500">Khách hàng hoàn toàn được mở kiểm tra thiết bị trước khi thanh toán và nhận hàng.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-stone-900">Bảo hành 1 đổi 1 trong 30 ngày</h4>
                  <p className="text-xs text-stone-500">Bất kỳ lỗi kỹ thuật nào từ nhà sản xuất sẽ được đổi mới sản phẩm hoàn toàn miễn phí.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-stone-900">Giao hàng hỏa tốc toàn quốc</h4>
                  <p className="text-xs text-stone-500">Kết nối các đơn vị vận chuyển hàng đầu giúp giao hàng nhanh chóng chỉ từ 1 - 2 ngày làm việc.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Image Grid Right */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80"
                alt="Thiết bị nhà bếp hiện đại"
                className="w-full h-48 object-cover rounded-3xl shadow-md border border-stone-200/50"
              />
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80"
                alt="Thiết bị gia dụng tiện nghi"
                className="w-full h-64 object-cover rounded-3xl shadow-md border border-stone-200/50"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&auto=format&fit=crop&q=80"
                alt="Không gian phòng bếp hiện đại"
                className="w-full h-64 object-cover rounded-3xl shadow-md border border-stone-200/50"
              />
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80"
                alt="Gia dụng cao cấp"
                className="w-full h-48 object-cover rounded-3xl shadow-md border border-stone-200/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-925 to-stone-950 py-24 text-center text-white relative overflow-hidden border-t border-stone-850">
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_200px,rgba(217,119,6,0.15),transparent)]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-950/20 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl -z-10" />

        <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-8">
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/25 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            Bắt đầu trải nghiệm mua sắm
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Sẵn sàng nâng tầm <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Không Gian Sống Gia Đình Bạn?
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-stone-400 text-sm sm:text-base leading-relaxed">
            Khám phá ngay hàng ngàn sản phẩm đồ gia dụng và thiết bị nhà bếp thông minh chính hãng với giá ưu đãi tốt nhất tại Gia Dụng 24h.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 transition-all px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-600/25 active:scale-95"
            >
              Khám phá sản phẩm
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
