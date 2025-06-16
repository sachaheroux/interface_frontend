import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function ExcelExportSection({ 
  jobs,
  dueDates,
  jobNames,
  machineNames,
  unite = "heures",
  algorithmName = "algorithme",
  API_URL = "/api",
  algorithmEndpoint = "spt"
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [exportError, setExportError] = useState(null);

  const handleExportData = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    setExportError(null);

    try {
      // Préparer les données pour l'export selon le format de l'algorithme
      let jobsDataFormatted;
      
      if (algorithmEndpoint === 'contraintes') {
        // Format Contraintes: jobs = [{name, durations, dueDate}, ...]
        jobsDataFormatted = jobs.map(job => 
          job.durations ? job.durations.map(d => parseFloat(d) || 0) : []
        );
      } else {
        // Format standard (SPT, Johnson, etc.) ou format EDD
        jobsDataFormatted = jobs.map(job => {
          if (Array.isArray(job)) {
            // Format standard: [[duration1, duration2, ...], ...]
            return job.map(duration => parseFloat(duration) || 0);
          } else if (job.map) {
            // Format EDD: [{duration: "value"}, {duration: "value"}, ...]
            return job.map(task => parseFloat(task.duration) || 0);
          }
          return [];
        });
      }

      const exportData = {
        jobs_data: jobsDataFormatted,
        due_dates: dueDates.map(date => parseFloat(date) || 0),
        job_names: jobNames,
        machine_names: machineNames,
        unite: unite
      };

      // Vérifier que nous avons des données à exporter
      if (!exportData.jobs_data.length || !exportData.job_names.length) {
        throw new Error("Aucune donnée à exporter. Veuillez saisir des données d'abord.");
      }

      const response = await fetch(`${API_URL}/${algorithmEndpoint}/export-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'export');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Export_${algorithmName}_Donnees_Manuelles.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(`✅ Données exportées avec succès ! Le fichier Excel contient ${exportData.job_names.length} jobs et ${exportData.machine_names.length} machines.`);

    } catch (error) {
      console.error('Erreur export Excel:', error);
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Vérifier si nous avons des données à exporter
  const hasDataToExport = jobs && jobs.length > 0 && 
                         jobNames && jobNames.length > 0 && 
                         machineNames && machineNames.length > 0;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>📤 Export vers Excel</h3>
      
      <div className={styles.exportSection}>
        <div className={styles.exportInfo}>
          <p className={styles.exportDescription}>
            Exportez vos données saisies manuellement vers un fichier Excel pour les sauvegarder, 
            les partager ou les réutiliser plus tard.
          </p>
          
          {hasDataToExport && (
            <div className={styles.exportStats}>
              <span className={styles.statItem}>
                📊 {jobs.length} jobs
              </span>
              <span className={styles.statItem}>
                ⚙️ {machineNames.length} machines
              </span>
              <span className={styles.statItem}>
                ⏱️ Unité: {unite}
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.exportActions}>
          <button 
            className={`${styles.exportButton} ${!hasDataToExport ? styles.disabled : ''}`}
            onClick={handleExportData}
            disabled={isExporting || !hasDataToExport}
            type="button"
          >
            {isExporting ? '⏳ Export en cours...' : '📤 Exporter vers Excel'}
          </button>
          
          {!hasDataToExport && (
            <p className={styles.noDataMessage}>
              ⚠️ Saisissez d'abord des données pour pouvoir les exporter
            </p>
          )}
        </div>
        
        {exportSuccess && (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>✅</span>
            {exportSuccess}
          </div>
        )}
        
        {exportError && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>❌</span>
            {exportError}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExcelExportSection; 