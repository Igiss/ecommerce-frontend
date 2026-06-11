const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/ecommerce';

const usersData = [
  {
    "_id": "6a23ca90bf198b5c121c9d28",
    "fullName": "Nguyen Van A",
    "email": "admin@gmail.com",
    "password": "$2b$10$CUSLrxjlw.FtoXwmNTpgVe1DRj0nSt3CkdbQFCFkCmUzUvLb/CHhu",
    "phone": "0901234567",
    "role": "user",
    "status": "active",
    "address": ""
  },
  {
    "_id": "6a24fc86c6cecfe1ff0b6270",
    "fullName": "Admin",
    "email": "admin@cupstore.com",
    "password": "$2b$10$l7gPMDtC7JC2iZJ6Rmj3O.Uwpbm6dck6beT7Z//.rNiCT2nJ2scIS",
    "role": "admin",
    "status": "active",
    "phone": "0837193544"
  },
  {
    "_id": "6a2a478db01475b5a378ead4",
    "fullName": "ShopeeFood",
    "email": "admin123@cupstore.com",
    "password": "$2b$10$TrH7Bf6Wpxm7h4g4Zs8Hn.1McJrB1iu61tUClGzByAJFcZe0Nsuy6",
    "phone": "0837193544",
    "role": "owner",
    "status": "active",
    "address": ""
  }
];

const productsData = [
  {
    "productId": 1,
    "name": "Ly cà phê",
    "slug": "ly-ca-phe",
    "description": "Ly cà phê sứ cao cấp phong cách thời thượng",
    "price": 150000,
    "stock": 50,
    "images": ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"],
    "createdBy": "6a2a478db01475b5a378ead4",
    "status": "active"
  },
  {
    "productId": 2,
    "name": "ly sứ matcha latte",
    "slug": "ly-su-matcha-latte",
    "description": "Ly sứ chuyên dụng cho matcha latte, màu xanh lá cây ấm áp",
    "price": 180000,
    "stock": 35,
    "images": ["https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600"],
    "createdBy": "6a2a478db01475b5a378ead4",
    "status": "active"
  },
  {
    "productId": 3,
    "name": "ly sứ trắng",
    "slug": "ly-su-trang",
    "description": "Ly sứ trắng tráng men bóng cao cấp",
    "price": 120000,
    "stock": 100,
    "images": ["https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?w=600"],
    "createdBy": "6a2a478db01475b5a378ead4",
    "status": "active"
  }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Đã kết nối tới MongoDB.');
    
    const UserSchema = new mongoose.Schema({}, { collection: 'users', strict: false });
    const User = mongoose.model('User', UserSchema);

    const ProductSchema = new mongoose.Schema({}, { collection: 'products', strict: false });
    const Product = mongoose.model('Product', ProductSchema);

    console.log('Đang làm sạch dữ liệu cũ...');
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Đang tạo các tài khoản mẫu...');
    const userDocs = usersData.map(u => ({
      ...u,
      _id: new mongoose.Types.ObjectId(u._id)
    }));
    await User.insertMany(userDocs);

    console.log('Đang tạo các sản phẩm mẫu...');
    const productDocs = productsData.map(p => ({
      ...p,
      createdBy: new mongoose.Types.ObjectId(p.createdBy)
    }));
    await Product.insertMany(productDocs);

    console.log('>>> KHỞI TẠO DỮ LIỆU THÀNH CÔNG! <<<');
    console.log(`- Đã tạo: ${usersData.length} tài khoản mẫu (Admin, Owner, User).`);
    console.log(`- Đã tạo: ${productsData.length} sản phẩm mẫu.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Lỗi khởi tạo database:', err);
    process.exit(1);
  });
