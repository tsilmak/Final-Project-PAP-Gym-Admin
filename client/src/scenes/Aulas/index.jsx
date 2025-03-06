import React, { useState, useRef, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ptLocale from "@fullcalendar/core/locales/pt";
import { useTheme } from "@emotion/react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid2,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  Autocomplete,
  Snackbar,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { ColorPicker, useColor } from "react-color-palette";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import "react-color-palette/css";
import dayjs from "dayjs";
import Header from "components/common/Header";
import {
  useCreateClassMutation,
  useCreateClassTypeMutation,
  useDeleteClassByIdMutation,
  useDeleteClassTypeMutation,
  useGetAllClassesQuery,
  useGetAllClassTypeQuery,
  useGetAllEmployeesQuery,
  useGetGymPlanQuery,
  useUpdateClassMutation,
  useUpdateClassTypeMutation,
} from "state/api";
import ErrorOverlay from "components/common/ErrorOverlay";

export const ClassTypesSidebar = () => {
  const theme = useTheme();
  const {
    data: dataClassType,
    isLoading: isLoadingClassTypes,
    error: errorClassTypes,
  } = useGetAllClassTypeQuery();
  const [upload, { isLoading }] = useCreateClassTypeMutation();

  const [edit, { isLoading: isLoadingUpdateClassType }] =
    useUpdateClassTypeMutation();
  const [deleteClassType] = useDeleteClassTypeMutation();
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useColor("#000000"); // Default color

  const [editingClassType, setEditingClassType] = useState(null); // for edit mode
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Severity level for snackbar

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", color: "" },
  });

  const handleDelete = async (classTypeId) => {
    try {
      await deleteClassType(classTypeId);
      setSnackbarMessage("Tipo de aula eliminado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage("Ocorreu um erro ao eliminar o tipo de aula");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const handleOpen = () => {
    reset({ name: "", color: "" });
    setOpen(true);
    setShowColorPicker(true);
    setEditingClassType(null);
  };

  const handleClose = () => {
    setOpen(false);
    setShowColorPicker(false);
  };

  const handleEdit = (classType) => {
    setValue("name", classType.name);
    setValue("color", classType.color);
    const colorToSet = classType.color
      ? {
          hex: classType.color || "#000000",
          rgb: classType.color.rgb || { r: 0, g: 0, b: 0, a: 1 },
          hsv: classType.color.hsv || { h: 0, s: 0, v: 0, a: 1 },
        }
      : {
          hex: "#000000",
          rgb: { r: 0, g: 0, b: 0, a: 1 },
          hsv: { h: 0, s: 0, v: 0, a: 1 },
        };
    setColor(colorToSet);
    setOpen(true);
    setShowColorPicker(true);
    setEditingClassType(classType);
  };
  const onSubmitClassType = async (data) => {
    try {
      if (editingClassType) {
        const updatedData = {
          ...editingClassType,
          ...data,
          color: color.hex,
        };
        await edit(updatedData).unwrap();
        setSnackbarMessage("Tipo de aula atualizado com sucesso!");
      } else {
        const colorHexData = { ...data, color: color.hex };
        await upload(colorHexData).unwrap();
        setSnackbarMessage("Tipo de aula criado com sucesso!");
      }
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleClose();
    } catch (error) {
      setSnackbarMessage(error?.data?.error || "Ocorreu um erro!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredClassTypes = Array.isArray(dataClassType)
    ? dataClassType.filter((type) =>
        type.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Card
      sx={{
        width: 350,
        top: "1rem",
        bgcolor: theme.palette.background.alt,
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight="bold">
            Tipos de aula
          </Typography>
          <Tooltip title="Adicionar um tipo de aula">
            <IconButton color="secondary" onClick={handleOpen}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Procurar por tipos de aula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            bgcolor: theme.palette.background.default,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">Nome</TableCell>
                <TableCell align="center">Cor</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingClassTypes ? (
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={`skeleton-row-${index}`}>
                    <TableCell colSpan={3}>
                      <Skeleton
                        variant="rounded"
                        height={20}
                        sx={{ my: "0.5rem" }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : errorClassTypes ? (
                <TableRow key="error-row">
                  <TableCell colSpan={3} align="center">
                    <ErrorOverlay error={errorClassTypes} />
                  </TableCell>
                </TableRow>
              ) : filteredClassTypes.length > 0 ? (
                filteredClassTypes
                  .slice(
                    (currentPage - 1) * rowsPerPage,
                    currentPage * rowsPerPage
                  )
                  .map((type) => (
                    <TableRow key={type.classTypeId}>
                      <TableCell>
                        <Typography
                          sx={{
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block",
                            wordWrap: "break-word",
                          }}
                        >
                          {type.name.length > 10
                            ? `${type.name.slice(0, 10)}...`
                            : type.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            width: 80,
                            height: 20,
                            backgroundColor: type.color,
                            borderRadius: 1,
                            border: "1px solid rgba(0,0,0,0.1)",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEdit(type)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(type.classTypeId)}
                            disabled={type.hasAssociatedClasses}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow key="no-results-row">
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum resultado foi encontrado...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil((dataClassType?.length || 0) / rowsPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            size="small"
          />
        </Box>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
          <DialogTitle sx={{ bgcolor: theme.palette.background.alt }}>
            {editingClassType ? "Editar tipo de aula" : "Criar um tipo de aula"}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmitClassType)}>
            <DialogContent
              sx={{ minHeight: "500px", bgcolor: theme.palette.background.alt }}
            >
              <Grid2 container spacing={4}>
                <Grid2 xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Nome é obrigatorio" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nome"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid2>
                <Grid2 xs={12}>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cor"
                        value={color.hex}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        error={!!errors.color}
                        helperText={errors.color?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  backgroundColor: color.hex,
                                  borderRadius: 0.5,
                                  border: "1px solid rgba(0,0,0,0.1)",
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                  {showColorPicker && (
                    <ColorPicker
                      hideInput={["rgb", "hsv"]}
                      color={color}
                      onChange={setColor}
                    />
                  )}
                </Grid2>
              </Grid2>
            </DialogContent>
            <DialogActions sx={{ bgcolor: theme.palette.background.alt }}>
              <Button onClick={handleClose} color="secondary">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {isLoadingUpdateClassType || isLoading
                  ? "A Guardar..."
                  : "Guardar"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

const MapaAulas = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);
  const { data: dataClassType } = useGetAllClassTypeQuery();
  const { data: dataEmployees } = useGetAllEmployeesQuery();
  const { data: dataGymPlans } = useGetGymPlanQuery();

  const [upload] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassByIdMutation();
  const { data: classes, refetch } = useGetAllClassesQuery();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      classType: "",
      instructors: "",
      location: "",
      isOnline: false,
      maxParticipants: 20,
      onlineClassUrl: "",
      startTime: "",
      endTime: "",
      classDate: "",
      repeatSince: "",
      repeatUntil: "",
      repeatDays: {
        segunda: false,
        terça: false,
        quarta: false,
        quinta: false,
        sexta: false,
        sabádo: false,
        domingo: false,
      },
      isRepeating: false,
      isExclusive: false,
      exclusiveGymPlan: "",
    },
    mode: "onBlur",
  });

  const isRepeating = watch("isRepeating");
  const isExclusive = watch("isExclusive");
  const isOnline = watch("isOnline");
  const isFullDay = watch("isFullDay");

  const handleDateClick = useCallback(
    (info) => {
      const adjustedEndDate = dayjs(info.end);

      const isMultiDaySelection = !dayjs(info.start).isSame(
        adjustedEndDate,
        "day"
      );

      const repeatDays = {
        segunda: false,
        terça: false,
        quarta: false,
        quinta: false,
        sexta: false,
        sabádo: false,
        domingo: false,
      };

      if (isMultiDaySelection) {
        // Loop through each day in the selected range
        let currentDate = dayjs(info.start);
        while (
          currentDate.isBefore(adjustedEndDate, "day") ||
          currentDate.isSame(adjustedEndDate, "day")
        ) {
          // Get the day of the week as a number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
          const dayOfWeek = currentDate.day();

          // Set the corresponding day to true in repeatDays
          switch (dayOfWeek) {
            case 0:
              repeatDays.domingo = true;
              break;
            case 1:
              repeatDays.segunda = true;
              break;
            case 2:
              repeatDays.terça = true;
              break;
            case 3:
              repeatDays.quarta = true;
              break;
            case 4:
              repeatDays.quinta = true;
              break;
            case 5:
              repeatDays.sexta = true;
              break;
            case 6:
              repeatDays.sabádo = true;
              break;
            default:
              break;
          }

          // Move to the next day
          currentDate = currentDate.add(1, "day");
        }
      }

      // Set up the form fields with the initial values
      reset({
        classType: "",
        instructors: "",
        location: "",
        isOnline: false,
        isFullDay: false,
        maxParticipants: 20,
        startTime: dayjs(info.start).format("HH:mm"),
        endTime: dayjs(adjustedEndDate).format("HH:mm"),
        classDate: dayjs(info.start).format("YYYY-MM-DD"),
        repeatSince: isMultiDaySelection
          ? dayjs(info.start).format("YYYY-MM-DD")
          : "",
        repeatUntil: isMultiDaySelection
          ? dayjs(adjustedEndDate).format("YYYY-MM-DD")
          : "",
        repeatDays, // Use the populated repeatDays object
        isRepeating: isMultiDaySelection, // Set isRepeating to true if start and adjusted end are on separate days
        isExclusive: false,
      });

      // Set the selected start date and open the form
      setSelectedDate(dayjs(info.start));
      setOpen(true);
    },
    [reset]
  );

  const handleClose = useCallback(() => {
    reset({
      classType: "",
      instructors: "",
      location: "",
      isOnline: false,
      isFullDay: false,
      onlineClassUrl: "",
      maxParticipants: 20,
      startTime: "",
      endTime: "",
      classDate: "",
      repeatSince: "",
      repeatUntil: "",
      repeatDays: {
        segunda: false,
        terça: false,
        quarta: false,
        quinta: false,
        sexta: false,
        sabádo: false,
        domingo: false,
      },
      isRepeating: false,
    });
    setSelectedEvent(null);
    setOpen(false);
  }, [reset]);

  const handleEventClick = useCallback(
    (info) => {
      setSelectedEvent(info.event);

      // Extract all backend data
      const eventData = info.event.extendedProps;
      const classId = info.event._def.publicId;
      // Format start and end times using dayjs
      const startTime = dayjs(info.event.start).format("HH:mm");
      const endTime = dayjs(info.event.end).format("HH:mm");

      // Map backend fields to form fields
      reset({
        classId: classId,
        classType: eventData.classType || "",
        location: eventData.location || "",
        maxParticipants: eventData.maxParticipants || 0,
        startTime,
        endTime,
        classDate: dayjs(info.event.start).format("YYYY-MM-DD"),
        isOnline: eventData.isOnline || false,
        isFullDay: eventData.isFullDay || false,
        isExclusive: eventData.isExclusive || false,
        instructors: eventData.instructors || [],
        onlineClassUrl: eventData.onlineClassUrl || "",
        exclusiveGymPlan: eventData.exclusiveGymPlans || [],
        repeatSince: eventData.repeatSince || null,
        repeatUntil: eventData.repeatUntil || null,
      });

      setOpen(true);
    },
    [reset]
  );
  const handleRemoveClass = async (classId) => {
    try {
      await deleteClass({ classId }).unwrap();
    } catch (error) {
      console.error("Error removing class:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        classType: data.classType,
        location: data.location,
        maxParticipants: data.maxParticipants,
        startTime: data.startTime,
        endTime: data.endTime,
        classDate: data.classDate,
        isOnline: data.isOnline,
        isFullDay: data.isFullDay,
        isExclusive: data.isExclusive,
        instructors: data.instructors,
        onlineClassUrl: data.isOnline ? data.onlineClassUrl : undefined,
        exclusiveGymPlan: data.isExclusive ? data.exclusiveGymPlan : [],
      };

      if (selectedEvent) {
        await updateClass({
          classId: selectedEvent._def.publicId,
          data: payload,
        }).unwrap();
      } else if (data.isRepeating) {
        await handleRecurringClasses(data, payload);
      } else {
        await upload({ data: payload }).unwrap();
      }

      await refetch();
      handleClose();
    } catch (error) {
      console.error("Error during upload:", error);
      alert(
        error.message || "Erro ao salvar a aula. Por favor, tente novamente."
      );
    }
  };

  const handleRecurringClasses = async (data, payload) => {
    const startDate = new Date(data.repeatSince);
    const endDate = new Date(data.repeatUntil);

    if (startDate > endDate) {
      throw new Error("A data de início deve ser anterior à data de término");
    }

    const daysOfWeek = [
      { key: "segunda", index: 1 },
      { key: "terça", index: 2 },
      { key: "quarta", index: 3 },
      { key: "quinta", index: 4 },
      { key: "sexta", index: 5 },
      { key: "sabádo", index: 6 },
      { key: "domingo", index: 0 },
    ];

    const hasSelectedDays = daysOfWeek.some((day) => data.repeatDays[day.key]);

    if (!hasSelectedDays) {
      throw new Error("Selecione pelo menos um dia para aulas recorrentes");
    }

    const recurringClasses = [];
    while (startDate <= endDate) {
      const dayOfWeek = startDate.getDay();
      const matchingDay = daysOfWeek.find(
        (day) => day.index === dayOfWeek && data.repeatDays[day.key]
      );

      if (matchingDay) {
        recurringClasses.push({
          ...payload,
          classDate: startDate.toISOString().split("T")[0],
        });
      }
      startDate.setDate(startDate.getDate() + 1);
    }

    try {
      const uploadPromises = recurringClasses.map((recurringClass) =>
        upload({ data: recurringClass }).unwrap()
      );
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading recurring classes:", error);
      throw new Error("Erro ao criar aulas recorrentes");
    }
  };

  return (
    <>
      <Header title="Mapa de Aulas" subtitle="Administração de Aulas" />
      <Box
        sx={{
          display: "flex",
          mx: "5rem",
          gap: 5,
          mx: { xs: "1rem", md: "5rem" },
        }}
      >
        <Box
          sx={{
            flex: 1,
          }}
        >
          <FullCalendar
            ref={calendarRef}
            height="77vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,today,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={false}
            selectable={true}
            selectMirror={false}
            dayMaxEvents={true}
            locale={ptLocale}
            select={handleDateClick}
            eventClick={handleEventClick}
            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            events={classes}
          />
        </Box>

        <Box sx={{ width: "20rem" }}>
          <ClassTypesSidebar />
        </Box>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            textAlign: "center",
            py: 2,
            bgcolor: theme.palette.background.default,
          }}
        >
          {selectedEvent ? "Editar a Aula" : "Criar Uma Nova Aula"}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{ px: 3, pt: 2, bgcolor: theme.palette.background.default }}
          >
            {/* Class Type Field */}
            <Grid2 xs={12} sx={{ mb: 2 }}>
              <Controller
                name="classType"
                control={control}
                rules={{ required: "O tipo de aula é obrigatório" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.classType}>
                    <Autocomplete
                      {...field}
                      options={dataClassType}
                      getOptionLabel={(option) => option.name || ""} // Show option name, default to empty string
                      isOptionEqualToValue={(option, value) =>
                        option.classTypeId === value?.classTypeId
                      }
                      value={
                        dataClassType?.find(
                          (option) => option.classTypeId === field.value
                        ) || null
                      }
                      onChange={(_, value) =>
                        field.onChange(value ? value.classTypeId : "")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tipo de Aula"
                          variant="outlined"
                          error={!!errors.classType}
                        />
                      )}
                    />
                    <FormHelperText>{errors.classType?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid2>

            {/* Instructor Field */}
            <Grid2 xs={12} sx={{ mb: 2 }}>
              <Controller
                name="instructors"
                control={control}
                rules={{ required: "É necessário pelo menos um instrutor" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.instructors}>
                    <Autocomplete
                      {...field}
                      multiple // Enable multiple selections
                      options={dataEmployees}
                      getOptionLabel={(option) =>
                        `${option.fname} ${option.lname} (${option.role.rolesName})` ||
                        ""
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.userId === value?.userId
                      }
                      value={
                        (Array.isArray(field.value) ? field.value : []).map(
                          (id) =>
                            dataEmployees.find((option) => option.userId === id)
                        ) || []
                      }
                      onChange={(_, value) => {
                        field.onChange(value ? value.map((v) => v.userId) : []);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Treinador"
                          variant="outlined"
                          error={!!errors.instructors}
                          helperText={errors.instructors?.message}
                        />
                      )}
                    />
                  </FormControl>
                )}
              />
            </Grid2>

            {/* Location Field */}
            <Grid2 xs={12} sx={{ mb: 5 }}>
              <Controller
                name="location"
                control={control}
                rules={{ required: "O local é obrigatório" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Local"
                    variant="outlined"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                )}
              />
            </Grid2>
            {/* Class Date Selected */}

            {/* Max Participants, Start and End Time */}
            <Grid2 container spacing={6}>
              <Grid2 xs={12}>
                <Controller
                  name="maxParticipants"
                  control={control}
                  rules={{
                    min: { value: 1, message: "Mínimo de 1 participante" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Máximo de Participantes"
                      type="number"
                      variant="outlined"
                      fullWidth
                      error={!!errors.maxParticipants}
                      helperText={errors.maxParticipants?.message}
                      slotProps={{
                        inputProps: { min: 1 },
                      }}
                    />
                  )}
                />
              </Grid2>
              {!isFullDay && (
                <>
                  <Grid2 xs={12}>
                    <Controller
                      name="startTime"
                      control={control}
                      rules={{ required: "Hora de início é obrigatória" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Hora de Início"
                          type="time"
                          fullWidth
                          variant="outlined"
                          error={!!errors.startTime}
                          helperText={errors.startTime?.message}
                        />
                      )}
                    />
                  </Grid2>
                  <Grid2 xs={12}>
                    <Controller
                      name="endTime"
                      control={control}
                      rules={{ required: "Hora de término é obrigatória" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Hora de Término"
                          type="time"
                          fullWidth
                          variant="outlined"
                          error={!!errors.endTime}
                          helperText={errors.endTime?.message}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid2>
                </>
              )}
            </Grid2>
            <Grid2 xs={6} sx={{ mt: 1 }}>
              <Controller
                name="isFullDay"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="A aula será o dia inteiro?"
                  />
                )}
              />
            </Grid2>

            {/* Online Checkbox */}
            <Grid2 xs={6} sx={{ mt: 1 }}>
              <Controller
                name="isOnline"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Aula Online?"
                  />
                )}
              />
            </Grid2>
            {/* Online Url Field */}
            {isOnline && (
              <Grid2 xs={12} sx={{ mb: 2 }}>
                <Controller
                  name="onlineClassUrl"
                  control={control}
                  rules={{ required: "O título é obrigatório" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Informe o link para esta aula"
                      variant="outlined"
                      fullWidth
                      error={!!errors.onlineClassUrl}
                      helperText={errors.onlineClassUrl?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid2>
            )}

            {/* Repeat Checkbox */}
            {!selectedEvent && (
              <Grid2 xs={12}>
                <Controller
                  name="isRepeating"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                        />
                      }
                      label="Aula Recorrente?"
                    />
                  )}
                />
              </Grid2>
            )}

            {!isRepeating && (
              <Grid2 xs={12} sx={{ my: 2 }}>
                <Controller
                  name="classDate"
                  control={control}
                  rules={{ required: "Hora de término é obrigatória" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Dia da aula"
                      type="date"
                      fullWidth
                      disabled
                      variant="outlined"
                      error={!!errors.classDate}
                      helperText={errors.classDate?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid2>
            )}
            {/* Repeat Since and Until */}
            {isRepeating && (
              <>
                <Grid2 xs={12} sx={{ mt: 2 }}>
                  <Controller
                    name="repeatSince"
                    control={control}
                    rules={{ required: "A data de repetição é obrigatória" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Repetir desde"
                        type="date"
                        variant="outlined"
                        fullWidth
                        error={!!errors.repeatSince}
                        helperText={errors.repeatSince?.message}
                        focused
                      />
                    )}
                  />
                </Grid2>

                <Grid2 xs={12} sx={{ mt: 2 }}>
                  <Controller
                    name="repeatUntil"
                    control={control}
                    rules={{ required: "A data de repetição é obrigatória" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Repetir até"
                        type="date"
                        variant="outlined"
                        fullWidth
                        error={!!errors.repeatUntil}
                        helperText={errors.repeatUntil?.message}
                        focused
                      />
                    )}
                  />
                </Grid2>
                <Grid2 xs={12} sx={{ mb: 2 }}>
                  <Controller
                    name="repeatDays"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.repeatDays}>
                        <FormGroup row>
                          {Object.keys(field.value).map((day) => (
                            <FormControlLabel
                              key={day}
                              control={
                                <Checkbox
                                  checked={field.value[day]}
                                  onChange={(e) => {
                                    const newRepeatDays = {
                                      ...field.value,
                                      [day]: e.target.checked,
                                    };
                                    field.onChange(newRepeatDays);
                                  }}
                                  name={day}
                                />
                              }
                              label={day.charAt(0).toUpperCase() + day.slice(1)}
                            />
                          ))}
                        </FormGroup>
                        {errors.repeatDays && (
                          <FormHelperText>
                            {errors.repeatDays?.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid2>
              </>
            )}
            <Grid2 xs={12}>
              <Controller
                name="isExclusive"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Aula exclusiva?"
                  />
                )}
              />
            </Grid2>
            {/* Repeat Since and Until */}
            {isExclusive && (
              <>
                <Grid2 xs={12} sx={{ mt: 2 }}>
                  <Controller
                    name="exclusiveGymPlan"
                    control={control}
                    defaultValue={[]}
                    rules={{ required: "Um plano é obrigatório" }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.classType}>
                        <InputLabel>Plano Exclusivo</InputLabel>
                        <Select
                          {...field}
                          label="Plano Exclusivo"
                          multiple
                          renderValue={(selected) =>
                            selected
                              .map(
                                (id) =>
                                  dataGymPlans?.data.find(
                                    (plan) => plan.gymPlanId === id
                                  )?.name
                              )
                              .join(", ")
                          }
                        >
                          {dataGymPlans?.data?.map((type) => (
                            <MenuItem
                              key={type.gymPlanId}
                              value={type.gymPlanId}
                            >
                              <Checkbox
                                checked={field.value.includes(type.gymPlanId)}
                              />
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {errors.classType?.message}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid2>
              </>
            )}
          </DialogContent>

          <DialogActions
            sx={{ px: 3, py: 2, bgcolor: theme.palette.background.default }}
          >
            {selectedEvent && (
              <Button
                onClick={() => {
                  if (selectedEvent) {
                    handleRemoveClass(selectedEvent._def.publicId);
                    selectedEvent.remove();
                    handleClose();
                  }
                }}
                color="error"
              >
                Eliminar
              </Button>
            )}
            <Button onClick={handleClose} color="secondary">
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {selectedEvent ? "Atualizar" : "Guardar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default MapaAulas;
