import { useTheme } from "@emotion/react";
import { Box, CircularProgress, useMediaQuery } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import ErrorOverlay from "components/common/ErrorOverlay";
import { useMemo } from "react";
import { useGetAllPaymentsQuery, useGetUsersQuery } from "state/api";

const UsersToRevenueChart = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();

  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: errorUsers,
  } = useGetUsersQuery();
  const activeUsers = usersData?.filter((user) =>
    user.signatures.some((signature) => signature.isActive)
  );
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    error: errorPayments,
  } = useGetAllPaymentsQuery();

  const chartData = useMemo(() => {
    if (isUsersLoading || isPaymentsLoading) return null;
    const currentYear = new Date().getFullYear();
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const getMonthData = (type) => {
      return months.map((month, index) => {
        const monthIndex = index + 1;
        if (type === "users") {
          const usersForMonth =
            activeUsers?.filter((user) => {
              const createdAtDate = new Date(user.createdAt);
              return (
                createdAtDate.getFullYear() === currentYear &&
                createdAtDate.getMonth() + 1 === monthIndex
              );
            }).length || 0;
          return { x: month, y: usersForMonth };
        }
        if (type === "revenue") {
          const revenueForMonth =
            paymentsData
              ?.filter((payment) => {
                const paymentDate = new Date(payment.date);
                return (
                  payment.paymentStatus.paymentStatusName === "Pago" &&
                  paymentDate.getFullYear() === currentYear &&
                  paymentDate.getMonth() + 1 === monthIndex
                );
              })
              .reduce((acc, payment) => acc + payment.amount, 0) || 0;
          return { x: month, y: revenueForMonth };
        }
        return { x: month, y: 0 };
      });
    };

    const usersChartData = getMonthData("users");
    const revenueChartData = getMonthData("revenue");

    return [
      {
        id: "Clientes",
        color: "hsl(120, 70%, 50%)",
        data: usersChartData,
      },
      {
        id: "Receita",
        color: "hsl(200, 70%, 50%)",
        data: revenueChartData,
      },
    ];
  }, [activeUsers, paymentsData, isUsersLoading, isPaymentsLoading]);

  return (
    <Box height={isMobile ? "250px" : "400px"} width="100%" position="relative">
      {isUsersLoading || isPaymentsLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Box position="relative" height="100%" width="100%">
            {errorUsers || errorPayments ? (
              <ErrorOverlay
                isButtonVisible={false}
                error={errorUsers || errorPayments}
                dataName={"Gráfico entre clientes e receita"}
              />
            ) : (
              <ResponsiveLine
                data={chartData}
                margin={{
                  top: 10,
                  right: isMobile ? 40 : 80,
                  bottom: 40,
                  left: isMobile ? 40 : 60,
                }}
                theme={{
                  axis: {
                    ticks: {
                      line: { stroke: theme.palette.neutral.main },
                      text: {
                        fill: theme.palette.neutral.main,
                        fontSize: isMobile ? 10 : 12,
                      },
                    },
                    legend: {
                      text: {
                        fill: theme.palette.neutral.main,
                        fontSize: isMobile ? 12 : 14,
                      }, // Adjust legend text size
                    },
                  },
                  legends: { text: { fill: theme.palette.neutral.main } },
                  tooltip: {
                    container: {
                      background: theme.palette.neutral.main,
                      color: theme.palette.neutral.main,
                    },
                  },
                }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Mês",
                  legendOffset: 35,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Clientes / Receita (EUR)",
                  legendOffset: -50,
                  legendPosition: "middle",
                }}
                pointSize={isMobile ? 6 : 10}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabel="y"
                pointLabelYOffset={-12}
                enableCrosshair={true}
                useMesh={true}
                tooltip={({ point }) => (
                  <div
                    style={{
                      background: theme.palette.neutral.main,
                      padding: "5px 10px",
                      borderRadius: "3px",
                      color: theme.palette.primary.main,
                    }}
                  >
                    <strong>
                      {point.serieId === "Clientes"
                        ? "Clientes Totais"
                        : "Receita Total"}
                      :
                    </strong>{" "}
                    {point.data.xFormatted} <br />
                    {point.serieId === "Clientes"
                      ? `${point.data.y} Clientes`
                      : `${point.data.y} €`}
                  </div>
                )}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    translateX: isMobile ? 60 : 100,
                    itemsSpacing: 0,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    symbolSize: isMobile ? 8 : 12,
                    symbolShape: "circle",
                    symbolBorderColor: "rgba(0, 0, 0, .5)",
                  },
                ]}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default UsersToRevenueChart;
