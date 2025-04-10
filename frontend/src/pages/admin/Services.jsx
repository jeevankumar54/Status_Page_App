import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ServiceList from '../../components/services/ServiceList';
import PageTitle from '../../components/common/PageTitle';
import Card from '../../components/common/Card';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { useOrganization } from '../../hooks/useAuth';

const Services = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization || { currentOrganization: null };

  // Fetch services
  const { data: services, isLoading, error } = useQuery(
    'services',
    async () => {
      const response = await api.get('/api/v1/services');
      return response.data;
    },
    {
      staleTime: 30000, // 30 seconds
      retry: 2,
      onError: (error) => {
        toast.error('Failed to load services');
        console.error('Error fetching services:', error);
      },
    }
  );

  // Create service mutation
  const createServiceMutation = useMutation(
    async (serviceData) => {
      const data = {
        ...serviceData,
        organization_id: currentOrganization?.id,
      };
      const response = await api.post('/api/v1/services', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create service');
        console.error('Error creating service:', error);
      },
    }
  );

  // Update service mutation
  const updateServiceMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/v1/services/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update service');
        console.error('Error updating service:', error);
      },
    }
  );

  // Update service status mutation
  const updateServiceStatusMutation = useMutation(
    async ({ id, status }) => {
      const response = await api.patch(`/api/v1/services/${id}/status`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service status updated');
      },
      onError: (error) => {
        toast.error('Failed to update service status');
        console.error('Error updating service status:', error);
      },
    }
  );

  // Delete service mutation
  const deleteServiceMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/v1/services/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete service');
        console.error('Error deleting service:', error);
      },
    }
  );

  // Handler functions
  const handleCreateService = async (serviceData) => {
    return createServiceMutation.mutateAsync(serviceData);
  };

  const handleUpdateService = async (id, serviceData) => {
    return updateServiceMutation.mutateAsync({ id, data: serviceData });
  };

  const handleUpdateStatus = async (id, status) => {
    return updateServiceStatusMutation.mutateAsync({ id, status });
  };

  const handleDeleteService = async (id) => {
    return deleteServiceMutation.mutateAsync(id);
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle title="Services" />
        <Card>
          <div className="p-4 text-center">
            <p className="text-danger-600">Failed to load services. Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Services" 
        description="Manage your services and their status"
      />

      <ServiceList
        services={services || []}
        isLoading={isLoading}
        onCreateService={handleCreateService}
        onUpdateService={handleUpdateService}
        onUpdateStatus={handleUpdateStatus}
        onDeleteService={handleDeleteService}
      />
    </div>
  );
};

export default Services;