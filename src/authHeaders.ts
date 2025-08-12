export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const authHeaders = (): Record<string, string> => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};
