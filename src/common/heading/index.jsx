import React from "react";
import { twMerge } from "tailwind-merge";

const Heading = ({ heading = "", className }) => {
  return (
    <h1
      className={twMerge(
        `text-xl md:text-3xl font-bold text-custom_black ${className}`
      )}
    >
      {heading}
    </h1>
  );
};

export default Heading;
