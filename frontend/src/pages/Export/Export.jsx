import React, { useState } from 'react';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import './Export.css';

const Export = () => {
  const [activeTab, setActiveTab] = useState('export');
  const [exportFilters, setExportFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: 'all',
    includeCategories: true,
    includeAlerts: true,
    includeDocuments: false,
  });
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    // TODO: Call API to export data
    setTimeout(() => {
      const exportData = {
        version: '3.0',
        exportDate: new Date().toISOString(),
        filters: exportFilters,
        data: {
          transactions: [],
          categories: exportFilters.includeCategories ? [] : undefined,
          alerts: exportFilters.includeAlerts ? [] : undefined,
          documents: exportFilters.includeDocuments ? [] : undefined,
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashflow-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExporting(false);
    }, 1000);
  };

  const handleDownloadTemplate = () => {
    const template = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      data: {
        transactions: [
          {
            id: 'example-1',
            type: 'income',
            amount: 1000,
            description: 'Salario ejemplo',
            date: '2025-01-01',
            hashtags: ['#trabajo'],
            group: 'Ingresos Fijos'
          }
        ],
        categories: [
          {
            id: 'example-cat-1',
            name: '#trabajo',
            type: 'hashtag',
            color: '#6c5dd3'
          }
        ]
      }
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cashflow-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);

        // Validate structure
        const errors = [];
        if (!jsonData.version) errors.push('Falta el campo "version"');
        if (!jsonData.data) errors.push('Falta el campo "data"');
        if (!jsonData.data?.transactions) errors.push('Falta el campo "data.transactions"');

        // Validate transactions
        if (jsonData.data?.transactions) {
          jsonData.data.transactions.forEach((tx, idx) => {
            if (!tx.type) errors.push(`Transacción ${idx + 1}: falta "type"`);
            if (!tx.amount) errors.push(`Transacción ${idx + 1}: falta "amount"`);
            if (!tx.date) errors.push(`Transacción ${idx + 1}: falta "date"`);
          });
        }

        setImportErrors(errors);
        setImportPreview(jsonData);
      } catch (err) {
        setImportErrors(['El archivo no es un JSON válido']);
        setImportPreview(null);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (importErrors.length > 0) {
      alert('El archivo tiene errores. Por favor corrígelos antes de importar.');
      return;
    }

    setImporting(true);
    // TODO: Call API to import data
    setTimeout(() => {
      alert(`Importados ${importPreview.data.transactions.length} transacciones correctamente`);
      setImportFile(null);
      setImportPreview(null);
      setImporting(false);
    }, 1500);
  };

  return (
    <div className="export-page">
      <div className="export-header">
        <div className="export-header-left">
          <div className="export-icon-wrapper">
            <Download size={32} />
          </div>
          <div>
            <h1 className="export-title">Exportar / Importar</h1>
            <p className="export-subtitle">Gestiona la exportación e importación de datos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="export-tabs">
        <button
          className={`export-tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <Download size={18} />
          Exportar
        </button>
        <button
          className={`export-tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          <Upload size={18} />
          Importar
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="export-content">
          <div className="export-card">
            <h2 className="export-card-title">Configuración de Exportación</h2>

            <div className="form-group">
              <label className="form-label">Rango de Fechas</label>
              <div className="form-row">
                <input
                  type="date"
                  className="form-input"
                  value={exportFilters.dateFrom}
                  onChange={(e) => setExportFilters({ ...exportFilters, dateFrom: e.target.value })}
                  placeholder="Desde"
                />
                <input
                  type="date"
                  className="form-input"
                  value={exportFilters.dateTo}
                  onChange={(e) => setExportFilters({ ...exportFilters, dateTo: e.target.value })}
                  placeholder="Hasta"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Transacción</label>
              <select
                className="form-input"
                value={exportFilters.type}
                onChange={(e) => setExportFilters({ ...exportFilters, type: e.target.value })}
              >
                <option value="all">Todas</option>
                <option value="income">Solo Ingresos</option>
                <option value="expense">Solo Gastos</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Datos Adicionales</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportFilters.includeCategories}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeCategories: e.target.checked })}
                  />
                  <span>Incluir Categorías</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportFilters.includeAlerts}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeAlerts: e.target.checked })}
                  />
                  <span>Incluir Alertas</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportFilters.includeDocuments}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeDocuments: e.target.checked })}
                  />
                  <span>Incluir Documentos</span>
                </label>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download size={18} />
              {exporting ? 'Exportando...' : 'Exportar Datos'}
            </button>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="export-content">
          <div className="export-card">
            <h2 className="export-card-title">Importar Datos</h2>

            <div className="import-template">
              <FileText size={24} />
              <div>
                <p className="import-template-title">¿No tienes un archivo?</p>
                <p className="import-template-subtitle">Descarga nuestra plantilla JSON de ejemplo</p>
              </div>
              <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
                <Download size={16} />
                Descargar Plantilla
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Seleccionar Archivo JSON</label>
              <input
                type="file"
                className="form-input"
                accept=".json"
                onChange={handleFileSelect}
              />
            </div>

            {importPreview && (
              <div className="import-preview">
                <h3 className="import-preview-title">Vista Previa</h3>

                {importErrors.length > 0 && (
                  <div className="import-errors">
                    <AlertCircle size={20} />
                    <div>
                      <p className="import-errors-title">Errores encontrados:</p>
                      <ul className="import-errors-list">
                        {importErrors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {importErrors.length === 0 && (
                  <div className="import-summary">
                    <div className="import-summary-item">
                      <span className="import-summary-label">Transacciones:</span>
                      <span className="import-summary-value">{importPreview.data.transactions?.length || 0}</span>
                    </div>
                    {importPreview.data.categories && (
                      <div className="import-summary-item">
                        <span className="import-summary-label">Categorías:</span>
                        <span className="import-summary-value">{importPreview.data.categories?.length || 0}</span>
                      </div>
                    )}
                    {importPreview.data.alerts && (
                      <div className="import-summary-item">
                        <span className="import-summary-label">Alertas:</span>
                        <span className="import-summary-value">{importPreview.data.alerts?.length || 0}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="btn btn-primary btn-full"
                  onClick={handleImport}
                  disabled={importing || importErrors.length > 0}
                >
                  <Upload size={18} />
                  {importing ? 'Importando...' : 'Importar Datos'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Export;
