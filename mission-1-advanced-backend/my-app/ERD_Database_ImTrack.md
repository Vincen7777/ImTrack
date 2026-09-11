# ERD ImTrack — Advanced Backend

Skema inti yang digunakan aplikasi saat ini. Sumber implementasi:
server/models/index.js dan server/database/migrate.js.
File PDF lama merupakan arsip desain mission sebelumnya.

~~~mermaid
erDiagram
    USERS ||--o{ TASKS : owns
    USERS ||--o{ TAGS : owns
    RECURRENCES o|--o{ TASKS : schedules
    TASKS ||--o{ TASK_TAGS : has
    TAGS ||--o{ TASK_TAGS : labels

    USERS {
        bigint user_id PK
        varchar fullname "100, required"
        varchar username UK "50, required"
        varchar email UK "255, required"
        varchar password_hash "bcrypt; never plaintext"
        varchar verification_token UK "SHA-256 of UUID; nullable"
        datetime verification_expires_at "nullable"
        datetime email_verified_at "nullable"
        varchar avatar_url "500; nullable"
        boolean is_active "default true"
        datetime created_at
        datetime updated_at
    }
    TASKS {
        bigint task_id PK
        bigint user_id FK
        bigint recurrence_id FK "nullable"
        varchar title "300"
        enum priority "Sekarang, Nanti, Someday"
        enum status "todo, done"
        date due_date "nullable"
        varchar category "100; nullable"
        boolean is_recurring
        datetime deleted_at "nullable; preserved from legacy"
        datetime created_at
        datetime updated_at
    }
    TAGS {
        bigint tag_id PK
        bigint user_id FK
        varchar name "50; unique per user"
        datetime created_at
    }
    TASK_TAGS {
        bigint task_tag_id PK
        bigint task_id FK
        bigint tag_id FK
        datetime created_at
    }
    RECURRENCES {
        bigint recurrence_id PK
        enum recurrence_type "daily, weekly, monthly"
        date start_date
        datetime created_at
    }
~~~

## Entitas User

Payload registrasi memiliki fullname, username, password, email. Password dipetakan
ke password_hash dan diproses menggunakan bcrypt sebelum INSERT melalui Sequelize.
Username dan email memiliki unique constraint di database.

Token verifikasi dibuat memakai UUID v4. Nilai mentah hanya dikirim lewat email;
verification_token menyimpan SHA-256 token, verification_expires_at menyimpan batas
24 jam. Setelah verifikasi sukses, email_verified_at diisi dan kedua kolom token
dikosongkan dalam satu conditional UPDATE. Akun yang belum terverifikasi tidak
dapat login.

## Relasi dan integritas

- Setiap tugas dan tag dimiliki satu user; seluruh query tugas menyertakan user_id
  dari JWT dan deleted_at IS NULL.
- Tugas mempunyai nol atau satu konfigurasi pengulangan. Service membuat
  konfigurasi sendiri untuk tugas dan menghapusnya ketika pengulangan dimatikan.
- Task dan tag berelasi banyak-ke-banyak lewat task_tags. Pasangan
  (task_id, tag_id) unik; (user_id, name) pada tags unik.
- Perubahan task, tag, dan recurrence berjalan dalam transaksi.
- Endpoint DELETE saat ini menghapus tugas secara permanen, sesuai CRUD sebelumnya.
- Gambar disimpan di upload/{user_id}/{UUID}.{extension}. Hanya path avatar terakhir
  disimpan di users.avatar_url. Pengambilan file membutuhkan JWT pemilik.

## Kompatibilitas database sebelumnya

npm run db:migrate menambah fullname, verification_token,
verification_expires_at, email_verified_at bila belum ada. Fullname data lama
diambil dari display_name, dengan fallback username. Kolom lama seperti
display_name, is_shared, warna tag, atau detail recurrence tambahan tetap ada jika
berasal dari schema terdahulu. Tabel groups, user_groups, task_groups, dan
notifications yang sudah ada juga tidak dihapus; fitur tersebut belum dipakai oleh
backend mission ini.

Untuk database baru, buat database sesuai .env lalu jalankan npm run db:migrate.
Sequelize membangun lima tabel di atas melalui model dan association, tanpa force
atau alter. Indeks mencakup email/username, (user_id,status),
(user_id,priority), tag unik per user, serta pasangan task-tag.
