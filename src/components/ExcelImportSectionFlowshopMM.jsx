import React, { useState } from 'react';
import styles from './FlowshopContraintesForm.module.css';

const ExcelImportSectionFlowshopMM = ({ onImportSuccess, onGanttGenerated }) => {
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const handleDownloadTemplate = (downloadType) => {
    try {
      let fileName;
      if (downloadType === 'exemple') {
        fileName = 'Template-FlowshopMM_Exemple.xlsx';
      } else {
        fileName = 'Template-FlowshopMM_Vide.xlsx';
      }
      
      const link = document.createElement('a');
      link.href = `/${fileName}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur téléchargement template:', error);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier l'extension
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      event.target.value = '';
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportSuccess(null);

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

      setImportSuccess(`✅ Fichier "${file.name}" importé avec succès ! ${result.imported_data.job_names.length} jobs et ${result.imported_data.stage_names.length} étapes détectés.`);

    } catch (error) {
      console.error('Erreur import:', error);
      setError(error.message);
    } finally {
      setIsImporting(false);
      // Réinitialiser l'input file
      event.target.value = '';
    }
  };

  const handleGanttDirect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

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
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>📊 Import depuis Excel</h3>
      
      <div className={styles.importToggle}>
        <label className={styles.toggleLabel}>
          <input 
            type="checkbox" 
            checked={showImportOptions} 
            onChange={() => setShowImportOptions(!showImportOptions)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxCustom}></span>
          Activer l'import depuis Excel
        </label>
      </div>

      {showImportOptions && (
        <div className={styles.importSection}>
          <div className={styles.importInfo}>
            <p className={styles.importDescription}>
              Importez vos données depuis un fichier Excel pour un traitement automatique avec l'algorithme FlowshopMM.
              Téléchargez d'abord un template pour voir la structure attendue (format machines multiples avec points-virgules).
            </p>
          </div>
          
          <div className={styles.importActions}>
            <div className={styles.templateButtons}>
              <button 
                className={styles.templateButton}
                onClick={() => handleDownloadTemplate('exemple')}
                type="button"
              >
                📄 Template avec exemple
              </button>
              <button 
                className={styles.templateButton}
                onClick={() => handleDownloadTemplate('vide')}
                type="button"
              >
                📄 Template vide
              </button>
            </div>
            
            <div className={styles.importUpload}>
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className={styles.fileInput}
                  disabled={isImporting}
                />
                <span className={styles.uploadButton}>
                  {isImporting ? '⏳ Import en cours...' : '📥 Importer & Calculer'}
                </span>
              </label>
            </div>

            <div className={styles.importUpload}>
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleGanttDirect}
                  className={styles.fileInput}
                  disabled={isImporting}
                />
                <span className={styles.uploadButton}>
                  {isImporting ? '⏳ Génération...' : '📈 Gantt direct'}
                </span>
              </label>
            </div>
          </div>
          
          {importSuccess && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✅</span>
              {importSuccess}
            </div>
          )}
          
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>❌</span>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelImportSectionFlowshopMM; 