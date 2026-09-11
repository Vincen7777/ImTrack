import 'dotenv/config';
import { createMailTransport } from '../services/mailService.js';

// This command makes no database changes and never prints SMTP credentials.
const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM'];
const missing = required.filter((key) => !process.env[key]?.trim());
const recipient = process.env.SMTP_TEST_TO;
const send = process.argv.includes('--send');
if (send && (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient))) missing.push('SMTP_TEST_TO (alamat email valid)');

if (missing.length) {
  console.error('Belum bisa menguji SMTP. Isi di .env:', missing.join(', '));
  process.exitCode = 1;
} else {
  const transport = createMailTransport({ mailMode: 'smtp' });
  try {
    await transport.verify();
    console.log('Koneksi dan autentikasi SMTP berhasil.');
    if (send) {
      const info = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: recipient,
        subject: 'Uji SMTP ImTrack - persiapan pengumpulan mission',
        text: 'Ini adalah email pengujian aplikasi ImTrack atas permintaan pemilik akun.\n\nJika pesan ini terlihat di inbox, pengiriman melalui SMTP berhasil. Tidak ada tindakan atau verifikasi akun yang diperlukan.\n\nWaktu pengujian: ' + new Date().toISOString(),
      });
      if (!info.accepted?.length || info.rejected?.length) throw new Error('SMTP tidak menerima seluruh penerima');
      console.log('Server SMTP menerima email untuk:', recipient);
      console.log('Message ID:', info.messageId);
      console.log('Periksa inbox/spam untuk memastikan penerimaan. Respons SMTP belum membuktikan lokasi inbox.');
    } else {
      console.log('Tidak ada email dikirim. Gunakan npm run test:smtp -- --send untuk mengirim email uji.');
    }
  } catch (error) {
    console.error('Pengujian SMTP gagal:', error.code || error.name, error.responseCode ? '(SMTP ' + error.responseCode + ')' : '');
    process.exitCode = 1;
  } finally {
    transport.close();
  }
}
