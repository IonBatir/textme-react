export const getFormatedDate = date =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
export const getFormatedTime = date =>
  date.toLocaleTimeString(undefined, { timeStyle: "short" });
