import React, { useState } from 'react';
import styles from './FlowshopContraintesForm.module.css';

const ExcelExportSectionFlowshopMM = ({ jobs, stageNames, machinesPerStage, unite }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [exportError, setExportError] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const handleExportData = async () => {
    if (!jobs || jobs.length === 0) {
      setExportError('Aucune donnée à exporter');
      setTimeout(() => setExportError(null), 5000);
      return;
    }

    setIsExporting(true);
    setExportSuccess(null);
    setExportError(null);

    try {
      // Convertir les données au format FlowshopMM pour l'API
      const exportData = {
        jobs_data: jobs.map(job => 
          job.durations.map((stageDurations, stageIndex) => 
            stageDurations.map((duration, altIndex) => {
              // Machine ID : étape (base 1) * 10 + (alternative + 1)
              const machineId = (stageIndex + 1) * 10 + (altIndex + 1);
              return [machineId, parseFloat(duration) || 0];
            })
          )
        ),
        due_dates: jobs.map(job => parseFloat(job.dueDate) || 0),
        job_names: jobs.map(job => job.name || ''),
        stage_names: stageNames || [],
        machines_per_stage: machinesPerStage || [],
        unite: unite || "heures"
      };

      const response = await fetch(`${API_URL}/flowshop/machines_multiples/export-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'export');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Export_FlowshopMM_Donnees_Manuelles.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportSuccess(`✅ Données exportées avec succès !`);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setExportSuccess(null), 3000);

    } catch (error) {
      console.error('Erreur export:', error);
      setExportError(error.message);
      
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Vérifier si nous avons des données à exporter
  const hasDataToExport = jobs && jobs.length > 0 && 
                         stageNames && stageNames.length > 0;

  return (
    <div style={{ marginBottom: '20px' }}>
      <button 
        className={`${styles.button} ${!hasDataToExport ? styles.disabled : ''}`}
        onClick={handleExportData}
        disabled={isExporting || !hasDataToExport}
        type="button"
        style={{
          width: '100%',
          backgroundColor: hasDataToExport ? '#007bff' : '#6c757d',
          color: 'white',
          border: 'none',
          padding: '16px 20px',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 'bold',
          cursor: hasDataToExport ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s',
          textAlign: 'center',
          lineHeight: '1.4',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hasDataToExport ? '0 2px 4px rgba(0,123,255,0.3)' : 'none'
        }}
      >
        {isExporting ? (
          <span>📤 Export FlowshopMM en cours...</span>
        ) : (
          <span>📤 Exporter FlowshopMM vers Excel (format machines multiples)</span>
        )}
      </button>

      {/* Messages de feedback */}
      {exportSuccess && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px 12px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: '4px',
          fontSize: '13px',
          border: '1px solid #c3e6cb'
        }}>
          {exportSuccess}
        </div>
      )}
      
      {exportError && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px 12px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          fontSize: '13px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {exportError}
        </div>
      )}
    </div>
  );
};

export default ExcelExportSectionFlowshopMM; 