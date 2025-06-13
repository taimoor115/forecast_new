import React from "react";
import { InputField, SelectField, ToggleSwitch } from "../../components";
import { Form } from "formik";

export const SearchForm = ({ setFieldValue, values }) => (
  <Form className="grid-cols-1 gap-6 mt-4 space-y-2 md:grid md:space-y-0 md:grid-cols-3">
    <InputField
      type="search"
      label="Suche"
      name="suche"
      placeholder="Nach SKU oder Artikelnummer suchen"
      className="px-5 bg-white border-none rounded-full focus:ring-0"
      onChange={(e) => setFieldValue("suche", e.target.value)}
    />

    <div className="flex items-center md:flex-row gap-x-7">
      <SelectField
        label="Anbieter"
        parentClassName="md:w-[60%]"
        name="anbieter"
        options={[
          { value: "anbieter", label: "Anbieter" },
          { value: "anbieter1", label: "Anbieter 1" },
          { value: "anbieter2", label: "Anbieter 2" },
        ]}
        placeholder="Select an Anbieter"
        onValueChange={(value) => setFieldValue("anbieter", value)}
      />
      <div>
        <SelectField
          label="Zoom"
          parentClassName="md:w-20"
          name="zoom"
          placeholder="Select Zoom"
          options={[
            { value: "50", label: "50%" },
            { value: "75", label: "75%" },
            { value: "100", label: "100%" },
            { value: "125", label: "125%" },
            { value: "150", label: "150%" },
            { value: "200", label: "200%" },
          ]}
          onValueChange={(value) => setFieldValue("zoom", value)}
        />
      </div>
    </div>

    <div className="flex flex-col col-span-2 gap-y-3 md:flex-row gap-x-4 ">
      <div className="flex items-center px-4 w-[95%] xl:w-[30%] h-10 py-2 bg-white rounded-full">
        <ToggleSwitch
          checked={values.passweeks}
          onChange={() => setFieldValue("passweeks", !values.passweeks)}
          label="Vergangene Wochen ausblenden"
        />
      </div>

      <div className="flex items-center px-4 w-[95%] xl:w-[30%] h-10 py-2 bg-white rounded-full">
        <ToggleSwitch
          checked={values.showOrder}
          onChange={() => setFieldValue("showOrder", !values.showOrder)}
          label="Beauftragt"
        />
      </div>
    </div>
  </Form>
);
