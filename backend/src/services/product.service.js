import ProductRepository from "../repositories/product.repository.js";
import ApiError from "../exceptions/ApiError.js";

class ProductService {

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(productData, companyId, userId) {

    const existingSKU = await this.productRepository.findProductBySKU(
      productData.sku,
      companyId
    );

    if (existingSKU) {
      throw new ApiError(
        409,
        "Product with this SKU already exists."
      );
    }

    const product = await this.productRepository.createProduct({
      ...productData,
      company: companyId,
      createdBy: userId,
    });

    return product;
  }


  async getAllProducts({
    companyId,
    search,
    category,
    status,
    page = 1,
    limit = 10,
  }) {

    const skip = (page - 1) * limit;

    const products = await this.productRepository.findProducts({
      companyId,
      search,
      category,
      status,
      skip,
      limit,
    });

    const total = await this.productRepository.countProducts({
      companyId,
      search,
      category,
      status,
    });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  async getProductById(productId, companyId) {

    const product = await this.productRepository.findProductById(
      productId,
      companyId
    );

    if (!product) {
      throw new ApiError(
        404,
        "Product not found."
      );
    }

    return product;
  }


  async updateProduct(productId, companyId, updateData) {

    const product = await this.productRepository.findProductById(
      productId,
      companyId
    );

    if (!product) {
      throw new ApiError(
        404,
        "Product not found."
      );
    }

    if (updateData.sku) {

      const existingSKU =
        await this.productRepository.findProductBySKU(
          updateData.sku,
          companyId
        );

      if (
        existingSKU &&
        existingSKU._id.toString() !== productId
      ) {
        throw new ApiError(
          409,
          "Product with this SKU already exists."
        );
      }
    }

    const updatedProduct =
      await this.productRepository.updateProduct(
        productId,
        companyId,
        updateData
      );

    return updatedProduct;
  }


  async deleteProduct(productId, companyId) {

    const product =
      await this.productRepository.findProductById(
        productId,
        companyId
      );

    if (!product) {
      throw new ApiError(
        404,
        "Product not found."
      );
    }

    const deletedProduct =
      await this.productRepository.deleteProduct(
        productId,
        companyId
      );

    return deletedProduct;
  }


  async getProductStats(companyId) {

    return await this.productRepository.getProductStats(
      companyId,
      10
    );
  }
}

export default ProductService;