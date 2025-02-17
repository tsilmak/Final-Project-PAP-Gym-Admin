import { useState, useMemo } from "react";
import { useTheme } from "@emotion/react";
import Header from "components/common/Header";
import { useNavigate } from "react-router-dom";
import { useGetAllPaymentsQuery } from "state/api";
import { FormatDate } from "components/common/FormatDate";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import SearchBar from "../../../components/common/SearchBar";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";

const PaymentsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleNavigate = (paymentId) => {
    navigate(`/pagamentos/${paymentId}`);
  };

  const {
    data: dataPayments = [],
    error: errorPayments,
    isLoading: isLoadingPayments,
  } = useGetAllPaymentsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const rowsPerPage = 15;

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const filteredRows = useMemo(() => {
    const searchWords = searchQuery.toLowerCase().split(" ");
    return dataPayments.filter((payment) => {
      const fullClientName = payment.signature?.user
        ? `${payment.signature.user.fname} ${payment.signature.user.lname}`.toLowerCase()
        : "";

      // Extract month and year from payment date
      const paymentDate = new Date(payment.date);
      const paymentMonth = (paymentDate.getMonth() + 1).toString(); // Months are zero-indexed
      const paymentYear = paymentDate.getFullYear().toString();

      const matchesMonth = selectedMonth
        ? paymentMonth === selectedMonth
        : true;
      const matchesYear = selectedYear ? paymentYear === selectedYear : true;

      return (
        matchesMonth &&
        matchesYear &&
        searchWords.every(
          (word) =>
            payment._id?.toLowerCase().includes(word) ||
            payment.date?.toLowerCase().includes(word) ||
            fullClientName.includes(word) ||
            payment.amount.toString().includes(word) ||
            payment.paymentStatus?.paymentStatusName
              .toLowerCase()
              .includes(word)
        )
      );
    });
  }, [dataPayments, searchQuery, selectedMonth, selectedYear]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const displayedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return filteredRows.slice(startIdx, endIdx);
  }, [filteredRows, currentPage, rowsPerPage]);

  if (errorPayments)
    return (
      <ErrorOverlay error={errorPayments} dataName={"Todos os pagamentos"} />
    );

  return (
    <>
      <Header title="Pagamentos" subtitle={"Visualize os pagamentos"} />

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <Box sx={{ ml: "5rem", mr: "5rem", mx: { xs: "1rem", md: "5rem" } }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Mês</InputLabel>
            <Select value={selectedMonth} onChange={handleMonthChange}>
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {[...Array(12).keys()].map((month) => (
                <MenuItem key={month + 1} value={(month + 1).toString()}>
                  {new Date(0, month).toLocaleString("pt-pt", {
                    month: "long",
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Ano</InputLabel>
            <Select value={selectedYear} onChange={handleYearChange}>
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {Array.from(
                new Set(
                  dataPayments.map((payment) =>
                    new Date(payment.date).getFullYear().toString()
                  )
                )
              ).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell>ID do Pagamento</TableCell>
                <TableCell>Nome do Cliente</TableCell>
                <TableCell>Data do Pagamento</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingPayments ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ backgroundColor: theme.palette.background.alt }}
                  >
                    <Loading />
                  </TableCell>
                </TableRow>
              ) : displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ backgroundColor: theme.palette.background.alt }}
                  >
                    <Typography color="textSecondary">
                      Nenhum pagamento encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((dataPayments) => (
                  <TableRow
                    key={dataPayments.paymentId}
                    sx={{ backgroundColor: theme.palette.background.alt }}
                  >
                    <TableCell>{dataPayments.paymentId}</TableCell>
                    <TableCell>
                      {dataPayments.signature.user.fname +
                        " " +
                        dataPayments.signature.user.fname}
                    </TableCell>
                    <TableCell>{FormatDate(dataPayments.date)}</TableCell>
                    <TableCell>
                      {dataPayments.amount.toFixed(2) + "€"}
                    </TableCell>
                    <TableCell>
                      {dataPayments.paymentStatus.paymentStatusName}
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="secondary"
                        sx={{
                          cursor: "pointer",
                          display: "inline-block",
                          "&:hover": {
                            boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.2)",
                          },
                        }}
                        onClick={() => handleNavigate(dataPayments.paymentId)}
                      >
                        Rever
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default PaymentsPage;
