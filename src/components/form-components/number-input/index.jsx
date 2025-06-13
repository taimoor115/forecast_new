import { ErrorMessage, Field } from "formik";

const NumberInputField = ({ id, label, placeholder, disabled }) => (
    <div className="w-full">
      <label htmlFor={id} className="block mb-1 text-sm font-medium">
        {label}
      </label>
      <Field
        id={id}
        name={id}
        disabled={disabled}
        type="number"
        placeholder={placeholder}
        className="px-3 py-2 w-full rounded-md border border-gray-4 focus:outline-none"
      />
      <ErrorMessage name={id} component="div" className="text-sm text-red-500" />
    </div>
  );

  
export default NumberInputField