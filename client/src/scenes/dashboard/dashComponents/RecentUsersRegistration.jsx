import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Box,
} from "@mui/material";
import Chart from "react-apexcharts";
import { useTheme } from "@emotion/react";
import { useGetLast7DaysUsersQuery, useGetUsersQuery } from "state/api";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";

const fetchRealTimeTrend = (dailyCounts) => {
  return {
    series: [
      {
        name: "Novos Registos",
        data: dailyCounts,
      },
    ],
    options: {
      chart: {
        type: "line",
        zoom: { enabled: false },
        background: "transparent",
        height: 400,
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: {
        categories: [
          "segunda",
          "terça",
          "quarta",
          "quinta",
          "sexta",
          "sábado",
          "domingo",
        ],
      },
    },
  };
};

const AdminDashboard = () => {
  const theme = useTheme();
  const {
    data: usersData,
    error: usersDataError,
    isLoading: usersDataIsLoading,
  } = useGetUsersQuery();
  const {
    data: last7daysUsersData,
    error: last7daysUsersDataError,
    isLoading: last7daysUsersDataIsLoading,
  } = useGetLast7DaysUsersQuery();

  const [trendData, setTrendData] = useState(
    fetchRealTimeTrend(Array(7).fill(0))
  );

  const usersDataLast5 = Array.isArray(usersData) ? usersData.slice(0, 5) : [];

  useEffect(() => {
    if (last7daysUsersData) {
      const dailyCounts = Array(7).fill(0);
      const daysOfWeek = {
        segunda: 0,
        terça: 1,
        quarta: 2,
        quinta: 3,
        sexta: 4,
        sábado: 5,
        domingo: 6,
      };
      for (const [day, count] of Object.entries(last7daysUsersData)) {
        if (daysOfWeek[day] !== undefined) {
          dailyCounts[daysOfWeek[day]] = count;
        }
      }
      setTrendData(fetchRealTimeTrend(dailyCounts));
    }
  }, [last7daysUsersData]);

  if (usersDataIsLoading || last7daysUsersDataIsLoading) return <Loading />;

  const updatedChartOptions = {
    ...trendData.options,
    title: {
      text: `Clientes Registados - ${new Date(
        new Date().setDate(new Date().getDate() - 7)
      ).toLocaleDateString("pt-PT")} até ${new Date().toLocaleDateString(
        "pt-PT"
      )}`,
      align: "left",
      style: {
        color: theme.palette.secondary[400],
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    xaxis: {
      ...trendData.options.xaxis,
      labels: {
        style: {
          colors: theme.palette.neutral.main,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.neutral.main,
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
    },
    grid: {
      borderColor: theme.palette.neutral[600],
    },
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap={2}
      >
        {/* Trend Line Chart */}
        <Box width={{ xs: "100%", md: "70%" }} mt={3} position="relative">
          {usersDataError ? (
            <ErrorOverlay
              error={usersDataError}
              dataName={"Gráfico com os últimos clientes"}
              isButtonVisible={false}
            />
          ) : (
            <Card sx={{ backgroundColor: "transparent" }}>
              <CardContent>
                <Box position="relative" height="385px">
                  <Chart
                    options={updatedChartOptions}
                    series={trendData.series}
                    type="line"
                    height={395}
                    width="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Latest Users */}
        <Box width={{ xs: "100%", md: "30%" }} position="relative">
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: theme.palette.secondary.main }}
          >
            Últimos Registos
          </Typography>
          <Divider />
          {last7daysUsersDataError ? (
            <ErrorOverlay
              isButtonVisible={false}
              error={last7daysUsersDataError}
              dataName={"Últimos registos"}
            />
          ) : (
            <Box display="flex" flexDirection="column" gap={1.75}>
              {usersDataLast5.slice(0, 4).map((user) => (
                <Box key={user.userId}>
                  <Card sx={{ backgroundColor: "transparent" }}>
                    <CardContent sx={{ padding: 1 }}>
                      <Box display="flex" alignItems="center">
                        <Avatar src={user.profilePictureUrl}></Avatar>
                        <Box ml={2} textAlign="left">
                          <Typography variant="h6" noWrap>
                            {user.fname + " " + user.lname}
                          </Typography>
                          <Typography noWrap>{user.email}</Typography>
                          <Typography noWrap>
                            Plano: {user.signatures[0]?.gymPlan.name}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
