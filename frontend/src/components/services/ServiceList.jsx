import React, { useState } from 'react';
import StatusSelector from './StatusSelector';
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/utils';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ServiceForm from './ServiceForm';

const ServiceList = ({ 
  services = [], 
  isLoading = false, 
  onUpdateStatus,
  onCreateService,
  onUpdateService,
  onDeleteService
}) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);

  const handleAddService = () => {
    setEditingService(null);
    setIsFormModalOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (service) => {
    setDeletingService(service);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingService) {
      await onDeleteService(deletingService.id);
      setIsDeleteModalOpen(false);
      setDeletingService(null);
    }
  };

  const handleSubmitService = async (serviceData) => {
    if (editingService) {
      await onUpdateService(editingService.id, serviceData);
    } else {
      await onCreateService(serviceData);
    }
    setIsFormModalOpen(false);
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    await onUpdateStatus(serviceId, newStatus);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const color = STATUS_COLORS[status] || 'neutral';
    const label = STATUS_LABELS[status] || 'Unknown';
    
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

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-32">
          <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="Services"
        subtitle="Manage your services and their current status"
        headerActions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={handleAddService}
          >
            Add Service
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-neutral-500">
                    No services found. Click "Add Service" to create your first service.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <StatusBadge status={service.status} />
                        </div>
                        <div className="w-40">
                          <StatusSelector
                            value={service.status}
                            onChange={(status) => handleStatusChange(service.id, status)}
                            showLabel={false}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-500 max-w-md truncate">
                        {service.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(service)}
                          className="text-danger-600 hover:text-danger-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Service Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add Service'}
        size="md"
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleSubmitService}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Service"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          Are you sure you want to delete the service "{deletingService?.name}"? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

function PlusIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default ServiceList;