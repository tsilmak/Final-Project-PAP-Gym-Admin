import ErrorOverlay from "components/common/ErrorOverlay";
import React from "react";
import { useGetAllPaymentsQuery } from "state/api";

const PaymentsTotal = () => {
  const { data: paymentsData = [], error: errorPaymentsData } =
    useGetAllPaymentsQuery();

  if (errorPaymentsData) {
    return (
      <ErrorOverlay
        error={errorPaymentsData}
        dataName={"Receita Total"}
        isButtonVisible={false}
      />
    );
  }
  const paidPayments = paymentsData.filter(
    (payment) => payment.paymentStatus.paymentStatusName === "Pago"
  );

  const totalAmount = paidPayments.reduce((total, payment) => {
    return total + payment.amount;
  }, 0);
  return <span>{totalAmount.toFixed(2)} €</span>;
};

export default PaymentsTotal;
