import React, { useState } from "react";
import LoaderSvg from "../../assets/svgs/loader";
import { Button } from "../../common";
import { useModal } from "../../context/modal";
import useUpdateBulk from "../../hooks/products/useUpdateBulk";
import { useGrowthRateChangesStore } from "../../store/growth-rate";
import usePreviousProductStore from "../../store/previous-product-state";
import useProductStore from "../../store/products";
import { revert } from "../../utils/revert-calculation";
import useExpectedSalesChangesStore from "../../store/expected-sales/usePreviousExpectedSales";

const BulkRevertModal = ({ variantIds = [] }) => {
  const [isLoading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const { getPreviousProducts, filterAndRemoveProducts } =
    usePreviousProductStore();
  const { removeVariantsData } = useGrowthRateChangesStore.getState();
  const { removeVariantsData: removeExpectedSalesData } =
    useExpectedSalesChangesStore();
  const { products, setProducts } = useProductStore();

  const { updateBulk } = useUpdateBulk();
  const handleRevert = async () => {
    setLoading(true);

    try {
      const revertProducts = getPreviousProducts(variantIds);
      const res = await updateBulk(revertProducts);

      if (res.statusCode === 200) {
        const revertSuccess = await revert(
          products,
          revertProducts,
          setProducts
        );
        if (revertSuccess) {
          filterAndRemoveProducts(variantIds);
          removeVariantsData(variantIds);
          removeExpectedSalesData(variantIds);
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }

    closeModal();
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex flex-col justify-center items-center mb-6">
        <h3 className="mb-3 text-lg font-bold md:text-2xl text-custom_primary">
          Bestätigen Sie die Rückkehr
        </h3>
        <p className="text-base text-gray-600">
          Sind Sie sicher, dass Sie {variantIds.length} Produkt(e) zurückkehren
          möchten?
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          className="flex gap-x-2 items-center px-4 py-2 mt-4 text-sm font-semibold text-white rounded-md bg-custom_black hover:opacity-70"
          type="submit"
          onClick={handleRevert}
        >
          {isLoading ? (
            <>
              <LoaderSvg /> Wird zurückgekehrt....
            </>
          ) : (
            "Rückkehr"
          )}
        </Button>
        <Button
          onClick={closeModal}
          disabled={isLoading}
          className="px-4 py-2 mt-4 ml-4 text-sm font-semibold text-black border rounded-md border-[#e6e3e3] hover:bg-custom_black hover:text-white"
          type="button"
        >
          Abbrechen
        </Button>
      </div>
    </div>
  );
};

export default BulkRevertModal;
