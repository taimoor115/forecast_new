const endpoint = {
  AUTH: {
    LOGIN: "/v1/users/login-user",
    LOGOUT: "/v1/users/logout-user",
  },
  FORECAST: {
    PRODUCTS: "/v1/forecast/get-forecast",
    UPDATE: "/v1/forecast/upsert-forecast",
    BULK_UPDATE: "/v1/forecast/update-bulk-data",
    VARIANTS_COUNT: "/v1/forecast/get-variants-count"
  },
};

export default endpoint;
