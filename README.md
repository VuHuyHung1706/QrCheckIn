# 🎯 OBS QR Check-in & Firework Bubble Overlay (Pure Frontend Edition)

Dự án **100% Thuần Frontend (Không cần bất kỳ backend server nào)**:
- Deploy trực tiếp lên **Vercel** chỉ với 1 click chuột.
- Không cần tài khoản server, không cần thẻ tín dụng, không tốn chi phí nào.
- Kết nối thời gian thực giữa điện thoại người xem và màn hình OBS thông qua hạ tầng **Serverless Realtime (MQTT over Secure WebSocket + BroadcastChannel)**.

---

## ✨ Chuỗi Hiệu Ứng

1. **Mã QR bên trái màn hình** với nền trong suốt (chuẩn OBS Browser Source), hiển thị đồng hồ đếm ngược.
2. **Khán giả quét mã QR bằng điện thoại** (dùng 4G/5G/Wi-Fi bất kỳ) và nhập tên.
3. Khi gửi xong, **quả bóng kính mờ (Apple Frosted Glass) mang tên người đó bay từ đáy lên sát đỉnh màn hình**.
4. Khi chạm đỉnh: Quả bóng **nổ tung thành pháo hoa rực rỡ (Fireworks Confetti)** tỏa tròn 360 độ rồi tan biến mượt mà, không bị rụng hay tụt xuống.
5. Khi hết thời gian: Mã QR tự động biến mất, xuất hiện nút bấm tinh tế **`📊 Xem Thống Kê Điểm Danh`** để streamer chủ động mở xem tỷ lệ % người tham gia trên tổng số tổ chức (kèm vòng đo phong cách Apple Watch và nút xuất Excel).

---

## 🚀 Hướng Dẫn Deploy Lên Vercel (1 Phút)

Vì dự án đã được chuyển đổi thành **100% Pure Frontend**, bạn không cần setup bất kỳ server hay biến môi trường nào!

1. Khởi tạo Git và đẩy code lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: 100% pure frontend OBS checkin"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
   git push -u origin main
   ```
2. Truy cập [vercel.com](https://vercel.com) ➔ Bấm **Add New Project** ➔ Chọn repo vừa tạo.
3. Bấm **Deploy**.
4. Xong! Bạn sẽ nhận được đường link chính thức (ví dụ: `https://ten-du-an.vercel.app`).

---

## 🎥 Cách Chèn Vào OBS Studio

1. Mở **OBS Studio**, tại bảng **Sources** chọn **Browser**.
2. Dán link Vercel của bạn kèm `?obs=1`:  
   ```
   https://ten-du-an.vercel.app/?obs=1
   ```
3. Cài đặt **Width**: `1920`, **Height**: `1080`.
4. Bấm **OK**. Toàn bộ nền sẽ trong suốt tự nhiên!
