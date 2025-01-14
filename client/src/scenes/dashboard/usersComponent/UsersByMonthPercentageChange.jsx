import React from "react";
import { useGetUsersQuery } from "state/api";
import {
  startOfMonth,
  subMonths,
  isAfter,
  isBefore,
  endOfMonth,
} from "date-fns";

const UsersByMonthPercentageChange = () => {
  const { data: usersData = [], error: errorUsersData } = useGetUsersQuery();

  if (errorUsersData) {
    console.error("Erro ao carregar os dados:", JSON.stringify(errorUsersData));
    return <span>Erro</span>;
  }

  const getUsersByMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return usersData.filter((user) => {
      const createdAt = new Date(user.createdAt);
      return isAfter(createdAt, start) && isBefore(createdAt, end);
    });
  };

  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const usersThisMonth = getUsersByMonth(currentMonth);
  const usersLastMonth = getUsersByMonth(lastMonth);

  const numberOfUsersThisMonth = usersThisMonth.length;
  const numberOfUsersLastMonth = usersLastMonth.length;

  let percentageChange = 0;

  if (numberOfUsersLastMonth > 0) {
    percentageChange =
      ((numberOfUsersThisMonth - numberOfUsersLastMonth) /
        numberOfUsersLastMonth) *
      100;
  } else if (numberOfUsersThisMonth > 0) {
    percentageChange = 100;
  }

  return (
    <div>
      <span>{percentageChange.toFixed(2)}%</span>
    </div>
  );
};

export default UsersByMonthPercentageChange;
