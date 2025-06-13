import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosWithToken, axiosWithoutToken } from "../../api";

const useQueryApi = (endpoint, options = {}) => {
  const {
    useToken = true,
    defaultQueryParams = {},
    defaultHeaders = {},
  } = options;

  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const axiosInstance = useToken ? axiosWithToken : axiosWithoutToken;

  const createConfig = (
    method,
    body = null,
    customParams = {},
    customHeaders = {}
  ) => {
    return {
      method,
      url: endpoint,
      headers: {
        "Content-Type": "application/json",
        ...defaultHeaders,
        ...customHeaders,
      },
      data: body,
      params: { ...defaultQueryParams, ...customParams },
    };
  };

  const handleError = (err) => {
    const errorMessage = err.response?.data?.error || err.message;
    setError(errorMessage);
    return Promise.reject(errorMessage);
  };

  const useGetData = (queryParams = {}, queryOptions = {}) => {
    return useQuery({
      queryKey: [endpoint, queryParams],
      queryFn: async () => {
        try {
          const config = createConfig("GET", null, queryParams);
          const response = await axiosInstance(config);
          return response.data;
        } catch (err) {
          return handleError(err);
        }
      },
      ...queryOptions,
    });
  };

  const usePostData = (mutationOptions = {}) => {
    return useMutation({
      mutationFn: async ({ body, queryParams = {}, headers = {} }) => {
        try {
          const config = createConfig(
            "POST",
            body ? body : undefined,
            Object.keys(queryParams).length ? queryParams : undefined,
            Object.keys(headers).length ? headers : undefined
          );
          if (
            !body &&
            !Object.keys(queryParams).length &&
            !Object.keys(headers).length
          ) {
            config.data = undefined;
            config.params = undefined;
            config.headers = undefined;
          }
          const response = await axiosInstance(config);
          return response.data;
        } catch (err) {
          return handleError(err);
        }
      },
      onSuccess: (data, variables) => {
        if (mutationOptions.invalidateQueries !== false) {
          queryClient.invalidateQueries({ queryKey: [endpoint] });
        }
        if (mutationOptions.onSuccess) {
          mutationOptions.onSuccess(data, variables);
        }
      },
      ...mutationOptions,
    });
  };

  const usePutData = (mutationOptions = {}) => {
    return useMutation({
      mutationFn: async ({ id, body, queryParams = {}, headers = {} }) => {
        try {
          const url = id ? `${endpoint}/${id}` : endpoint;
          const config = createConfig("PUT", body, queryParams, headers);
          config.url = url;
          const response = await axiosInstance(config);
          return response.data;
        } catch (err) {
          return handleError(err);
        }
      },
      onSuccess: (data, variables) => {
        if (mutationOptions.invalidateQueries !== false) {
          queryClient.invalidateQueries({ queryKey: [endpoint] });
        }
        if (mutationOptions.onSuccess) {
          mutationOptions.onSuccess(data, variables);
        }
      },
      ...mutationOptions,
    });
  };

  // PATCH request
  const usePatchData = (mutationOptions = {}) => {
    return useMutation({
      mutationFn: async ({ id, body, queryParams = {}, headers = {} }) => {
        try {
          const url = id ? `${endpoint}/${id}` : endpoint;
          const config = createConfig("PATCH", body, queryParams, headers);
          config.url = url;
          const response = await axiosInstance(config);
          return response.data;
        } catch (err) {
          return handleError(err);
        }
      },
      onSuccess: (data, variables) => {
        if (mutationOptions.invalidateQueries !== false) {
          queryClient.invalidateQueries({ queryKey: [endpoint] });
        }
        if (mutationOptions.onSuccess) {
          mutationOptions.onSuccess(data, variables);
        }
      },
      ...mutationOptions,
    });
  };

  const useDeleteData = (mutationOptions = {}) => {
    return useMutation({
      mutationFn: async ({
        id,
        body = null,
        queryParams = {},
        headers = {},
      }) => {
        try {
          const url = id ? `${endpoint}/${id}` : endpoint;
          const config = createConfig("DELETE", body, queryParams, headers);
          config.url = url;
          const response = await axiosInstance(config);
          return response.data;
        } catch (err) {
          return handleError(err);
        }
      },
      onSuccess: (data, variables) => {
        if (mutationOptions.invalidateQueries !== false) {
          queryClient.invalidateQueries({ queryKey: [endpoint] });
        }
        if (mutationOptions.onSuccess) {
          mutationOptions.onSuccess(data, variables);
        }
      },
      ...mutationOptions,
    });
  };

  return {
    useGetData,
    usePostData,
    usePutData,
    usePatchData,
    useDeleteData,
    error,
  };
};

export default useQueryApi;
