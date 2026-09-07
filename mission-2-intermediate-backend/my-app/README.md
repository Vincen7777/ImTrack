# ImTrack

ImTrack terdiri dari frontend React + TypeScript dan REST API Node.js + Express yang
terhubung ke MySQL. API mengimplementasikan DML SELECT, INSERT, UPDATE, dan DELETE
untuk entitas task sesuai skema pada ERD_Database_ImTrack.md.

## Persiapan

1. Gunakan Node.js 20+ dan MySQL 8.x atau MariaDB 10.6+.
2. Jalankan DDL pada bagian **SQL DDL — Preparation Database** di
   ERD_Database_ImTrack.md.
3. Jalankan server/database/seed.sql agar tersedia user demo dengan id 1.
4. Salin nilai dari .env.example ke .env, lalu sesuaikan DB_HOST, DB_PORT,
   DB_USER, DB_PASSWORD, dan DB_NAME.
5. Pasang dependency:

~~~bash
npm install
~~~

## Menjalankan aplikasi

Jalankan API dan frontend pada dua terminal:

~~~bash
npm run dev:api
~~~

~~~bash
npm run dev
~~~

API berjalan di http://localhost:3000/api, sedangkan Vite biasanya berjalan di
http://localhost:5173. Endpoint health check tersedia di GET /api/health.

Sebelum autentikasi sungguhan ditambahkan, API mengambil pengguna dari header
x-user-id. Jika header tidak dikirim, nilainya memakai DEFAULT_USER_ID dari .env.

## Endpoint task

| Method | Endpoint | Kegunaan |
|---|---|---|
| GET | /api/task | Mengambil semua task milik user |
| GET | /api/task/:id | Mengambil satu task berdasarkan id |
| POST | /api/task | Menambahkan task |
| PATCH | /api/task/:id | Mengubah field tertentu pada task |
| DELETE | /api/task/:id | Menghapus task |

Alias plural /api/tasks juga tersedia. Contoh payload:

~~~json
{
  "title": "Belajar Express.js",
  "priority": "Sekarang",
  "status": "todo",
  "due": "2026-09-08",
  "tags": ["backend", "nodejs"],
  "cat": "Belajar",
  "isRecurring": false
}
~~~

Nilai priority yang diterima adalah Sekarang, Nanti, atau Someday. Nilai status
adalah todo atau done. Untuk task berulang, kirim isRecurring: true beserta
recurrenceType bernilai daily, weekly, atau monthly.

## Testing

Pengujian otomatis endpoint tidak memerlukan database aktif karena service
database diganti fake service:

~~~bash
npm run test:api
~~~

Untuk menguji alur sungguhan dengan MySQL, import
postman/ImTrack-Task-API.postman_collection.json ke Postman, nyalakan API, lalu
jalankan kelima request secara berurutan lewat Collection Runner.

Pemeriksaan proyek lengkap:

~~~bash
npm run lint
npm run build
npm run test:api
~~~
