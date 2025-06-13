

import * as Yup from "yup";

export const dropdownSchema = Yup.object().shape({
  growthRate: Yup.number().required("Wachstumsrate ist erforderlich"),
  minimumStock: Yup.number().required("Mindestbestand ist erforderlich"),
  expectedSales: Yup.number().required("Erwartete Verkäufe sind erforderlich"),
  fromKW: Yup.number().required("Von KW ist erforderlich"),
  toKW: Yup.number().required("Bis KW ist erforderlich"),
});

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ungültige E-Mail-Adresse")
    .required("E-Mail-Adresse ist erforderlich"),
  password: Yup.string().required("Passwort ist erforderlich"),
});



export const bulkEditSchema = Yup.object({
    byKw: Yup.number()
      .required("Erforderlich")
      .min(1, "Muss mindestens 1 sein")
      .max(53, "Darf höchstens 53 sein"),
    upToKw: Yup.number()
      .required("Erforderlich")
      .min(1, "Muss mindestens 1 sein")
      .max(53, "Darf höchstens 53 sein")
      .test(
        "is-greater",
        "Bis KW muss größer oder gleich Von KW sein",
        function (value) {
          const { byKw } = this.parent;
          return value >= byKw;
        }
      ),
    growthRate: Yup.number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
    minimumStock: Yup.number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
    expectedSalesPerYear: Yup.number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
  }).test(
    "at-least-one",
    "Mindestens ein Feld muss ausgefüllt sein (Wachstumsrate, Mindestbestand oder Verkäufe)",
    function (values) {
      const { growthRate, minimumStock, expectedSalesPerYear } = values;
      return (
        growthRate !== null ||
        minimumStock !== null ||
        expectedSalesPerYear !== null
      );
    }
  );