import { useEffect, useRef, useState } from "react";
import { Button } from "../../common";
import { DownSvg, UpSvg } from "../../assets/svgs";
import { Link } from "react-router-dom";

export default function DropdownButton({
  title,
  options,
  image,
  icon: Icon,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 font-semibold bg-white border rounded-md cursor-pointer border-custom_primary shadow-custom_primary shadow-2 gap-x-3 text-custom-black"
      >
        {image && (
          <img
            src={image}
            alt="icon"
            className="rounded-full min-w-5 min-h-5"
          />
        )}
        {Icon && <Icon size={16} />}
        <span className="text-sm font-medium text-custom_black">{title}</span>
        {isOpen ? <UpSvg fill="black" /> : <DownSvg fill="black" />}
      </Button>
      {isOpen && (
        <div className="absolute right-0 z-10 w-48 mt-2 bg-white border shadow-lg rounded-xl">
          <ul className="py-2 text-sm ">
            {options.map((option, index) =>
              option.to ? (
                <Link to={option.to} key={index}>
                  <li className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-4">
                    {option?.title}
                  </li>
                </Link>
              ) : (
                <button
                  key={index}
                  disabled={option.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    option?.onClick();
                  }}
                  className="w-full px-4 py-2 text-sm cursor-pointer text-start hover:bg-gray-4"
                >
                  {option?.title}
                </button>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
