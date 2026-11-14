##🎨 PixelCraft Studio

A Browser-Based 2D Graphic Design Application

Ứng dụng thiết kế đồ họa 2D trên nền tảng trình duyệt

---

##🇻🇳 Giới thiệu | Introduction 🇬🇧

Tiếng Việt

PixelCraft Studio là ứng dụng thiết kế đồ họa 2D chạy trực tiếp trên trình duyệt. Ứng dụng cung cấp một không gian làm việc tương tác (Canvas), cho phép người dùng tạo, chỉnh sửa và quản lý các thành phần đồ họa một cách linh hoạt.

Dự án được phát triển nhằm vận dụng kiến thức lập trình web vào việc xây dựng một sản phẩm có tính ứng dụng thực tế, kết hợp giữa giao diện trực quan và các công cụ chỉnh sửa đồ họa.

English

PixelCraft Studio is a browser-based 2D graphic design application. It provides an interactive canvas where users can create, edit, and manage graphic elements flexibly.

This project aims to apply web development knowledge to build a practical application that combines an intuitive user interface with graphic editing tools.

---

##✨ Tính năng chính | Key Features

1. Canvas Editor – Trình chỉnh sửa Canvas

- Thêm, di chuyển, xoay và thay đổi kích thước đối tượng.
- Add, move, rotate, and resize objects.
- Hỗ trợ nhiều loại đối tượng đồ họa.
- Supports multiple graphic element types.

2. Shape Library – Thư viện hình dạng

- Hình chữ nhật, hình tròn, tam giác, đa giác, ngôi sao và mũi tên.
- Rectangles, circles, triangles, polygons, stars, and arrows.
- Tích hợp biểu tượng từ Lucide.
- Integrated Lucide icon library.
- Hỗ trợ các đường dẫn SVG.
- Supports SVG paths.

3. Text Editor – Chỉnh sửa văn bản

- Thay đổi nội dung, font chữ và kích thước.
- Edit text content, fonts, and font sizes.
- Tùy chỉnh màu sắc, kiểu chữ và căn lề.
- Customize colors, text styles, and alignment.

4. Drawing Tools – Công cụ vẽ

- Công cụ bút vẽ tự do.
- Freehand drawing tool.
- Công cụ thước kẻ.
- Ruler tool.
- Tùy chỉnh màu sắc và độ dày nét vẽ.
- Adjustable drawing colors and stroke thickness.

5. Image Editing – Chỉnh sửa hình ảnh

- Tải hình ảnh từ thiết bị lên Canvas.
- Upload images from your device to the canvas.
- Hỗ trợ tích hợp dịch vụ tách nền Poof.bg.
- Integration with the Poof.bg background removal service.

6. Custom Shapes – Hình dạng tùy chỉnh

- Tạo hình chữ nhật, hình tròn, đa giác và ngôi sao.
- Create custom rectangles, circles, polygons, and stars.
- Lưu hình tự tạo vào thư viện để tái sử dụng.
- Save custom shapes to the library for reuse.

7. Layer Management – Quản lý lớp

- Thay đổi thứ tự hiển thị của đối tượng.
- Change the stacking order of objects.
- Nhân bản và xóa đối tượng.
- Duplicate and delete objects.

8. Editing History – Lịch sử chỉnh sửa

- Hỗ trợ Undo và Redo.
- Undo and Redo support.
- Theo dõi và khôi phục các thao tác chỉnh sửa.
- Track and restore editing actions.

9. Export & Project Management – Xuất và quản lý dự án

- Xuất thiết kế thành ảnh PNG.
- Export designs as PNG images.
- Lưu và mở dự án bằng tệp JSON.
- Save and load projects using JSON files.
- Tự động lưu dữ liệu trên trình duyệt bằng localStorage.
- Automatically save data in the browser using localStorage.

---

🛠️ Công nghệ sử dụng | Technologies Used

Công nghệ| Technology| Vai trò / Purpose
React 18| React 18| Xây dựng giao diện / UI development
Vite 5| Vite 5| Development and build tool
React Konva| React Konva| Canvas rendering and interaction
Konva| Konva| 2D graphics engine
Lucide React| Lucide React| Icon library
use-image| use-image| Image loading
UUID| UUID| Unique object identifiers
CSS| CSS| Interface styling

---

##🚀 Cài đặt và chạy dự án | Installation & Setup

Yêu cầu hệ thống | Requirements

- Node.js
- npm
- A modern web browser

Bước 1: Clone repository

```bash
git clone https://github.com/adofminh123/design-app.git
```

##Bước 2: Di chuyển vào thư mục dự án | Navigate to the project directory

```bash
cd design-app
```

##Bước 3: Cài đặt dependencies | Install dependencies

```bash
npm install
```

##Bước 4: Khởi chạy ứng dụng | Start the development server

```bash
npm run dev
```

##Mở địa chỉ localhost được hiển thị trong terminal.

Open the localhost URL displayed in your terminal.

---

##📦 Build dự án | Production Build

```bash
npm run build
```

Xem trước phiên bản production:

Preview the production build:

```bash
npm run preview
```

---

##📁 Cấu trúc dự án | Project Structure

```text
design-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── ShapeLibrary.jsx
│   ├── data/
│   │   └── shapeData.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

---

##📝 Lưu ý | Notes

Tiếng Việt

- Dữ liệu thiết kế được lưu trong localStorage của trình duyệt.
- Nên xuất tệp JSON để sao lưu dự án.
- Tính năng tách nền phụ thuộc vào dịch vụ Poof.bg và kết nối Internet.
- Ứng dụng hiện chưa hỗ trợ tài khoản người dùng hoặc đồng bộ dự án qua máy chủ.

English

- Design data is stored in the browser's localStorage.
- Export JSON files to back up your projects.
- Background removal depends on the Poof.bg service and an Internet connection.
- The application currently does not support user accounts or server-side project synchronization.

---

##👨‍💻 Tác giả | Author

Nguyễn Anh Minh

Student Developer | Người phát triển dự án

Project: PixelCraft Studio
Repository: https://github.com/adofminh123/design-app

---

Built with React, creativity, and a passion for technology.

Được xây dựng bằng React, sự sáng tạo và niềm đam mê công nghệ.
