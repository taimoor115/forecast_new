import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../../common";
import {
  DashboardHeader,
  FilterSection,
  InventoryTable,
  Logout,
  Pagination,
} from "../../components";
import { useModal } from "../../context/modal";
import { useFetchProducts } from "../../hooks";
import useGetVariantCount from "../../hooks/products/useGetVariantsCount";
import useProductStore from "../../store/products";
import { useQueryParamsManager } from "../context/params";
import { InventoryTableSkeleton } from "./skeleton";
import useExpandedRowsStore from "../../store/expended-rows";

const InventoryDashboard = () => {
  const { openModal } = useModal();
  const { updateQueryParams, queryParams } = useQueryParamsManager();
  const { expandedRows, toggleExpandedRow } = useExpandedRowsStore();

  const tableRef = useRef(null);

  useFetchProducts(queryParams);
  useGetVariantCount(queryParams);
  const {
    products: data = {},
    loading = false,
    batchLoading,
  } = useProductStore((state) => state);

  const { pagination = {}, products = [] } = data || {};

  useEffect(() => {
    if (tableRef.current && !loading) {
      tableRef.current.scrollToCurrentWeek(true);
    }
  }, [queryParams.page, loading]);
  const hasProducts = useMemo(() => {
    return products.length > 0;
  }, [products]);

  const handleLogout = useCallback(() => {
    openModal(<Logout />);
  }, [openModal]);

  const mainTableRef = useRef(null);
  const upperScrollRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    const mainTable = mainTableRef.current;
    const upperScroll = upperScrollRef.current;

    if (!mainTable || !upperScroll) return;

    let isUpdatingMainScroll = false;
    let isUpdatingUpperScroll = false;

    const handleMainScroll = () => {
      if (!isUpdatingUpperScroll) {
        isUpdatingMainScroll = true;
        upperScroll.scrollLeft = mainTable.scrollLeft;
        setTimeout(() => {
          isUpdatingMainScroll = false;
        }, 10);
      }
    };

    const handleUpperScroll = () => {
      if (!isUpdatingMainScroll) {
        isUpdatingUpperScroll = true;
        mainTable.scrollLeft = upperScroll.scrollLeft;
        setTimeout(() => {
          isUpdatingUpperScroll = false;
        }, 10);
      }
    };

    mainTable.addEventListener("scroll", handleMainScroll);
    upperScroll.addEventListener("scroll", handleUpperScroll);

    return () => {
      mainTable.removeEventListener("scroll", handleMainScroll);
      upperScroll.removeEventListener("scroll", handleUpperScroll);
    };
  }, []);

  const onPageChange = (page) => {
    updateQueryParams("page", page);
  };

  return (
    <div className="flex justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple--100">
      <div className="px-4 py-8 w-full max-w-screen-2xl">
        <div className="w-full">
          <div className="flex justify-between mb-5">
            <h1 className="text-xl font-bold">Bestandsplanung & Forecast</h1>
            <Button
              onClick={handleLogout}
              className="px-4 py-2 text-white rounded-md bg-custom_blue"
              text="Logout"
            />
          </div>

          <DashboardHeader handleLogout={handleLogout} />
          <FilterSection zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />

          {loading ? (
            <InventoryTableSkeleton />
          ) : (
            <>
              <InventoryTable
                ref={tableRef}
                mainTableRef={mainTableRef}
                upperScrollRef={upperScrollRef}
                zoomLevel={zoomLevel}
                expandedRows={expandedRows}
                toggleExpandedRow={toggleExpandedRow}
              />
              <Pagination
                currentPage={queryParams.page}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
              {!hasProducts && (
                <div className="flex justify-start pt-4 ml-5">
                  Keine Daten gefunden
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
