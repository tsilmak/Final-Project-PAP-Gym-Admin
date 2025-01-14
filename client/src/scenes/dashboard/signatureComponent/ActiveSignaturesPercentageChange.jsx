import React from "react";
import { useGetSignatureQuery } from "state/api";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isAfter,
  isBefore,
} from "date-fns";

const ActiveSignaturesPercentageChange = () => {
  const { data: signatures = [], error: errorSignaturesData } =
    useGetSignatureQuery();

  if (errorSignaturesData) {
    console.log(errorSignaturesData);
    return <span>Erro</span>;
  }

  const getActiveSignaturesByMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(start);
    return signatures.data.filter((signature) => {
      const startDate = new Date(signature.startDate);
      return (
        signature.isActive &&
        isAfter(startDate, start) &&
        isBefore(startDate, end)
      );
    });
  };

  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const activeSignaturesThisMonth = getActiveSignaturesByMonth(currentMonth);
  const activeSignaturesLastMonth = getActiveSignaturesByMonth(lastMonth);

  const countThisMonth = activeSignaturesThisMonth.length;
  const countLastMonth = activeSignaturesLastMonth.length;

  let percentageChange = 0;
  if (countLastMonth > 0) {
    percentageChange =
      ((countThisMonth - countLastMonth) / countLastMonth) * 100;
  } else if (countThisMonth > 0) {
    percentageChange = 100;
  }

  return (
    <div>
      <span>{percentageChange.toFixed(2)}%</span>
      {/* <p>This Month: {countThisMonth}</p>
      <p>Last Month: {countLastMonth}</p> */}
    </div>
  );
};

export default ActiveSignaturesPercentageChange;
