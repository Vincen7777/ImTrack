from pathlib import Path
import json, html, shutil
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, A3, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from pypdf import PdfReader
import pdfplumber

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "tmp/pdfs/advanced-erd"
OUT = ROOT / "output/pdf/Laporan_Mission_ERD_ImTrack.pdf"
schema = {m["table"]: m for m in json.loads((WORK/"schema.json").read_text(encoding="utf-8"))}
for name, filename in [("Body","segoeui.ttf"),("Bold","segoeuib.ttf"),("Light","segoeuil.ttf"),("Mono","consola.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(Path("C:/Windows/Fonts")/filename)))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="Bold", italic="Body", boldItalic="Bold")
NAVY=colors.HexColor("#14213D"); TEAL=colors.HexColor("#087F83"); INK=colors.HexColor("#243347")
MUTED=colors.HexColor("#657487"); LINE=colors.HexColor("#DCE5EC"); PALE=colors.HexColor("#EFF8F8")
BLUE=colors.HexColor("#3564AA"); WHITE=colors.white
OUT.parent.mkdir(parents=True, exist_ok=True)
C=canvas.Canvas(str(OUT),pagesize=A4,pageCompression=1)
C.setTitle("ImTrack - ERD dan Implementasi Database Advanced Backend")
C.setAuthor("ImTrack")
C.setSubject("Skema Sequelize, autentikasi, verifikasi email, upload dan pengujian")
N=8; PAGE=0; W,H=A4; M=42
S=ParagraphStyle("body",fontName="Body",fontSize=10,leading=15,textColor=INK)
SM=ParagraphStyle("small",parent=S,fontSize=8.5,leading=12)
TC=ParagraphStyle("cell",parent=S,fontSize=8.2,leading=11.6)
TM=ParagraphStyle("mono",parent=TC,fontName="Mono",fontSize=7.8,leading=11)
TH=ParagraphStyle("th",parent=TC,fontName="Bold",fontSize=8,textColor=WHITE,leading=11)
limits=[]
def p(txt,x,y,w,style=S):
    item=Paragraph(txt,style); _,h=item.wrap(w,2000)
    item.drawOn(C,x,H-y-h)
    limits.append((PAGE,y+h,txt[:70]))
    return y+h
def text(txt,x,y,size=10,font="Body",color=INK):
    C.setFont(font,size);C.setFillColor(color);C.drawString(x,H-y,txt)
def rect(x,y,w,h,fill,stroke=None,r=0):
    C.setFillColor(fill)
    C.setStrokeColor(stroke or fill)
    if r:C.roundRect(x,H-y-h,w,h,r,stroke=bool(stroke),fill=1)
    else:C.rect(x,H-y-h,w,h,stroke=bool(stroke),fill=1)
def line(x1,y1,x2,y2,col=LINE,width=1):
    C.setStrokeColor(col);C.setLineWidth(width);C.line(x1,H-y1,x2,H-y2)
def start(section,wide=False):
    global PAGE,W,H
    if PAGE:C.showPage()
    PAGE+=1;W,H=landscape(A3) if wide else A4;C.setPageSize((W,H))
    rect(0,0,W,H,colors.HexColor("#FDFEFF"))
    rect(M,25,4,12,TEAL)
    text("IMTRACK / DATABASE REPORT",M+12,35,8.1,"Bold",NAVY)
    C.setFont("Body",8);C.setFillColor(MUTED);C.drawRightString(W-M,H-35,section.upper())
    line(M,48,W-M,48)
    line(M,H-38,W-M,H-38)
    text("11 September 2026  |  Advanced Backend Node.js",M,H-22,7.5,color=MUTED)
    C.setFont("Bold",7.5);C.drawRightString(W-M,22,f"{PAGE:02d} / {N:02d}")
def title(kicker,heading,sub):
    text(kicker.upper(),M,78,8.5,"Bold",TEAL)
    text(heading,M,111,25,"Bold",NAVY)
    return p(sub,M,126,W-2*M,SM)+20
def h2(heading,y):
    text(heading,M,y+15,13,"Bold",NAVY)
    return y+27
def table(headers,rows,y,widths):
    data=[[Paragraph(html.escape(x),TH) for x in headers]]+[
        [Paragraph(str(x),TM if i==0 else TC) for i,x in enumerate(row)] for row in rows]
    t=Table(data,colWidths=widths,repeatRows=1,hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,colors.HexColor("#F3F7FA")]),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),
        ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("LINEBELOW",(0,0),(-1,0),0.5,NAVY),
        ("LINEBELOW",(0,1),(-1,-1),0.35,LINE)]))
    _,height=t.wrap(sum(widths),2000)
    assert y+height < H-52, f"Page {PAGE}: table overflow {y+height}"
    t.drawOn(C,M,H-y-height);limits.append((PAGE,y+height,"TABLE"))
    return y+height
def callout(head,body,y,w=None,x=None):
    w=w or W-2*M;x=M if x is None else x
    item=Paragraph(body,SM);_,bh=item.wrap(w-28,2000)
    hh=bh+49
    rect(x,y,w,hh,PALE,r=8)
    text(head,x+14,y+22,10,"Bold",TEAL)
    p(body,x+14,y+31,w-28,SM)
    return y+hh
def bullet(label,body,y):
    y=p("<b>"+label+"</b> "+body,M,y,W-2*M,S)
    return y+10

desc={
"users":{
"user_id":"Identitas pengguna; auto-increment.",
"fullname":"Nama lengkap, sesuai payload registrasi.",
"username":"Nama akun; unik. Validasi API: 3-50 huruf, angka atau underscore.",
"email":"Alamat email unik; dinormalisasi menjadi huruf kecil.",
"password_hash":"Hash bcrypt cost 12. Password mentah tidak disimpan.",
"avatar_url":"Path foto terakhir; contoh /uploads/{UUID}.png.",
"is_active":"Default 1. Akun nonaktif ditolak saat login dan akses API.",
"verification_token":"SHA-256 dari UUID v4; 64 karakter heksadesimal.",
"verification_expires_at":"Batas masa berlaku token; 24 jam sejak diterbitkan.",
"email_verified_at":"Waktu verifikasi sukses. NULL berarti belum diverifikasi.",
"created_at":"Waktu pembuatan data; dikelola Sequelize.",
"updated_at":"Waktu perubahan data; dikelola Sequelize."},
"tasks":{
"task_id":"Identitas tugas; auto-increment.",
"user_id":"Pemilik tugas; FK ke users.user_id.",
"recurrence_id":"Opsional; FK ke recurrences.recurrence_id.",
"title":"Judul tugas; API menerima 1-300 karakter.",
"priority":"Sekarang, Nanti, Someday. Default: Nanti.",
"status":"todo atau done. Default: todo.",
"due_date":"Tanggal tenggat atau NULL; format API YYYY-MM-DD.",
"category":"Kategori bebas sampai 100 karakter; field API: cat.",
"is_recurring":"Default 0. Menandai tugas berulang.",
"deleted_at":"Kompatibilitas skema lama. Daftar aktif memakai IS NULL.",
"created_at":"Dikelola Sequelize; pengurutan default daftar tugas.",
"updated_at":"Waktu pembaruan; dikelola Sequelize."},
"tags":{"tag_id":"Identitas tag; auto-increment.","user_id":"Pemilik tag; FK ke users.user_id.","name":"Nama tag 1-50 karakter; unik bersama user_id.","created_at":"Waktu pembuatan; dikelola Sequelize."},
"task_tags":{"task_tag_id":"Identitas baris penghubung; auto-increment.","task_id":"FK ke tasks.task_id; bagian unique gabungan.","tag_id":"FK ke tags.tag_id; bagian unique gabungan.","created_at":"Waktu pembuatan; dikelola Sequelize."},
"recurrences":{"recurrence_id":"Identitas konfigurasi; auto-increment.","recurrence_type":"daily, weekly atau monthly; wajib.","start_date":"Tanggal mulai; dari due atau tanggal saat dibuat.","created_at":"Waktu pembuatan; dikelola Sequelize."}
}
def dictionary(name,y):
    rows=[]
    for f in schema[name]["fields"]:
        type_="ENUM" if f["type"].startswith("ENUM(") else f["type"]
        flags=["PK","AI"] if f["pk"] else ["NULL" if f["nullable"] else "NN"]
        if f["ref"]:flags.append("FK")
        if f["unique"]:flags.append("UQ*" if isinstance(f["unique"],str) else "UQ")
        rows.append([f["name"],type_,", ".join(flags),desc[name][f["name"]]])
    return table(["Kolom","Tipe SQL","Aturan","Fungsi"],rows,y,[132,92,64,W-2*M-288])

# 1: Overview.
start("Ringkasan implementasi")
text("LAPORAN PENGUMPULAN MISSION",M,89,9,"Bold",TEAL)
text("ERD & Database",M,139,36,"Bold",NAVY)
text("ImTrack",M,183,36,"Light",NAVY)
y=p("Implementasi Advanced Backend dengan Node.js, Express, MySQL/MariaDB dan Sequelize ORM.",M,209,470,S)
y=269
for i,(num,label) in enumerate([("5","entitas inti"),("4","kolom User baru"),("24","tes otomatis lulus")]):
    x=M+i*174
    rect(x,y,162,77,PALE if i==0 else colors.HexColor("#F0F4F8"),r=7)
    text(num,x+14,y+36,24,"Bold",TEAL if i==0 else NAVY)
    text(label,x+14,y+58,9,color=MUTED)
y=h2("Cakupan sesuai mission",369)
rows=[
["User dan ORM","Lima model, relasi, constraint dan migrasi database."],
["Registrasi","fullname, username, email, password; hash bcrypt sebelum INSERT."],
["Login dan middleware","JWT HS256; pengecekan token, akun aktif dan verifikasi email."],
["Filter, sort, search","WHERE, ORDER BY dan LIKE melalui query Sequelize."],
["Verifikasi email","UUID v4, hash token, kedaluwarsa 24 jam dan konsumsi sekali pakai."],
["Upload gambar","Multer, folder per pengguna, validasi format dan batas 5 MB."]]
y=table(["Kebutuhan","Implementasi"],rows,y,[139,W-2*M-139])
y=callout("Sumber skema", "Nama kolom, tipe data, nullability dan foreign key pada laporan ini diambil dari metadata <b>server/models/index.js</b>. Aturan proses diperiksa terhadap service, validator dan migrasi aplikasi.",y+20)
p("Susunan: 02 Diagram ERD | 03 User | 04 Task | 05 Tabel pendukung<br/>06 Relasi dan query | 07 Alur aplikasi | 08 Migrasi dan validasi",M,y+18,W-2*M,SM)

# 2: Vector ERD.
start("Diagram ERD",True)
text("02 / SKEMA RELASIONAL",M,80,9,"Bold",TEAL)
text("Lima entitas inti aplikasi",M,116,28,"Bold",NAVY)
p("Notasi multiplicity: 1 = tepat satu, 0..1 = opsional, 0..* = nol atau banyak. Kardinalitas mengikuti constraint database.",M,130,W-2*M,SM)
def entity(name,x,top,w):
    fields=schema[name]["fields"];height=42+len(fields)*21+28
    rect(x,top,w,height,WHITE,LINE,r=8)
    rect(x,top,w,37,TEAL if name in ["users","task_tags"] else NAVY,r=7)
    text(name,x+14,top+25,14,"Bold",WHITE)
    for i,f in enumerate(fields):
        rowtop=top+43+i*21
        if f["name"] in ["fullname","verification_token","verification_expires_at","email_verified_at"]:
            rect(x+1,rowtop-2,w-2,20,PALE)
        tag="PK" if f["pk"] else "FK" if f["ref"] else ""
        label=f["name"]
        text(label,x+12,rowtop+11,8.9,"Mono",TEAL if f["name"].startswith("verification") or f["name"]=="email_verified_at" else INK)
        ty="ENUM" if f["type"].startswith("ENUM(") else f["type"].replace(" UNSIGNED"," U")
        text(ty,x+w-112,rowtop+11,8.0,"Mono",MUTED)
        badge=tag+("?" if f["nullable"] else "")
        if f["unique"] is True:badge+=(" " if badge else "")+"UQ"
        C.setFont("Bold",7);C.setFillColor(BLUE);C.drawRightString(x+w-10,H-(rowtop+11),badge)
    uniques=["("+", ".join(v["fields"])+")" for v in schema[name]["uniqueKeys"].values() if len(v["fields"])>1]
    uniques += ["("+", ".join(idx["fields"])+")" for idx in schema[name]["indexes"] if idx.get("unique")]
    note="UQ "+", ".join(uniques) if uniques else "PK auto-increment | ? = nullable"
    text(note,x+12,top+height-10,8,color=MUTED)
    return height
# Connector routes are outside all entity compartments.
entity("users",42,173,306)
entity("tasks",445,173,322)
entity("recurrences",874,173,274)
entity("tags",42,567,306)
entity("task_tags",445,567,322)
def connection(x1,y1,x2,y2,left,right,label):
    line(x1,y1,x2,y2,BLUE,1.4)
    if y1==y2:
        text(left,x1+7,y1-7,8,"Bold",BLUE)
        C.setFont("Bold",8);C.setFillColor(BLUE);C.drawRightString(x2-7,H-y2+7,right)
        C.setFont("Body",8);C.setFillColor(MUTED);C.drawCentredString((x1+x2)/2,H-y1-16,label)
    else:
        text(left,x1+8,y1+14,8,"Bold",BLUE)
        text(right,x2+8,y2-7,8,"Bold",BLUE)
        text(label,x1+9,(y1+y2)/2+4,8,color=MUTED)
connection(348,277,445,277,"1","0..*","memiliki")
connection(195,495,195,567,"1","0..*","membuat")
connection(606,495,606,567,"1","0..*","memiliki")
connection(348,642,445,642,"1","0..*","digunakan")
connection(767,235,874,235,"0..*","0..1","pengulangan")
callout("Legenda", "<b>PK</b> Primary key<br/><b>FK</b> Foreign key<br/><b>UQ</b> Unique constraint<br/><b>?</b> Kolom boleh NULL<br/><b>U</b> UNSIGNED",375,w=274,x=874)
callout("Relasi recurrence", "Setiap task memiliki 0 atau 1 recurrence. Kolom recurrence_id pada tasks <b>tidak unique</b>, sehingga secara SQL satu recurrence dapat direferensikan banyak task. Service saat ini membuat konfigurasi sendiri untuk tiap tugas berulang.",557,w=274,x=874)
text("Sorotan hijau: fullname dan tiga kolom verifikasi email yang ditambahkan pada users.",M,771,9,color=MUTED)

# 3: users.
start("Kamus data / Users")
y=title("03 / ENTITAS USER","Akun dan verifikasi email","12 kolom. PK = primary key, AI = auto-increment, NN = NOT NULL, UQ = unik.")
y=dictionary("users",y)
y=h2("Pemetaan payload registrasi",y+20)
y=p("<b>fullname</b> disimpan sebagai fullname, <b>username</b> dan <b>email</b> memiliki unique constraint. Input <b>password</b> diproses dengan bcrypt dan disimpan hanya dalam <b>password_hash</b>.",M,y,W-2*M)
y=callout("Token email dan JWT berbeda", "verification_token berisi hash SHA-256 dari token UUID, bukan JWT. JWT login dibuat setelah email terverifikasi dan tidak disimpan pada tabel users. Token UUID mentah hanya diberikan lewat email.",y+17)

# 4: tasks.
start("Kamus data / Tasks")
y=title("04 / ENTITAS TASK","Tugas milik pengguna","12 kolom. Kepemilikan diperiksa menggunakan user_id dari JWT pada seluruh operasi tugas.")
y=dictionary("tasks",y)
y=h2("Aturan pada API",y+20)
y=p("Field frontend <b>due</b>, <b>cat</b> dan <b>isRecurring</b> dipetakan ke due_date, category dan is_recurring. Field tags menggunakan tabel penghubung; recurrenceType menggunakan tabel recurrences.",M,y,W-2*M)
y=callout("Perilaku penghapusan", "Endpoint DELETE menghapus task secara permanen beserta hubungan task_tags. Kolom deleted_at dipertahankan untuk kompatibilitas dan penyaringan data lama; service saat ini tidak menjalankan soft delete.",y+17)

# 5: supporting models.
start("Kamus data / Relasi pendukung")
y=title("05 / TABEL PENDUKUNG","Tag dan pengulangan","Ketiga tabel memiliki created_at, tanpa updated_at pada model aktif.")
for name,label in [("tags","tags - label milik pengguna"),("task_tags","task_tags - penghubung tugas dan label"),("recurrences","recurrences - konfigurasi pengulangan")]:
    y=h2(label,y)
    y=dictionary(name,y)+19
p("<b>UQ*</b> pada task_tags adalah unique gabungan (task_id, tag_id), bukan unik per kolom. Pada tags, pasangan (user_id, name) unik. Ketika isRecurring diaktifkan, API membutuhkan recurrenceType.",M,y,W-2*M,SM)

# 6: relations.
start("Integritas dan query")
y=title("06 / INTEGRITAS RELASIONAL","Constraint, transaksi dan pencarian","Aturan berikut berasal dari asosiasi Sequelize dan service tugas.")
rows=[]
for model in schema.values():
    for f in model["fields"]:
        if f["ref"]:
            rows.append([model["table"]+"."+f["name"],f["ref"]["model"]+"."+f["ref"]["key"],f["onDelete"],f["onUpdate"]])
y=table(["Foreign key","Referensi","ON DELETE","ON UPDATE"],rows,y,[154,151,103,103])
y=h2("Indeks eksplisit pada model",y+19)
y=table(["Tabel","Constraint atau indeks"],[
["users","UNIQUE username; UNIQUE email; UNIQUE verification_token."],
["tasks","Indeks (user_id, status) dan (user_id, priority)."],
["tags","UNIQUE (user_id, name)."],
["task_tags","UNIQUE (task_id, tag_id)."],
["Semua tabel","Primary key pada ID masing-masing; indeks pendukung FK dapat dibuat oleh database."]],y,[112,399])
y=h2("Konsistensi perubahan",y+18)
y=p("Pembuatan, pembaruan dan penghapusan tugas memakai transaksi Sequelize. Perubahan task, tag dan recurrence ikut dibatalkan bila transaksi gagal. UPDATE dan DELETE mengunci baris task saat memeriksa kepemilikan.",M,y,W-2*M)
y=h2("Query daftar tugas",y+15)
y=p("Filter: <b>cat, status, priority</b>. Pencarian: <b>search</b> pada title dengan LIKE. Urutan: <b>sort</b> berisi createdAt, title, due, priority atau status; <b>order</b> berisi asc/desc. Nilai sort divalidasi; karakter % dan _ pada pencarian diperlakukan secara literal.",M,y,W-2*M)
p("Default: created_at DESC, lalu task_id DESC. Semua query tugas aktif menyertakan user_id pemilik dan deleted_at IS NULL.",M,y+9,W-2*M,SM)

# 7: workflows.
start("Alur autentikasi dan upload")
y=title("07 / ALUR APLIKASI","Dari registrasi hingga akses data","Endpoint pada tabel berikut menggunakan awalan /api.")
rows=[
["1. Register","POST /auth/register","Validasi input, hash bcrypt cost 12, buat UUID dan simpan hash token beserta kedaluwarsa 24 jam."],
["2. Kirim email","Nodemailer SMTP / file","SMTP mengirim pesan. Mode file menyimpan .eml lokal. Jika gagal kirim, akun tetap tersedia untuk kirim ulang."],
["3. Verifikasi","POST /auth/verify-email","Conditional UPDATE memeriksa token, waktu berlaku dan akun aktif. Isi email_verified_at, lalu hapus kedua nilai token."],
["4. Login","POST /auth/login","Bandingkan password memakai bcrypt.compare. Akun aktif dan terverifikasi menerima JWT HS256 berlaku 1 jam."],
["5. Akses data","Authorization: Bearer","Middleware memverifikasi signature, issuer, audience, expiry, dan kondisi akun sebelum menjalankan service."]
]
y=table(["Tahap","Endpoint / komponen","Perilaku"],rows,y,[89,150,272])
y=p("Alias verifikasi: /auth/verifikasi-email. GET menerima query token; POST menerima body token. Token salah, kedaluwarsa atau sudah dipakai menghasilkan <b>Invalid Verification Token</b>. Sukses menghasilkan <b>Email Verified Successfully</b>.",M,y+13,W-2*M,SM)
y=h2("Upload foto profil",y+19)
y=bullet("Penerimaan.", "POST /upload memakai satu field multipart/form-data bernama file. Format PNG, JPEG, WebP atau GIF; ukuran maksimal 5 MB.",y)
y=bullet("Penyimpanan.", "Multer menulis ke upload/{user_id}. Signature file diperiksa, nama file memakai UUID, kemudian avatar_url pada users diperbarui.",y)
y=bullet("Akses.", "GET /uploads/:filename memerlukan JWT pemilik. Frontend mengambil gambar sebagai blob; folder upload tidak dibuka sebagai direktori statis publik.",y)
p("Password hash dan token verifikasi tidak dimasukkan ke respons profil. Logout menghapus sesi pada tab; JWT yang telah disalin tetap berlaku sampai kedaluwarsa.",M,y+2,W-2*M,SM)

# 8: migration/testing.
start("Migrasi dan bukti validasi")
y=title("08 / PERSIAPAN PENGUMPULAN","Migrasi dan hasil pengujian","Ringkasan validasi aplikasi pada 11 September 2026.")
y=h2("Migrasi dari database sebelumnya",y)
y=p("Jalankan <b>npm run db:migrate</b>. Migrasi menambah fullname, verification_token, verification_expires_at dan email_verified_at jika belum ada. Nilai fullname lama diambil dari display_name atau username, lalu kolom dibuat NOT NULL.",M,y,W-2*M)
y=p("Sequelize sync membuat tabel inti yang belum ada, tanpa opsi force atau alter. Tabel dan kolom lama di luar model aktif tetap dipertahankan. groups, user_groups, task_groups serta notifications belum menjadi fitur backend pada mission ini.",M,y+10,W-2*M)
y=h2("Hasil validasi",y+18)
y=table(["Pemeriksaan","Hasil dan batas pengujian"],[
["HTTP dan SMTP lokal","11 tes lulus: JWT, validasi payload/query, proteksi upload, pengiriman SMTP dan penolakan autentikasi/penerima."],
["Integrasi database","13 tes lulus pada MariaDB lokal terpisah: migrasi, akun, verifikasi konkuren, CRUD, transaksi, isolasi akun dan upload."],
["Build dan lint","npm run build dan npm run lint berhasil."],
["SMTP Gmail","Autentikasi dan pengiriman email uji berhasil; penerimaan di inbox dikonfirmasi pengguna."],
["Antarmuka","Alur daftar, verifikasi, login, tambah/edit/status tugas, pencarian dan logout telah diuji melalui browser."]],y,[120,391])
y=h2("Menjalankan aplikasi",y+18)
y=p("Siapkan MySQL/MariaDB dan database imtrack_db, lalu isi .env sesuai .env.example. Jalankan <b>npm install</b>, <b>npm run db:migrate</b>, kemudian <b>npm run dev:api</b> dan <b>npm run dev</b> pada dua terminal.",M,y,W-2*M)
y=p("Untuk pengiriman registrasi gunakan MAIL_MODE=smtp beserta konfigurasi provider. Kredensial disimpan lokal di .env dan tidak dicantumkan pada laporan atau repository. Petunjuk rinci dan koleksi Postman tersedia pada README.md.",M,y+10,W-2*M,SM)
y=h2("Acuan implementasi",y+14)
p("server/models/index.js; server/database/migrate.js;<br/>server/services/authService.js; server/services/taskService.js;<br/>server/services/mailService.js; server/routes/uploadRoutes.js;<br/>server/tests/; ERD_Database_ImTrack.md; README.md.",M,y,W-2*M,SM)

# Bounds checks and content checks are evaluated before replacing the root copy.
for pn,bottom,label in limits:
    height=landscape(A3)[1] if pn==2 else A4[1]
    assert bottom < height-47, f"Page {pn}: content exceeds footer ({bottom}): {label}"
assert PAGE==N
C.save()
reader=PdfReader(str(OUT))
assert len(reader.pages)==N, len(reader.pages)
combined="\n".join(page.extract_text() or "" for page in reader.pages)
for model in schema.values():
    for field in model["fields"]:
        assert field["name"] in combined, field["name"]
for key in ["fullname","verification_token","verification_expires_at","email_verified_at","Sequelize","SMTP"]:
    assert key in combined,key
assert "MockAPI.io" not in combined
renders=WORK/"rendered"; renders.mkdir(exist_ok=True)
with pdfplumber.open(OUT) as pdf:
    for i,page in enumerate(pdf.pages,1):
        page.to_image(resolution=105).save(str(renders/f"page-{i:02d}.png"))
print(f"Generated {len(reader.pages)} pages: {OUT}")
print(f"Rendered all pages to {renders}")
