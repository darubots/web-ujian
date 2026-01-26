# Web Ujian AI - Platform Ujian Berbasis Kecerdasan Buatan

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Platform ujian online modern dengan sistem penilaian otomatis menggunakan Google Gemini AI. Mendukung soal esai dan pilihan ganda dengan fitur manajemen kelas, monitoring real-time, dan analitik performa siswa.

## 🌟 Fitur Utama v2.0

### 🎓 Multi-Role System
- **Owner** - Super admin untuk konfigurasi sistem
- **Guru** - Membuat kelas, soal, dan monitoring ujian
- **Siswa** - Mengikuti kelas dan mengerjakan ujian

### 🏫 Class System (Clash)
- Guru membuat kelas dengan invite code unik
- Siswa join kelas via invite link atau QR code
- Satu siswa bisa gabung multiple kelas
- Manajemen student per kelas

### 📝 Enhanced Exam System
- **Essay Questions** - Dinilai otomatis oleh Gemini AI
- **Multiple Choice** - Auto-grading instant
- Upload soal dari PDF/DOCX (AI extraction)
- Input manual soal
- Shuffle questions & options
- Timer countdown real-time

### 📊 Real-time Monitoring
- Live student status (online/offline)
- Track who's taking exam
- Real-time progress updates
- Live score monitoring

### 📈 Student Dashboard
- History ujian yang telah dikerjakan
- Lihat jawaban benar/salah
- AI feedback untuk setiap jawaban
- Performance analytics per subject
- Multi-class view

### 💾 Hybrid Storage
- **Local Mode** - File JSON untuk testing
- **MongoDB Mode** - Database cloud untuk production
- Automatic fallback jika MongoDB gagal
- Mudah toggle via Owner Dashboard

### 🔐 Security
- JWT authentication
- Password hashing dengan bcrypt
- Role-based access control
- API rate limiting
- CORS protection

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (opsional - bisa pakai local storage)
- Gemini API Key ([Get it free](https://ai.google.dev/))

### Installation

```bash
# Clone repository
git clone <repo-url>
cd web-ujian-ai

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dan isi API keys

# Run development
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

📖 **Panduan lengkap:** Lihat [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🏗️ Teknologi Stack

### Frontend
- React 19 + TypeScript
- Vite 6
- React Router DOM 7
- TailwindCSS 3
- Axios

### Backend
- Node.js + Express 4
- MongoDB + Mongoose 8
- JWT Authentication
- Bcrypt password hashing
- Google Gemini API

### Development
- TypeScript
- Concurrently
- Hot Module Reload (HMR)

---

## 📁 Struktur Project

```
web-ujian-ai/
├── server/                 # Backend Express server
│   ├── db/                # Database connection
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── middleware/        # Auth, validation
│
├── services/              # Frontend API services
│   ├── apiService.ts      # Axios API client
│   ├── geminiService.ts   # AI grading (legacy)
│   └── exportService.ts   # Export PDF/Excel
│
├── components/            # React components (TBU)
│   ├── OwnerDashboard.tsx
│   ├── GuruDashboard.tsx
│   ├── StudentDashboard.tsx
│   └── ...
│
├── database/              # Local JSON storage
│   ├── admin.json
│   ├── siswa.json
│   └── mapel-ujiannya.json
│
├── types.ts               # TypeScript definitions
├── App.tsx                # Main app component
└── README.md              # Documentation
```

---

## 🎯 Roadmap

### ✅ Completed (v2.0)
- [x] Backend API dengan Express
- [x] MongoDB integration dengan hybrid fallback
- [x] JWT authentication
- [x] Role-based access (Owner, Guru, Siswa)
- [x] API routes untuk semua fitur
- [x] Auto-grading service (Essay + MC)
- [x] Real-time monitoring API
- [x] TypeScript types lengkap
- [x] API service layer (Axios)
- [x] Deployment documentation

### 🔨 In Progress (Frontend Integration)
- [ ] Update Login component (Owner/Guru support)
- [ ] Owner Dashboard UI
- [ ] Guru Dashboard dengan class system
- [ ] Student Dashboard dengan history
- [ ] Class management components
- [ ] Exam builder UI (Essay + MC)
- [ ] Results viewer dengan AI feedback
- [ ] Performance analytics charts

### 🔮 Future Features
- [ ] WebSocket untuk real-time (replace polling)
- [ ] PWA support (offline mode)
- [ ] Image upload dalam soal
- [ ] Video recording proctoring
- [ ] Advanced analytics dashboard
- [ ] Export to various formats
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📞 Support & Contributing

**Developed by:** izhardevelop

Untuk bug reports, feature requests, atau kontribusi:
1. Open GitHub Issues
2. Submit Pull Request
3. Contact developer

---

## 📄 License

MIT License - Feel free to use for educational purposes

---

## 🙏 Acknowledgments

- Google Gemini API untuk AI grading
- MongoDB Atlas untuk free tier database
- React & Vite teams untuk amazing tools
- TailwindCSS untuk beautiful UI framework

---

**Happy Teaching & Learning!** 📚✨
