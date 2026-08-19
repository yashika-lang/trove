// ==========================================
// GST CALCULATOR
// ==========================================

const calculateGST = ({
  taxableAmount,
  gstRate,
  companyState,
  customerState,
}) => {
  const amount =
    Number(taxableAmount) || 0;

  const rate =
    Number(gstRate) || 0;

  const totalGST =
    (amount * rate) / 100;

  const sameState =
    companyState
      ?.trim()
      .toLowerCase() ===
    customerState
      ?.trim()
      .toLowerCase();

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (sameState) {
    cgst = totalGST / 2;
    sgst = totalGST / 2;
  } else {
    igst = totalGST;
  }

  return {
    taxableAmount: amount,
    gstRate: rate,
    totalGST,
    cgst,
    sgst,
    igst,
    totalAmount:
      amount + totalGST,
  };
};

export default calculateGST;