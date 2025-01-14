import React from "react";
import { useTheme } from "@emotion/react";
import { Box, Grid, Button } from "@mui/material";
import {
  AttachMoney,
  Group,
  TrendingUp,
  Notifications,
} from "@mui/icons-material";

import Header from "../../components/common/Header";
import PaymentDueCalendar from "scenes/dashboard/paymentComponent/PaymentDueCalendar";
import StatBox from "./dashComponents/StatBox";
import GymPlansChart from "scenes/dashboard/dashComponents/GymPlansChart";
import FlexBetween from "../../components/common/FlexBetween";
import PaymentsTotal from "scenes/dashboard/paymentComponent/PaymentsTotal";
import PaymentsPercentageChange from "scenes/dashboard/paymentComponent/PaymentsPercentageChange";
import ActiveSignaturesCount from "scenes/dashboard/signatureComponent/ActiveSignaturesCount";
import ActiveSignaturesPercentageChange from "./signatureComponent/ActiveSignaturesPercentageChange";
import UsersByMonthPercentageChange from "scenes/dashboard/usersComponent/UsersByMonthPercentageChange";
import UsersTotal from "scenes/dashboard/usersComponent/UsersTotal";
import {
  useGetAllPaymentsQuery,
  useGetSignatureQuery,
  useGetUsersQuery,
} from "state/api";
import { useSelector } from "react-redux";
import UsersToRevenueChart from "./dashComponents/UsersToRevenueChart";
import AdminDashboard from "./dashComponents/RecentUsersRegistration";
import { selectCurrentUser } from "state/authSlice";

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);

  const { isLoading: isLoadingUsersData } = useGetUsersQuery();
  const { isLoading: isLoadingPaymentsData } = useGetAllPaymentsQuery();
  const { isLoading: isLoadingSignatureData } = useGetSignatureQuery();

  const theme = useTheme();

  return (
    <>
      {/* HEADER AND BUTTONS */}
      <FlexBetween>
        <Header
          title={`Olá ${user?.fname + " " + user?.lname}`}
          subtitle="Tira proveito da tua dashboard!"
        />
      </FlexBetween>

      <Box sx={{ mx: { xs: "1rem", md: "5rem" } }}>
        {/* STATISTICS GRID */}
        <Grid container spacing={3} sx={{ mb: "2rem" }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatBox
              isLoading={isLoadingUsersData}
              title="Clientes Totais"
              value={<UsersTotal />}
              increase={<UsersByMonthPercentageChange />}
              description="Desde o último mês"
              icon={
                <Group
                  sx={{ color: theme.palette.secondary.main, fontSize: "26px" }}
                />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatBox
              isLoading={isLoadingPaymentsData}
              title="Receita Total"
              value={<PaymentsTotal />}
              increase={<PaymentsPercentageChange />}
              description="Desde o último mês"
              icon={
                <AttachMoney
                  sx={{ color: theme.palette.secondary.main, fontSize: "26px" }}
                />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatBox
              isLoading={isLoadingSignatureData}
              title="Assinaturas Ativas Totais"
              value={<ActiveSignaturesCount />}
              increase={<ActiveSignaturesPercentageChange />}
              description="Desde o último mês"
              icon={
                <TrendingUp
                  sx={{ color: theme.palette.secondary.main, fontSize: "26px" }}
                />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatBox
              title="Capacidade total"
              value="0/100"
              description="Ver histórico"
              icon={
                <Notifications
                  sx={{ color: theme.palette.secondary.main, fontSize: "26px" }}
                />
              }
            />
          </Grid>
        </Grid>
        {/* MAIN CONTENT AREA */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {/* Admin Dashboard */}
            <Box
              sx={{
                backgroundColor: theme.palette.background.alt,
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: theme.shadows[2],
              }}
            >
              <AdminDashboard />
            </Box>
            <Box
              sx={{
                mt: "1.25rem",
                backgroundColor: theme.palette.background.alt,
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: theme.shadows[2],
              }}
            >
              <UsersToRevenueChart />
            </Box>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Box
              sx={{
                boxShadow: theme.shadows[2],
                backgroundColor: theme.palette.background.alt,
                borderRadius: "8px",
              }}
            >
              <GymPlansChart />
            </Box>
            <Box
              sx={{
                mt: "1.25rem",
                boxShadow: theme.shadows[2],
                backgroundColor: theme.palette.background.alt,
                borderRadius: "8px",
              }}
            >
              <PaymentDueCalendar />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
