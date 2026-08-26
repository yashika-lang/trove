// These mirror the validation rules enforced server-side in
// backend/src/controllers/auth.controller.js exactly, so the form can give
// instant feedback instead of waiting on a failed request. The backend is
// still the source of truth and re-validates everything.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Backend currently accepts Indian mobile numbers only: 10 digits, starting 6-9.
export const PHONE_REGEX = /^[6-9]\d{9}$/;

// 8+ chars, at least one lowercase, one uppercase, one digit, one special char.
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export const isValidEmail = (value) => EMAIL_REGEX.test(value ?? "");

export const isValidPhone = (value) => PHONE_REGEX.test(value ?? "");

export const isValidPassword = (value) => PASSWORD_REGEX.test(value ?? "");

export const PASSWORD_HINT =
  "At least 8 characters, with one uppercase, one lowercase, one number and one special character (@$!%*?&).";

export const PHONE_HINT = "10-digit Indian mobile number, starting with 6-9.";
