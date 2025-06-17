import React, { useState } from 'react';
import styles from './FlowshopContraintesForm.module.css';

const ExcelImportSectionFlowshopMM = ({ onImportSuccess, onGanttGenerated }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Vérifier l'extension
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/flowshop/machines_multiples/import-excel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'import');
      }

      const result = await response.json();
      setImportResult(result);
      
      if (onImportSuccess) {
        // Transmettre les données formatées pour l'interface
        const formattedData = {
          jobs: result.imported_data.jobs_data.map((jobStages, index) => ({
            name: result.imported_data.job_names[index],
            durations: jobStages.map(stageAlternatives => 
              stageAlternatives.map(([machineId, duration]) => duration)
            ),
            dueDate: result.imported_data.due_dates[index]
          })),
          stageNames: result.imported_data.stage_names,
          machinesPerStage: result.imported_data.machines_per_stage,
          unite: result.imported_data.unite
        };
        onImportSuccess(formattedData, result);
      }

    } catch (error) {
      console.error('Erreur import:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateGantt = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/flowshop/machines_multiples/import-excel-gantt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la génération du Gantt');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      if (onGanttGenerated) {
        onGanttGenerated(imageUrl);
      }

    } catch (error) {
      console.error('Erreur Gantt:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/Template-FlowshopMM_Vide.xlsx';
    link.download = 'Template-FlowshopMM_Vide.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExample = () => {
    const link = document.createElement('a');
    link.href = '/Template-FlowshopMM_Exemple.xlsx';
    link.download = 'Template-FlowshopMM_Exemple.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>📊 Import Excel FlowshopMM</h2>
      
      <div className={styles.templateSection}>
        <p>Téléchargez d'abord un template Excel :</p>
        <div className={styles.templateButtons}>
          <button onClick={downloadTemplate} className={styles.templateButton}>
            📄 Template vide
          </button>
          <button onClick={downloadExample} className={styles.templateButton}>
            📋 Exemple rempli
          </button>
        </div>
        <p className={styles.formatInfo}>
          <strong>Format spécial FlowshopMM :</strong> Les cellules peuvent contenir plusieurs durées séparées par des points-virgules.<br/>
          <em>Exemple :</em> "35" (une machine) ou "35; 43.4; 33.5" (plusieurs machines sur la même étape)
        </p>
      </div>

      <div className={styles.uploadSection}>
        <div className={styles.fileInputGroup}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className={styles.fileInput}
            id="flowshop-mm-file-input"
          />
          <label htmlFor="flowshop-mm-file-input" className={styles.fileInputLabel}>
            {file ? file.name : 'Choisir un fichier Excel'}
          </label>
        </div>

        <div className={styles.actionButtons}>
          <button 
            onClick={handleImport}
            disabled={!file || isUploading}
            className={styles.importButton}
          >
            {isUploading ? 'Import en cours...' : '📊 Importer & Calculer'}
          </button>
          
          <button 
            onClick={handleGenerateGantt}
            disabled={!file || isUploading}
            className={styles.ganttButton}
          >
            {isUploading ? 'Génération...' : '📈 Gantt direct'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {importResult && (
        <div className={styles.success}>
          <h3>✅ Import réussi !</h3>
          <div className={styles.resultSummary}>
            <p><strong>Jobs importés :</strong> {importResult.imported_data.job_names.length}</p>
            <p><strong>Étapes :</strong> {importResult.imported_data.stage_names.length}</p>
            <p><strong>Unité :</strong> {importResult.imported_data.unite}</p>
            <p><strong>Flowtime moyen :</strong> {importResult.flowtime_moyen?.toFixed(2) || 'N/A'}</p>
            <p><strong>Makespan :</strong> {importResult.makespan?.toFixed(2) || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImportSectionFlowshopMM; 