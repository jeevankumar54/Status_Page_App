import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageTitle from '../../components/common/PageTitle';
import Modal from '../../components/common/Modal';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { INCIDENT_STATUS_LABELS, INCIDENT_STATUS_COLORS } from '../../lib/utils';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch incident details
  const { data: incident, isLoading, error } = useQuery(
    ['incident', id],
    async () => {
      const response = await api.get(`/api/v1/incidents/${id}`);
      return response.data;
    },
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // 1 minute
      onError: (error) => {
        toast.error('Failed to load incident details');
        console.error('Error fetching incident:', error);
      },
    }
  );

  // Add incident update mutation
  const addUpdateMutation = useMutation(
    async (updateData) => {
      const response = await api.post(`/api/v1/incidents/${id}/updates`, updateData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['incident', id]);
        toast.success('Update added successfully');
        setIsUpdateModalOpen(false);
        setIsResolveModalOpen(false);
        setUpdateMessage('');
      },
      onError: (error) => {
        toast.error('Failed to add update');
        console.error('Error adding update:', error);
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // Resolve incident mutation
  const resolveIncidentMutation = useMutation(
    async (updateData) => {
      // First update the status
      await api.patch(`/api/v1/incidents/${id}/status`, {
        status: 'resolved',
      });
      
      // Then add the update
      const response = await api.post(`/api/v1/incidents/${id}/updates`, updateData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['incident', id]);
        queryClient.invalidateQueries('incidents');
        toast.success('Incident resolved');
        setIsResolveModalOpen(false);
        setUpdateMessage('');
      },
      onError: (error) => {
        toast.error('Failed to resolve incident');
        console.error('Error resolving incident:', error);
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    
    if (!updateMessage.trim()) {
      toast.error('Update message is required');
      return;
    }
    
    setIsSubmitting(true);
    
    const updateData = {
      message: updateMessage,
      status: updateStatus || incident.status,
      is_public: true,
    };
    
    await addUpdateMutation.mutateAsync(updateData);
  };

  const handleResolveIncident = async (e) => {
    e.preventDefault();
    
    if (!updateMessage.trim()) {
      toast.error('Resolution message is required');
      return;
    }
    
    setIsSubmitting(true);
    
    const updateData = {
      message: updateMessage,
      status: 'resolved',
      is_public: true,
    };
    
    await resolveIncidentMutation.mutateAsync(updateData);
  };

  const handleBackClick = () => {
    navigate('/admin/incidents');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle title="Incident Details" onBack={handleBackClick} />
        <Card>
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !incident) {
    return (
      <div className="space-y-6">
        <PageTitle title="Incident Details" onBack={handleBackClick} />
        <Card>
          <div className="p-4 text-center">
            <p className="text-danger-600">Failed to load incident details. Please try again later.</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => queryClient.invalidateQueries(['incident', id])}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Status badge
  const StatusBadge = ({ status }) => {
    const color = INCIDENT_STATUS_COLORS[status] || 'neutral';
    const label = INCIDENT_STATUS_LABELS[status] || 'Unknown';
    
    const colorClasses = {
      success: 'bg-success-100 text-success-800 border-success-200',
      warning: 'bg-warning-100 text-warning-800 border-warning-200',
      danger: 'bg-danger-100 text-danger-800 border-danger-200',
      primary: 'bg-primary-100 text-primary-800 border-primary-200',
      neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        title={incident.title} 
        onBack={handleBackClick}
        actions={
          <div className="flex space-x-2">
            {incident.status !== 'resolved' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUpdateStatus(incident.status);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  Add Update
                </Button>
                <Button
                  variant="success"
                  onClick={() => setIsResolveModalOpen(true)}
                >
                  Resolve Incident
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Incident Info */}
      <Card
        title="Incident Information"
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Status</h3>
            <div className="mt-1">
              <StatusBadge status={incident.status} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Impact</h3>
            <p className="mt-1 text-sm text-neutral-900 capitalize">{incident.impact}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Type</h3>
            <p className="mt-1 text-sm text-neutral-900 capitalize">{incident.type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Started</h3>
            <p className="mt-1 text-sm text-neutral-900">
              {formatDate(incident.started_at)}
            </p>
          </div>
          {incident.type === 'maintenance' && (
            <>
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Scheduled Start</h3>
                <p className="mt-1 text-sm text-neutral-900">
                  {formatDate(incident.scheduled_start_time)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Scheduled End</h3>
                <p className="mt-1 text-sm text-neutral-900">
                  {formatDate(incident.scheduled_end_time)}
                </p>
              </div>
            </>
          )}
          {incident.resolved_at && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Resolved</h3>
              <p className="mt-1 text-sm text-neutral-900">
                {formatDate(incident.resolved_at)}
              </p>
            </div>
          )}
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-neutral-500">Affected Services</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {incident.services && incident.services.length > 0 ? (
                incident.services.map(service => (
                  <span 
                    key={service.id} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"
                  >
                    {service.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No services affected</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Updates Timeline */}
      <Card
        title="Updates"
        subtitle="Latest updates for this incident"
      >
        <div className="flow-root">
          {incident.updates && incident.updates.length > 0 ? (
            <ul className="-mb-8">
              {incident.updates.map((update, index) => (
                <li key={update.id}>
                  <div className="relative pb-8">
                    {index !== incident.updates.length - 1 ? (
                      <span 
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" 
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white 
                          ${INCIDENT_STATUS_COLORS[update.status] === 'success' 
                            ? 'bg-success-100' 
                            : INCIDENT_STATUS_COLORS[update.status] === 'warning' 
                              ? 'bg-warning-100' 
                              : INCIDENT_STATUS_COLORS[update.status] === 'danger' 
                                ? 'bg-danger-100' 
                                : 'bg-primary-100'
                          }`}>
                          {update.status === 'resolved' ? (
                            <CheckIcon className="h-5 w-5 text-success-600" />
                          ) : update.status === 'investigating' ? (
                            <SearchIcon className="h-5 w-5 text-danger-600" />
                          ) : update.status === 'identified' ? (
                            <ExclamationIcon className="h-5 w-5 text-warning-600" />
                          ) : (
                            <ChartIcon className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-neutral-900">
                              <StatusBadge status={update.status} />
                            </p>
                            <p className="text-sm text-neutral-500">
                              <time title={formatDate(update.created_at)}>
                                {formatRelativeTime(update.created_at)}
                              </time>
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-neutral-700">
                            <p>{update.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-4">No updates yet.</p>
          )}
        </div>
      </Card>

      {/* Add Update Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Add Incident Update"
        size="md"
      >
        <form onSubmit={handleAddUpdate}>
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="update-status" 
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Status
              </label>
              <select
                id="update-status"
                value={updateStatus || incident.status}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label 
                htmlFor="update-message" 
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Message
              </label>
              <textarea
                id="update-message"
                rows={4}
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Provide an update on the current situation..."
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Add Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Incident Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Incident"
        size="md"
      >
        <form onSubmit={handleResolveIncident}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-700">
              Please provide a resolution message to mark this incident as resolved.
            </p>
            <div>
              <label 
                htmlFor="resolve-message" 
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Resolution Message
              </label>
              <textarea
                id="resolve-message"
                rows={4}
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="The issue has been resolved. We have identified the root cause and..."
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResolveModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={isSubmitting}
            >
              Resolve Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Icons
function CheckIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ExclamationIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function ChartIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

export default IncidentDetail;