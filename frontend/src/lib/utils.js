import { format, parseISO, formatDistanceToNow } from 'date-fns';

// Format date to readable string
export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// Format date as relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return dateString;
  }
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Service status helpers
export const SERVICE_STATUSES = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  PARTIAL_OUTAGE: 'partial_outage',
  MAJOR_OUTAGE: 'major_outage',
  MAINTENANCE: 'maintenance',
};

export const STATUS_LABELS = {
  [SERVICE_STATUSES.OPERATIONAL]: 'Operational',
  [SERVICE_STATUSES.DEGRADED]: 'Degraded Performance',
  [SERVICE_STATUSES.PARTIAL_OUTAGE]: 'Partial Outage',
  [SERVICE_STATUSES.MAJOR_OUTAGE]: 'Major Outage',
  [SERVICE_STATUSES.MAINTENANCE]: 'Under Maintenance',
};

export const STATUS_COLORS = {
  [SERVICE_STATUSES.OPERATIONAL]: 'success',
  [SERVICE_STATUSES.DEGRADED]: 'warning',
  [SERVICE_STATUSES.PARTIAL_OUTAGE]: 'warning',
  [SERVICE_STATUSES.MAJOR_OUTAGE]: 'danger',
  [SERVICE_STATUSES.MAINTENANCE]: 'primary',
};

// Incident status helpers
export const INCIDENT_STATUSES = {
  INVESTIGATING: 'investigating',
  IDENTIFIED: 'identified',
  MONITORING: 'monitoring',
  RESOLVED: 'resolved',
};

export const INCIDENT_STATUS_LABELS = {
  [INCIDENT_STATUSES.INVESTIGATING]: 'Investigating',
  [INCIDENT_STATUSES.IDENTIFIED]: 'Identified',
  [INCIDENT_STATUSES.MONITORING]: 'Monitoring',
  [INCIDENT_STATUSES.RESOLVED]: 'Resolved',
};

export const INCIDENT_STATUS_COLORS = {
  [INCIDENT_STATUSES.INVESTIGATING]: 'danger',
  [INCIDENT_STATUSES.IDENTIFIED]: 'warning',
  [INCIDENT_STATUSES.MONITORING]: 'primary',
  [INCIDENT_STATUSES.RESOLVED]: 'success',
};

// Get the overall system status based on service statuses
export const getOverallStatus = (services) => {
  if (!services || !services.length) return SERVICE_STATUSES.OPERATIONAL;
  
  // Check for major outages first
  if (services.some(service => service.status === SERVICE_STATUSES.MAJOR_OUTAGE)) {
    return SERVICE_STATUSES.MAJOR_OUTAGE;
  }
  
  // Check for partial outages
  if (services.some(service => service.status === SERVICE_STATUSES.PARTIAL_OUTAGE)) {
    return SERVICE_STATUSES.PARTIAL_OUTAGE;
  }
  
  // Check for degraded performance
  if (services.some(service => service.status === SERVICE_STATUSES.DEGRADED)) {
    return SERVICE_STATUSES.DEGRADED;
  }
  
  // Check if any service is under maintenance
  if (services.some(service => service.status === SERVICE_STATUSES.MAINTENANCE)) {
    return SERVICE_STATUSES.MAINTENANCE;
  }
  
  // All systems operational
  return SERVICE_STATUSES.OPERATIONAL;
};

export default {
  formatDate,
  formatRelativeTime,
  truncateText,
  getInitials,
  SERVICE_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
  INCIDENT_STATUSES,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_COLORS,
  getOverallStatus,
};