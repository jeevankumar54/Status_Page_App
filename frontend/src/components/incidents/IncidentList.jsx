import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { INCIDENT_STATUS_COLORS, INCIDENT_STATUS_LABELS } from '../../lib/utils';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import IncidentForm from './IncidentForm';

const IncidentList = ({
  incidents = [],
  services = [],
  isLoading = false,
  onCreateIncident,
  onUpdateIncident,
  onDeleteIncident,
  showUnresolved = false,
}) => {
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [deletingIncident, setDeletingIncident] = useState(null);

  const filteredIncidents = showUnresolved
    ? incidents.filter(incident => incident.status !== 'resolved')
    : incidents;

  const handleAddIncident = () => {
    setEditingIncident(null);
    setIsIncidentModalOpen(true);
  };

  const handleAddMaintenance = () => {
    setEditingIncident(null);
    setIsMaintenanceModalOpen(true);
  };

  const handleEditIncident = (incident) => {
    setEditingIncident(incident);
    if (incident.type === 'maintenance') {
      setIsMaintenanceModalOpen(true);
    } else {
      setIsIncidentModalOpen(true);
    }
  };

  const handleDeleteClick = (incident) => {
    setDeletingIncident(incident);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingIncident) {
      await onDeleteIncident(deletingIncident.id);
      setIsDeleteModalOpen(false);
      setDeletingIncident(null);
    }
  };

  const handleSubmitIncident = async (incidentData) => {
    if (editingIncident) {
      await onUpdateIncident(editingIncident.id, incidentData);
    } else {
      await onCreateIncident(incidentData);
    }
    setIsIncidentModalOpen(false);
    setIsMaintenanceModalOpen(false);
    setEditingIncident(null);
  };

  // Status badge component
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

  // Type badge component
  const TypeBadge = ({ type }) => {
    const config = {
      incident: {
        label: 'Incident',
        classes: 'bg-danger-100 text-danger-800 border-danger-200',
      },
      maintenance: {
        label: 'Maintenance',
        classes: 'bg-primary-100 text-primary-800 border-primary-200',
      },
    };

    const typeConfig = config[type] || config.incident;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeConfig.classes}`}>
        {typeConfig.label}
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
        title={showUnresolved ? "Active Incidents" : "All Incidents"}
        subtitle={showUnresolved 
          ? "Currently active incidents and scheduled maintenance" 
          : "All incidents and maintenance events"
        }
        headerActions={
          <div className="flex space-x-2">
            <Button
              variant="outline-primary"
              size="sm"
              leftIcon={<CalendarIcon className="w-4 h-4" />}
              onClick={handleAddMaintenance}
            >
              Schedule Maintenance
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ExclamationIcon className="w-4 h-4" />}
              onClick={handleAddIncident}
            >
              Report Incident
            </Button>
          </div>
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
                  Title
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
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Services
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
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-neutral-500">
                    {showUnresolved 
                      ? "No active incidents or scheduled maintenance." 
                      : "No incidents found. Click 'Report Incident' to create your first incident."
                    }
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900 truncate max-w-xs">
                        <Link 
                          to={`/admin/incidents/${incident.id}`} 
                          className="hover:underline text-primary-600"
                        >
                          {incident.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={incident.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500">
                        {incident.type === 'maintenance' && incident.scheduled_start_time ? (
                          <>
                            <span>Scheduled: {formatDate(incident.scheduled_start_time)}</span>
                          </>
                        ) : (
                          <>
                            <span title={formatDate(incident.started_at)}>
                              {formatRelativeTime(incident.started_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {incident.services?.map(service => (
                          <span 
                            key={service.id} 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/incidents/${incident.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => handleEditIncident(incident)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(incident)}
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

      {/* Incident Form Modal */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title={editingIncident ? 'Update Incident' : 'Report Incident'}
        size="md"
      >
        <IncidentForm
          incident={editingIncident}
          services={services}
          onSubmit={handleSubmitIncident}
          onCancel={() => setIsIncidentModalOpen(false)}
          isMaintenanceMode={false}
        />
      </Modal>

      {/* Maintenance Form Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={editingIncident ? 'Update Maintenance' : 'Schedule Maintenance'}
        size="md"
      >
        <IncidentForm
          incident={editingIncident}
          services={services}
          onSubmit={handleSubmitIncident}
          onCancel={() => setIsMaintenanceModalOpen(false)}
          isMaintenanceMode={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Incident"
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
          Are you sure you want to delete the {deletingIncident?.type === 'maintenance' ? 'maintenance' : 'incident'} "{deletingIncident?.title}"? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

function ExclamationIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

export default IncidentList;