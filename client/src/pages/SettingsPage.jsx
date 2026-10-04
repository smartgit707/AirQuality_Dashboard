import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  apiUpdateProfile,
  apiChangePassword,
  fetchCities
} from '../services/api';
import {
  Settings,
  User,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Shield,
  Mail
} from 'lucide-react';

export default function SettingsPage() {
  const { user, preferences, savePreferences, refreshMe } = useAuth();
  const [cities, setCities] = useState([]);

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);

  // Preference fields
  const [defaultCity, setDefaultCity] = useState(preferences?.default_city || 'Chennai');
  const [threshold, setThreshold] = useState(preferences?.alert_aqi_threshold || 100);
  const [emailNotif, setEmailNotif] = useState(preferences?.email_notifications ?? true);
  const [pushNotif, setPushNotif] = useState(preferences?.push_notifications ?? false);
  const [prefMsg, setPrefMsg] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [passErr, setPassErr] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    async function loadCities() {
      const res = await fetchCities();
      if (res.cities) setCities(res.cities);
    }
    loadCities();
  }, []);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (preferences) {
      if (preferences.default_city) setDefaultCity(preferences.default_city);
      if (preferences.alert_aqi_threshold) setThreshold(preferences.alert_aqi_threshold);
      if (preferences.email_notifications !== undefined) setEmailNotif(preferences.email_notifications);
      if (preferences.push_notifications !== undefined) setPushNotif(preferences.push_notifications);
    }
  }, [preferences]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);
    try {
      await apiUpdateProfile({ name });
      await refreshMe();
      setProfileMsg('Display name updated successfully.');
      setTimeout(() => setProfileMsg(null), 3500);
    } catch (err) {
      setProfileErr(err.message || 'Failed to update profile.');
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefMsg(null);
    try {
      await savePreferences({
        defaultCity,
        alertAqiThreshold: Number(threshold),
        emailNotifications: emailNotif,
        pushNotifications: pushNotif
      });
      setPrefMsg('Preferences saved and synchronized.');
      setTimeout(() => setPrefMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);
    setPassErr(null);

    if (newPassword.length < 6) {
      setPassErr('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErr('New passwords do not match.');
      return;
    }

    try {
      setPassLoading(true);
      await apiChangePassword({ currentPassword, newPassword });
      setPassMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassMsg(null), 3500);
    } catch (err) {
      setPassErr(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 18px rgba(99, 102, 241, 0.3)'
        }}>
          <Settings size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
            Account & Environmental Preferences
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Configure your notifications threshold, default station, and security credentials
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Profile & Monitoring Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <User size={18} color="#00f5a0" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Profile Identity
              </h2>
            </div>

            {profileMsg && (
              <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#34d399', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} /> {profileMsg}
              </div>
            )}
            {profileErr && (
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} /> {profileErr}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Email Address (Primary Identity)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    color: '#94a3b8',
                    fontSize: '0.88rem',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  System Role
                </label>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  color: user?.role === 'ADMIN' ? '#818cf8' : '#34d399',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Shield size={14} /> {user?.role === 'ADMIN' ? 'Platform Administrator (Full Permissions)' : 'Registered Citizen Observer'}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)',
                  border: '1px solid rgba(0, 245, 160, 0.4)',
                  color: '#042416',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 245, 160, 0.35)'
                }}
              >
                <Save size={15} /> Update Name
              </button>
            </form>
          </div>

          {/* Environmental Thresholds Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Sliders size={18} color="#10b981" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Monitoring Station & Alerts
              </h2>
            </div>

            {prefMsg && (
              <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#34d399', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} /> {prefMsg}
              </div>
            )}

            <form onSubmit={handleSavePreferences}>
              {/* Default City */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Default City Station
                </label>
                <select
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  {cities.map(c => (
                    <option key={c.key} value={c.name}>{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>

              {/* Threshold Slider */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Alert AQI Threshold
                  </label>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>
                    {threshold} AQI
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  <span>50 (Good)</span>
                  <span>100 (Moderate)</span>
                  <span>150 (Sensitive)</span>
                  <span>200+ (Severe)</span>
                </div>
              </div>

              {/* Notification Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span>Send email alerts when AQI exceeds threshold</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={pushNotif}
                    onChange={(e) => setPushNotif(e.target.checked)}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span>Enable push/in-app alert broadcasts</span>
                </label>
              </div>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Save size={15} /> Save Preferences
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security Credentials */}
        <div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Lock size={18} color="#f43f5e" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Security & Password
              </h2>
            </div>

            {passMsg && (
              <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#34d399', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} /> {passMsg}
              </div>
            )}
            {passErr && (
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} /> {passErr}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#f43f5e',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: passLoading ? 'not-allowed' : 'pointer',
                  opacity: passLoading ? 0.7 : 1
                }}
              >
                <Lock size={15} /> {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
