import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Skeleton } from "../../components";

const GenericTable = ({ loading = false, data = [], columns = [] }) => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortKey, setSortKey] = useState("");

  const handleSort = (columnKey) => {
    const newSortOrder =
      sortKey === columnKey && sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setSortKey(columnKey);
  };

  const getSortedData = () => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aValue = sortKey.split(".").reduce((o, i) => o?.[i], a);
      const bValue = sortKey.split(".").reduce((o, i) => o?.[i], b);

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedData = getSortedData();

  const renderSkeletonRows = () => {
    return Array(9)
      .fill(null)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((_, colIndex) => (
            <TableCell key={`skeleton-cell-${colIndex}`} className="py-6.5">
              <Skeleton className="h-4 w-[80%]" />
            </TableCell>
          ))}
        </TableRow>
      ));
  };

  return (
    <div className="pt-8 overflow-x-auto min-h-[calc(100vh-60vh)]">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="text-sm font-bold bg-white text-custom_grey_light text-nowrap">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className={`py-3 ${col.sortable ? "cursor-pointer" : ""}`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="py-4 text-sm text-custom_grey_light">
          {loading ? (
            renderSkeletonRows()
          ) : sortedData.length > 0 ? (
            sortedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                className={`transition-all duration-200 bg-white hover:bg-gray-50 ${
                  index % 2 !== 1 ? "bg-[#F6F6F7]" : ""
                }`}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={`py-6.5 text-sm text-black border-b-0 max-w-xs ${
                      column.key === "metadata.semester" ||
                      column.key === "metadata.exam_variable"
                        ? "pl-5"
                        : ""
                    }`}
                  >
                    {column.render
                      ? column.render(row)
                      : column.key.split(".").reduce((o, i) => o?.[i], row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="py-4">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GenericTable;
