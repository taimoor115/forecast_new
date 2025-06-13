"use client"

import { useState } from "react"

export const SkeletonCell = ({ width = "w-full", height = "h-6" }) => (
  <div className={`rounded animate-pulse bg-[#d1d5db] ${width} ${height}`} />
)

export const TableHeaderSkeleton = ({ columnsCount = 10 }) => (
  <thead className="sticky top-0 z-50">
    <tr className="text-left">
      <th className="sticky left-0 z-50 py-3 pr-8 font-medium bg-purple-300">
        <div className="flex gap-3 items-center w-20 md:w-64">
          <SkeletonCell width="w-[300px]" />
        </div>
      </th>
      <th className="sticky top-0 left-64 z-50 px-6 py-3 font-medium text-center bg-purple-300">
        <div className="w-20 md:w-80">
          <SkeletonCell width="w-[300px]" height="h-5" />
        </div>
      </th>
      {Array(columnsCount)
        .fill(0)
        .map((_, i) => (
          <th key={i} className="sticky top-0 z-50 px-6 py-3 font-medium text-center bg-purple-300">
            <div className="whitespace-nowrap">
              <SkeletonCell width="w-20" height="h-5" />
            </div>
            <div className="mt-1 text-xs whitespace-nowrap text-[#6b7280]">
              <SkeletonCell width="w-24" height="h-3" />
            </div>
          </th>
        ))}
    </tr>
  </thead>
)

export const TableRowSkeleton = ({ columnsCount = 10 }) => (
  <tr className="p-6 bg-[#ffffff]">
    <td className="sticky left-0 py-4 pr-8 bg-[#ffffff] z-10">
      <div className="flex gap-3 items-center">
        <SkeletonCell width="w-5" height="h-5" />
        <div className="flex flex-col gap-1">
          <SkeletonCell width="w-36" height="h-4.5" />
          <SkeletonCell width="w-24" height="h-3.5" />
        </div>
      </div>
    </td>
    <td className="sticky left-64 z-10 px-6 py-4 text-center bg-[#ffffff]">
      <div className="mx-auto w-32">
        <SkeletonCell width="w-16" height="h-6" />
      </div>
    </td>
    {Array(columnsCount)
      .fill(0)
      .map((_, i) => (
        <td key={i} className="px-6 py-4 text-center">
          <div className="flex flex-col gap-2 items-center">
            <SkeletonCell width="w-20" height="h-6" />
          </div>
        </td>
      ))}
  </tr>
)

export const InventoryTableSkeleton = ({
  rowsCount = 5,
  columnsCount = 10,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100)

  return (
    <div className="overflow-hidden p-6 bg-[#ffffff]">
      <div className="relative mb-2">
        <div className="absolute top-0 left-0 z-10 w-80 h-10 bg-[#ffffff]" />
        <div className="ml-32 h-10">
          <div className="flex items-center w-full h-10" />
        </div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-80" />
              <col className="w-80" />
              {Array(columnsCount)
                .fill(0)
                .map((_, i) => (
                  <col key={i} className="w-80" />
                ))}
            </colgroup>
            {/* <TableHeaderSkeleton columnsCount={columnsCount} /> */}
            <tbody>
              {Array(rowsCount)
                .fill(0)
                .map((_, i) => (
                  <TableRowSkeleton key={i} columnsCount={columnsCount} />
                ))}
            </tbody>
          </table>
        </div>
      </div>

     
    </div>
  )
}

export default InventoryTableSkeleton
