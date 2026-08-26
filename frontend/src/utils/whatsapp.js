// Opens WhatsApp (app or web) with a pre-filled message via the public
// click-to-chat deep link — https://wa.me/<phone>?text=<message>. This is
// NOT a backend integration: no WhatsApp Business API/credentials exist in
// this project, so "sending" happens from the user's own WhatsApp account,
// same as tapping a wa.me link anywhere else.
export function openWhatsAppShare(phone, message) {
  const digitsOnly = (phone ?? "").replace(/\D/g, "");
  const url = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
