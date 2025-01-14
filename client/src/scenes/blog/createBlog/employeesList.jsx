import React, { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { useGetAllEmployeesQuery } from "state/api";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "state/authSlice";
import { useTheme } from "@emotion/react";
import { Skeleton } from "@mui/material";
import ErrorOverlay from "components/common/ErrorOverlay";

const Root = styled("div")(
  ({ theme }) => `
  color: ${theme.palette.text.primary};
  font-size: 14px;
  position: relative;
  width: 100%;
`
);

const Label = styled("label")`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled("div")(
  ({ theme }) => `
  width: 100%;
  max-width: 300px;
  border: 1px solid ${theme.palette.text.primary};
  background-color: ${theme.palette.background.default};
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;
  &:hover {
    border-color: ${theme.palette.text.primary};
  }
  & input {
    flex-grow: 1;
    border: none;
    outline: none;
    padding: 8px;
    background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
    color: ${theme.palette.text.primary};
  }
`
);

const StyledTag = styled("div")(
  ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: ${theme.palette.background.alt};
  border: 1px solid ${theme.palette.mode === "dark" ? "#303030" : "#e8e8e8"};
  border-radius: 2px;
  padding: 0 4px 0 10px;
  & svg {
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
  }
`
);

const Listbox = styled("ul")(
  ({ theme }) => `
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.background.alt};
  max-height: 200px;
  margin: 2px 0 0;
  padding: 0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  overflow-y: auto;
  width: 100%;
  max-width: 300px;
  & li {
    padding: 5px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }
  & li.selected {
    background-color: ${theme.palette.action.selected};
    font-style: italic;
  }
  & li:hover {
    background-color: ${theme.palette.secondary[500]};
    color: #000;
  }
`
);

function Tag({ label, onDelete, canDelete }) {
  return (
    <StyledTag>
      <span>{label}</span>
      {canDelete && <CloseIcon onClick={onDelete} />}
    </StyledTag>
  );
}

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  canDelete: PropTypes.bool,
};

export default function CustomAutocomplete({
  onAuthorsChange,
  preselectedUsers,
}) {
  const theme = useTheme();
  const { data: employees, isLoading, error } = useGetAllEmployeesQuery();
  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = currentUser?.userId;
  const [inputValue, setInputValue] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  console.log("ngga", selectedEmployees);
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setInputValue("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize selected employees with preselected users
  useEffect(() => {
    // Avoid unnecessary updates
    if (employees && currentUserId && !preselectedUsers?.length) {
      const currentEmployee = employees.find(
        (emp) => emp.userId === currentUserId
      );
      setSelectedEmployees(currentEmployee ? [currentEmployee] : []);
    } else {
      console.log("Preselected users:", preselectedUsers);
      const selectedEmployeesList = employees?.filter((emp) =>
        preselectedUsers.includes(emp.userId)
      );
      setSelectedEmployees(selectedEmployeesList);
    }
  }, [employees, preselectedUsers, currentUserId]);

  useEffect(() => {
    console.log("Selected employees changed:", selectedEmployees);
    onAuthorsChange(selectedEmployees?.map((emp) => emp.userId));
  }, [selectedEmployees, onAuthorsChange]);

  // Get selectable employees (excluding the current user only if preselectedUsers has users)
  const selectableEmployees = useMemo(
    () => {
      // Include all employees if preselectedUsers is not empty
      if (preselectedUsers && preselectedUsers.length > 0) {
        return employees || [];
      }
      // Exclude current user if preselectedUsers is empty
      return employees?.filter((emp) => emp.userId !== currentUserId) || [];
    },
    [employees, currentUserId, preselectedUsers] // Dependencies
  );

  // Filter employees based on input value
  const filteredOptions = useMemo(() => {
    if (!inputValue) return []; // Skip filtering if inputValue is empty
    return selectableEmployees.filter((emp) =>
      `${emp.fname} ${emp.lname} (${emp.role.rolesName})`
        .toLowerCase()
        .includes(inputValue.toLowerCase())
    );
  }, [inputValue, selectableEmployees]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(newValue.length > 0); // Open dropdown when input is not empty
  };

  const handleToggleEmployee = (employee) => {
    setSelectedEmployees((prev) =>
      prev.some((e) => e.userId === employee.userId)
        ? prev.filter((e) => e.userId !== employee.userId)
        : [...prev, employee]
    );
    setInputValue("");
    setIsOpen(false); // Close dropdown after selection
  };

  const handleRemoveEmployee = (userId) => {
    if (userId !== currentUserId && !preselectedUsers?.length) {
      setSelectedEmployees((prev) =>
        prev.filter((emp) => emp.userId !== userId)
      );
    } else {
      setSelectedEmployees((prev) =>
        prev.filter((emp) => emp.userId !== userId)
      );
    }
  };

  if (isLoading) return <Skeleton height="3rem" width="15%" />;

  if (error)
    return (
      <ErrorOverlay
        error={error}
        dataName="A lista de funcionários"
        isButtonVisible={false}
      />
    );

  return (
    <Root ref={wrapperRef}>
      <Label>Adicione autores a este blog</Label>
      <InputWrapper>
        {selectedEmployees?.map((employee) => (
          <Tag
            key={employee.userId}
            label={`${employee.fname} ${employee.lname} (${employee.role.rolesName})`}
            onDelete={() => handleRemoveEmployee(employee.userId)}
            canDelete={
              employee.userId !== currentUserId || preselectedUsers?.length
            }
          />
        ))}
        <input
          type="text"
          placeholder="Adicione autores..."
          value={inputValue}
          onChange={handleInputChange}
          style={{
            backgroundColor: theme.palette.background.default,
            borderTop: `2px solid ${theme.palette.neutral.main}`,
          }}
        />
      </InputWrapper>
      {isOpen && filteredOptions.length > 0 && (
        <Listbox>
          {filteredOptions?.map((option) => {
            const isSelected = selectedEmployees.some(
              (emp) => emp.userId === option.userId
            );
            return (
              <li
                key={option.userId}
                onClick={() => handleToggleEmployee(option)}
                className={isSelected ? "selected" : ""}
              >
                <span>{`${option.fname} ${option.lname} (${option.role.rolesName})`}</span>
                {isSelected && <CheckIcon fontSize="small" />}
              </li>
            );
          })}
        </Listbox>
      )}
    </Root>
  );
}
