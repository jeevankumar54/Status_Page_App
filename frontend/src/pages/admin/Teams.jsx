import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PageTitle from '../../components/common/PageTitle';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/common/Modal';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

const Teams = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
  });
  
  const [userFormData, setUserFormData] = useState({
    email: '',
    role: 'member',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch teams
  const { data: teams, isLoading: isLoadingTeams } = useQuery(
    'teams',
    async () => {
      const response = await api.get('/api/v1/teams');
      return response.data;
    },
    {
      onError: (error) => {
        toast.error('Failed to load teams');
        console.error('Error fetching teams:', error);
      },
    }
  );

  // Fetch team users when a team is selected
  const { data: teamUsers, isLoading: isLoadingUsers } = useQuery(
    ['team-users', selectedTeam?.id],
    async () => {
      const response = await api.get(`/api/v1/teams/${selectedTeam.id}/users`);
      return response.data;
    },
    {
      enabled: !!selectedTeam?.id,
      onError: (error) => {
        toast.error('Failed to load team members');
        console.error('Error fetching team members:', error);
      },
    }
  );

  // Create team mutation
  const createTeamMutation = useMutation(
    async (data) => {
      const response = await api.post('/api/v1/teams', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('teams');
        toast.success('Team created successfully');
        setIsTeamModalOpen(false);
        setIsSubmitting(false);
        setTeamFormData({ name: '', description: '' });
      },
      onError: (error) => {
        console.error('Error creating team:', error);
        toast.error('Failed to create team');
        setIsSubmitting(false);
      },
    }
  );

  // Update team mutation
  const updateTeamMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/v1/teams/${id}`, data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('teams');
        
        if (selectedTeam?.id === data.id) {
          setSelectedTeam(data);
        }
        
        toast.success('Team updated successfully');
        setIsTeamModalOpen(false);
        setIsSubmitting(false);
        setEditingTeam(null);
        setTeamFormData({ name: '', description: '' });
      },
      onError: (error) => {
        console.error('Error updating team:', error);
        toast.error('Failed to update team');
        setIsSubmitting(false);
      },
    }
  );

  // Delete team mutation
  const deleteTeamMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/v1/teams/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teams');
        
        if (selectedTeam?.id === deletingTeam?.id) {
          setSelectedTeam(null);
        }
        
        toast.success('Team deleted successfully');
        setIsDeleteModalOpen(false);
        setDeletingTeam(null);
      },
      onError: (error) => {
        console.error('Error deleting team:', error);
        toast.error('Failed to delete team');
      },
    }
  );

  // Add user to team mutation
  const addUserMutation = useMutation(
    async ({ teamId, data }) => {
      const response = await api.post(`/api/v1/teams/${teamId}/users`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team-users', selectedTeam?.id]);
        toast.success('User added to team successfully');
        setIsUserModalOpen(false);
        setIsSubmitting(false);
        setUserFormData({ email: '', role: 'member' });
      },
      onError: (error) => {
        console.error('Error adding user to team:', error);
        toast.error(error.response?.data?.detail || 'Failed to add user to team');
        setIsSubmitting(false);
      },
    }
  );

  // Remove user from team mutation
  const removeUserMutation = useMutation(
    async ({ teamId, userId }) => {
      const response = await api.delete(`/api/v1/teams/${teamId}/users/${userId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team-users', selectedTeam?.id]);
        toast.success('User removed from team successfully');
      },
      onError: (error) => {
        console.error('Error removing user from team:', error);
        toast.error('Failed to remove user from team');
      },
    }
  );

  // Handle team selection
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  // Handle form changes
  const handleTeamFormChange = (e) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validation
  const validateTeamForm = () => {
    const newErrors = {};
    
    if (!teamFormData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUserForm = () => {
    const newErrors = {};
    
    if (!userFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userFormData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submissions
  const handleTeamFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTeamForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingTeam) {
        await updateTeamMutation.mutateAsync({
          id: editingTeam.id,
          data: teamFormData,
        });
      } else {
        await createTeamMutation.mutateAsync(teamFormData);
      }
    } catch (error) {
      console.error('Error submitting team form:', error);
      setIsSubmitting(false);
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateUserForm() || !selectedTeam) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addUserMutation.mutateAsync({
        teamId: selectedTeam.id,
        data: userFormData,
      });
    } catch (error) {
      console.error('Error submitting user form:', error);
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!selectedTeam) return;
    
    try {
      await removeUserMutation.mutateAsync({
        teamId: selectedTeam.id,
        userId,
      });
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const handleAddTeam = () => {
    setEditingTeam(null);
    setTeamFormData({ name: '', description: '' });
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamFormData({
      name: team.name,
      description: team.description || '',
    });
    setIsTeamModalOpen(true);
  };

  const handleDeleteClick = (team) => {
    setDeletingTeam(team);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTeam) return;
    
    try {
      await deleteTeamMutation.mutateAsync(deletingTeam.id);
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  // Define columns for the team users table
  const userColumns = [
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Name',
      accessor: 'full_name',
      render: (user) => user.full_name || '-',
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (user) => (
        <Badge variant={user.role === 'admin' ? 'blue' : 'gray'}>
          {user.role === 'admin' ? 'Admin' : 'Member'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (user) => (
        <button
          className="text-danger-600 hover:text-danger-900"
          onClick={() => handleRemoveUser(user.id)}
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Teams" 
        description="Manage your organization teams"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team List */}
        <div className="md:col-span-1">
          <Card 
            title="Teams"
            headerActions={
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddTeam}
              >
                Add Team
              </Button>
            }
          >
            {isLoadingTeams ? (
              <div className="flex justify-center items-center h-24">
                <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : teams && teams.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {teams.map((team) => (
                  <div 
                    key={team.id} 
                    className={`
                      py-3 px-2 cursor-pointer hover:bg-neutral-50 flex justify-between items-center
                      ${selectedTeam?.id === team.id ? 'bg-primary-50' : ''}
                    `}
                    onClick={() => handleTeamSelect(team)}
                  >
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">{team.name}</h3>
                      {team.description && (
                        <p className="mt-1 text-xs text-neutral-500 truncate">{team.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-1 text-neutral-400 hover:text-neutral-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTeam(team);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="p-1 text-neutral-400 hover:text-danger-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(team);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-neutral-500">No teams found</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleAddTeam}
                >
                  Create Team
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Team Members */}
        <div className="md:col-span-2">
          <Card 
            title={selectedTeam ? `${selectedTeam.name} Members` : 'Team Members'}
            subtitle={selectedTeam?.description}
            headerActions={
              selectedTeam && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsUserModalOpen(true)}
                >
                  Add Member
                </Button>
              )
            }
          >
            {selectedTeam ? (
              <Table
                columns={userColumns}
                data={teamUsers || []}
                isLoading={isLoadingUsers}
                emptyMessage="No members in this team"
              />
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-neutral-900">Select a team</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Select a team from the list to view its members
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Team Form Modal */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={editingTeam ? 'Edit Team' : 'Create Team'}
        size="md"
      >
        <form onSubmit={handleTeamFormSubmit}>
          <div className="space-y-4">
            <Input
              label="Team Name"
              id="name"
              name="name"
              value={teamFormData.name}
              onChange={handleTeamFormChange}
              placeholder="Engineering Team"
              error={errors.name}
              required
            />
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={teamFormData.description}
                onChange={handleTeamFormChange}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Team responsible for engineering and development"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTeamModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingTeam ? 'Update Team' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={`Add Member to ${selectedTeam?.name}`}
        size="md"
      >
        <form onSubmit={handleUserFormSubmit}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={userFormData.email}
              onChange={handleUserFormChange}
              placeholder="user@example.com"
              error={errors.email}
              required
            />
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={userFormData.role}
                onChange={handleUserFormChange}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUserModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Team"
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
          Are you sure you want to delete the team "{deletingTeam?.name}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Teams;