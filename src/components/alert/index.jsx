const Alert = ({ parentClass = "", textClass = "", text = "" }) => {
  return (
    <div
      className={` rounded-full md:py-3 md:px-4 p-2 bg-[#05025933]
] ${parentClass}`}
    >
      <p
        className={`text-[12px] md:text-base text-center text-custom_blue font-normal ${textClass}`}
      >
        {text}
      </p>
    </div>
  );
};

export default Alert;
