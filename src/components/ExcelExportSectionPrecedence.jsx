import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function ExcelExportSectionPrecedence({ 
  tasks,
  timeUnit = "minutes",
  algorithmName = "Précédences",
  API_URL = "/api"
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [exportError, setExportError] = useState(null);

  const handleExportData = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    setExportError(null);

    try {
      // Préparer les données pour l'export au format attendu par le backend
      const tasksDataFormatted = tasks.map(task => {
        let predecessors = null;
        if (task.predecessors && task.predecessors.trim() !== '') {
          const predecessorIds = task.predecessors.split(',')
            .map(p => parseInt(p.trim()))
            .filter(p => !isNaN(p));
          
          if (predecessorIds.length === 1) {
            predecessors = predecessorIds[0];
          } else if (predecessorIds.length > 1) {
            predecessors = predecessorIds;
          }
        }

        return {
          id: task.id,
          name: task.name,
          predecessors: predecessors,
          duration: task.duration
        };
      });

      const exportData = {
        tasks_data: tasksDataFormatted.map((task, index) => ({
          task_id: index + 1,
          name: task.name,
          duration: task.duration,
          predecessors: task.predecessors
        })),
        unite: timeUnit,
        format_type: "precedence"
      };

      // Vérifier que nous avons des données à exporter
      if (!exportData.tasks_data.length) {
        throw new Error("Aucune donnée à exporter. Veuillez saisir des tâches d'abord.");
      }

      console.log("Données Précédences à exporter:", exportData);

      const response = await fetch(`${API_URL}/ligne_assemblage/precedence/export-excel`, {
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
      link.download = `Export_${algorithmName.replace(/\s+/g, '_')}_Donnees_Manuelles.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(`✅ Données ${algorithmName} exportées avec succès !`);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setExportSuccess(null), 3000);

    } catch (error) {
      console.error('Erreur export Excel Précédences:', error);
      setExportError(error.message);
      
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Vérifier si nous avons des données à exporter
  const hasDataToExport = tasks && tasks.length > 0;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>📤 Export vers Excel</h3>
      
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
          <span>📤 Export {algorithmName} en cours...</span>
        ) : (
          <span>📤 Exporter {algorithmName} vers Excel (tâches, durées, prédécesseurs)</span>
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
          ✅ {exportSuccess}
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
}

export default ExcelExportSectionPrecedence; 