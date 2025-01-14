import ErrorOverlay from "components/common/ErrorOverlay";
import React from "react";
import { useGetSignatureQuery } from "state/api";

const ActiveSignaturesCount = () => {
  const { data: signatures = [], error: errorSignaturesData } =
    useGetSignatureQuery();

  if (errorSignaturesData) {
    return (
      <ErrorOverlay
        error={errorSignaturesData}
        dataName={"Assinaturas Ativas Totais Totais"}
        isButtonVisible={false}
      />
    );
  }

  const activeSignatures = signatures.data.filter(
    (signature) => signature.isActive
  );

  const activeSignaturesCount = activeSignatures.length;

  return (
    <div>
      <span>{activeSignaturesCount}</span>
    </div>
  );
};

export default ActiveSignaturesCount;
