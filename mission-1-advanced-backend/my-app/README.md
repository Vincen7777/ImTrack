# ImTrack — Advanced Backend Node.js

Aplikasi pengelola tugas React + TypeScript dengan REST API Express, MySQL/MariaDB,
dan Sequelize ORM. Implementasi mengikuti kebutuhan dalam missionobject.md.

## Fitur mission

| Kebutuhan | Implementasi |
|---|---|
| Entitas User | fullname, username unik, email unik, password_hash, token verifikasi, status verifikasi |
| Register | Validasi input; password di-hash bcrypt (cost 12); duplikasi ditolak dengan 409 |
| Login | Email + bcrypt.compare; akun harus terverifikasi; JWT HS256 berlaku 1 jam |
| Middleware | Authorization: Bearer; validasi signature, issuer, audience, expiry, akun aktif |
| Filter, sort, search | Query database via Sequelize WHERE, ORDER BY, LIKE pada daftar tugas |
| Email | Nodemailer + token UUID sekali pakai, kedaluwarsa 24 jam, endpoint verifikasi dan kirim ulang |
| Upload | Multer disk storage di upload/; validasi MIME dan signature, maksimal 5 MB |
| ORM | Model User, Task, Tag, TaskTag, Recurrence beserta relasi dan transaksi |
| Frontend | Daftar, verifikasi, masuk/keluar, proteksi halaman, filter/search, CRUD, upload foto profil |

Semua operasi tugas dan gambar dibatasi berdasarkan user dari JWT. Header
x-user-id dan DEFAULT_USER_ID tidak lagi digunakan.

## Persiapan

1. Gunakan Node.js **22.12+** dan MySQL 8 atau MariaDB (integrasi juga diuji pada MariaDB 10.4 dari XAMPP).
2. Jalankan MySQL, lalu buat database kosong jika belum tersedia:

~~~sql
CREATE DATABASE IF NOT EXISTS imtrack_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
~~~

3. Jalankan npm install.
4. Salin .env.example menjadi .env **hanya jika .env belum ada**. Sesuaikan
   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, dan DB_NAME. Jangan bagikan .env.
5. Isi JWT_SECRET dengan nilai acak minimal 32 karakter. Contoh generator:

~~~bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
~~~

6. Buat/upgrade tabel dengan:

~~~bash
npm run db:migrate
~~~

Migrasi menambah kolom autentikasi pada users, menyalin display_name atau username
lama ke fullname, serta membuat tabel inti yang belum ada. Tidak memakai
sync({ force: true }) atau sync({ alter: true }); tidak menghapus data lama.
Tabel grup/kolaborasi dari mission sebelumnya tetap dipertahankan jika sudah ada.
Akun demo dengan password placeholder lama tidak dapat login; daftarkan akun baru.

## Menjalankan

Dua terminal:

~~~bash
npm run dev:api
~~~

~~~bash
npm run dev
~~~

Buka [ImTrack](http://localhost:5173). API: [health](http://localhost:3000/api/health).
Default VITE_API_BASE_URL=/api memakai proxy Vite ke port 3000. Jika frontend dan
API berbeda origin, isi URL API lengkap dan sesuaikan CORS_ORIGIN.
FRONTEND_URL harus menunjuk alamat frontend yang dapat dibuka dari email.

npm run preview hanya menyajikan build frontend. Untuk preview set
VITE_API_BASE_URL=http://localhost:3000/api sebelum build, dan
CORS_ORIGIN=http://localhost:4173 pada API. Pada deployment, arahkan /api ke server
Express melalui reverse proxy dan aktifkan HTTPS.

## Mencoba email verifikasi

Mode default MAIL_MODE=file memakai Nodemailer stream transport dan menulis email
ke **server/storage/mail/*.eml**, bukan mengirimkannya ke inbox.

1. Daftar lewat /sign-up dengan fullname, username, email, password.
2. Buka berkas .eml terbaru memakai aplikasi email, atau editor teks.
3. Buka tautan /verify-email?token=... dan klik **Verifikasi email**.
4. Masuk lewat /sign-in. Token JWT disimpan di sessionStorage untuk tab tersebut.
5. Jika token habis atau email gagal dikirim, isi email pada halaman masuk lalu
   klik **Kirim ulang verifikasi email**. Token sebelumnya diganti.

Jika membaca .eml mentah, MIME dapat melipat tautan memakai quoted-printable:
gabungkan baris yang berakhir dengan = dan ubah =3D menjadi =.
Tidak ada endpoint publik untuk membaca outbox atau mengambil token.

Untuk pengiriman sungguhan:

~~~dotenv
MAIL_MODE=smtp
MAIL_FROM=ImTrack <akun@domain-kamu.com>
SMTP_HOST=smtp.provider-kamu.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=akun@domain-kamu.com
SMTP_PASSWORD=password-atau-app-password
~~~

Untuk port 465 gunakan SMTP_SECURE=true. Konfigurasi production memerlukan mode
SMTP. Jika pengiriman gagal, registrasi tetap membuat akun, respons mengandung
emailDelivery: "failed", dan pengguna dapat meminta pengiriman ulang. Pengiriman
ke provider eksternal memerlukan kredensial SMTP milik pengguna; pengujian proyek
menggunakan transport lokal.

Uji koneksi SMTP tanpa mengirim pesan:

~~~bash
npm run test:smtp
~~~

Untuk mengirim satu pesan uji, isi SMTP_TEST_TO pada .env dengan alamat email
tujuan, kemudian jalankan:

~~~bash
npm run test:smtp -- --send
~~~

Perintah ini memakai pengaturan SMTP meskipun MAIL_MODE masih file, tidak membuat
akun, dan tidak mengubah database. Respons berhasil berarti server SMTP menerima
pesan; penerimaan di inbox/spam perlu dikonfirmasi dari kotak email tujuan.
Setelah pengujian berhasil, gunakan MAIL_MODE=smtp untuk email registrasi aplikasi.
Untuk Gmail, SMTP_PASSWORD berisi App Password Google setelah Verifikasi 2 Langkah
aktif. Jangan isi dengan password login akun Google atau menyertakan password pada
repository pengumpulan.

## API

Semua endpoint di bawah diawali /api.

| Method | Endpoint | Auth | Respons |
|---|---|---|---|
| GET | /health | Tidak | 200 status |
| POST | /auth/register | Tidak | 201 akun dan status email |
| POST | /auth/login | Tidak | 200 JWT + user |
| GET | /auth/me | Bearer | 200 profil user |
| POST | /auth/verify-email | Tidak | 200 Email Verified Successfully |
| GET | /auth/verifikasi-email?token=... | Tidak | Alias verifikasi |
| POST | /auth/resend-verification | Tidak | 200 pesan pengiriman ulang |
| GET | /task | Bearer | 200 array tugas |
| GET | /task/:id | Bearer | 200 tugas / 404 |
| POST | /task | Bearer | 201 tugas |
| PATCH | /task/:id | Bearer | 200 tugas |
| DELETE | /task/:id | Bearer | 204 |
| POST | /upload | Bearer | 201 metadata gambar, sekaligus memperbarui avatar |
| GET | /uploads/:filename | Bearer | File milik user tersebut |

/tasks adalah alias /task. /auth/verify-email dan /auth/verifikasi-email menerima
GET (query token) maupun POST (body token). Alias /upload dan /uploads/:filename
juga tersedia tanpa awalan /api.

Contoh registrasi:

~~~json
{
  "fullname": "Student ImTrack",
  "username": "student",
  "email": "student@example.com",
  "password": "PasswordYangKuat123!"
}
~~~

Username: 3–50 huruf, angka, underscore. Password: minimal 8 karakter dan maksimal
72 byte UTF-8 (batas bcrypt). Fullname maksimal 100 karakter. API tidak pernah
mengembalikan password hash atau token verifikasi. Token UUID pada email hanya
disimpan sebagai SHA-256 dalam database.

Contoh tugas:

~~~json
{
  "title": "Belajar Express",
  "priority": "Sekarang",
  "status": "todo",
  "due": "2026-12-20",
  "cat": "Belajar",
  "tags": ["backend", "node"],
  "isRecurring": true,
  "recurrenceType": "weekly"
}
~~~

isRecurring true memerlukan recurrenceType daily/weekly/monthly. Untuk mematikan
pengulangan, kirim isRecurring: false. Tags maksimal 20 buah, masing-masing 50
karakter. Tanggal harus valid dalam format YYYY-MM-DD atau null.

Query dapat digabungkan:

~~~text
GET /api/task?cat=Belajar&status=todo&priority=Sekarang&search=Express&sort=title&order=asc
Authorization: Bearer <token-login>
~~~

| Parameter | Nilai |
|---|---|
| cat | Nama kategori persis |
| status | todo / done |
| priority | Sekarang / Nanti / Someday |
| search | Potongan judul; % dan _ diperlakukan sebagai karakter literal |
| sort | createdAt / title / due / priority / status |
| order | asc / desc (default desc) |

Default sort adalah createdAt. Prioritas mengikuti urutan ENUM Sekarang, Nanti,
Someday. Tenggat null mengikuti pengurutan MySQL (di awal untuk asc).
Frontend mengelompokkan hasil berdasarkan prioritas dan mengurutkan tugas di dalam
setiap kelompok. Query tidak dikenal, nilai array, atau sort tidak valid ditolak
dengan 422.

Upload menggunakan multipart/form-data, satu field **file**, format PNG/JPEG/WebP/GIF,
maksimal 5 MB. Jangan set Content-Type secara manual saat memakai FormData.
Nama file acak dan folder per-user mencegah penimpaan serta akses gambar lintas akun.
URL gambar pada respons bersifat relatif terhadap base API dan membutuhkan Bearer.
Frontend mengambil gambar sebagai blob untuk foto profil. File mentah tidak
dipublikasikan sebagai folder statis. Gambar lama tetap ada sebagai file milik akun
setelah avatar diganti.

Format error:

~~~json
{ "error": { "message": "Data akun tidak valid", "details": ["Email tidak valid"] } }
~~~

Kode penting: 400 token/JSON invalid, 401 autentikasi, 403 email belum diverifikasi,
404 tidak ditemukan atau bukan pemilik, 409 duplikat, 413 terlalu besar, 415 format
gambar tidak cocok, 422 validasi, 429 terlalu banyak percobaan, 503 email gagal.
Endpoint autentikasi dibatasi 30 permintaan per IP per 15 menit.

## Postman

Import postman/ImTrack-Task-API.postman_collection.json. Isi baseUrl, email,
username, fullname, password sesuai akun uji. Jalankan **Register**, ambil token
dari email lalu isi verificationToken dan jalankan **Verify email**, kemudian
**Login** (otomatis menyimpan accessToken). Lanjutkan CRUD, query, dan upload.
Untuk upload pilih sendiri file lokal pada field file. Respons Create task
otomatis menyimpan taskId. Registrasi ulang dengan data sama menghasilkan 409.

## Pengujian

~~~bash
npm run lint
npm run build
npm run test:api
npm run test:integration
~~~

test:api menjalankan 11 pengujian tanpa MySQL: 7 HTTP/middleware dan 4 SMTP lokal.
Pengujian SMTP lokal mencakup pengiriman email verifikasi, autentikasi salah,
penolakan penerima, dan host yang belum dikonfigurasi. Server uji hanya mendengarkan
alamat loopback dan menggunakan kredensial sintetis.
test:integration menjalankan 13 pengujian menggunakan database MySQL asli yang
dibuat khusus dengan nama acak imtrack_test_*, kemudian dihapus setelah selesai.
Akun DB pengujian memerlukan izin CREATE/DROP DATABASE. Gunakan server lokal/uji.
Konfigurasi default mengikuti DB_* di .env; override lewat TEST_DB_HOST,
TEST_DB_PORT, TEST_DB_USER, TEST_DB_PASSWORD. Database aplikasi tidak dihapus.

Cakupan: migrasi ulang dan data lama, bcrypt, duplikasi, verifikasi konkuren dan
kedaluwarsa, login, pemulihan email gagal, JWT, CRUD relasional, rollback, query,
isolasi akun, upload valid/tidak valid/terlalu besar, dan email Nodemailer lokal.

## Struktur dan catatan

- server/models: model dan relasi ORM.
- server/services: operasi database, autentikasi, email.
- server/routes, middleware, validators: HTTP, JWT, validasi, upload.
- src/components/auth: sesi dan proteksi halaman, foto profil.
- ERD_Database_ImTrack.md: ERD implementasi terbaru.
- PDF ERD dan laporan di output/pdf adalah arsip mission sebelumnya dan belum
  mencakup perubahan autentikasi ini.

Kolaborasi grup, Google OAuth, reset password, kalender, keuangan, dan kesehatan
belum menjadi endpoint dalam mission ini. Tombol simulasi login Google dan reset
password sudah dilepas; aksi grup tidak lagi menghapus tugas seolah-olah sudah
dibagikan. Keluar menghapus token dan state tugas pada tab; JWT yang sudah disalin
tetap berlaku sampai kedaluwarsa (belum ada mekanisme revokasi server).

Referensi implementasi: [transaksi Sequelize](https://sequelize.org/docs/v6/other-topics/transactions/),
[Nodemailer stream transport](https://nodemailer.com/transports/stream),
[SMTP](https://nodemailer.com/smtp), [Multer](https://expressjs.com/en/resources/middleware/multer/).
