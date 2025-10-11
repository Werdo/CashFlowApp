import React, { useState } from 'react';
import { FileText, Upload, Download, Trash2, File } from 'lucide-react';
import './Documents.css';

const Documents = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Factura_Enero_2025.pdf', description: 'Factura mensual', fileType: 'application/pdf', fileSize: 245680, createdAt: '2025-01-15' },
    { id: 2, name: 'Recibo_Alquiler.pdf', description: '', fileType: 'application/pdf', fileSize: 156320, createdAt: '2025-01-10' }
  ]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar 10MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = () => {
      const fileData = reader.result.split(',')[1]; // base64

      // TODO: Call API
      setTimeout(() => {
        const newDoc = {
          id: documents.length + 1,
          name: file.name,
          description: '',
          fileType: file.type,
          fileSize: file.size,
          fileData,
          createdAt: new Date().toISOString()
        };
        setDocuments([newDoc, ...documents]);
        setUploading(false);
        e.target.value = '';
      }, 1000);
    };

    reader.readAsDataURL(file);
  };

  const handleDownload = (doc) => {
    // TODO: Call API to get fileData
    console.log('Download:', doc.id);
    // Mock download
    alert(`Descargando ${doc.name}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este documento?')) {
      // TODO: Call API
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div className="documents-header-left">
          <div className="documents-icon-wrapper">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="documents-title">Documentos</h1>
            <p className="documents-subtitle">{documents.length} documento{documents.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <label className="btn btn-primary">
          <Upload size={18} />
          {uploading ? 'Subiendo...' : 'Subir Documento'}
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        </label>
      </div>

      <div className="documents-grid">
        {documents.map(doc => (
          <div key={doc.id} className="document-card">
            <div className="document-icon">
              <File size={32} />
            </div>
            <div className="document-info">
              <h3 className="document-name">{doc.name}</h3>
              {doc.description && <p className="document-description">{doc.description}</p>}
              <div className="document-meta">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(doc.createdAt)}</span>
              </div>
            </div>
            <div className="document-actions">
              <button className="btn-icon" onClick={() => handleDownload(doc)} title="Descargar">
                <Download size={16} />
              </button>
              <button className="btn-icon btn-danger" onClick={() => handleDelete(doc.id)} title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="documents-empty">
          <FileText size={48} />
          <p>No hay documentos subidos</p>
          <label className="btn btn-primary">
            <Upload size={18} />
            Subir Primer Documento
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      )}
    </div>
  );
};

export default Documents;
