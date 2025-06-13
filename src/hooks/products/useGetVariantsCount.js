import { useEffect } from "react";
import useProductStore from "../../store/products";
import endpoint from "../../utils/endpoint";
import useApi from "../api/useApi";

const useGetVariantCount = (queryParams = {}) => {
  const { get } = useApi(true);
  const { setInventoryStatus } = useProductStore();

  useEffect(() => {
    const getVariantCount = async () => {
      try {
        const data = await get(endpoint.FORECAST.VARIANTS_COUNT, queryParams);
        setInventoryStatus(data?.data);
      } catch (err) {
        console.log(err);
      } finally {
      }
    };

    getVariantCount();
  }, [JSON.stringify(queryParams)]);
};

export default useGetVariantCount;
