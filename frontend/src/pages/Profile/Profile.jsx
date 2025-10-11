import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Pedro García',
    email: 'pedro.garcia@example.com',
    phone: '+34 612 345 678',
    address: 'Madrid, España',
    birthdate: '1990-05-15',
    joinedDate: '2025-01-01',
    avatar: null,
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

  const handleSave = () => {
    // TODO: Call API to update profile
    setProfileData({ ...editedData });
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedData({ ...editedData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
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
          <button className="btn btn-primary" onClick={handleEdit}>
            <Edit2 size={16} />
            Editar Perfil
          </button>
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
            <button className="btn btn-secondary" onClick={handleCancel}>
              <X size={16} />
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} />
              Guardar Cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
