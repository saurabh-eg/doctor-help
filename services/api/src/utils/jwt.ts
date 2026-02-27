/**
 * Shared JWT secret utility.
 * Lazily loads and caches the JWT_SECRET as a Uint8Array for jose.
 */
let _jwtSecret: Uint8Array | null = null;

export function getJwtSecret(): Uint8Array {
    if (!_jwtSecret) {
        if (!process.env.JWT_SECRET) {
            throw new Error('FATAL: JWT_SECRET environment variable is not set.');
        }
        _jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
    }
    return _jwtSecret;
}
