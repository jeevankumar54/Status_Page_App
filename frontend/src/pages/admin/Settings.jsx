import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PageTitle from '../../components/common/PageTitle';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { useOrganization } from '../../hooks/useAuth';
import organizationService from '../../services/organizationService';

const Settings = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization() || { currentOrganization: null };
  
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    slug: '',
    website: '',
    logo_url: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load organization data
  const { isLoading, error } = useQuery(
    ['organization', currentOrganization?.id],
    async () => {
      if (!currentOrganization?.id) return null;
      const response = await organizationService.getOrganizationById(currentOrganization.id);
      return response;
    },
    {
      onSuccess: (data) => {
        if (data) {
          setOrgFormData({
            name: data.name || '',
            slug: data.slug || '',
            website: data.website || '',
            logo_url: data.logo_url || '',
          });
        }
      },
      enabled: !!currentOrganization?.id,
    }
  );

  // Update organization mutation
  const updateOrgMutation = useMutation(
    (data) => organizationService.updateOrganization(currentOrganization.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organization', currentOrganization?.id]);
        toast.success('Organization settings updated successfully');
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Error updating organization:', error);
        toast.error('Failed to update organization settings');
        setIsSubmitting(false);
      },
    }
  );

  const handleOrgFormChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from name
    if (name === 'name' && !orgFormData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
        
      setOrgFormData(prev => ({
        ...prev,
        [name]: value,
        slug,
      }));
    } else {
      setOrgFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateOrgForm = () => {
    const newErrors = {};
    
    if (!orgFormData.name) {
      newErrors.name = 'Organization name is required';
    }
    
    if (!orgFormData.slug) {
      newErrors.slug = 'Organization slug is required';
    } else if (!/^[a-z0-9-]+$/.test(orgFormData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    if (orgFormData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(orgFormData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    if (orgFormData.logo_url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(orgFormData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid logo URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrgFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOrgForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateOrgMutation.mutateAsync(orgFormData);
    } catch (error) {
      console.error('Error updating organization:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle title="Settings" />
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

  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle title="Settings" />
        <Card>
          <div className="p-4 text-center">
            <p className="text-danger-600">Failed to load settings. Please try again later.</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => queryClient.invalidateQueries(['organization', currentOrganization?.id])}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Settings" 
        description="Manage your organization settings"
      />

      <Card title="Organization Settings" className="overflow-hidden">
        <form onSubmit={handleOrgFormSubmit}>
          <div className="space-y-4">
            <Input
              label="Organization Name"
              id="name"
              name="name"
              value={orgFormData.name}
              onChange={handleOrgFormChange}
              placeholder="My Company"
              error={errors.name}
              required
            />
            
            <Input
              label="Organization Slug"
              id="slug"
              name="slug"
              value={orgFormData.slug}
              onChange={handleOrgFormChange}
              placeholder="my-company"
              error={errors.slug}
              hint="This will be used in your public status page URL"
              leftAddon="status.yourdomain.com/"
              required
            />
            
            <Input
              label="Website"
              id="website"
              name="website"
              type="url"
              value={orgFormData.website}
              onChange={handleOrgFormChange}
              placeholder="https://example.com"
              error={errors.website}
            />
            
            <Input
              label="Logo URL"
              id="logo_url"
              name="logo_url"
              type="url"
              value={orgFormData.logo_url}
              onChange={handleOrgFormChange}
              placeholder="https://example.com/logo.png"
              error={errors.logo_url}
              hint="URL to your company logo (recommended size: 200x50px)"
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Status Page" className="overflow-hidden">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-700">Your Public Status Page</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Your public status page is available at:
            </p>
            <div className="mt-1 flex items-center">
              <span className="text-primary-600 font-medium">
                {window.location.origin}/status/{orgFormData.slug}
              </span>
              <button
                type="button"
                className="ml-2 p-1 text-neutral-400 hover:text-neutral-600"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/status/${orgFormData.slug}`);
                  toast.success('URL copied to clipboard');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => window.open(`/status/${orgFormData.slug}`, '_blank')}
            >
              View Public Status Page
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Danger Zone" className="overflow-hidden">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-danger-600">Delete Organization</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Once you delete an organization, there is no going back. Please be certain.
            </p>
          </div>
          
          <div className="mt-4">
            <Button
              variant="danger"
              onClick={() => toast.error('This feature is disabled in the demo')}
            >
              Delete Organization
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;