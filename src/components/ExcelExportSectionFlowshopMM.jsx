import React, { useState } from 'react';
import styles from './ExcelExportSection.module.css';

const ExcelExportSectionFlowshopMM = ({ jobs, stageNames, machinesPerStage, unite }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const handleExport = async () => {
    if (!jobs || jobs.length === 0) {
      setError('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    setError('');

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

      console.log('Données export FlowshopMM:', exportData);

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
      link.download = `flowshop_mm_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur export:', error);
      setError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>📤 Export Excel FlowshopMM</h2>
      
      <div className={styles.exportInfo}>
        <p>Exportez vos données actuelles vers un fichier Excel avec le format FlowshopMM.</p>
        <p className={styles.formatInfo}>
          <strong>Format spécial :</strong> Les cellules contiendront les durées séparées par des points-virgules.<br/>
          <em>Exemple :</em> "35" (une machine) ou "35; 43.4; 33.5" (plusieurs machines)
        </p>
        {jobs && jobs.length > 0 && (
          <div className={styles.dataPreview}>
            <p><strong>Données à exporter :</strong></p>
            <ul>
              <li>Jobs : {jobs.length}</li>
              <li>Étapes : {stageNames?.length || 0}</li>
              <li>Unité : {unite || "heures"}</li>
            </ul>
          </div>
        )}
      </div>

      <div className={styles.exportActions}>
        <button 
          onClick={handleExport}
          disabled={!jobs || jobs.length === 0 || isExporting}
          className={styles.exportButton}
        >
          {isExporting ? 'Export en cours...' : '📤 Exporter vers Excel'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Erreur :</strong> {error}
        </div>
      )}
    </div>
  );
};

export default ExcelExportSectionFlowshopMM; 