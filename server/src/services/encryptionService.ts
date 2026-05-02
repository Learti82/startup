import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-cbc';

function getKey(): Buffer {
  const key = env.encryptionKey;
  return crypto.createHash('sha256').update(key).digest();
}

export function encryptFile(inputPath: string, outputPath: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const input = fs.readFileSync(inputPath);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(outputPath, encrypted);
  return iv.toString('hex');
}

export function decryptFile(encryptedPath: string, ivHex: string): Buffer {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

  const encrypted = fs.readFileSync(encryptedPath);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function encryptText(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return { encrypted: encrypted.toString('hex'), iv: iv.toString('hex') };
}

export function decryptText(encryptedHex: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export function secureDelete(filePath: string): void {
  if (fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    const fd = fs.openSync(filePath, 'r+');
    fs.writeSync(fd, crypto.randomBytes(size), 0, size, 0);
    fs.closeSync(fd);
    fs.unlinkSync(filePath);
  }
}
