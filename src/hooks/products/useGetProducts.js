import { useEffect, useRef } from "react";
import useProductStore from "../../store/products";
import endpoint from "../../utils/endpoint";
import { axiosWithToken } from "../../api";
import axios from "axios";

const useFetchProducts = (queryParams = {}) => {
  const { setProducts, setLoading, setError, setBatchLoading } = useProductStore();

  // Ref to store CancelToken source
  const cancelTokenSourceRef = useRef(null);

  useEffect(() => {
    // Skip if year is not provided
    if (!queryParams.year) return;

    const fetchProducts = async () => {
      const { page = 1, year, ...otherParams } = queryParams;

      // Cancel previous API calls
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel("Previous API calls canceled");
      }
      // Create new CancelToken source
      cancelTokenSourceRef.current = axios.CancelToken.source();

      setError(null);
      setBatchLoading(true);

      try {
        const batchConfigs = [
          { batch: 1, batchSize: 30 },
          { batch: 2, batchSize: 100 },
          { batch: 3, batchSize: 200 },
          { batch: 4, batchSize: 670 },
        ];

        let currentProducts = [];
        let currentPagination = {
          totalPages: 0,
          currentPage: page,
          hasNextForThisPage: true,
          currentBatch: 0,
          currentBatchSize: 0,
        };
        let currentStock = null;

        for (let i = 0; i < batchConfigs.length; i++) {
          const { batch, batchSize } = batchConfigs[i];

          if (!currentPagination.hasNextForThisPage) {
            setLoading(false); // No next batch, set loading false
            break;
          }

          // Set loading only for the first batch
          if (i === 0) {
            setLoading(true);
          }

          const params = {
            page,
            batch,
            batchSize,
            year,
            ...otherParams,
          };

          // Use axiosWithToken directly with CancelToken
          const response = await axiosWithToken.get(endpoint.FORECAST.PRODUCTS, {
            params,
            cancelToken: cancelTokenSourceRef.current.token,
          });

          const newProducts = response?.data?.data?.products || [];

          currentProducts = [...currentProducts, ...newProducts];

          if (response?.data?.data?.pagination) {
            currentPagination = {
              ...response.data.data.pagination,
              currentPage: page,
            };
          }

          currentStock = response?.data?.data?.inventoryStatus || currentStock;

          await setProducts({
            products: currentProducts,
            pagination: currentPagination,
            stock: currentStock,
          });

          // Set loading false if there is a next batch
          if (i < batchConfigs.length - 1 && currentPagination.hasNextForThisPage) {
            setLoading(false);
          }
        }

        // Ensure loading is false after the last batch
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Previous API calls canceled:", err.message);
          return; // Exit early on cancellation
        }
        setError(err?.response?.data?.error || "Something went wrong");
        setLoading(false);
      } finally {
        setBatchLoading(false);
      }
    };

    fetchProducts();

    // Cleanup on unmount or queryParams change
    return () => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel("Component unmounted or params changed");
      }
    };
  }, [JSON.stringify(queryParams), setProducts, setLoading, setError, setBatchLoading]);

  return {};
};

export default useFetchProducts;
// import { useEffect } from "react";
// import useProductStore from "../../store/products";
// import endpoint from "../../utils/endpoint";
// import useApi from "../api/useApi";
// import useDidQueryParamsChange from "../utility/useDidParamsChanged";

// const useFetchProducts = (queryParams = {}) => {
//   const { get } = useApi(true);

//   // const didChange = useDidQueryParamsChange(queryParams);
//   // console.log("🚀 ~ useFetchProducts ~ didChange:", didChange)
//   const { setProducts, setLoading, setError, setBatchLoading } =
//     useProductStore();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const { page = 1, year, ...otherParams } = queryParams;

//       setError(null);
//       setBatchLoading(true);

//       try {
//         const batchConfigs = [
//           { batch: 1, batchSize: 30 },
//           { batch: 2, batchSize: 100 },
//           { batch: 3, batchSize: 200 },
//           { batch: 4, batchSize: 670 },
//         ];

//         let currentProducts = [];
//         let currentPagination = {
//           totalPages: 0,
//           currentPage: page,
//           hasNextForThisPage: true,
//           currentBatch: 0,
//           currentBatchSize: 0,
//         };
//         let currentStock = null;

//         for (let i = 0; i < batchConfigs.length; i++) {
//           const { batch, batchSize } = batchConfigs[i];

//           if (!currentPagination.hasNextForThisPage) break;

//           // Set loading only for the first batch
//           if (i === 0) {
//             setLoading(true);
//           }

//           const params = {
//             page,
//             batch,
//             batchSize,
//             year,
//             ...otherParams,
//           };

//           const response = await get(endpoint.FORECAST.PRODUCTS, params);
//           const newProducts = response?.data?.products || [];

//           currentProducts = [...currentProducts, ...newProducts];

//           if (response?.data?.pagination) {
//             currentPagination = {
//               ...response.data.pagination,
//               currentPage: page,
//             };
//           }

//           currentStock = response?.data?.inventoryStatus || currentStock;

//           await setProducts({
//             products: currentProducts,
//             pagination: currentPagination,
//             stock: currentStock,
//           });

//           // Turn off loading after first batch
//           if (i === 0) {
//             setLoading(false);
//           }

//           // Small delay between batches (optional)
//           if (
//             i < batchConfigs.length - 1 &&
//             currentPagination.hasNextForThisPage
//           ) {
//             await new Promise((resolve) => setTimeout(resolve, 200));
//           }
//         }
//       } catch (err) {
//         setError(err?.response?.data?.error || "Something went wrong");
//         setLoading(false);
//       } finally {
//         setBatchLoading(false);
//       }
//     };

//     if (queryParams.year) {
//       fetchProducts();
//     }
//   }, [JSON.stringify(queryParams)]);

//   return {};
// };

// export default useFetchProducts;
