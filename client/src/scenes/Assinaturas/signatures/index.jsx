import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Typography,
  Pagination,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import {
  useGetSignatureQuery,
  useGetPaymentsBySignatureIdQuery,
} from "state/api";
import Header from "components/common/Header";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { FormatDate } from "components/common/FormatDate";
import SearchBar from "../../../components/common/SearchBar";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";

const PaymentsDetails = ({ signatureId }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: payments = [], error } =
    useGetPaymentsBySignatureIdQuery(signatureId);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const displayedPayments = payments.slice(startIdx, endIdx);

  const totalPages = Math.ceil(payments.length / rowsPerPage);

  const handleNavigate = (paymentId) => {
    navigate(`/pagamentos/${paymentId}`);
  };

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell>ID do Pagamento</TableCell>
            <TableCell>Data do Pagamento</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedPayments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{ backgroundColor: theme.palette.background.alt }}
              >
                {error ? (
                  <Typography color="error">
                    Nenhum pagamento encontrado: {error.message}
                  </Typography>
                ) : (
                  <Typography color="textSecondary">
                    Nenhum pagamento encontrado
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ) : (
            displayedPayments.map((payment) => (
              <TableRow
                key={payment.paymentId}
                sx={{ backgroundColor: theme.palette.background.alt }}
              >
                <TableCell>{payment.paymentId}</TableCell>
                <TableCell>{FormatDate(payment.date)}</TableCell>
                <TableCell>{`${payment.amount.toFixed(2)}€`}</TableCell>
                <TableCell>{payment.paymentStatus.paymentStatusName}</TableCell>
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
                    onClick={() => handleNavigate(payment.paymentId)}
                  >
                    Rever
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
    </>
  );
};

const SignatureRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  const membershipNumber = row.user?.membershipNumber || "N/A";
  const clientFullName = `${row.user?.fname || "Desconhecido"} ${
    row.user?.lname || "Client"
  }`;
  const gymPlanName = row.gymPlan?.name || "Plano desconhecido";

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Link
            to={`/assinaturas/${row.signatureId}`}
            style={{ textDecoration: "underline", color: "inherit" }}
          >
            {row.signatureId}
          </Link>
        </TableCell>
        <TableCell>{membershipNumber}</TableCell>
        <TableCell>
          <Link
            to={`/users/${row.userId}`}
            style={{ textDecoration: "underline", color: "inherit" }}
          >
            {clientFullName}
          </Link>
        </TableCell>
        <TableCell>{gymPlanName}</TableCell>
        <TableCell>{FormatDate(row.startDate)}</TableCell>
        <TableCell>{FormatDate(row.endDate) || "N/A"}</TableCell>
        <TableCell>{row.isActive ? "Ativa" : "Inativa"}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <PaymentsDetails signatureId={row.signatureId} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const SignaturesPage = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(null);
  const rowsPerPage = 7;
  const { data: dataSignature = [], error, isLoading } = useGetSignatureQuery();

  const toggleActiveFilter = () => {
    if (activeFilter === null) setActiveFilter(true);
    else if (activeFilter === true) setActiveFilter(false);
    else setActiveFilter(null);
  };

  const filteredRows = useMemo(() => {
    const searchWords = searchQuery.toLowerCase().split(" ");
    const signatureData = dataSignature?.data || [];

    return signatureData.filter((signature) => {
      const signatureId = String(signature.signatureId || "").toLowerCase();
      const membershipNumber = String(signature.user?.membershipNumber || "");
      const fullName = `${signature.user?.fname || ""} ${
        signature.user?.lname || ""
      }`.toLowerCase();
      const gymPlanName = (signature.gymPlan?.name || "").toLowerCase();

      const isStatusMatched =
        activeFilter === null || signature.isActive === activeFilter;

      return (
        isStatusMatched &&
        searchWords.every(
          (word) =>
            signatureId.includes(word) ||
            membershipNumber.includes(word) ||
            fullName.includes(word) ||
            gymPlanName.includes(word)
        )
      );
    });
  }, [dataSignature, searchQuery, activeFilter]);

  const displayedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return filteredRows.slice(startIdx, endIdx);
  }, [filteredRows, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  if (error)
    return <ErrorOverlay error={error} dataName={"Todas as assinaturas"} />;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Header title="Assinaturas" subtitle="Visualize as assinaturas" />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: { xs: "calc(100% - 2rem)", md: "calc(100% - 10rem)" },
          margin: "0 auto",
          backgroundColor: theme.palette.background.default,
          borderRadius: "8px",
          boxShadow: theme.shadows[3],
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.secondary.main }}>
              <TableCell />
              <TableCell sx={{ color: "black" }}>ID da Assinatura</TableCell>
              <TableCell sx={{ color: "black" }}>ID Membro</TableCell>
              <TableCell sx={{ color: "black" }}>Nome do Cliente</TableCell>
              <TableCell sx={{ color: "black" }}>Plano</TableCell>
              <TableCell sx={{ color: "black" }}>Data Início</TableCell>
              <TableCell sx={{ color: "black" }}>Data Fim</TableCell>
              <TableCell
                sx={{
                  color: "black",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={toggleActiveFilter}
              >
                Estado{" "}
                {activeFilter === null
                  ? ""
                  : activeFilter
                  ? "Ativa"
                  : "Inativo"}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Loading />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && displayedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              displayedRows.length > 0 &&
              displayedRows.map((row) => (
                <SignatureRow key={row.signatureId} row={row} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default SignaturesPage;
