# BÁO CÁO ĐỒ ÁN MÔN THƯƠNG MẠI ĐIỆN TỬ
**ĐỀ TÀI: XÂY DƯNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ KINH DOANH VÀ TÙY CHỈNH THIẾT KẾ LY CỐC 3D TRỰC TUYẾN (CUPSHOP)**

---

# CHƯƠNG 1. GIỚI THIỆU

## 1.1 Mô tả bài toán TMĐT
Trong những năm gần đây, ngành thương mại điện tử (TMĐT) bán lẻ đã có những bước phát triển vượt bậc. Người tiêu dùng không chỉ dừng lại ở việc tìm kiếm các sản phẩm có sẵn mà ngày càng có xu hướng tìm kiếm trải nghiệm **cá nhân hóa (Personalization)** cao cấp, đặc biệt là các sản phẩm mang dấu ấn cá nhân như ly, cốc, quà tặng lưu niệm.

Tuy nhiên, các mô hình bán ly cốc truyền thống hiện nay đang gặp phải nhiều hạn chế:
- **Khó hình dung sản phẩm thực tế:** Khách hàng khi đặt làm ly cốc in hình theo yêu cầu thường chỉ gửi file ảnh 2D qua Zalo, Facebook hoặc email, dẫn đến việc khó hình dung sản phẩm sau khi in lên bề mặt cong 3D sẽ như thế nào.
- **Quy trình trao đổi thủ công, tốn thời gian:** Nhận yêu cầu -> chỉnh sửa mockup 2D -> báo giá -> chốt mẫu -> đặt cọc -> sản xuất. Quy trình này phân mảnh qua nhiều kênh tin nhắn, dễ sai sót thông tin đơn hàng.
- **Thiếu sự hỗ trợ sáng tạo:** Khách hàng muốn có hình ảnh độc đáo nhưng không biết dùng phần mềm thiết kế chuyên nghiệp (Photoshop, AI).

Để giải quyết bài toán trên, hệ thống **Cupshop** ra đời với mô hình Thương mại Điện tử tích hợp công nghệ đồ họa **3D Realtime (Three.js)** và **Trí tuệ nhân tạo (AI)**. Hệ thống cho phép người dùng tự do tương tác xoay 360 độ, đổi màu sắc, thêm chữ, upload hình ảnh lên bề mặt cốc 3D ngay trên trình duyệt, đồng thời tích hợp AI gợi ý thiết kế độc đáo.

## 1.2 Xác định mục tiêu chung

### Mục tiêu kinh doanh
- Xây dựng nền tảng TMĐT chuyên biệt cho mặt hàng ly cốc và sản phẩm quà tặng tùy chỉnh, giúp tối ưu hóa quy trình từ khâu ý tưởng thiết kế đến khâu đặt hàng và thanh toán.
- Giảm 70% thời gian tư vấn và chốt mẫu thiết kế giữa khách hàng và nhân viên cửa hàng nhờ bộ công cụ Customizer 3D trực quan.
- Tăng tỷ lệ chuyển đổi đơn hàng (Conversion Rate) bằng trải nghiệm mua sắm tương tác sống động và cổng thanh toán nội địa tiện lợi (VNPAY).

### Mục tiêu kỹ thuật
- **Frontend:** Phát triển ứng dụng Web phản hồi nhanh (SPA/SSR) bằng **Next.js 16 (React 19)** và **Tailwind CSS**, tích hợp thư viện **Three.js / React Three Fiber** để render mô hình 3D mượt mà với hiệu năng cao.
- **Backend:** Xây dựng hệ thống kiến trúc RESTful API mạnh mẽ, bảo mật bằng **NestJS (TypeScript)** kết hợp cơ sở dữ liệu NoSQL **MongoDB (Mongoose)** đảm bảo tính mở rộng linh hoạt (Scalability).
- **Tích hợp dịch vụ đám mây (Cloud Infrastructure):** 
  - Tích hợp cổng thanh toán trực tuyến **VNPAY**.
  - Tích hợp hệ thống lưu trữ ảnh và texture 3D tốc độ cao **Cloudinary**.
  - Tích hợp WebSockets (**Socket.IO**) để gửi thông báo thời gian thực (Realtime Notifications) cho Admin và Khách hàng.
  - Tích hợp **Google AI (Gemini)** hỗ trợ tự động gợi ý mẫu thiết kế cho người dùng.

---

# CHƯƠNG 2. XÂY DƯNG KIẾN TRÚC

## 2.1 Kiến trúc hệ thống TMĐT
Hệ thống Cupshop được áp dụng kiến trúc **Client - Server hiện đại**, tách biệt hoàn toàn giữa giao diện người dùng (Frontend) và xử lý nghiệp vụ, dữ liệu (Backend). Sự giao tiếp giữa hai nền tảng được thực hiện thông qua giao thức **HTTPS RESTful API** chuẩn JSON và luồng kết nối song công **WebSockets** cho các tác vụ thời gian thực.

```mermaid
flowchart TB
    subgraph ClientLayer ["Lớp Khách hàng (Client Layer)"]
        Browser["Trình duyệt Web (PC/Mobile browser)"]
        ThreeCanvas["3D Customizer Engine (Three.js Canvas)"]
    end

    subgraph CDNLayer ["Lớp Phân phối & Proxy"]
        NextServer["Next.js SSR / Static CDN (Port 3005)"]
    </subgraph>

    subgraph ApplicationLayer ["Lớp Application Server (Backend NestJS - Port 3000)"]
        AuthService["Auth & JWT Security"]
        OrderService["Order & Checkout Service"]
        CustomService["Custom 3D Design Service"]
        NotifService["Realtime Socket.IO Gateway"]
    end

    subgraph DatabaseLayer ["Lớp Dữ liệu & Lưu trữ (Data Layer)"]
        MongoDB[(MongoDB Atlas Cluster)]
        Redis[(Cache / Queue Redis)]
    end

    subgraph ExternalServices ["Dịch vụ Bên thứ 3 (Third-party Cloud)"]
        VNPAY["Cổng thanh toán VNPAY"]
        Cloudinary["Cloudinary Image/Texture CDN"]
        GoogleAI["Google Gemini AI Engine"]
    </subgraph>

    Browser -->|HTTP GET/POST| NextServer
    Browser <-->|REST API / JWT| ApplicationLayer
    Browser <-->|WebSocket| NotifService
    NextServer -->|Render UI| Browser

    ApplicationLayer <-->|Mongoose ORM| MongoDB
    ApplicationLayer <-->|Caching| Redis

    OrderService <-->|Redirect / IPN| VNPAY
    CustomService <-->|Upload Texture| Cloudinary
    CustomService <-->|Prompt / Generate| GoogleAI
```

## 2.2 Cơ sở hạ tầng TMĐT
Cơ sở hạ tầng của hệ thống được xây dựng trên nền tảng điện toán đám mây (Cloud Computing) đảm bảo khả năng chịu tải cao và tính sẵn sàng liên tục (High Availability):
1. **Máy chủ ứng dụng (Application Hosting):** Backend NestJS được container hóa bằng Docker và triển khai trên hạ tầng VPS/Cloud (như AWS EC2, DigitalOcean hoặc Render), cấu hình Nginx làm Reverse Proxy và SSL Termination.
2. **Hệ quản trị cơ sở dữ liệu (Database Infrastructure):** Sử dụng **MongoDB Atlas Cloud Cluster** với kiến trúc Replica Set giúp phân tán dữ liệu, tự động sao lưu (Automated Backup) và đảm bảo tính nhất quán dữ liệu cho các giao dịch TMĐT.
3. **Mạng lưới phân phối nội dung (CDN & Media Storage):** Sử dụng **Cloudinary** làm nơi lưu trữ toàn bộ hình ảnh sản phẩm, avatar người dùng, các file thiết kế 3D texture và hình ảnh xuất ra từ AI. CDN giúp tối ưu dung lượng ảnh tự động (WebP/AVIF) và giảm trễ tải trang.
4. **Hạ tầng thanh toán điện tử:** Kết nối trực tiếp với cổng thanh toán quốc gia **VNPAY Sandbox/Production** thông qua cơ chế mã hóa chữ ký bảo mật SHA512 và xác thực giao dịch qua Webhook (IPN - Instant Payment Notification).

## 2.3 Kiến trúc và cơ sở hạ tầng phần mềm Cupshop
Mã nguồn Cupshop tuân thủ nghiêm ngặt nguyên lý thiết kế **SOLID** và mô hình **Modular Monolith** trong NestJS, chia tách hệ thống thành các module độc lập theo tính năng nghiệp vụ (Domain-Driven Design).

```mermaid
flowchart LR
    subgraph ControllerLayer ["Lớp Controller (API Routing)"]
        OrdersController["OrdersController"]
        ProductsController["ProductsController"]
        DesignsController["CustomDesignsController"]
    end

    subgraph ServiceLayer ["Lớp Service (Business Logic)"]
        OrdersService["OrdersService"]
        ProductsService["ProductsService"]
        DesignsService["CustomDesignsService"]
    end

    subgraph RepositoryLayer ["Lớp Data Access (Schemas)"]
        OrderModel["OrderSchema"]
        ProductModel["ProductSchema"]
        DesignModel["CustomDesignSchema"]
    end

    ControllerLayer -->|DTO / Validation| ServiceLayer
    ServiceLayer -->|Mongoose Queries| RepositoryLayer
```

---

# CHƯƠNG 3. MÔ HÌNH HÓA YÊU CẦU

## 3.1 Usecase Diagram (Hướng Package / Hướng Actor)

### 3.1.1 Sơ đồ mức tổng quát
Hệ thống phân định rõ ràng 4 nhóm tác nhân (Actor) chính tương tác với hệ thống: **Khách hàng (Customer)**, **Quản trị viên (Admin)**, **Chủ cửa hàng (Shop Owner)**, và **Nhân viên giao hàng (Shipper)**.

```mermaid
flowchart LR
    subgraph Actors ["Các Tác Nhân"]
        Customer(["Khách hàng (Customer)"])
        Owner(["Chủ cửa hàng (Shop Owner)"])
        Admin(["Quản trị viên (Admin)"])
        Shipper(["Nhân viên giao hàng (Shipper)"])
    end

    subgraph System ["Hệ Thống TMĐT Cupshop"]
        UC_Account["Quản lý tài khoản & Xác thực"]
        UC_Shop["Xem & Tìm kiếm sản phẩm"]
        UC_Custom["Tùy chỉnh thiết kế ly cốc 3D & AI"]
        UC_Order["Đặt hàng & Thanh toán VNPAY"]
        UC_ManageCatalog["Quản lý danh mục & Sản phẩm"]
        UC_ManageOrder["Quản lý & Duyệt đơn hàng"]
        UC_Shipping["Cập nhật trạng thái giao hàng"]
        UC_Report["Thống kê báo cáo doanh thu"]
    end

    Customer --> UC_Account
    Customer --> UC_Shop
    Customer --> UC_Custom
    Customer --> UC_Order

    Owner --> UC_ManageCatalog
    Owner --> UC_ManageOrder
    Owner --> UC_Report

    Admin --> UC_Account
    Admin --> UC_ManageCatalog
    Admin --> UC_ManageOrder
    Admin --> UC_Report

    Shipper --> UC_Shipping
```

### 3.1.2 Sơ đồ chi tiết 1: Phân hệ Đặt hàng & Thanh toán VNPAY

```mermaid
flowchart TD
    Actor["Khách hàng (Customer)"]

    subgraph OrderSystem ["Phân hệ Đặt hàng & Thanh toán"]
        UC_Cart["Thêm sản phẩm vào giỏ hàng"]
        UC_ApplyCoupon["Áp dụng mã giảm giá (Coupon)"]
        UC_Checkout["Tiến hành đặt hàng (Checkout)"]
        UC_SelectPayment["Chọn phương thức thanh toán"]
        UC_PayCOD["Thanh toán khi nhận hàng (COD)"]
        UC_PayVNPAY["Thanh toán trực tuyến qua VNPAY"]
        UC_TrackOrder["Theo dõi trạng thái đơn hàng"]
    end

    Actor --> UC_Cart
    Actor --> UC_Checkout
    Actor --> UC_TrackOrder

    UC_Checkout .->|<<include>>| UC_SelectPayment
    UC_Checkout .->|<<extend>>| UC_ApplyCoupon
    UC_SelectPayment <|-- UC_PayCOD
    UC_SelectPayment <|-- UC_PayVNPAY
```

### 3.1.3 Sơ đồ chi tiết 2: Phân hệ Tùy chỉnh thiết kế 3D & AI

```mermaid
flowchart TD
    Actor["Khách hàng (Customer)"]

    subgraph CustomSystem ["Phân hệ Thiết kế Ly cốc 3D Custom"]
        UC_SelectModel["Chọn mẫu ly cốc 3D phôi"]
        UC_Rotate3D["Tương tác xoay/phóng to thu nhỏ 3D"]
        UC_ChangeColor["Thay đổi màu sắc các bộ phận"]
        UC_UploadImg["Upload hình ảnh cá nhân lên cốc"]
        UC_AIGen["Sử dụng AI tạo hình ảnh theo prompt"]
        UC_SaveDesign["Lưu mẫu thiết kế cá nhân"]
        UC_OrderCustom["Đặt hàng mẫu cốc tự thiết kế"]
    end

    Actor --> UC_SelectModel
    Actor --> UC_SaveDesign
    Actor --> UC_OrderCustom

    UC_SelectModel .->|<<include>>| UC_Rotate3D
    UC_SelectModel .->|<<extend>>| UC_ChangeColor
    UC_SelectModel .->|<<extend>>| UC_UploadImg
    UC_UploadImg .->|<<extend>>| UC_AIGen
    UC_OrderCustom .->|<<include>>| UC_SaveDesign
```

---

## 3.2 Bảng Usecase (Đặc tả chi tiết ca sử dụng)

### Bảng 3.1: Đặc tả Usecase "Đặt hàng và Thanh toán qua VNPAY"
| Thuộc tính | Mô tả chi tiết |
| :--- | :--- |
| **Tên Usecase** | Đặt hàng và Thanh toán qua cổng VNPAY |
| **Mã Usecase** | UC-ORD-001 |
| **Tác nhân chính** | Khách hàng (Customer đã đăng nhập) |
| **Mục tiêu** | Khách hàng hoàn tất việc tạo đơn hàng từ giỏ và thanh toán thành công qua VNPAY |
| **Điều kiện tiên quyết** | Giỏ hàng của khách có ít nhất 1 sản phẩm hợp lệ, tồn kho đủ cung ứng |
| **Luồng sự kiện chính (Basic Flow)** | 1. Khách hàng truy cập trang Giỏ hàng và nhấn nút "Thanh toán".<br/>2. Hệ thống hiển thị form nhập thông tin giao hàng và danh sách sản phẩm.<br/>3. Khách hàng nhập địa chỉ, chọn phương thức thanh toán là **"VNPAY"** và nhấn "Đặt hàng".<br/>4. Backend NestJS kiểm tra tồn kho, tạo đơn hàng với trạng thái `pending_payment` và khởi tạo URL thanh toán ký mã SHA512 từ VNPAY.<br/>5. Hệ thống chuyển hướng (Redirect) trình duyệt của khách sang trang thanh toán của VNPAY.<br/>6. Khách hàng thực hiện quét mã QR / nhập thông tin thẻ ATM nội địa để thanh toán.<br/>7. VNPAY xác thực thành công và gửi IPN (Webhook) báo về Backend Cupshop.<br/>8. Backend cập nhật trạng thái đơn thành `paid`, trừ số lượng tồn kho và gửi thông báo Realtime cho Admin.<br/>9. Trình duyệt hiển thị trang "Đặt hàng thành công". |
| **Luồng thay thế / Ngoại lệ** | - **4a. Tồn kho không đủ:** Hệ thống báo lỗi sản phẩm hết hàng, quay lại giỏ hàng.<br/>- **7a. Thanh toán VNPAY thất bại/Hủy:** Đơn hàng được giữ ở trạng thái `payment_failed` hoặc tự động hủy sau 15 phút, hoàn lại số lượng tạm giữ. |

---

## 3.3 Activity Diagram (3 luồng nghiệp vụ chính có khung phân làn theo hệ thống)

Để phản ánh chính xác sự tương tác giữa người dùng và các phân hệ phần mềm trong hệ thống Cupshop, các biểu đồ hoạt động (Activity Diagram) dưới đây được thiết kế theo mô hình phân làn (**Swimlanes / Khung bao quanh**), chỉ rõ trách nhiệm của từng tác nhân và các lớp hệ thống (Frontend, Backend NestJS, Dịch vụ Cloud).

### 3.3.1 Luồng 1: Đặt hàng & Thanh toán trực tuyến (Checkout & VNPAY Payment Workflow)

```mermaid
flowchart TD
    subgraph Actor_Customer [" 👤 Khách hàng (Customer) "]
        W1_Start([Bắt đầu]) --> W1_ViewCart["Xem giỏ hàng"]
        W1_ViewCart --> W1_ClickCheckout["Nhấn nút 'Thanh toán'"]
        W1_InputInfo["Nhập địa chỉ giao hàng & Chọn mã giảm giá"]
        W1_SelectPay{"Chọn phương thức<br/>thanh toán?"}
        W1_VNPAYAction["Quét mã QR / Nhập thẻ ATM trên cổng VNPAY"]
    end

    subgraph Sys_Frontend [" 🖥️ Next.js Web App (Frontend) "]
        W1_RenderForm["Hiển thị form Checkout & Tính phí vận chuyển"]
        W1_Redirect["Redirect trình duyệt sang trang VNPAY"]
        W1_ShowSuccess["Render màn hình 'Đặt hàng thành công'"]
        W1_ShowFail["Render thông báo lỗi thanh toán / Hết hàng"]
    end

    subgraph Sys_Backend [" ⚙️ NestJS API Server (Backend) "]
        W1_Validate["Kiểm tra tính hợp lệ & Tồn kho sản phẩm"]
        W1_CreateCOD["Tạo Order trong DB (Status: Pending)"]
        W1_CreateVNPay["Tạo Order (Status: Pending Payment)"]
        W1_SignHash["Tạo chữ ký SHA512 & URL thanh toán VNPAY"]
        W1_VerifyIPN["Xác thực chữ ký Webhook IPN từ VNPAY"]
        W1_UpdatePaid["Cập nhật Order Status = Paid & Trừ kho"]
        W1_PushSocket["Gửi thông báo Realtime tới Admin"]
    end

    subgraph Sys_External [" 🌐 Cổng thanh toán VNPAY "]
        W1_ProcessVNPay{"VNPAY xử lý<br/>giao dịch"}
        W1_SendWebhook["Gửi Webhook IPN ngầm cho Backend"]
    end

    W1_ClickCheckout --> W1_RenderForm
    W1_RenderForm --> W1_InputInfo
    W1_InputInfo --> W1_Validate
    W1_Validate -->|Hết hàng / Lỗi| W1_ShowFail --> W1_End([Kết thúc])
    W1_Validate -->|Hợp lệ| W1_SelectPay

    W1_SelectPay -->|COD| W1_CreateCOD
    W1_CreateCOD --> W1_UpdatePaid

    W1_SelectPay -->|VNPAY| W1_CreateVNPay
    W1_CreateVNPay --> W1_SignHash
    W1_SignHash --> W1_Redirect
    W1_Redirect --> W1_VNPAYAction
    W1_VNPAYAction --> W1_ProcessVNPay

    W1_ProcessVNPay -->|Thành công| W1_SendWebhook
    W1_ProcessVNPay -->|Hủy / Lỗi thẻ| W1_ShowFail

    W1_SendWebhook --> W1_VerifyIPN
    W1_VerifyIPN --> W1_UpdatePaid
    W1_UpdatePaid --> W1_PushSocket
    W1_PushSocket --> W1_ShowSuccess --> W1_End
```

### 3.3.2 Luồng 2: Tùy chỉnh thiết kế ly cốc 3D & duyệt mẫu (Custom 3D Design Workflow)

```mermaid
flowchart TD
    subgraph Actor_Customer [" 👤 Khách hàng (Customer) "]
        W2_Start([Bắt đầu]) --> W2_SelectBase["Chọn phôi cốc 3D (Base Cup)"]
        W2_Interact["Xoay 360°, đổi màu thân/nắp cốc"]
        W2_AddElement{"Thêm chi tiết<br/>đồ họa?"}
        W2_InputPrompt["Nhập câu lệnh (Prompt) mô tả ý tưởng"]
        W2_Check3D{"Hài lòng với<br/>mẫu 3D?"}
        W2_SaveSubmit["Nhấn 'Lưu thiết kế' & Đặt làm mẫu"]
    end

    subgraph Sys_Frontend [" 🖥️ Next.js 3D Customizer (Three.js Canvas) "]
        W2_Render3D["Load & Render mô hình 3D Canvas"]
        W2_UpdateTexture["Apply Texture mới lên bề mặt cốc 3D"]
        W2_ShowResult["Hiển thị bản xem trước & Báo giá tạm tính"]
    end

    subgraph Sys_Backend [" ⚙️ NestJS API Server (Backend) "]
        W2_CallAI["Gọi Google Gemini AI API"]
        W2_SaveDB["Lưu bản ghi CustomDesign vào MongoDB"]
        W2_NotifyOwner["Push Socket Notification cho Chủ cửa hàng"]
        W2_UpdateStatus["Cập nhật trạng thái Approved / Rejected"]
    end

    subgraph Sys_Cloud [" ☁️ Dịch vụ Đám mây (Cloudinary & Google AI) "]
        W2_UploadCDN["Cloudinary: Upload & Tối ưu hóa ảnh"]
        W2_GeminiGen["Google Gemini AI: Tạo hình ảnh theo Prompt"]
    end

    subgraph Actor_Owner [" 🏪 Chủ cửa hàng / Shop Owner "]
        W2_Review["Kiểm tra tính khả thi sản xuất mẫu in"]
        W2_Decision{"Duyệt mẫu<br/>thiết kế?"}
    end

    W2_SelectBase --> W2_Render3D
    W2_Render3D --> W2_Interact
    W2_Interact --> W2_AddElement

    W2_AddElement -->|Upload ảnh| W2_UploadCDN
    W2_AddElement -->|Tạo bằng AI| W2_InputPrompt
    W2_InputPrompt --> W2_CallAI
    W2_CallAI --> W2_GeminiGen

    W2_UploadCDN --> W2_UpdateTexture
    W2_GeminiGen --> W2_UpdateTexture
    W2_AddElement -->|Chỉ đổi màu| W2_UpdateTexture

    W2_UpdateTexture --> W2_ShowResult
    W2_ShowResult --> W2_Check3D
    W2_Check3D -->|Chưa ưng ý| W2_Interact
    W2_Check3D -->|Ưng ý| W2_SaveSubmit

    W2_SaveSubmit --> W2_SaveDB
    W2_SaveDB --> W2_NotifyOwner
    W2_NotifyOwner --> W2_Review
    W2_Review --> W2_Decision

    W2_Decision -->|Từ chối| W2_Reject["Backend cập nhật Rejected & Gửi lý do cho khách"] --> W2_End([Kết thúc])
    W2_Decision -->|Chấp nhận| W2_Approve["Backend cập nhật Approved & Báo giá chính thức"] --> W2_End
```

### 3.3.3 Luồng 3: Xử lý đơn hàng & Giao hàng (Order Fulfillment & Shipping Workflow)

```mermaid
flowchart TD
    subgraph Actor_Admin [" 🏪 Chủ cửa hàng / Admin "]
        W3_Start([Đơn hàng mới trong hệ thống]) --> W3_CheckOrder["Kiểm tra thông tin & chi tiết sản phẩm"]
        W3_PrintPack["In đơn, đóng gói & sản xuất mẫu cốc"]
        W3_Assign["Phân công đơn cho Đơn vị vận chuyển / Shipper"]
    end

    subgraph Sys_Backend [" ⚙️ NestJS API Server (Backend) "]
        W3_UpdateProcessing["Cập nhật Order Status = Processing"]
        W3_UpdateShipping["Cập nhật Order Status = Shipping"]
        W3_UpdateDone["Cập nhật Order Status = Completed"]
        W3_UpdateCancel["Cập nhật Order Status = Cancelled / Refund"]
        W3_AddLoyalty["Cộng điểm thưởng Loyalty cho khách hàng"]
        W3_PushNotif["Gửi thông báo Realtime (Socket.IO / Email)"]
    end

    subgraph Actor_Shipper [" 🚚 Nhân viên giao hàng (Shipper) "]
        W3_ReceiveOrder["Tiếp nhận kiện hàng & Thông tin giao bưu"]
        W3_Shipping["Di chuyển giao hàng tới địa chỉ khách"]
        W3_CallCustomer["Liên hệ khách hàng & Bàn giao sản phẩm"]
        W3_Result{"Giao hàng<br/>thành công?"}
        W3_CollectCOD["Thu tiền mặt COD (nếu có)"]
        W3_ReturnGoods["Hoàn trả hàng về kho cửa hàng"]
    end

    subgraph Actor_Customer [" 👤 Khách hàng (Customer) "]
        W3_Inspect["Kiểm tra sản phẩm nhận được"]
        W3_ReceivePoints["Nhận điểm thưởng & Đánh giá (Review)"]
    end

    W3_CheckOrder --> W3_UpdateProcessing
    W3_UpdateProcessing --> W3_PrintPack
    W3_PrintPack --> W3_Assign
    W3_Assign --> W3_UpdateShipping
    W3_UpdateShipping --> W3_PushNotif
    W3_PushNotif --> W3_ReceiveOrder

    W3_ReceiveOrder --> W3_Shipping
    W3_Shipping --> W3_CallCustomer
    W3_CallCustomer --> W3_Inspect
    W3_Inspect --> W3_Result

    W3_Result -->|Thất bại / Từ chối nhận| W3_ReturnGoods
    W3_ReturnGoods --> W3_UpdateCancel --> W3_End([Kết thúc])

    W3_Result -->|Thành công| W3_CODCheck{"Đơn hàng<br/>COD?"}
    W3_CODCheck -->|Có| W3_CollectCOD --> W3_UpdateDone
    W3_CODCheck -->|Đã thanh toán trước| W3_UpdateDone

    W3_UpdateDone --> W3_AddLoyalty
    W3_AddLoyalty --> W3_ReceivePoints --> W3_End
```

---

## 3.4 Sequence Diagram (Sơ đồ tuần tự chính)

### 3.4.1 Sơ đồ tuần tự: Luồng Đặt hàng và Thanh toán VNPAY

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    participant Frontend as Next.js Frontend
    participant API as NestJS OrdersService
    participant DB as MongoDB Atlas
    participant VNPAY as Cổng thanh toán VNPAY

    Customer->>Frontend: Nhấn "Đặt hàng" (Chọn VNPAY)
    Frontend->>API: POST /orders (Payload: items, address, paymentMethod='VNPAY')
    API->>DB: Kiểm tra tồn kho sản phẩm (ProductSchema)
    DB-->>API: Tốn kho hợp lệ
    API->>DB: Tạo mới Order (status='pending_payment')
    DB-->>API: Trả về Order ID
    API->>API: Tạo chữ ký SHA512 & URL thanh toán VNPAY
    API-->>Frontend: Trả về vnpayUrl
    Frontend->>Customer: Redirect trình duyệt sang cổng VNPAY
    Customer->>VNPAY: Nhập thông tin thẻ & xác nhận thanh toán
    VNPAY-->>Customer: Hiển thị kết quả & Redirect về Frontend Return URL
    
    Note over VNPAY, API: Webhook bất đồng bộ (IPN) đảm bảo tính chính xác
    VNPAY->>API: GET /payments/vnpay-ipn (Secure Hash & Order Info)
    API->>API: Xác thực chữ ký VNPAY Hash
    API->>DB: Cập nhật Order status = 'paid' & Trừ kho
    DB-->>API: Cập nhật thành công
    API-->>VNPAY: Trả về { RspCode: '00', Message: 'Confirm Success' }
    
    Frontend->>API: GET /orders/:id (Kiểm tra lại trạng thái đơn)
    API-->>Frontend: Trả về thông tin đơn hàng đã thanh toán
    Frontend->>Customer: Hiển thị giao diện "Đặt hàng thành công"
```

### 3.4.2 Sơ đồ tuần tự: Luồng Thông báo thời gian thực (Realtime Notification)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng / Admin
    participant Frontend as Client App
    participant Gateway as Socket.IO Gateway
    participant Service as NotificationsService
    participant DB as MongoDB (NotificationSchema)

    User->>Frontend: Đăng nhập thành công vào App
    Frontend->>Gateway: WebSocket Connect ( mang theo JWT Token )
    Gateway->>Gateway: Xác thực JWT & join room theo User ID / Role
    Gateway-->>Frontend: Kết nối Socket thành công

    Note over Service, DB: Có sự kiện phát sinh (Ví dụ: Đơn hàng mới tạo)
    Service->>DB: Lưu notification mới vào DB
    DB-->>Service: Trả về bản ghi Notification
    Service->>Gateway: Phát sự kiện serverEmit('new_notification', payload)
    Gateway->>Frontend: Push sự kiện 'new_notification' tới room Admin
    Frontend->>User: Hiển thị Toast Popup thông báo có đơn hàng mới
```

---

## 3.5 Statechart Diagram (Biểu đồ trạng thái đơn hàng)
Biểu đồ mô tả vòng đời của một Đơn hàng (`Order`) trong hệ thống Cupshop kể từ khi được khởi tạo cho đến khi kết thúc.

```mermaid
stateDiagram-v2
    [*] --> PendingPayment: Tạo đơn hàng (VNPAY)
    [*] --> Pending: Tạo đơn hàng (COD)

    PendingPayment --> Paid: Webhook VNPAY xác nhận thành công
    PendingPayment --> PaymentFailed: Khách hủy / Giao dịch lỗi
    PaymentFailed --> [*]

    Paid --> Processing: Shop tiếp nhận đơn
    Pending --> Processing: Shop tiếp nhận đơn

    Processing --> Shipping: Bàn giao cho Shipper vận chuyển
    Processing --> Cancelled: Shop / Khách hàng hủy đơn (Hoàn kho)

    Shipping --> Delivered: Giao hàng thành công cho khách
    Shipping --> Returned: Giao thất bại / Khách trả hàng

    Delivered --> Completed: Khách xác nhận hài lòng / Sau 3 ngày
    Returned --> Cancelled: Hoàn tất nhận lại hàng về kho

    Cancelled --> [*]
    Completed --> [*]
```

---

## 3.6 Class Diagram (Biểu đồ lớp thực tế từ mã nguồn Backend)
Sơ đồ mô tả các thực thể (Entities / Schemas) chính trong cơ sở dữ liệu MongoDB của hệ thống Cupshop và mối quan hệ giữa chúng.

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String email
        +String password
        +String fullName
        +String role (admin, owner, customer, shipper)
        +Number loyaltyPoints
        +Boolean isActive
        +validatePassword()
    }

    class Product {
        +ObjectId _id
        +String name
        +String slug
        +Number price
        +Number stock
        +String description
        +Array images
        +ObjectId categoryId
        +Boolean isCustomizable
        +Object baseCup3DModel
    }

    class CustomDesign {
        +ObjectId _id
        +ObjectId userId
        +ObjectId baseProductId
        +String designName
        +Object colorPalette
        +Array uploadedTextures
        +String aiPromptUsed
        +String preview3DUrl
        +String status (draft, submitted, approved, rejected)
    }

    class Order {
        +ObjectId _id
        +String orderCode
        +ObjectId userId
        +Array items
        +Number totalAmount
        +Number discountAmount
        +String paymentMethod (COD, VNPAY)
        +String paymentStatus
        +String orderStatus
        +Object shippingAddress
    }

    class Coupon {
        +ObjectId _id
        +String code
        +String discountType (percentage, fixed)
        +Number discountAmount
        +Date startDate
        +Date endDate
        +Number minOrderValue
    }

    class Notification {
        +ObjectId _id
        +ObjectId recipientId
        +String title
        +String content
        +String type
        +Boolean isRead
        +Date createdAt
    }

    User "1" --> "0..*" Order : đặt hàng
    User "1" --> "0..*" CustomDesign : tạo thiết kế
    User "1" --> "0..*" Notification : nhận thông báo
    Order "1" --> "1..*" Product : chứa sản phẩm
    Order "0..1" --> "0..1" Coupon : áp dụng mã
    CustomDesign "1" --> "1" Product : tham chiếu phôi cốc
```

---

## 3.7 Sơ đồ khai thác hệ thống (Deployment Diagram)
Sơ đồ mô tả cấu trúc triển khai vật lý và logic của hệ thống Cupshop trên môi trường máy chủ và điện toán đám mây.

```mermaid
flowchart TB
    subgraph ClientNodes ["Thiết bị người dùng (Client Nodes)"]
        PC["Máy tính cá nhân (PC / Laptop)"]
        Mobile["Điện thoại thông minh (Mobile App / Browser)"]
    end

    subgraph CloudInfrastructure ["Hạ tầng Đám mây Cupshop (Cloud Infrastructure)"]
        subgraph ProxyLayer ["Proxy & Firewall Layer"]
            Cloudflare["Cloudflare CDN / WAF Firewall"]
            Nginx["Nginx Reverse Proxy & SSL"]
        end

        subgraph WebTier ["Web Tier (Frontend Node)"]
            NextApp["Next.js SSR Container (Port 3005)"]
        </subgraph>

        subgraph AppTier ["Application Tier (Backend Node)"]
            NestApp["NestJS API Container (Port 3000)"]
            SocketServer["Socket.IO Realtime Engine"]
        </subgraph>

        subgraph DataTier ["Data & Cache Tier"]
            MongoCluster[(MongoDB Atlas Cluster Replicas)]
            RedisCache[(Redis Cache Memory)]
        </subgraph>
    end

    subgraph ExternalServices ["Dịch vụ Đám mây Ngoại vi (External API)"]
        VNPAYGateway["VNPAY Payment Gateway"]
        CloudinaryCDN["Cloudinary Media Storage"]
        GeminiAI["Google Gemini AI API"]
    </subgraph>

    PC -->|HTTPS| Cloudflare
    Mobile -->|HTTPS| Cloudflare
    Cloudflare -->|Route Traffic| Nginx
    Nginx -->|Frontend Requests| NextApp
    Nginx -->|API Requests| NestApp
    Nginx -->|WebSocket Upgrade| SocketServer

    NestApp <-->|Read / Write| MongoCluster
    NestApp <-->|Cache Session/Stock| RedisCache

    NestApp <-->|Secure Webhook / API| VNPAYGateway
    NestApp <-->|Upload 3D Assets| CloudinaryCDN
    NestApp <-->|Generate Design| GeminiAI
```

---
*Ghi chú: Toàn bộ các sơ đồ trên được thiết kế chuẩn sát với logic thực tế của mã nguồn Cupshop backend (`d:\do_an\ecommerce-backend`) và đáp ứng đầy đủ cấu trúc của file PDF yêu cầu đến hết mục 3.*
