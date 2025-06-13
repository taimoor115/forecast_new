import { useState, useCallback } from "react";
import { axiosWithToken, axiosWithoutToken } from "../../api";

const useApi = (useTokenInstance = true) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const apiCall = useCallback(
    async (
      method,
      url,
      body = null,
      queryParams = {},
      headers = {},
      withToken = useTokenInstance,
      responseType = "json"
    ) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const axiosInstance = withToken ? axiosWithToken : axiosWithoutToken;
        const config = {
          method,
          url,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          data: body,
          params: queryParams,
          responseType,
        };

        const response = await axiosInstance(config);
        setData(response.data);
        return response.data;
      } catch (err) {
        setError(err.response ? err.response?.data?.error : err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [useTokenInstance]
  );

  const get = (
    url,
    queryParams = {},
    headers = {},
    withToken = useTokenInstance
  ) => apiCall("GET", url, null, queryParams, headers, withToken);

  const post = (
    url,
    body,
    queryParams = {},
    headers = {},
    withToken = useTokenInstance
  ) => apiCall("POST", url, body, queryParams, headers, withToken);

  const put = (
    url,
    body,
    queryParams = {},
    headers = {},
    withToken = useTokenInstance
  ) => apiCall("PUT", url, body, queryParams, headers, withToken);

  const patch = (
    url,
    body,
    queryParams = {},
    headers = {},
    withToken = useTokenInstance
  ) => apiCall("PATCH", url, body, queryParams, headers, withToken);

  const deleteRequest = (
    url,
    body = null,
    queryParams = {},
    headers = {},
    withToken = useTokenInstance
  ) => {
    const options = body && { body };

    if (options?.body) {
      return apiCall(
        "DELETE",
        url,
        options?.body,
        queryParams,
        headers,
        withToken
      );
    }

    return apiCall("DELETE", url, queryParams, headers, withToken);
  };
  const options = (
    url,
    queryParams = {},
    headers = {},
    withToken = useTokenInstance
  ) => apiCall("OPTIONS", url, null, queryParams, headers, withToken);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    patch,
    deleteRequest,
    options,
  };
};

export default useApi;
