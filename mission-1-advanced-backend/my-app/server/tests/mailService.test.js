import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { SMTPServer } from 'smtp-server';
import { createMailService } from '../services/mailService.js';

describe('Nodemailer SMTP transport on an isolated loopback server', () => {
  let smtp;
  const received = [];
  const envKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM'];
  const savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const config = { mailMode: 'smtp', frontendUrl: 'http://localhost:5173' };
  before(async () => {
    smtp = new SMTPServer({
      // Plaintext is confined to this loopback fixture, using synthetic credentials.
      disabledCommands: ['STARTTLS'],
      disableReverseLookup: true,
      logger: false,
      closeTimeout: 1000,
      onAuth(auth, _session, callback) {
        if (auth.username !== 'smtp-test-user' || auth.password !== 'smtp-test-password') return callback(new Error('Invalid test credentials'));
        callback(null, { user: auth.username });
      },
      onRcptTo(address, _session, callback) {
        if (address.address === 'reject@example.test') return callback(Object.assign(new Error('Recipient rejected'), { responseCode: 550 }));
        callback();
      },
      onData(stream, session, callback) {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.once('error', callback);
        stream.once('end', () => {
          received.push({ raw: Buffer.concat(chunks).toString('utf8'), from: session.envelope.mailFrom.address, to: session.envelope.rcptTo.map((item) => item.address) });
          callback(null, 'Queued for local test');
        });
      },
    });
    await new Promise((resolve, reject) => {
      smtp.once('error', reject);
      smtp.listen(0, '127.0.0.1', resolve);
    });
  });
  beforeEach(() => {
    Object.assign(process.env, { SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtp.server.address().port), SMTP_SECURE: 'false', SMTP_USER: 'smtp-test-user', SMTP_PASSWORD: 'smtp-test-password', MAIL_FROM: 'ImTrack Test <sender@example.test>' });
  });
  after(async () => {
    if (smtp) await new Promise((resolve) => smtp.close(resolve));
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  test('authenticates and delivers a verification email with correct recipient and token', async () => {
    const token = randomUUID();
    assert.equal(await createMailService(config).sendVerification('student@example.test', token), 'smtp');
    assert.equal(received.length, 1);
    assert.equal(received[0].from, 'sender@example.test');
    assert.deepEqual(received[0].to, ['student@example.test']);
    const raw = received[0].raw.replace(/=\r?\n/g, '').replaceAll('=3D', '=');
    assert.match(raw, /Subject: Verifikasi akun ImTrack/);
    assert.ok(raw.includes('http://localhost:5173/verify-email?token=' + token));
    assert.match(raw, /24 jam/);
  });
  test('wrong SMTP credentials fail instead of claiming delivery', async () => {
    process.env.SMTP_PASSWORD = 'wrong-test-password';
    await assert.rejects(createMailService(config).sendVerification('student@example.test', randomUUID()), (error) => error.code === 'EAUTH');
    assert.equal(received.length, 1);
  });
  test('rejected recipient fails instead of claiming delivery', async () => {
    await assert.rejects(createMailService(config).sendVerification('reject@example.test', randomUUID()), (error) => error.code === 'EENVELOPE');
    assert.equal(received.length, 1);
  });
  test('SMTP mode requires an explicit host', () => {
    delete process.env.SMTP_HOST;
    assert.throws(() => createMailService(config), /SMTP_HOST wajib/);
  });
});
