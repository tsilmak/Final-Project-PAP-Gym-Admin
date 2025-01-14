import React from "react";
import { useGetAllPaymentsQuery } from "state/api";

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getTotalPaymentsByMonth = (payments = [], date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return payments
    .filter((payment) => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= start && paymentDate <= end;
    })
    .reduce((total, payment) => total + payment.amount, 0);
};

const PaymentsPercentageChange = () => {
  const { data: paymentsData = [], error: errorPaymentsData } =
    useGetAllPaymentsQuery();

  if (errorPaymentsData) {
    console.error("Error fetching payments data:", errorPaymentsData);
    return "ERRO";
  }

  const currentMonth = new Date();
  const lastMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );

  const totalPaymentsThisMonth = getTotalPaymentsByMonth(
    paymentsData,
    currentMonth
  );
  const totalPaymentsLastMonth = getTotalPaymentsByMonth(
    paymentsData,
    lastMonth
  );

  let percentageChange = 0;

  if (totalPaymentsLastMonth > 0) {
    percentageChange =
      ((totalPaymentsThisMonth - totalPaymentsLastMonth) /
        totalPaymentsLastMonth) *
      100;
  } else if (totalPaymentsThisMonth > 0) {
    percentageChange = 100;
  }

  return (
    <div>
      <span>{percentageChange.toFixed(2)}%</span>
    </div>
  );
};

export default PaymentsPercentageChange;
