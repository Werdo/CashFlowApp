import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import Button from '../../components/Button/Button';
import './Profile.css';

const Profile = () => {
  const { success: notifySuccess, error: notifyError } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Pedro García',
    email: 'pedro.garcia@example.com',
    phone: '+34 612 345 678',
    address: 'Madrid, España',
    birthdate: '1990-05-15',
    joinedDate: '2025-01-01',
    avatar: localStorage.getItem('user-avatar') || null,
  });

  const [editedData, setEditedData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...profileData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...profileData });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        setProfileData({ ...editedData });
        setIsEditing(false);
        notifySuccess('Perfil actualizado correctamente');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      notifyError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      notifyError('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notifyError('La imagen debe ser menor a 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setEditedData({ ...editedData, avatar: base64 });
      localStorage.setItem('user-avatar', base64);
      notifySuccess('Avatar actualizado');
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-left">
          <div className="profile-icon-wrapper">
            <User size={32} />
          </div>
          <div>
            <h1 className="profile-title">Mi Perfil</h1>
            <p className="profile-subtitle">Gestiona tu información personal</p>
          </div>
        </div>
        {!isEditing && (
          <Button
            variant="primary"
            icon={<Edit2 size={16} />}
            onClick={handleEdit}
          >
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {(isEditing ? editedData.avatar : profileData.avatar) ? (
              <img
                src={isEditing ? editedData.avatar : profileData.avatar}
                alt="Avatar"
                className="avatar-image"
              />
            ) : (
              <User size={64} />
            )}
            {isEditing && (
              <label className="avatar-upload">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          <div className="profile-avatar-info">
            <h2 className="profile-name">{profileData.name}</h2>
            <p className="profile-email">{profileData.email}</p>
            <div className="profile-joined">
              <Calendar size={14} />
              <span>Miembro desde {formatDate(profileData.joinedDate)}</span>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="profile-info-grid">
          {/* Personal Information */}
          <div className="profile-info-card">
            <h3 className="info-card-title">Información Personal</h3>
            <div className="info-card-content">
              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  <span>Nombre Completo</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                  />
                ) : (
                  <span className="info-value">{profileData.name}</span>
                )}
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  <span>Fecha de Nacimiento</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    className="form-input"
                    value={editedData.birthdate}
                    onChange={(e) => setEditedData({ ...editedData, birthdate: e.target.value })}
                  />
                ) : (
                  <span className="info-value">{formatDate(profileData.birthdate)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="profile-info-card">
            <h3 className="info-card-title">Información de Contacto</h3>
            <div className="info-card-content">
              <div className="info-item">
                <div className="info-label">
                  <Mail size={18} />
                  <span>Email</span>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    className="form-input"
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  />
                ) : (
                  <span className="info-value">{profileData.email}</span>
                )}
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Phone size={18} />
                  <span>Teléfono</span>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-input"
                    value={editedData.phone}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                  />
                ) : (
                  <span className="info-value">{profileData.phone}</span>
                )}
              </div>

              <div className="info-item">
                <div className="info-label">
                  <MapPin size={18} />
                  <span>Dirección</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editedData.address}
                    onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                  />
                ) : (
                  <span className="info-value">{profileData.address}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="profile-actions">
            <Button
              variant="secondary"
              icon={<X size={16} />}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              loading={loading}
              disabled={loading}
            >
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
