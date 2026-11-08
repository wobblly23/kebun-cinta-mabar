# 🌾 Kebun Cinta Kita - Game Mabar P2P Berbasis Web 💖

Game bertani santai (*cozy farming RPG*) multipemain 2 orang (**Mabar**) yang dirancang khusus untuk dimainkan berdua bersama pasangan secara langsung melalui browser (HP atau Laptop), **100% web statis tanpa butuh server berbayar atau kartu kredit sama sekali!**

Menggunakan teknologi **WebRTC Peer-to-Peer (P2P)** via PeerJS, koneksi langsung menghubungkan perangkatmu dengan perangkat pacarmu secara instan.

---

## 🌟 Fitur Utama Game

### 1. 👫 2 Karakter Utama (MC Cowok & Cewek)
- **Karakter Cowok 👦 (Zahy / Custom)**: Mengenakan pakaian denim petani yang gagah dengan potret ekspresi dan animasi cangkul/siram/panen.
- **Karakter Cewek 👧 (Aurel / Custom)**: Mengenakan pakaian bernuansa pink/lavender manis dengan hiasan bunga dan rona pipi imut.
- Nama pemain dapat disesuaikan sesuka hati sebelum memulai permainan.

### 2. 🤖 Helper Bot Pekerja Kebun (AI Asisten Otomatis)
- **Boni Si Kerangka Rajin 💀**: Secara otomatis berjalan mencari tanaman sayur yang sudah matang, memanennya, dan menyimpannya langsung ke dalam Peti Bersama.
- **Slimey Si Slime Air 💦**: Slime hijau imut yang memantul mencari tanah kering dan menyiramnya agar tanaman tumbuh **2.5x lebih cepat**!
- Pemain bisa mengatur tugas bot (Bantu Panen, Bantu Siram, atau Istirahat) melalui menu *Pekerja Bot*.

### 3. 🐮 Hewan Peternakan yang Bisa Dielus
- Terdapat **Sapi (Bessie)**, **Domba (Fluffy)**, **Babi (Barnaby)**, **Ayam (Chicky)**, dan **Anak Ayam (Pipit)** di padang rumput berpagar.
- Dekati hewan lalu tekan tombol **[E]** (atau tap **🖐️ Elus** di HP) untuk membelai mereka.
- Mengeluarkan partikel hati cinta ❤️ dan menghasilkan **Susu Segar 🥛**, **Telur Emas 🥚**, serta **Wol Lembut 🧶**.

### 4. 🌱 Sistem Berkebun Lengkap
- **5 Jenis Tanaman**: Wortel Manis 🥕, Kentang Emas 🥔, Tomat Segar 🍅, Stroberi Cinta 🍓, dan Semangka Kebun 🍉.
- **5 Tahap Pertumbuhan**: Bibit ➔ Tunas ➔ Berkembang ➔ Berbunga ➔ Siap Panen.
- **Alat Lengkap**: Cangkul 🌾, Penyiram 💧, Kantong Bibit, Sabit Panen 🧺, dan Bunga Cinta 🌸.
- **Peti Bersama & Kotak Jual**: Simpan hasil panen bersama atau jual untuk mendapatkan Koin Cinta 🪙.

### 5. 💕 Fitur Romantis Khusus Pasangan
- **Tingkat Cinta (Love Meter ❤️)**: Poin cinta bertambah setiap kali kalian berkebun bareng, menyiram bersama, mengelus hewan, mengirim emote, berpelukan, atau berciuman!
- **Emote & Interaksi Cepat**:
  - Tombol Emote: ❤️ Cinta, 😘 Ciuman, 🤗 Pelukan, 🌸 Bunga, ☕ Santai, 🎉 Hore!
  - Menampilkan bubble emote di atas kepala karakter dan suara manis.
  - Shortcut tombol **[H]** untuk langsung mengecup pasangan.
- **Siklus Waktu & Cuaca**:
  - Pagi Cerah 🌅
  - Siang Hari ☀️
  - Senja Romantis 🌇 (langit oranye hangat)
  - Malam Berbintang 🌙 (dengan kunang-kunang menyala ✨ di sekitar kebun)
  - Masuk ke rumah dan tidur bersama untuk menyambut pagi hari berikutnya.
- **📷 Kamera Foto Polaroid**:
  - Klik tombol kamera untuk mengambil foto kenangan kalian berdua di kebun!
  - Otomatis dibingkai dengan template Polaroid romantis bertuliskan nama kalian dan tanggal hari ini, langsung tersimpan ke galeri HP / Laptop!

### 6. 💾 Sistem Penyimpanan Data (Save System)
- **Otomatis Tersimpan**: Progres kebun otomatis tersimpan di `localStorage` peramban setiap beberapa detik.
- **Cadangan File (.json)**:
  - Tombol **📥 Unduh File Cadangan**: Menyimpan file save `.json` ke perangkatmu.
  - Tombol **📂 Muat File Cadangan**: Mengunggah kembali data kebun jika berganti perangkat.
  - Saat pasangan terhubung mabar via P2P, data kebun Host otomatis disinkronkan secara mulus!

### 7. 📱 Responsif Desktop & Mobile
- **PC / Laptop**: Gerakan dengan tombol `WASD` / Panah, `Spasi` untuk alat, `E` untuk interaksi, angka `1-7` untuk memilih alat, `C` untuk chat.
- **Smartphone / Tablet**: Layar sentuh dilengkapi **Virtual Joystick analog** di kiri bawah dan **Tombol Sentuh Aksi** di kanan bawah.

---

## 🚀 Panduan Hosting (100% Gratis & Tanpa Kartu Kredit)

### Langkah 1: Hubungkan ke GitHub Kamu
1. Buka folder proyek ini di terminal / PowerShell.
2. Buat repository baru di [GitHub](https://github.com/new), misalnya beri nama: `kebun-cinta-kita`.
3. Jalankan perintah berikut di terminal:
   ```bash
   git remote add origin https://github.com/USERNAME_KAMU/kebun-cinta-kita.git
   git branch -M main
   git push -u origin main
   ```

---

### Cara 1: Hosting di Netlify (Sangat Direkomendasikan ⚡)
1. Buka [app.netlify.com](https://app.netlify.com/) dan login menggunakan akun GitHub kamu.
2. Klik tombol **Add new site** ➔ pilih **Import an existing project**.
3. Pilih **Deploy with GitHub**.
4. Cari dan pilih repository kamu: `kebun-cinta-kita`.
5. Langsung klik tombol **Deploy kebun-cinta-kita** (Semua pengaturannya sudah otomatis terbaca dari file `netlify.toml`).
6. Dalam hitungan detik, web game kamu langsung online dan kamu mendapatkan link Netlify (contoh: `https://kebun-cinta.netlify.app`)!

---

### Cara 2: Hosting di GitHub Pages (Alternatif Gratis)
1. Buka halaman repository kamu di GitHub: `https://github.com/USERNAME_KAMU/kebun-cinta-kita/settings/pages`
2. Pada bagian **Build and deployment**:
   - Di bawah **Branch**, pilih `main` dan folder `/(root)`.
   - Klik tombol **Save**.
3. Tunggu sekitar 1 menit lalu refresh halaman.
4. Kamu akan langsung mendapatkan link game resmi:
   `https://USERNAME_KAMU.github.io/kebun-cinta-kita/`

---

## 🎮 Cara Mabar Berdua dengan Pacar

1. **Kamu (Host)**:
   - Buka link web game kamu di HP atau Laptop.
   - Pilih karaktermu (misal: Cowok 👦) dan klik **🏡 Buat Kebun Baru (Host)**.
   - Akan muncul jendela berisi **Kode Kamar** dan tombol **📋 Salin Link Undangan**.
   - Kirim link tersebut ke pacarmu lewat WhatsApp atau pesan chat!

2. **Pacar Kamu (Joiner)**:
   - Pacarmu cukup mengklik link WhatsApp yang kamu kirim.
   - Game akan otomatis membuka layar pemilihan karakter (misal: Cewek 👧).
   - Klik **💌 Gabung (Join)**.
   - **TADA! 🎉** Kalian langsung muncul berdua di kebun yang sama dan bisa langsung mulai berkebun bersama secara *real-time*!

---

*Dibuat dengan penuh cinta untuk menemani waktu santai berkualitas bersama pasangan.* 🌾❤️✨

