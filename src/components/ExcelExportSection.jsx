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
      
      // Unifier le formatage pour tous les algorithmes comme Johnson qui fonctionne
      jobsDataFormatted = jobs.map(job => {
        if (Array.isArray(job)) {
          return job.map(task => {
            // Si c'est un objet avec une propriété duration (SPT, EDD)
            if (task && typeof task === 'object' && task.duration !== undefined) {
              return parseFloat(task.duration) || 0;
            }
            // Si c'est directement une valeur (Johnson, contraintes)
            else {
              return parseFloat(task) || 0;
            }
          });
        }
        // Si c'est un objet avec durations (contraintes)
        else if (job && typeof job === 'object' && job.durations) {
          return job.durations.map(d => parseFloat(d) || 0);
        }
        return [];
      });

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

      setExportSuccess(`✅ Données exportées avec succès !`);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setExportSuccess(null), 3000);

    } catch (error) {
      console.error('Erreur export Excel:', error);
      setExportError(error.message);
      
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Vérifier si nous avons des données à exporter
  const hasDataToExport = jobs && jobs.length > 0 && 
                         jobNames && jobNames.length > 0 && 
                         machineNames && machineNames.length > 0;

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
          padding: '12px 20px',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: hasDataToExport ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s'
        }}
      >
        {isExporting ? '⏳ Export en cours...' : '📤 Exporter vers Excel'}
      </button>
      
      {exportSuccess && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          {exportSuccess}
        </div>
      )}
      
      {exportError && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          ❌ {exportError}
        </div>
      )}
    </div>
  );
}

export default ExcelExportSection; 