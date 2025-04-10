import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from './useAuth';
import api from '../lib/api';
import { useToast } from './useToast';

export const useApi = () => {
  const { token } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Generic fetch function with authentication
  const fetchWithAuth = async ({ url, method = 'GET', data = null, params = null }) => {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      if (data) {
        config.data = data;
      }

      if (params) {
        config.params = params;
      }

      const response = await api(url, config);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error.response?.data?.detail || 'An error occurred';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Custom hooks for common operations
  const useFetch = (key, url, options = {}) => {
    return useQuery(
      key,
      () => fetchWithAuth({ url }),
      {
        enabled: !!token,
        ...options,
      }
    );
  };

  const useCreate = (resource, options = {}) => {
    return useMutation(
      (data) => fetchWithAuth({ url: `/${resource}`, method: 'POST', data }),
      {
        onSuccess: (data) => {
          // Invalidate queries related to this resource
          queryClient.invalidateQueries(resource);
          toast.success(`${resource.charAt(0).toUpperCase() + resource.slice(1)} created successfully`);
          
          if (options.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (error) => {
          if (options.onError) {
            options.onError(error);
          }
        },
        ...options,
      }
    );
  };

  const useUpdate = (resource, options = {}) => {
    return useMutation(
      ({ id, data }) => fetchWithAuth({ url: `/${resource}/${id}`, method: 'PUT', data }),
      {
        onSuccess: (data) => {
          // Invalidate queries related to this resource
          queryClient.invalidateQueries(resource);
          toast.success(`${resource.charAt(0).toUpperCase() + resource.slice(1)} updated successfully`);
          
          if (options.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (error) => {
          if (options.onError) {
            options.onError(error);
          }
        },
        ...options,
      }
    );
  };

  const useDelete = (resource, options = {}) => {
    return useMutation(
      (id) => fetchWithAuth({ url: `/${resource}/${id}`, method: 'DELETE' }),
      {
        onSuccess: () => {
          // Invalidate queries related to this resource
          queryClient.invalidateQueries(resource);
          toast.success(`${resource.charAt(0).toUpperCase() + resource.slice(1)} deleted successfully`);
          
          if (options.onSuccess) {
            options.onSuccess();
          }
        },
        onError: (error) => {
          if (options.onError) {
            options.onError(error);
          }
        },
        ...options,
      }
    );
  };

  return {
    fetchWithAuth,
    useFetch,
    useCreate,
    useUpdate,
    useDelete,
  };
};

export default useApi;