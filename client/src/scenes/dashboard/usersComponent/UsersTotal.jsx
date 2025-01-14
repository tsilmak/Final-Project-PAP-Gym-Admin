import ErrorOverlay from "components/common/ErrorOverlay";
import React from "react";
import { useGetUsersQuery } from "state/api";

const UsersTotal = () => {
  const { data: usersData = [], error: errorUsersData } = useGetUsersQuery();

  if (errorUsersData) {
    return (
      <ErrorOverlay
        error={errorUsersData}
        dataName={"Clientes Totais"}
        isButtonVisible={false}
      />
    );
  }

  const clientes = usersData.filter(
    (user) => user.role.rolesName === "Cliente"
  );

  const totalUsers = clientes.length;

  return <span>{totalUsers}</span>;
};

export default UsersTotal;
