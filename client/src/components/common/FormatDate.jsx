export function FormatDate(dateString) {
  if (dateString === undefined || dateString === null) {
    return "Não Aplicável";
  }

  // Create a Date object from the ISO 8601 date string
  const date = new Date(dateString);

  // Check if the Date object is invalid
  if (isNaN(date.getTime())) {
    return "Não Aplicável";
  }

  // Extract the day, month, and year
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  // Return the date in dd/mm/yyyy format
  return `${day}/${month}/${year}`;
}
