import { cn } from "@/lib/utils";
import { Form, Formik } from "formik";
import React, { useEffect, useRef } from "react";
import { Button, Heading } from "../../common";
import { Alert, InputField } from "../../components";
import { dropdownSchema } from "../../schema/schema";

const ForecastDropdown = ({ className, isOpen, toggleDropdown }) => {
  const dropdownRef = useRef(null);
  const initialValues = {
    growthRate: "",
    minimumStock: "",
    expectedSales: "",
    fromKW: "",
    toKW: "",
  };

  const inputFields = [
    { label: "Wachstumsrate pro KW (%)", name: "growthRate", type: "text" },
    { label: "Mindestbestand", name: "minimumStock", type: "text" },
    { label: "Erwartete Verkäufe pro KW", name: "expectedSales", type: "text" },
    { label: "Von KW", name: "fromKW", type: "text" },
    { label: "bis KW", name: "toKW", type: "text" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        toggleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleDropdown]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {isOpen && (
        <div className="absolute top-9 -right-0 md:-right-30 xl:-right-22  w-[600px] max-w-[calc(100vw-2rem)] bg-white rounded-[1.5rem]  drop-shadow-2xl overflow-hidden z-50 animate-scale-in">
          <Formik
            initialValues={initialValues}
            validationSchema={dropdownSchema}
            onSubmit={(values) => {
              console.log(values);
            }}
          >
            {({ handleSubmit }) => (
              <Form className="p-8 space-y-4" onSubmit={handleSubmit}>
                <Heading
                  className="text-2xl md:text-[32px] text-custom_black font-semibold"
                  heading="Forecast-Einstellungen"
                />
                <Alert text="Einstellungen werden auf 1 ausgewähltes Produkt angewendet." />
                {inputFields.slice(0, 3).map((field) => (
                  <InputField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                  />
                ))}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">
                    Zeitraum
                  </label>
                  <div className="flex items-center gap-4 w-[75%]">
                    {inputFields.slice(3).map((field) => (
                      <div className="flex-1" key={field.name}>
                        <InputField
                          label={field.label}
                          name={field.name}
                          type={field.type}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end mt-8 space-x-3">
                  <Button
                    onClick={() => toggleDropdown(false)}
                    className="bg-[#F8F8F8] text-[#060606] font-medium shadow-sm px-3 py-2 rounded-full"
                    type="button"
                  >
                    Anwenden
                  </Button>
                  <Button
                    className="px-3 py-2 font-medium text-white rounded-full bg-custom_blue"
                    type="submit"
                  >
                    Abbrechen
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
};

export default ForecastDropdown;
