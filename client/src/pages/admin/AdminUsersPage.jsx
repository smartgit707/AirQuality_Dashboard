import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetAdminUsers,
  apiToggleUserStatus,
  apiChangeUserRole,
  apiDeleteUser
} from '../../services/api';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';

export default function AdminUsersPage({ onBack }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await apiGetAdminUsers();
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      setError('You cannot deactivate your own administrative account.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const res = await apiToggleUserStatus(user.id);
      setMsg(res.message);
      setTimeout(() => setMsg(null), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (user.id === currentUser?.id) {
      setError('You cannot modify your own administrator role.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const res = await apiChangeUserRole(user.id, newRole);
      setMsg(res.message);
      setTimeout(() => setMsg(null), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      setError('You cannot delete your own administrative account.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete account for ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      const res = await apiDeleteUser(user.id);
      setMsg(res.message);
      setTimeout(() => setMsg(null), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Header & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} /> Admin Console
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              User & Privilege Management
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Enforce Role-Based Access Control and audit active accounts
            </p>
          </div>
        </div>

        <span style={{
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '6px 14px',
          borderRadius: '12px',
          fontSize: '0.82rem',
          fontWeight: 600
        }}>
          Total: {users.length} Registered Accounts
        </span>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          color: '#34d399',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#fca5a5',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email address..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '0.86rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Role Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="#94a3b8" />
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Filter Role:</span>
          {['ALL', 'USER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: roleFilter === r ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                background: roleFilter === r ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                color: roleFilter === r ? '#60a5fa' : '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>User ID</th>
                <th style={{ padding: '12px 14px' }}>Name & Email</th>
                <th style={{ padding: '12px 14px' }}>Role</th>
                <th style={{ padding: '12px 14px' }}>Account Status</th>
                <th style={{ padding: '12px 14px' }}>Registered At</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                      <td style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600 }}>
                        #{u.id}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {u.name} {isSelf && <span style={{ fontSize: '0.72rem', color: '#10b981' }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <select
                          disabled={isSelf}
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          style={{
                            background: u.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                            border: u.role === 'ADMIN' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
                            color: u.role === 'ADMIN' ? '#818cf8' : '#34d399',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="USER" style={{ background: '#1e293b', color: '#f8fafc' }}>USER</option>
                          <option value="ADMIN" style={{ background: '#1e293b', color: '#f8fafc' }}>ADMIN</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: u.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.is_active ? '#34d399' : '#fca5a5'
                        }}>
                          {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(u)}
                            title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                            style={{
                              background: u.is_active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              border: 'none',
                              color: u.is_active ? '#ef4444' : '#10b981',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              opacity: isSelf ? 0.4 : 1
                            }}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            disabled={isSelf}
                            onClick={() => handleDeleteUser(u)}
                            title="Delete Account"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: 'none',
                              color: '#f87171',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              opacity: isSelf ? 0.4 : 1
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '36px 0', textAlign: 'center', color: '#64748b' }}>
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
