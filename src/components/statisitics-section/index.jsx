import React from "react";
import { cardData } from "../../constant/home";
import { StatisticsCard } from "../../components";

export const StatisticsSection = () => (
  <section className="grid grid-cols-1 gap-y-4 md:grid-cols-2 lg:grid-cols-4 gap-x-10">
    {cardData.map((item, index) => (
      <StatisticsCard
        key={index}
        title={item.title}
        stats={item.stat}
        color={item.color}
      />
    ))}
  </section>
);
