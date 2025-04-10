import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import organizationService from '../services/organizationService';

export const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!isAuthenticated || !currentUser) return;
      
      setIsLoading(true);
      try {
        // Get organizations user belongs to
        const userOrgs = await organizationService.getUserOrganizations();
        setOrganizations(userOrgs);
        
        // Set current organization
        const savedOrgId = localStorage.getItem('currentOrgId');
        if (savedOrgId && userOrgs.some(org => org.id.toString() === savedOrgId)) {
          const org = userOrgs.find(org => org.id.toString() === savedOrgId);
          setCurrentOrganization(org);
        } else if (userOrgs.length > 0) {
          // Default to first organization
          setCurrentOrganization(userOrgs[0]);
          localStorage.setItem('currentOrgId', userOrgs[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [isAuthenticated, currentUser]);

  const switchOrganization = (orgId) => {
    const org = organizations.find(o => o.id.toString() === orgId.toString());
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrgId', org.id.toString());
    }
  };

  const createOrganization = async (orgData) => {
    try {
      const newOrg = await organizationService.createOrganization(orgData);
      setOrganizations([...organizations, newOrg]);
      
      // Switch to newly created organization
      setCurrentOrganization(newOrg);
      localStorage.setItem('currentOrgId', newOrg.id.toString());
      
      return { success: true, organization: newOrg };
    } catch (error) {
      console.error('Error creating organization:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create organization' 
      };
    }
  };

  const updateOrganization = async (orgId, orgData) => {
    try {
      const updatedOrg = await organizationService.updateOrganization(orgId, orgData);
      
      // Update organizations list
      setOrganizations(organizations.map(org => 
        org.id === updatedOrg.id ? updatedOrg : org
      ));
      
      // Update current org if it's the one being updated
      if (currentOrganization?.id === updatedOrg.id) {
        setCurrentOrganization(updatedOrg);
      }
      
      return { success: true, organization: updatedOrg };
    } catch (error) {
      console.error('Error updating organization:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update organization' 
      };
    }
  };
  
  const value = {
    organizations,
    currentOrganization,
    isLoading,
    switchOrganization,
    createOrganization,
    updateOrganization
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};