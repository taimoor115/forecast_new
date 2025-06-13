const Button = ({
  type = "button",
  disabled = false,
  text,
  onClick,
  className: styles,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftIconStyle = "",
  rightIconStyle = "",
  children,
}) => {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`${styles}`}
    >
      {LeftIcon && (
        <LeftIcon
          className={`inline-block items-center mr-2 ${leftIconStyle}`}
        />
      )}
      {text ? text : children}
      {RightIcon && (
        <RightIcon className={`inline-block ml-2 ${rightIconStyle}`} />
      )}
    </button>
  );
};

export default Button;
