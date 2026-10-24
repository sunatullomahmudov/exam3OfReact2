import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://debt-back-cvif.onrender.com/api",
  timeout: 60000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshRequest: Promise<string> | null = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      error.response?.status === 401 &&
      !config.retry &&
      !config.url.startsWith("/auth/")
    ) {
      config.retry = true;
      try {
        if (!refreshRequest)
          refreshRequest = axios
            .post(`${api.defaults.baseURL}/auth/refresh`, {
              refreshToken: localStorage.getItem("refreshToken"),
            })
            .then(({ data }) => {
              localStorage.setItem("accessToken", data.accessToken);
              localStorage.setItem("refreshToken", data.refreshToken);
              return data.accessToken as string;
            })
            .finally(() => {
              refreshRequest = null;
            });
        await refreshRequest;
        return api(config);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("session-expired"));
      }
    }
    return Promise.reject(error);
  },
);
export function errorText(error: unknown) {
  return axios.isAxiosError(error)
    ? error.response?.data?.error || error.message
    : String(error);
}
