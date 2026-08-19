import Product from "../models/product.model.js";

class ProductRepository {

  async createProduct(productData) {
    return await Product.create(productData);
  }

  async findProductById(productId, companyId) {
    return await Product.findOne({
      _id: productId,
      company: companyId,
    });
  }

  async findProductBySKU(sku, companyId) {
    return await Product.findOne({
      sku,
      company: companyId,
    });
  }

  async findProducts({
    companyId,
    search,
    category,
    status,
    skip,
    limit,
  }) {
    const query = {
      company: companyId,
    };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { hsnCode: { $regex: search, $options: "i" } },
      ];
    }

    return await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countProducts({
    companyId,
    search,
    category,
    status,
  }) {
    const query = {
      company: companyId,
    };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { hsnCode: { $regex: search, $options: "i" } },
      ];
    }

    return await Product.countDocuments(query);
  }

  async updateProduct(productId, companyId, updateData) {
    return await Product.findOneAndUpdate(
      {
        _id: productId,
        company: companyId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async deleteProduct(productId, companyId) {
    return await Product.findOneAndDelete({
      _id: productId,
      company: companyId,
    });
  }

  async getProductStats(companyId, lowStockThreshold = 10) {
    const stats = await Product.aggregate([
      {
        $match: {
          company: companyId,
        },
      },
      {
        $group: {
          _id: null,

          totalProducts: {
            $sum: 1,
          },

          categories: {
            $addToSet: "$category",
          },

          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$openingStock", 0] },
                    { $lte: ["$openingStock", lowStockThreshold] },
                  ],
                },
                1,
                0,
              ],
            },
          },

          outOfStock: {
            $sum: {
              $cond: [
                { $eq: ["$openingStock", 0] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          categories: {
            $size: "$categories",
          },
          lowStock: 1,
          outOfStock: 1,
        },
      },
    ]);

    return (
      stats[0] || {
        totalProducts: 0,
        categories: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );
  }
}

export default ProductRepository;