// Shows only the last 4 digits of a bank account number — the rest is
// masked for display anywhere the account appears in a list/card, per the
// module's security requirement (full number is still submitted/stored,
// this is a display-only mask).
export function maskAccountNumber(accountNumber) {
  const value = String(accountNumber ?? "");
  if (value.length <= 4) return value;
  const last4 = value.slice(-4);
  return `•••• •••• ${last4}`;
}
