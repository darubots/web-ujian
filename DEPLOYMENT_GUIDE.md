# 🚀 Panduan Setup & Deployment - Web Ujian AI v2.0

## 📋 Daftar Isi
1. [Prasyarat](#prasyarat)
2. [Instalasi Lokal](#instalasi-lokal)
3. [Konfigurasi Database](#konfigurasi-database)
4. [Menjalankan Aplikasi](#menjalankan-aplikasi)
5. [Panduan Pengguna](#panduan-pengguna)
6. [Troubleshooting](#troubleshooting)

---

## Prasyarat

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js** versi 18 atau lebih tinggi ([Download](https://nodejs.org/))
- **Git** untuk clone repository (opsional)
- **MongoDB** lokal ATAU akun MongoDB Atlas (gratis)
- **Gemini API Key** dari Google AI Studio ([Dapatkan di sini](https://ai.google.dev/))

---

## Instalasi Lokal

### 1. Download/Clone Project

```bash
# Jika menggunakan Git
git clone <repository-url>
cd web-ujian-ai

# Atau extract ZIP file dan masuk ke foldernya
cd web-ujian-ai
```

### 2. Install Dependencies

```bash
npm install
```

Ini akan menginstall semua package yang diperlukan termasuk:
- React, TypeScript, Vite (frontend)
- Express, Mongoose, JWT (backend)
- Axios (API client)

### 3. Setup Environment Variables

Buat file `.env.local` di root folder (copy dari `.env.example`):

```bash
cp .env.example .env.local
```

Atau buat manual file `.env.local` dengan isi:

```env
# Database Configuration
# Kosongkan untuk pakai local storage, isi untuk pakai MongoDB
MONGODB_URL=

# API Keys
# Dapatkan dari: https://ai.google.dev/
GEMINI_API_KEY=

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (ganti dengan string random untuk production)
JWT_SECRET=ganti-dengan-secret-key-anda-sendiri-yang-aman

# Frontend URL (untuk CORS)
CLIENT_URL=http://localhost:3000
```

---

##  Konfigurasi Database

Aplikasi mendukung **2 mode storage**:

### Mode 1: Local Storage (Tanpa MongoDB) ✅ RECOMMENDED UNTUK TESTING

Jika Anda tidak mengisi `MONGODB_URL`, aplikasi akan:
- Menggunakan file JSON lokal di folder `database/`
- Data tersimpan di `database/admin.json`, `database/siswa.json`
- Cocok untuk testing dan development
- **Tidak perlu setup MongoDB**

**Kelebihan:**
- ✅ Mudah, tidak perlu setup database
- ✅ Langsung jalan
- ✅ Data dalam JSON bisa diedit manual

**Kekurangan:**
- ❌ Data hilang jika folder dihapus
- ❌ Tidak cocok untuk production
- ❌ Fitur advanced (classes, exams) tidak tersedia

### Mode 2: MongoDB (Cloud/Local) 🚀 RECOMMENDED UNTUK PRODUCTION

#### Option A: MongoDB Atlas (Cloud - GRATIS)

1. Buka [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Buat akun gratis
3. Create New Cluster (pilih Free Tier)
4. Tunggu cluster selesai dibuat (~5 menit)
5. Klik "Connect" → "Connect your application"
6. Copy connection string, seperti:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myDatabase
   ```
7. Paste connection string ke `.env.local`:
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ujian-ai
   ```

#### Option B: MongoDB Lokal

1. Install MongoDB Community Edition
2. Jalankan MongoDB service
3. Set connection string:
   ```env
   MONGODB_URL=mongodb://localhost:27017/ujian-ai
   ```

**Kelebihan:**
- ✅ Data persistent dan aman
- ✅ Support semua fitur (classes, real-time, dll)
- ✅ Scalable untuk banyak user

---

## Menjalankan Aplikasi

### Development Mode (Recommended)

Jalankan frontend dan backend bersamaan:

```bash
npm run dev
```

Ini akan menjalankan:
- **Frontend** di http://localhost:3000
- **Backend API** di http://localhost:5000

### Atau Jalankan Terpisah

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

### Build untuk Production

```bash
npm run build
```

File production akan ada di folder `dist/`

### Preview Production Build

```bash
npm run preview
```

---

## 🎯 Panduan Pengguna

### 🔑 Default Login Credentials

#### Owner (Super Admin)
> **PENTING:** Owner login tidak ada di UI utama. Akses via:
> `http://localhost:3000/#/owner-login`

- **Username:** `owner`
- **Password:** `owner123` (ganti setelah first login)

*Cara membuat owner account manual:*
```bash
# Gunakan MongoDB Compass atau mongosh
# Tambahkan document di collection 'users':
{
  "username": "owner",
  "password": "<hash-bcrypt-dari-password>",
  "role": "owner",
  "email": "owner@school.com",
  "isSuspended": false
}
```

#### Guru (Teacher) - DEFAULT
- **Username:** `admin` (dari database lama)
- **Password:** `password`
- **Role:** Akan diubah dari `Admin` → `Guru`

#### Siswa (Student) - DEFAULT
- **Nama:** `Budi Santoso`
- **NISN:** `123456789`
- **Password:** Tidak perlu (login dengan NISN)

---

### 📚 Workflow Owner

**Owner Dashboard Features:**

1. **Settings Management**
   - Input Gemini API Key
   - Configure MongoDB URL
   - Toggle storage mode (Local ↔  MongoDB)
   - Test connections

2. **User Management**
   - Create Guru accounts
   - Create Siswa accounts
   - Suspend/Activate users
   - View all users across the system

3. **System Statistics**
   - Total users, classes, exams
   - Storage mode status
   - Active sessions

**Step-by-step:**
```
1. Login ke /owner-login
2. Tab "Settings" → Input Gemini API Key → Save
3. Tab "Settings" → Input MongoDB URL → Test Connection
4. Tab "Users" → Create guru accounts
5. Provide credentials to teachers
```

---

### 👨‍🏫 Workflow Guru (Teacher)

**Guru Dashboard Features:**

1. **Create Class (Clash)**
   ```
   - Name: "Kelas 10A - Matematika"
   - Subject: "Matematika"
   - Grade: "Kelas 10"
   - Description: "Kelas Matematika semester 1"
   → Click "Create Class"
   → Get INVITE CODE (ex: "ABC12XYZ")
   ```

2. **Share Invite Link**
   - Copy invite code
   - Share dengan siswa
   - Generate QR code untuk scan

3. **Create Exam**
   ```
   - Select Class
   - Title: "UTS Matematika"
   - Add Questions:
     * Essay: Free text answer
     * Multiple Choice: A, B, C, D with correct answer
   - Set start/end time
   - Publish to class
   ```

4. **Monitor Live Exam**
   - See who's online/offline
   - Track submission progress
   - Real-time score updates

5. **View Results & Export**
   - See all submissions
   - View detailed answers
   - Export to PDF/Excel/CSV

**Step-by-step:**
```
1. Login sebagai Guru
2. Tab "My Classes" → Create Class
3. Copy invite code → Share ke WhatsApp group siswa
4. Tab "Exams" → Create Exam → Add questions
5. Publish exam pada waktu yang ditentukan
6. Tab "Live Monitoring" → Lihat siswa yang mengerjakan
7. Tab "Results" → View & Export hasil
```

---

### 🎓 Workflow Siswa (Student)

**Siswa Dashboard Features:**

1. **Join Class**
   ```
   - Get invite code from teacher
   - Input code: "ABC12XYZ"
   - Click "Join Class"
   - Class muncul di "My Classes"
   ```

2. **Take Exam**
   ```
   - Lihat active exams
   - Click "Start Exam"
   - Answer questions (essay atau multiple choice)
   - Auto-save setiap jawaban
   - Submit when done
   ```

3. **View Results**
   - See score immediately (if allowed)
   - View correct/incorrect answers
   - Read AI feedback for essay
   - See correct answer for MC

4. **View History**
   - List all completed exams
   - Click untuk see detail
   - Track performance over time

**Step-by-step:**
```
1. Login dengan Nama + NISN
2. Tab "Join Class" → Input invite code dari guru
3. Tab "Active Exams" → Click "Mulai Ujian"
4. Kerjakan soal → Auto-save setiap jawaban
5. Click "Submit" saat selesai
6. Tab "Results" → Lihat nilai & pembahasan
7. Tab "Performance" → Lihat grafik progress
```

---

## Troubleshooting

### ❌ Error: "Cannot connect to MongoDB"

**Solusi:**
1. Cek connection string di `.env.local`
2. Pastikan IP sudah diwhitelist di MongoDB Atlas (0.0.0.0/0 untuk allow all)
3. Aplikasi akan fallback ke local storage automatically

### ❌ Error: "API Key not found"

**Solusi:**
1. Masuk ke Owner Dashboard
2. Tab Settings → Input Gemini API Key
3. Atau set di `.env.local`: `GEMINI_API_KEY=your-key`

### ❌ Port 3000 atau 5000 sudah dipakai

**Solusi:**
```bash
# Ganti port di package.json
"scripts": {
  "client": "vite --port 3001",
  "server": "PORT=5001 node server/index.js"
}
```

### ❌ "Command 'concurrently' not found"

**Solusi:**
```bash
npm install
# Atau install manual:
npm install --save-dev concurrently
```

### ❌ Dependencies install gagal

**Solusi:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ❌ CORS Error

**Solusi:**
Pastikan di `.env.local`:
```env
CLIENT_URL=http://localhost:3000
```

### ⚠️ AI Grading tidak bekerja

**Solusi:**
1. Check Gemini API Key valid
2. Check quota API (free tier: 60 requests/minute)
3. Fallback: Manual score diberikan otomatis

---

## 📞 Support & Kontribusi

Jika ada error atau butuh bantuan:

1. **Check Logs:**
   - Browser Console (F12)
   - Terminal server output

2. **Check GitHub Issues**
3. **Contact Developer:** izhardevelop

---

## 🎉 Selamat!

Aplikasi sudah siap digunakan! 

**Next Steps:**
1. ✅ Setup database (local atau MongoDB)
2. ✅ Input Gemini API key
3. ✅ Create guru accounts (via Owner)
4. ✅ Guru create classes & exams
5. ✅ Siswa join classes & take exams

**Happy Teaching & Learning!** 📚✨
