const DEV_FALLBACK = "dev_only_insecure_secret_change_me_0123456789";

/**
 * Devuelve la clave de firma de sesiones. En producción exige AUTH_SECRET
 * (mínimo 32 caracteres); en desarrollo usa un valor local no seguro.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      throw new Error("AUTH_SECRET no está definido o es demasiado corto (mínimo 32 caracteres).");
    }
    return secret;
  }
  return secret || DEV_FALLBACK;
}

export function getAuthKey(): Uint8Array {
  return new TextEncoder().encode(getAuthSecret());
}
