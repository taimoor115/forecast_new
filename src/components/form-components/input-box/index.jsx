import { Field, ErrorMessage } from "formik";
import { EyeSvg, HideSvg } from "../../../assets/svgs";
import { Button } from "../../../common";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  className,
  showPasswordToggle = false,
  onTogglePasswordVisibility,
  isPasswordVisible,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-base font-medium text-custom_black"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Field
          id={name}
          name={name}
          type={showPasswordToggle && isPasswordVisible ? "text" : type}
          placeholder={placeholder}
          className={`w-full px-3 py-2 placeholder:text-[#929292] placeholder:text-sm border rounded-full focus:border-transparent border-gray-6 focus:outline-none focus:ring-1 focus:ring-custom_primary ${className}`}
        />
        {showPasswordToggle && (
          <Button
            type="button"
            onClick={onTogglePasswordVisibility}
            className="absolute right-2 top-2"
          >
            {isPasswordVisible ? <EyeSvg /> : <HideSvg />}
          </Button>
        )}
      </div>
      <ErrorMessage
        name={name}
        component="div"
        className="text-xs text-red-500"
      />
    </div>
  );
};

export default InputField;
