## `README.md`

# 3D Racing Game Prototype - Challenge 1

## 🛠️ 1. Cài Đặt và Khởi Chạy

Dự án này sử dụng các file JavaScript module (`type="module"`), do đó, cần phải được chạy thông qua một **Web Server cục bộ** (Local Web Server).

### Yêu cầu

  * Trình duyệt web hiện đại (Chrome, Firefox).
  * Đã cài đặt Node.js hoặc Python.

### Cách Khởi Chạy

1.  **Mở Terminal** (hoặc CMD/PowerShell) trong thư mục gốc của dự án (`Racing Game/`).
2.  Chạy một trong các lệnh sau để khởi động Server:
      * **Sử dụng Python:**
        ```bash
        python -m http.server
        ```
      * **Sử dụng Node.js (cần cài đặt `http-server` trước):**
        ```bash
        npx http-server
        ```
3.  Mở trình duyệt và truy cập vào địa chỉ: **`http://localhost:8081/`** (hoặc cổng được hiển thị trên Terminal).

-----

## 2. Hướng Dẫn Điều Khiển

Dự án sử dụng các phím tiêu chuẩn (WASD hoặc Phím Mũi tên)

| Hành động | Phím WASD | Phím Mũi tên |
| :--- | :--- | :--- |
| **Tăng tốc (Accelerate)** | `W` | `Arrow Up` |
| **Phanh/Lùi (Brake/Reverse)** | `S` | `Arrow Down` |
| **Lái trái (Turn Left)** | `A` | `Arrow Left` |
| **Lái phải (Turn Right)** | `D` | `Arrow Right` |

-----

## 3. Triển Khai Kỹ Thuật (Đáp ứng các Yêu cầu)

Dự án được triển khai bằng kiến trúc ES Module (`.js` files trong thư mục `src/`) để tách biệt các lớp chức năng:

### R1 – 3D Environment and Physics (40%)

  * **Scene:** Sử dụng `THREE.Scene` với ánh sáng `AmbientLight` và `DirectionalLight`.
  * **Physics:** Khởi tạo `CANNON.World` với trọng lực **$9.82 \text{ m/s}^2$** và sử dụng `CANNON.SAPBroadphase` để tối ưu hóa va chạm.
  * **Track:** Track đua hình chữ nhật kín (100x100 đơn vị). Tường biên được tạo bằng `CANNON.Box` có `mass: 0`.
  * **Vật liệu:** Thiết lập `CANNON.ContactMaterial` với **hệ số ma sát $0.8$** giữa xe và mặt đất để đảm bảo độ bám.

### R2 – Car Control and Interaction (30%)

  * **Car Model:** Xe được mô hình hóa bằng `THREE.BoxGeometry` và `CANNON.Box` (Mass: 100kg).
  * **Điều khiển:** Áp dụng **Lực cục bộ (`applyLocalForce`)** để tăng/giảm tốc và **Mô-men xoắn cục bộ (`applyLocalTorque`)** để lái, đảm bảo xe di chuyển theo hướng quay hiện tại.
  * **Đồng bộ:** Vị trí và góc quay (`position` và `quaternion`) của Mesh 3D được đồng bộ liên tục từ Body vật lý trong mỗi frame.
  * **Camera:** Camera đi theo xe sử dụng kỹ thuật **LERP (Linear Interpolation)** để tạo hiệu ứng theo dõi mượt mà.

### R3 – Game Logic and Visual Feedback (30%)

  * **Lap Counting:** Triển khai **Logic 2 Checkpoint** trong `Game.js`. Chỉ đếm lap khi xe đi qua Vạch đích (Z=0) **sau khi** đã đi qua Checkpoint giữa đường (Z \< -30).
  * **HUD:** Hiển thị **Tốc độ** (Km/h), **Lap Count** (Vòng hiện tại/Tổng số vòng), và **Timer** theo thời gian thực.
  * **Collision Detection:** Bắt sự kiện va chạm của xe với các đối tượng tĩnh (`mass: 0`) và hiển thị thông báo **"CRASH\!"** nếu lực va chạm vượt quá ngưỡng an toàn.

-----

## 4. Thư Viện và Assets

  * **Rendering:** THREE.js
  * **Physics:** CANNON-ES 
  * **Assets:** Textures: `assets/textures/track_texture.jpg`, `grass_texture.jpg`
