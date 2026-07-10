import React, { useState, useEffect } from 'react';
import api from '../../../utils/api.js';
import Table from '../../ui/Table.jsx';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Modal from '../../Modal.jsx';
import { Edit, Key, Trash2, UserCheck, UserX, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDept, setEditDept] = useState('');
  const [editSpec, setEditSpec] = useState('');
  const [editContact, setEditContact] = useState('');

  // Password reset state
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/users';
      const params = [];
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (statusFilter) params.push(`isActive=${statusFilter === 'active'}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      const response = await api.get(url);
      setUsers(response.data.data);
    } catch (err) {
      console.error(err);
      triggerMessage('error', 'Failed to retrieve user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const triggerMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    if (user.role === 'doctor' && user.doctorProfile) {
      setEditDept(user.doctorProfile.department || '');
      setEditSpec(user.doctorProfile.specialization || '');
      setEditContact(user.doctorProfile.contactNumber || '');
    } else {
      setEditDept('');
      setEditSpec('');
      setEditContact('');
    }
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = {
      name: editName,
      email: editEmail,
      role: editRole,
      isActive: editIsActive,
      ...(editRole === 'doctor' && {
        department: editDept,
        specialization: editSpec,
        contactNumber: editContact
      })
    };

    try {
      await api.put(`/users/${selectedUser._id}`, payload);
      triggerMessage('success', 'User profile updated successfully.');
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      triggerMessage('error', err.response?.data?.message || 'Failed to update user profile.');
    }
  };

  const handlePasswordClick = (user) => {
    setSelectedUser(user);
    setResetPasswordVal('');
    setIsPasswordOpen(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (resetPasswordVal.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await api.patch(`/users/${selectedUser._id}/reset-password`, { password: resetPasswordVal });
      triggerMessage('success', `Password for ${selectedUser.name} reset successfully.`);
      setIsPasswordOpen(false);
    } catch (err) {
      triggerMessage('error', err.response?.data?.message || 'Failed to reset password.');
    }
  };

  const handleStatusToggle = async (user) => {
    const nextState = !user.isActive;
    const confirmMsg = nextState
      ? `Are you sure you want to activate ${user.name}?`
      : `Are you sure you want to deactivate ${user.name}? This will invalidate their current session.`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/users/${user._id}/status`, { isActive: nextState });
      triggerMessage('success', `User account ${nextState ? 'activated' : 'deactivated'} successfully.`);
      fetchUsers();
    } catch (err) {
      triggerMessage('error', err.response?.data?.message || 'Failed to change user status.');
    }
  };

  const handleDeleteClick = async (user) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete the account for ${user.name}? This cannot be undone.`)) return;

    try {
      await api.delete(`/users/${user._id}`);
      triggerMessage('success', 'User account deleted successfully.');
      fetchUsers();
    } catch (err) {
      triggerMessage('error', err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Local filtering for live search
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q) ||
      (user.role === 'doctor' && user.doctorProfile && (
        user.doctorProfile.department.toLowerCase().includes(q) ||
        user.doctorProfile.specialization.toLowerCase().includes(q)
      ))
    );
  });

  const headers = [
    'Name',
    'Email Address',
    'System Role',
    'Status',
    'Details',
    'Actions'
  ];

  const deptOptions = [
    { value: '', label: 'Select Department' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Orthopedics', label: 'Orthopedics' }
  ];

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'doctor', label: 'Doctor' }
  ];

  return (
    <div>
      {message.text && (
        <div 
          className="animate-fade-in" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 16px', 
            borderRadius: '6px', 
            marginBottom: '20px', 
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', 
            border: message.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca', 
            color: message.type === 'success' ? '#065f46' : '#991b1b' 
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '16px', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid var(--border-light)'
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              outline: 'none',
              backgroundColor: '#fff',
              transition: 'border-color 0.15s ease-in-out'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.9rem', outline: 'none' }}
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="receptionist">Receptionist</option>
            <option value="doctor">Doctor</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.9rem', outline: 'none' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <Table 
        headers={headers} 
        loading={loading} 
        emptyMessage="No users found matching the filter criteria."
      >
        {filteredUsers.map((user) => (
          <tr key={user._id}>
            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.name}
            </td>
            <td>{user.email}</td>
            <td>
              <span 
                style={{ 
                  textTransform: 'capitalize',
                  backgroundColor: user.role === 'super_admin' ? '#fee2e2' : user.role === 'doctor' ? '#dbeafe' : '#f1f5f9', 
                  color: user.role === 'super_admin' ? '#991b1b' : user.role === 'doctor' ? '#1e40af' : '#475569',
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {user.role.replace('_', ' ')}
              </span>
            </td>
            <td>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: user.isActive ? 'var(--success)' : 'var(--text-muted)'
                  }}
                ></span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </td>
            <td>
              {user.role === 'doctor' && user.doctorProfile ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Dept:</strong> {user.doctorProfile.department}<br />
                  <strong>Spec:</strong> {user.doctorProfile.specialization}<br />
                  <strong>Phone:</strong> {user.doctorProfile.contactNumber}
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Staff Account</span>
              )}
            </td>
            <td>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  title="Edit Profile"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    color: 'var(--primary)',
                    padding: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => handleEditClick(user)}
                >
                  <Edit size={14} />
                </button>

                <button
                  title="Reset Password"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    color: 'var(--warning)',
                    padding: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => handlePasswordClick(user)}
                >
                  <Key size={14} />
                </button>

                <button
                  title={user.isActive ? 'Deactivate User' : 'Activate User'}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    color: user.isActive ? 'var(--danger)' : 'var(--success)',
                    padding: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => handleStatusToggle(user)}
                >
                  {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                </button>

                <button
                  title="Delete User"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    color: 'var(--danger)',
                    padding: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => handleDeleteClick(user)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit User Account Details">
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Full Name"
              id="editName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              id="editEmail"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
            <Select
              label="System Role"
              id="editRole"
              options={roleOptions}
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              required
            />

            {editRole === 'doctor' && (
              <div 
                style={{ 
                  border: '1px solid var(--border-light)', 
                  padding: '16px', 
                  borderRadius: '6px', 
                  backgroundColor: '#f8fafc',
                  marginTop: '4px' 
                }}
              >
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Practitioner Profile Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Select
                    label="Medical Department"
                    id="editDept"
                    options={deptOptions}
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    required={editRole === 'doctor'}
                  />
                  <Input
                    label="Specialization"
                    id="editSpec"
                    value={editSpec}
                    onChange={(e) => setEditSpec(e.target.value)}
                    required={editRole === 'doctor'}
                  />
                  <Input
                    label="Contact Number"
                    id="editContact"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    required={editRole === 'doctor'}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="editIsActive" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Account is Active
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" style={{ flex: 1 }}>
                Update User
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} title="Reset User Password">
        <form onSubmit={handlePasswordSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Enter a new portal password for <strong>{selectedUser?.name}</strong>. The user's active session will be invalidated and they must re-authenticate.
            </p>
            <Input
              label="New Password"
              id="resetPasswordVal"
              type="password"
              placeholder="Minimum 6 characters"
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsPasswordOpen(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" style={{ flex: 1 }}>
                Reset Password
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserDirectory;
