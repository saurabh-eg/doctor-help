/**
 * Escape special regex characters to prevent ReDoS attacks.
 * Use before interpolating user input into a RegExp.
 */
export const escapeRegex = (str: string): string =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
