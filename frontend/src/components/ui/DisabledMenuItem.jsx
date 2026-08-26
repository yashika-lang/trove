// Shared by Quotation and Invoice row menus for actions with no backend
// support yet (PDF export, Email, WhatsApp, Credit/Debit Note...) — visible
// per the approved screenshots, but honestly inert rather than faked.
export default function DisabledMenuItem({ icon: Icon, label }) {
  return (
    <div
      className="flex cursor-not-allowed items-center gap-2 px-3 py-2 text-sm text-gray-300"
      title="Not available yet — no backend support for this action."
    >
      <Icon size={14} /> {label}
      <span className="ml-auto text-[10px] uppercase text-gray-300">Soon</span>
    </div>
  );
}
