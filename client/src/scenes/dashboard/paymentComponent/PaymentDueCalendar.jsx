import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  LocalizationProvider,
  DateCalendar,
  PickersDay,
  DayCalendarSkeleton,
} from "@mui/x-date-pickers";
import { useGetAllPaymentsQuery } from "state/api";
import { Box, Button, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOverlay from "components/common/ErrorOverlay";
import { useTheme } from "@emotion/react";

const statusStyles = {
  Pendente: {
    color: "#fb8500",
    emoji: "⏳",
    tooltip: "Aguarda Pagamento",
  },
  Pago: {
    color: "#058c42",
    emoji: "✅",
    tooltip: "Pagamento recebido",
  },
  Cancelado: {
    color: "#8d0801",
    emoji: "❌",
    tooltip: "Pagamento cancelado",
  },
  Reembolsado: {
    color: "#0d47a1",
    emoji: "🔄",
    tooltip: "Pagamento revertido",
  },
};

function CustomDay({
  highlightedDays = [],
  day,
  outsideCurrentMonth,
  onClick,
  ...other
}) {
  const dayDate = dayjs(day.toDate());

  const paymentsForDay = highlightedDays.filter((d) =>
    d.date.isSame(dayDate, "day")
  );

  const handleClick = (event) => {
    if (paymentsForDay.length > 0) {
      event.stopPropagation();
      onClick(day, paymentsForDay);
    }
  };

  return (
    <Tooltip
      title={
        paymentsForDay.length > 0
          ? paymentsForDay
              .map((payment) => {
                const status = statusStyles[payment.status];
                return status
                  ? `${status.tooltip} - ${payment.amount}€`
                  : `Estado desconhecido - ${payment.amount}€`;
              })
              .join(", ")
          : ""
      }
    >
      <Badge
        overlap="circular"
        badgeContent={
          paymentsForDay.length > 0
            ? statusStyles[paymentsForDay[0].status]?.emoji
            : undefined
        }
        sx={{
          bgcolor:
            paymentsForDay.length > 0
              ? statusStyles[paymentsForDay[0].status]?.color
              : "transparent",
        }}
        onClick={handleClick}
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
        />
      </Badge>
    </Tooltip>
  );
}

export default function PaymentDueCalendar() {
  const theme = useTheme();
  const {
    data: dataPayments = [],
    error: errorPayments,
    isLoading: isLoadingPayments,
  } = useGetAllPaymentsQuery();

  const [highlightedDays, setHighlightedDays] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const navigate = useNavigate();
  const handleNavigate = (paymentId) => {
    navigate(`/pagamentos/${paymentId}`);
  };

  useEffect(() => {
    if (dataPayments.length) {
      const payments = dataPayments.map((payment) => ({
        date: dayjs(payment.date).startOf("day"),
        status: payment.paymentStatus.paymentStatusName,
        amount: payment.amount,
        _id: payment.paymentId,
      }));

      setHighlightedDays(payments);
    }
  }, [dataPayments]);

  const handleDayClick = (day, paymentsForDay) => {
    if (paymentsForDay.length > 0) {
      console.log(paymentsForDay);
      const formattedContent = (
        <>
          <Typography>
            Detalhes dos pagamentos para o dia {day.format("DD/MM/YYYY")}:
          </Typography>
          <ul>
            {paymentsForDay.map((payment) => (
              <li key={payment._id}>
                <strong>Valor:</strong> {payment.amount}€ -{" "}
                <strong>Estado:</strong> {payment.status}
                <Button
                  color="secondary"
                  onClick={() => handleNavigate(payment._id)}
                >
                  Rever Pagamento
                </Button>
              </li>
            ))}
          </ul>
        </>
      );
      setDialogContent(formattedContent);
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Box>
        <Typography variant="h5" align="center" sx={{ padding: "16px 0" }}>
          Calendário com todos os pagamentos
        </Typography>
        <Divider />
      </Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ position: "relative", width: "100%", height: "390px" }}>
          {errorPayments ? (
            <ErrorOverlay
              isButtonVisible={false}
              error={errorPayments}
              dataName={"Calendário com os pagamentos"}
            />
          ) : (
            <DateCalendar
              sx={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
                width: "100%",
              }}
              value={selectedDate}
              onChange={setSelectedDate}
              loading={isLoadingPayments}
              renderLoading={() => <DayCalendarSkeleton />}
              slots={{ day: CustomDay }}
              slotProps={{
                day: {
                  highlightedDays,
                  onClick: handleDayClick,
                },
              }}
            />
          )}
        </Box>

        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle
            sx={{
              backgroundColor: theme.palette.background.alt,
            }}
          >
            Detalhes dos Pagamentos
          </DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: theme.palette.background.alt,
            }}
          >
            {dialogContent || "Nenhum detalhe disponível"}
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}
