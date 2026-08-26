import CreditDebitNote from "../models/creditDebitNote.model.js";

class CreditDebitNoteRepository {
  async create(data) {
    return await CreditDebitNote.create(data);
  }

  async findLast(companyId, type) {
    return await CreditDebitNote.findOne({ company: companyId, type }).sort({
      createdAt: -1,
    });
  }

  async findByCompany({ companyId, invoice, type, page, limit }) {
    const filter = { company: companyId };
    if (invoice) filter.invoice = invoice;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      CreditDebitNote.find(filter)
        .populate("customer", "customerName")
        .populate("invoice", "invoiceNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CreditDebitNote.countDocuments(filter),
    ]);

    return { notes, total };
  }

  async findById(noteId, companyId) {
    return await CreditDebitNote.findOne({ _id: noteId, company: companyId })
      .populate("customer")
      .populate("invoice")
      .populate("items.product");
  }
}

export default CreditDebitNoteRepository;
