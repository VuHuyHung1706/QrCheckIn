# 🎯 OBS QR Check-in & Floating Bubble Overlay

Dự án React.js chuyên dụng cho **OBS Studio Livestream**, tạo chuỗi hiệu ứng tương tác trực tiếp theo thời gian thực:

1. **Hiển thị mã QR bên trái màn hình** với **background trong suốt** (chuẩn Browser Source cho OBS). Có đồng hồ đếm ngược và thanh tiến trình.
2. **Khán giả quét mã QR bằng điện thoại** và nhập họ tên. Khi bấm gửi, **tên người đó sẽ xuất hiện trên màn hình livestream dưới dạng bong bóng xà phòng 3D phát sáng**, bay lượn từ dưới lên và nổ hạt tan biến (*bubble pop effect*) kèm âm thanh vui nhộn.
3. **Khi hết thời gian đếm ngược**:
   - Mã QR tự động mượt mà biến mất.
   - Hiển thị **bảng thống kê % số người đã nhập trên tổng số thành viên đã biết của tổ chức** (vòng đo tiến độ, hiệu ứng số nhảy từ 0% lên kết quả thực tế, pháo hoa rực rỡ confetti ăn mừng, danh sách người tham gia và nút xuất file Excel/CSV).

---

## 🚀 Khởi Chạy Nhanh

Trong thư mục dự án, chạy lệnh:

```bash
npm run dev
```

Hệ thống sẽ đồng thời khởi động:
- **Frontend (Vite + React)**: `http://localhost:5173/` (hoặc qua IP nội bộ mạng LAN: `http://<IP-may>:5173/`)
- **Backend (Node.js + Socket.io)**: `http://localhost:3001`

---

## 📺 Các Giao Diện Chính

| Đường dẫn | Mô tả |
| :--- | :--- |
| **`http://localhost:5173/`** | **Màn hình OBS Overlay**: Nền trong suốt hoàn toàn, mã QR nằm bên trái, hiệu ứng bong bóng bay và bảng tổng kết khi hết giờ. |
| **`http://localhost:5173/join`** | **Giao diện di động cho người quét mã**: Tự động mở khi quét mã QR từ camera điện thoại. Cho phép nhập họ tên để gửi lên livestream. |
| **`http://localhost:5173/admin`** | **Bảng điều khiển Streamer (Admin)**: Cài đặt tổng số thành viên tổ chức, thời gian đếm ngược (giây), tên sự kiện, bắt đầu/tạm dừng/reset phiên, và các nút test giả lập. |

---

## 🎥 Hướng Dẫn Chèn Vào OBS Studio

1. Mở **OBS Studio**.
2. Tại bảng **Sources (Nguồn)**, bấm dấu **`+`** và chọn **Browser (Trình duyệt)**.
3. Đặt tên: `QR Check-in Overlay`.
4. Trong cửa sổ cấu hình Browser Source:
   - **URL**: `http://localhost:5173/?obs=1` *(thêm `?obs=1` để tự động ẩn thanh điều hướng trang, giữ màn hình OBS sạch 100%)*.
   - **Width (Chiều rộng)**: `1920`
   - **Height (Chiều cao)**: `1080`
   - Tích chọn: **Shutdown source when not visible** và **Refresh browser when scene becomes active**.
5. Bấm **OK**. Toàn bộ nền sẽ trong suốt tự nhiên, chồng lên webcam/game/slide của bạn!

---

## 📱 Khán Giả Điểm Danh Bằng Điện Thoại

- Mã QR trên màn hình OBS tự động trỏ đến IP nội bộ Wi-Fi (ví dụ: `http://192.168.1.102:5173/join`).
- Bất kỳ ai kết nối chung Wi-Fi chỉ cần mở camera điện thoại quét mã QR là vào thẳng trang nhập tên.
- Khi người tham gia bấm **"Gửi Tên Lên Màn Hình"**, tên họ lập tức xuất hiện trong một quả bóng xà phòng lấp lánh bay lên trên stream của bạn!

---

## 🧪 Phím Tắt & Thử Nghiệm Nhanh

Nếu bạn muốn kiểm tra hiệu ứng ngay trên máy tính mà không cần dùng điện thoại:
1. Mở `http://localhost:5173/` trên trình duyệt.
2. Ở góc dưới cùng bên phải có thanh công cụ nhanh:
   - Bấm **`+ Test Nhập Tên`**: Hệ thống sẽ tự động gửi một tên ngẫu nhiên (Nguyễn Văn An, Lê Hoàng Long,...) để quả bóng bay lên ngay lập tức!
   - Bấm **`Bắt đầu`**: Khởi động đếm ngược thời gian.
   - Bấm **`Reset`**: Làm mới phiên chơi.
   - Bấm **`Loa`**: Bật/tắt âm thanh tiếng nổ bóng xà phòng.

---

## 🛠 Công Nghệ Sử Dụng

- **React 19 + TypeScript**: Giao diện mượt mà, type-safe.
- **Tailwind CSS**: Thiết kế hiện đại, glassmorphism cao cấp cho livestream.
- **Framer Motion**: Vật lý bay lượn lả lướt, hiệu ứng nổ vỡ bong bóng chân thực.
- **Socket.IO**: Đồng bộ dữ liệu 2 chiều siêu tốc thời gian thực (<10ms).
- **Web Audio API**: Bộ tổng hợp âm thanh bong bóng pop tự nhiên không cần file âm thanh ngoài.
- **Canvas-Confetti**: Bắn pháo hoa ăn mừng khi hoàn thành thống kê.
- **QRCode.react**: Sinh mã QR sắc nét định dạng SVG.

