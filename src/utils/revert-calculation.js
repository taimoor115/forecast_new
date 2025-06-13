import { calculateStock } from "./calculate-stock";

export const revert = async (products, revertProducts, setProducts) => {
  try {
    const updatedProducts = products.products.map((product) => {
      const revertProduct = revertProducts.find(
        (rp) => rp.variantId === product.variantId
      );

      if (!revertProduct) {
        return product;
      }

      const forecastByYear = revertProduct.forecastByYear || product.forecast;

      return {
        ...product,
        forecast: forecastByYear,
      };
    });

    const calculatedProducts = calculateStock(updatedProducts);

    const finalProducts = products.products.map((product) => {
      const calculatedProduct = calculatedProducts.find(
        (calcProduct) => calcProduct.variantId === product.variantId
      );

      if (
        revertProducts.some((rp) => rp.variantId === product.variantId) &&
        calculatedProduct
      ) {
        return {
          ...product,
          forecast: calculatedProduct.forecast,
          currentWeekStatus: calculatedProduct.currentWeekStatus,
          inventory_quantity:
            calculatedProduct.inventory_quantity || product.inventory_quantity,
        };
      }

      return product;
    });

    setProducts({
      ...products,
      products: finalProducts,
    });

    return true;
  } catch (error) {
    console.error("Error in revert function:", error);
    return false;
  }
};
