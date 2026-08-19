import HsnSac from "../models/hsnSac.model.js";

class HsnSacRepository {
  async create(data) {
    return await HsnSac.create(data);
  }

  async findAll({
    companyId,
    search,
    type,
    page = 1,
    limit = 20,
  }) {
    const filter = {
      company: companyId,
    };

    if (type && type !== "ALL") {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        {
          code: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (Number(page) - 1) * Number(limit);

    const [entries, total] =
      await Promise.all([
        HsnSac.find(filter)
          .sort({ code: 1 })
          .skip(skip)
          .limit(Number(limit)),

        HsnSac.countDocuments(filter),
      ]);

    return {
      entries,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(
          total / Number(limit)
        ),
      },
    };
  }

  async findById(id, companyId) {
    return await HsnSac.findOne({
      _id: id,
      company: companyId,
    });
  }

  async update(id, companyId, data) {
    return await HsnSac.findOneAndUpdate(
      {
        _id: id,
        company: companyId,
      },
      data,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async delete(id, companyId) {
    return await HsnSac.findOneAndDelete({
      _id: id,
      company: companyId,
    });
  }
}

export default HsnSacRepository;