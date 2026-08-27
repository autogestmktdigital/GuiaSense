import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(env.dataEncryptionKey, "hex");

function normalize(value: string): string {
  return value.replace(/\D/g, "");
}

export function encryptField(value: string): string {
  const plaintext = normalize(value);
  if (!plaintext) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(".");
}

export function decryptField(value: string | null): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return value;
  const [ivHex, tagHex, dataHex] = parts;
  try {
    const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return value;
  }
}