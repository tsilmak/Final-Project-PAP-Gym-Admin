import { useTheme } from "@emotion/react";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import React from "react";
import { useGetGymPlanQuery } from "state/api";
import ErrorOverlay from "components/common/ErrorOverlay";

const GymPlansChart = () => {
  const theme = useTheme();
  const {
    data: gymPlansResponse,
    isLoading: gymPlansLoading,
    error: gymPlansError,
  } = useGetGymPlanQuery();
  console.log(gymPlansResponse);
  const colors = [
    theme.palette.secondary[500],
    theme.palette.secondary[300],
    theme.palette.secondary[200],
    theme.palette.secondary[100],
    theme.palette.primary.text,
  ];
  const gymPlans = Array.isArray(gymPlansResponse?.data)
    ? gymPlansResponse.data
    : [];

  const formattedData = gymPlans
    .filter((plan) => plan.clientsCount !== 0 && plan.price !== 0)
    .map((plan, i) => {
      return {
        id: plan.gymPlanId,
        label: plan.name,
        clientsCount: plan.clientsCount,
        price: plan.price,
        value: plan.clientsCount * plan.price,
        color: colors[i % colors.length],
      };
    });
  const totalAmount = gymPlans
    .map((plan) => plan.clientsCount * plan.price)
    .reduce((acc, amount) => acc + amount, 0);

  return (
    <>
      <Box>
        <Typography variant="h5" align="center" sx={{ padding: "16px 0" }}>
          Previsão da Receita sobre os Planos
        </Typography>
        <Divider />
      </Box>
      <Box
        height={"450px"}
        width="100%"
        minHeight="100%"
        minWidth="100%"
        position="relative"
      >
        {gymPlansLoading ? (
          <CircularProgress />
        ) : gymPlansError ? (
          <ErrorOverlay
            isButtonVisible={false}
            error={gymPlansError}
            dataName={"Gráifco sobre a receita dos planos"}
          />
        ) : (
          <>
            <ResponsivePie
              data={formattedData}
              colors={{ datum: "data.color" }}
              margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
              sortByValue={true}
              innerRadius={0.4}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{
                from: "color",
                modifiers: [["darker", 0.2]],
              }}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={1}
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
              }}
              tooltip={({ datum }) => (
                <div
                  style={{
                    padding: "12px",
                    color: theme.palette.primary,
                    background: theme.palette.background.alt,
                    borderRadius: "4px",
                    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`,
                  }}
                >
                  <strong>{datum.label}</strong>
                  <br />
                  {`Número de Clientes: ${datum.data.clientsCount}`} <br />
                  {`Total estimado para o próximo mês: ${
                    datum.data.price * datum.data.clientsCount
                  }€`}
                </div>
              )}
            />

            {/* Centered Total Amount */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              color={theme.palette.secondary[400]}
              sx={{
                transform: "translate(-50%, -50%)",
              }}
            >
              <Typography variant="h5">{`${totalAmount.toFixed(
                2
              )}€`}</Typography>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default GymPlansChart;
