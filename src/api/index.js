import axios from "axios";
import Cookies from "js-cookies";

const axiosWithToken = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

const axiosWithoutToken = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

axiosWithToken.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosWithToken.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized: Please log in again.");

      Cookies.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export { axiosWithToken, axiosWithoutToken };
