import { useCallback } from "react";
import useApi from "../api/useApi";
import endpoint from "../../utils/endpoint";
import { toast } from "sonner";
import { useQueryParamsManager } from "../../components/context/params";

const useUpdateProduct = () => {
  const { queryParams } = useQueryParamsManager();

  const { post, loading, error, data } = useApi(true);

  const updateProduct = useCallback(
    async (data) => {
      const currentYear = new Date().getFullYear();

      if (currentYear - queryParams.year >= 2) {
        toast.error(
          "Die Prognose kann nicht für ein Jahr aktualisiert werden, das mehr als zwei Jahre zurückliegt"
        );
        return;
      }
      try {
        const response = await post(`${endpoint.FORECAST.UPDATE}`, data);
        return response;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [post]
  );

  return { updateProduct, loading, error, data };
};

export default useUpdateProduct;
