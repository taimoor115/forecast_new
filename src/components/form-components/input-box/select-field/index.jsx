import { ErrorMessage, useField } from "formik";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
const SelectField = ({
  name,
  placeholder = "",
  options,
  className,
  onValueChange,
  parentClassName = "w-full",
  label = "",
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <div className={parentClassName}>
      <div>
        <label
          htmlFor="label"
          className="block mb-1 text-sm font-medium text-custom_black"
        >
          {label}
        </label>
        <Select
          value={field.value}
          onValueChange={(value) => {
            helpers.setValue(value);
            if (onValueChange) {
              onValueChange(value);
            }
          }}
          name={name}
        >
          <SelectTrigger
            className={`${className} ${
              meta.touched && meta.error
                ? "border-[3px] border-[#C1292E]"
                : "border-custom_grey_dark"
            }`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.length !== 0 ? (
              options.map((option) => (
                <SelectItem
                  key={option?.id || option?.value}
                  value={option?.value}
                  className={className}
                >
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <p className="text-sm text-center text-black">
                No options available...
              </p>
            )}
          </SelectContent>
        </Select>

        <div className="hidden md:block">
          {meta.touched && meta.error && <ErrorMessage text={meta.error} />}
        </div>
      </div>
    </div>
  );
};

export default SelectField;
