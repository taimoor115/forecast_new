import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import SelectField from "../../components/form-components/input-box/select-field";
// import { Checkbox } from "./ui/checkbox";

const AccordionTable = () => {
  const [products, setProducts] = useState([
    {
      id: "SKU1234",
      name: "T-Shirt – Basic Weiß",
      currentStock: 150,
      values: [139, 96, 90, 79, 58],
      selected: false,
      badges: {
        3: "maschinenauftrag",
        4: "maschinenauftrag",
        5: "wird-gestrickt",
      },
    },
    {
      id: "SKU1235",
      name: "T-Shirt – Basic Weiß",
      currentStock: 140,
      values: [90, 79, 58, 43, 0],
      selected: true,
      badges: {},
    },
  ]);

  const [expandedRow, setExpandedRow] = useState(null);

  const statusOptions = [
    { value: "status", label: "Status" },
    { value: "maschinenauftrag", label: "Maschinenauftrag" },
    { value: "wird-gestrickt", label: "Wird gestrickt" },
    { value: "bei-svevo", label: "Bei Svevo" },
    { value: "kommission", label: "Kommission" },
  ];

  const initialValues = {
    minBestand: [20, 20, 30, 20, 50],
    wachstumsrate: ["", "", "", "", ""],
    erwarteteVerkaufe: [20, 20, 20, 20, 20],
    verkaufeVorjahr: [20, 20, 20, 20, 20],
    nachbestellung: [0, 20, 20, 20, 20],
    lieferzeit: [20, 20, 20, "-", "-"],
    statusNachbestellung: [
      "status",
      "maschinenauftrag",
      "maschinenauftrag",
      "wird-gestrickt",
      "bei-svevo",
    ],
  };

  const detailsData = [
    {
      label: "Min. Bestand",
      field: "minBestand",
      additionalInfo: {
        2: <RefreshCw size={14} className="inline ml-1 text-gray-500" />,
      },
    },
    {
      label: "Wachstumsrate",
      field: "wachstumsrate",
      className: "text-custom_primary",
      isInput: true,
    },
    {
      label: "Erwartete Verkäufe",
      field: "erwarteteVerkaufe",
    },
    {
      label: "Verkäufe Vorjahr",
      field: "verkaufeVorjahr",
      className: "bg-indigo-100 rounded-full px-4 py-1 inline-block",
    },
    {
      label: "Nachbestellung",
      field: "nachbestellung",
      isInput: true,
    },
    {
      label: "Status der Nachbestellung",
      field: "statusNachbestellung",
      isSelect: true,
      options: statusOptions,
    },
  ];

  // Add Lieferzeit as a separate row outside of detailsData
  const lieferzeitData = {
    label: "Lieferzeit",
    values: [20, 20, 20, "-", "-"],
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const toggleSelect = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id
          ? { ...product, selected: !product.selected }
          : product
      )
    );
  };

  const renderBadge = (type) => {
    if (!type) return null;

    const badgeClass = `badge-${type}`;

    const labelMap = {
      maschinenauftrag: "Maschinenauftrag",
      "wird-gestrickt": "Wird gestrickt",
      "bei-svevo": "Bei Svevo",
      status: "Status",
    };

    return <span className={badgeClass}>{labelMap[type]}</span>;
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case "maschinenauftrag":
        return "bg-red-100 text-red-700";
      case "wird-gestrickt":
        return "bg-yellow-100 text-yellow-700";
      case "bei-svevo":
        return "bg-blue-100 text-blue-700";
      case "kommission":
        return "bg-purple-100 text-purple-700";
      case "status":
      default:
        return "bg-white text-black";
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        // Handle form submission
      }}
    >
      {({ values }) => (
        <Form className="px-2 xl:px-0">
          <div className="w-full mx-auto  overflow-hidden bg-white rounded-lg shadow-[0px_4px_7.6px_0px_#05025926]">
            <div className="overflow-x-auto">
              <table className="w-full bg-">
                <thead>
                  <tr className="bg-white">
                    <th className="px-2 py-3 w-10 md:w-12 md:px-4 md:py-4"></th>
                    <th className="px-2 py-3 text-xs font-medium text-left md:px-4 md:py-4 text-custom_primary md:text-sm lg:text-base">
                      Produkt
                    </th>
                    <th className="px-2 py-3 text-xs font-normal text-center md:px-4 md:py-4 text-custom_primary md:text-sm lg:text-base">
                      Aktueller Bestand
                    </th>
                    <th className="px-2 py-3 text-xs font-normal text-center md:px-4 md:py-4 text-custom_primary md:text-sm lg:text-base">
                      KW 1
                    </th>
                    <th className="px-2 py-3 text-xs font-normal text-center md:px-4 md:py-4 text-custom_primary md:text-sm lg:text-base">
                      KW 2
                    </th>
                    <th className="px-2 py-3 text-xs font-normal text-center md:px-4 md:py-4 text-custom_primary md:text-sm lg:text-base">
                      KW 3
                    </th>
                    <th className="px-2 py-3 text-xs font-normal text-center md:px-4 md:py-4 text-custom_primary md:text-sm lg:text-base">
                      KW 4
                    </th>
                    <th className="px-2 py-3 text-xs font-normal text-center md:px-4 md:py-4 text-custom_primary md:text-sm lg:text-base">
                      KW 5
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product, index) => {
                    const isExpanded = expandedRow === `${product.id}-${index}`;

                    return (
                      <React.Fragment key={`${product.id}-${index}`}>
                        <tr
                          className={` ${isExpanded ? "bg-white" : ""}`}
                          onClick={() => toggleExpand(`${product.id}-${index}`)}
                        >
                          <td className="px-2 py-2 align-middle md:px-4 md:py-3">
                            {isExpanded ? (
                              <ChevronUp className="text-custom_primary min-w-5 min-h-5" />
                            ) : (
                              <ChevronDown className="text-custom_primary min-w-5 min-h-5" />
                            )}
                          </td>
                          <td className="px-2 py-2 md:px-4 md:py-3">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2 w-4 h-4 text-indigo-600 rounded-full md:w-5 md:h-5 md:mr-3"
                                checked={product.selected}
                                onChange={() => toggleSelect(product.id)}
                              />
                              <div>
                                <div className="text-xs font-medium text-custom_primary md:text-sm lg:text-base">
                                  {product.id}
                                </div>
                                <div className="text-xs text-gray-500 md:text-sm">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center md:px-4 md:py-3">
                            <div className="text-xs font-medium bg-white rounded-full md:text-sm lg:text-base">
                              {product.currentStock}
                            </div>
                          </td>
                          <td colSpan={5} className="relative px-0 py-0">
                            <div className="absolute top-0 right-0 left-0 w-full">
                              <div className="progress-gradient"></div>
                            </div>
                            <div className="flex">
                              {product.values.map((value, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 px-2 py-2 text-center md:px-4 md:py-3"
                                >
                                  <div className="text-xs font-medium bg-white rounded-full md:text-sm lg:text-base">
                                    {value}
                                  </div>
                                  {product.badges &&
                                    product.badges[String(idx + 3)] && (
                                      <div className="mt-1">
                                        {renderBadge(
                                          product.badges[String(idx + 3)]
                                        )}
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <>
                            {detailsData.map((row, rowIndex) => (
                              <tr key={rowIndex} className="detail-row">
                                <td className="px-2 py-2 align-middle md:px-4 md:py-3"></td>
                                <td className="px-2 py-2 text-xs font-medium text-left md:px-4 md:py-3 text-custom_primary md:text-sm lg:text-base">
                                  {row.label}
                                </td>
                                <td className="px-2 py-2 text-center md:px-4 md:py-3">
                                  {row.label === "Lieferzeit"
                                    ? values[row.field][0]
                                    : ""}
                                </td>
                                {row.isInput ? (
                                  <>
                                    {[0, 1, 2, 3, 4].map((i) => (
                                      <td
                                        key={i}
                                        className="px-2 py-2 text-center md:px-4 md:py-3"
                                      >
                                        <Field
                                          name={`${row.field}[${i}]`}
                                          placeholder={
                                            row.field === "nachbestellung"
                                              ? ""
                                              : "XX %"
                                          }
                                          type={
                                            row.field === "nachbestellung"
                                              ? "number"
                                              : "text"
                                          }
                                          min={0}
                                          className="p-1 w-12 text-xs text-center rounded-full md:w-16 focus:outline-none md:text-sm"
                                        />
                                      </td>
                                    ))}
                                  </>
                                ) : row.isSelect ? (
                                  <>
                                    {[0, 1, 2, 3, 4].map((i) => (
                                      <td
                                        key={i}
                                        className="px-2 py-2 text-center md:px-4 md:py-3"
                                      >
                                        <SelectField
                                          name={`${row.field}[${i}]`}
                                          options={row.options}
                                          className={`w-full text-xs md:text-sm ${getStatusClassName(
                                            values[row.field][i]
                                          )}`}
                                          parentClassName="w-full"
                                        />
                                      </td>
                                    ))}
                                  </>
                                ) : row.badges ? (
                                  <>
                                    {[0, 1, 2, 3, 4].map((i) => (
                                      <td
                                        key={i}
                                        className="px-2 py-2 text-center md:px-4 md:py-3"
                                      >
                                        <div className="flex justify-center">
                                          {renderBadge(row.badges[i])}
                                        </div>
                                      </td>
                                    ))}
                                  </>
                                ) : (
                                  <>
                                    {row.label === "Lieferzeit" &&
                                    !row.showAllColumns ? (
                                      <>
                                        <td className="px-2 py-2 text-center md:px-4 md:py-3">
                                          <div className={`${row.className}`}>
                                            <span className="px-2 py-1 text-xs bg-white rounded-full md:px-4 md:text-sm">
                                              {values[row.field][0]}
                                            </span>
                                          </div>
                                        </td>
                                        <td colSpan={4}></td>
                                      </>
                                    ) : (
                                      values[row.field].map(
                                        (value, valueIndex) => (
                                          <td
                                            key={valueIndex}
                                            className="px-2 py-2 text-center md:px-4 md:py-3"
                                          >
                                            {row.label ===
                                            "Verkäufe Vorjahr" ? (
                                              <div className="inline-block px-2 py-1 text-xs bg-white rounded-full md:px-4 md:text-sm">
                                                {value}
                                              </div>
                                            ) : (
                                              <div
                                                className={`${row.className}`}
                                              >
                                                <span className="px-2 py-1 text-xs bg-white rounded-full md:px-4 md:text-sm">
                                                  {value}
                                                </span>
                                                {row.additionalInfo &&
                                                  row.additionalInfo[
                                                    valueIndex
                                                  ] &&
                                                  row.additionalInfo[
                                                    valueIndex
                                                  ]}
                                              </div>
                                            )}
                                          </td>
                                        )
                                      )
                                    )}
                                  </>
                                )}
                              </tr>
                            ))}

                            <tr className="detail-row">
                              <td className="px-2 py-2 align-middle md:px-4 md:py-3"></td>
                              <td className="px-2 py-2 text-xs font-medium text-left md:px-4 md:py-3 text-custom_primary md:text-sm lg:text-base">
                                {lieferzeitData.label}
                              </td>
                              <td className="px-2 py-2 text-center md:px-4 md:py-3">
                                <span className="px-2 py-1 text-xs bg-white rounded-full md:px-4 md:text-sm">
                                  {lieferzeitData.values[0]}
                                </span>
                              </td>
                              {lieferzeitData.values.map((value, idx) => (
                                <td
                                  key={idx}
                                  className="px-2 py-2 text-center md:px-4 md:py-3"
                                >
                                  <span className="px-2 py-1 text-xs rounded-full md:px-4 md:text-sm">
                                    {/* {value}//must there */}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AccordionTable;
