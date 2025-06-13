export const expandedRowsConfig = [
  {
    title: "Min. Bestand",
    type: "minStock",
  },
  {
    title: "Wachstumsrate",
    type: "growthRate",
  },
  {
    title: "Erwartete Verkäufe",
    type: "expectedSales",
  },
  {
    title: (
      <>
        Verkäufe: <br />
        <span className="inline-block px-2 py-0.5 ml-1 text-xs text-purple-900 bg-purple-100 rounded-xl">
          Vorjahr
        </span>
      </>
    ),
    type: "sales",
  },
  {
    title: "Nachbestellung",
    type: "reorder",
  },
  {
    title: "Lieferzeit (Tage)",
    type: "deliveryTime",
  },
];
