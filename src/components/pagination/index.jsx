import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  size = "default",
  variant = "outline",
}) => {
  const [maxVisiblePages, setMaxVisiblePages] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth < 640 ? 3 : 5);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getVisiblePages = () => {
    let pages = [];

    if (totalPages <= maxVisiblePages) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(currentPage - halfVisible, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

      if (endPage === totalPages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  const buttonSizeClass = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];

  const iconSize = {
    sm: 16,
    default: 18,
    lg: 20,
  }[size];

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap gap-1 justify-end items-center py-5 sm:gap-2",
        className
      )}
    >
      {showFirstLast && (
        <Button
          variant={variant}
          size="icon"
          className={cn(buttonSizeClass, "hidden sm:flex")}
          disabled={currentPage === 1 || totalPages === 0}
          onClick={() => onPageChange(1)}
          aria-label="Go to first page"
        >
          <ChevronsLeft size={iconSize} />
        </Button>
      )}

      <Button
        variant={variant}
        size="icon"
        className={buttonSizeClass}
        disabled={currentPage === 1 || totalPages === 0}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={iconSize} />
      </Button>

      <div className="flex flex-wrap gap-1 items-center sm:gap-2">
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : variant}
            size="icon"
            className={cn(
              buttonSizeClass,
              page === currentPage && "pointer-events-none"
            )}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant={variant}
        size="icon"
        className={buttonSizeClass}
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
      >
        <ChevronRight size={iconSize} />
      </Button>

      {showFirstLast && (
        <Button
          variant={variant}
          size="icon"
          className={cn(buttonSizeClass, "hidden sm:flex")}
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(totalPages)}
          aria-label="Go to last page"
        >
          <ChevronsRight size={iconSize} />
        </Button>
      )}
    </nav>
  );
};

export default Pagination;
