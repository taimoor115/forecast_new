import { ErrorMessage, Field, Form, Formik } from "formik";
import { toast } from "sonner";
import LoaderSvg from "../../assets/svgs/loader";
import NumberInputField from "../../components/form-components/number-input";
import { useModal } from "../../context/modal";
import useUpdateBulk from "../../hooks/products/useUpdateBulk";
import { useGrowthRateChangesStore } from "../../store/growth-rate";
import useMinStockChangesStore from "../../store/min-stock/useRevetMinStock";
import usePreviousProductStore from "../../store/previous-product-state";
import useProductStore from "../../store/products";
import { calculateStock } from "../../utils/calculate-stock";
import { getWeekNumber } from "../../utils/get-current-week-number";
import { bulkEditSchema } from "../../schema/schema";
import { bulkEditFields } from "../../constant/home";
import useExpectedSalesChangesStore from "../../store/expected-sales/usePreviousExpectedSales";

const EditProducts = ({ selectedProductsCount = 0 }) => {
  const initialValues = {
    byKw: "",
    upToKw: "",
    growthRate: "",
    minimumStock: "",
    expectedSalesPerYear: "",
  };

  const { closeModal } = useModal();
  const { updateBulk, loading } = useUpdateBulk();
  const {
    products,
    setProducts,
    selectedVariantsIds,
    clearSelectedVariants,
    getCurrentWeekStatus,
  } = useProductStore();
  const { setOriginalValue, addBulkChanges } = useGrowthRateChangesStore();
  const { setOriginalMinStockValue, addChangedMinStockWeek } =
    useMinStockChangesStore();
  const { savePreviousProducts } = usePreviousProductStore();
  const {
    addChangedWeek,
    setOriginalGrowthRateValue,
    setOriginalExpectedSalesValue,
  } = useExpectedSalesChangesStore();

  const updateForecastForVariants = (
    variantIds,
    startWeek,
    endWeek,
    growthRate,
    minStock,
    expectedSales,
    targetYear
  ) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentWeek = getWeekNumber(currentDate);
    const yearToUpdate = targetYear || currentYear;
    const salesYear = yearToUpdate - 1;
    const effectiveStartWeek =
      startWeek < currentWeek ? currentWeek : startWeek;

    savePreviousProducts(variantIds, products.products, getCurrentWeekStatus);
    const weekKeys = [];
    for (let week = effectiveStartWeek; week <= endWeek; week++) {
      weekKeys.push(`${yearToUpdate}-${week}`);
    }

    const updatedProducts = products.products.map((product) => {
      if (!variantIds.includes(product.variantId)) {
        return product;
      }

      const updatedForecast =
        growthRate !== null || expectedSales !== null || minStock !== null
          ? product.forecast.map((forecastYear) => {
              if (forecastYear.year === yearToUpdate) {
                const updatedWeeks = forecastYear.weeks.map((week) => {
                  const isWithinRange =
                    week.week >= effectiveStartWeek && week.week <= endWeek;
                  const isFutureWeek =
                    forecastYear.year > currentYear ||
                    (forecastYear.year === currentYear &&
                      week.week >= currentWeek);

                  if (isWithinRange && isFutureWeek) {
                    const weekKey = `${forecastYear.year}-${week.week}`;
                    let calculatedGrowthRate = week.growthRate || 0;
                    let calculatedExpectedSales = null;

                    // Calculate previous year's sales for the week
                    const prevYearSalesEntry = product.sales
                      ?.find((s) => s.year === salesYear)
                      ?.weeks?.find((w) => w.week === week.week);
                    const prevYearSales = prevYearSalesEntry?.sales || 0;

                    if (expectedSales !== null) {
                      // User provided expected sales, calculate growth rate
                      if (prevYearSales > 0) {
                        const growth =
                          (expectedSales - prevYearSales) / prevYearSales;
                        calculatedGrowthRate = Math.round(growth * 100);
                      } else {
                        toast.error("Keine Verkaufsdaten für den vorigen Jahr");
                        return;
                      }
                      calculatedExpectedSales = Number(expectedSales);
                      // Store original growth rate

                      if (week.growthRate) {
                        setOriginalValue(
                          product.variantId,
                          weekKey,
                          week.growthRate || 0
                        );
                      }
                      if (week.expectedSales) {
                        const currentExpectedSales =
                          prevYearSales > 0
                            ? prevYearSales +
                              Math.round(
                                (prevYearSales * (week.growthRate || 0)) / 100
                              )
                            : 0;
                        setOriginalExpectedSalesValue(
                          product.variantId,
                          weekKey,
                          currentExpectedSales
                        );
                      }
                      if (week.growthRate) {
                        setOriginalGrowthRateValue(
                          product.variantId,
                          weekKey,
                          week.growthRate || 0
                        );
                      }
                      addChangedWeek(product.variantId, weekKey);
                    } else if (growthRate !== null) {
                      // User provided growth rate, calculate expected sales
                      calculatedGrowthRate = Number(growthRate);
                      calculatedExpectedSales =
                        prevYearSales > 0
                          ? prevYearSales +
                            Math.round(prevYearSales * (growthRate / 100))
                          : 0;

                      if (week.growthRate) {
                        setOriginalValue(
                          product.variantId,
                          weekKey,
                          week.growthRate || 0
                        );
                      }
                      if (week.growthRate) {
                        setOriginalGrowthRateValue(
                          product.variantId,
                          weekKey,
                          week.growthRate || 0
                        );
                      }

                      if (week.expectedSales) {
                        const currentExpectedSales =
                          prevYearSales > 0
                            ? prevYearSales +
                              Math.round(
                                (prevYearSales * (week.growthRate || 0)) / 100
                              )
                            : 0;
                        setOriginalExpectedSalesValue(
                          product.variantId,
                          weekKey,
                          currentExpectedSales
                        );
                      }
                      addChangedWeek(product.variantId, weekKey);
                    }

                    if (minStock !== null) {
                      if (week.minStock) {
                        setOriginalMinStockValue(
                          product.variantId,
                          weekKey,
                          week.minStock || 0
                        );
                      }
                      addChangedMinStockWeek(product.variantId, weekKey);
                    }

                    return {
                      ...week,
                      ...(growthRate !== null || expectedSales !== null
                        ? { growthRate: calculatedGrowthRate }
                        : {}),
                      ...(minStock !== null
                        ? { minStock: Number(minStock) }
                        : {}),
                    };
                  }
                  return week;
                });
                return { ...forecastYear, weeks: updatedWeeks };
              }
              return forecastYear;
            })
          : product.forecast;

      return {
        ...product,
        forecast: updatedForecast,
      };
    });

    const calculatedProducts = calculateStock(updatedProducts);

    const finalProducts = products.products.map((product) => {
      const calculatedProduct = calculatedProducts.find(
        (calcProduct) => calcProduct.variantId === product.variantId
      );
      if (variantIds.includes(product.variantId) && calculatedProduct) {
        return {
          ...product,
          forecast: calculatedProduct.forecast,
          currentWeekStatus: calculatedProduct.currentWeekStatus,
          reorderStatus: calculatedProduct.reorderStatus,
        };
      }
      return product;
    });

    setProducts({
      products: finalProducts,
      pagination: products.pagination,
      stock: products.stock,
    });

    if (growthRate !== null || expectedSales !== null) {
      addBulkChanges(variantIds, weekKeys);
    }

    return calculatedProducts
      .filter((product) => variantIds.includes(product.variantId))
      .map((product) => ({
        variantId: product.variantId,
        forecastByYear: product.forecast,
        currentWeekStatus: product.currentWeekStatus,
        reorderStatus: product.reorderStatus,
      }));
  };
  const handleSubmit = async (values, { resetForm, setFieldError }) => {
    const variantIds = Array.from(selectedVariantsIds);
    const updatedForecast = updateForecastForVariants(
      variantIds,
      Number(values.byKw),
      Number(values.upToKw),
      values.growthRate !== "" ? Number(values.growthRate) : null,
      values.minimumStock !== "" ? Number(values.minimumStock) : null,
      values.expectedSalesPerYear !== ""
        ? Number(values.expectedSalesPerYear)
        : null,
      values.year ? Number(values.year) : undefined
    );

    try {
      const res = await updateBulk(updatedForecast);
      if (res.statusCode === 200) {
        clearSelectedVariants();
        resetForm();
        closeModal();
        toast.success("Produkte erfolgreich aktualisiert");
      } else {
        setFieldError(
          "byKw",
          "Fehler beim Anwenden der Wochen: Bitte versuchen Sie es erneut."
        );
        setFieldError(
          "upToKw",
          "Fehler beim Anwenden der Wochen: Bitte versuchen Sie es erneut."
        );
        toast.error(
          "Aktualisierung der Produkte fehlgeschlagen. Bitte versuchen Sie es erneut."
        );
      }
    } catch (error) {
      console.error("Error updating products:", error);
      setFieldError(
        "byKw",
        "Fehler beim Anwenden der Wochen: Bitte versuchen Sie es erneut."
      );
      setFieldError(
        "upToKw",
        "Fehler beim Anwenden der Wochen: Bitte versuchen Sie es erneut."
      );
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Forecast Einstellungen
      </h2>
      <p className="mt-1 text-sm text-purple-600">
        Einstellungen werden auf {selectedProductsCount} ausgewählte Produkte
        angewendet
      </p>

      <Formik
        initialValues={initialValues}
        validationSchema={bulkEditSchema}
        onSubmit={(values, { setSubmitting, setFieldError, resetForm }) => {
          if (
            !values.growthRate &&
            !values.minimumStock &&
            !values.expectedSalesPerYear
          ) {
            setFieldError("at-least-one", "At least one field must be filled");
            setSubmitting(false);
            return;
          }
          handleSubmit(values, { resetForm, setFieldError });
        }}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ errors, touched, values }) => (
          <Form className="mt-4 space-y-4">
            <div className="flex gap-4">
              {bulkEditFields.kwRange.map(({ id, label, placeholder }) => (
                <div key={id} className="w-1/2">
                  <label
                    htmlFor={id}
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    {label}
                  </label>
                  <Field
                    id={id}
                    name={id}
                    type="number"
                    placeholder={placeholder}
                    className="px-3 py-2 w-full rounded-md border border-gray-4 focus:outline-none"
                  />
                  <ErrorMessage name={id} component="div" className="text-sm" />
                </div>
              ))}
            </div>

            {bulkEditFields.otherFields.map((field) => (
              <NumberInputField
                disabled={
                  (field.id === "growthRate" &&
                    values.expectedSalesPerYear !== null &&
                    values.expectedSalesPerYear !== "") ||
                  (field.id === "expectedSalesPerYear" &&
                    values.growthRate !== null &&
                    values.growthRate !== "")
                }
                key={field.id}
                {...field}
              />
            ))}

            {(touched.growthRate ||
              touched.minimumStock ||
              touched.expectedSalesPerYear) &&
              errors["at-least-one"] && (
                <div className="text-sm text-red-500">
                  {errors["at-least-one"]}
                </div>
              )}

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={selectedProductsCount === 0 || loading}
                className={`px-4 py-2 bg-purple-600 w-1/2 rounded-xl flex items-center justify-center text-white font-medium ${
                  selectedProductsCount === 0 || loading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? <LoaderSvg /> : null}
                Anwenden
              </button>
              <button
                disabled={loading}
                type="button"
                onClick={closeModal}
                className="py-3 w-1/2 bg-white rounded-xl border border-gray-4"
              >
                Abbrechen
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditProducts;
