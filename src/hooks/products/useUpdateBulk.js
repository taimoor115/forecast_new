import { useCallback } from "react";
import useApi from "../api/useApi";
import endpoint from "../../utils/endpoint";
import { useQueryParamsManager } from "../../components/context/params";
import { toast } from "sonner";

const useUpdateBulk = () => {
  const currentYear = new Date().getFullYear();
    const { queryParams } = useQueryParamsManager();
   
  const { post, loading, error, data } = useApi(true);

  const updateBulk = useCallback(
    async (data) => {
      if (currentYear - queryParams.year >= 2) {
        toast.error("Die Prognose kann nicht für ein Jahr aktualisiert werden, das mehr als zwei Jahre zurückliegt.");
        return;
      }
      try {
        const response = await post(`${endpoint.FORECAST.BULK_UPDATE}`, {
          forecastsData: data
        });

       
        return response;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [post]
  );

  return { updateBulk, loading, error, data };
};

export default useUpdateBulk;
