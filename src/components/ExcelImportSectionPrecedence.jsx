import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function ExcelImportSectionPrecedence({ 
  onImportSuccess, 
  API_URL = "/api",
  algorithmName = "Précédences"
}) {
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation du type de fichier
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setImportError("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      return;
    }

    setIsImporting(true);
    setImportSuccess(null);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format_type', 'precedence');

      console.log(`Importing ${algorithmName} file:`, file.name);

      const response = await fetch(`${API_URL}/ligne_assemblage/precedence/import-excel`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'import');
      }

      const data = await response.json();
      console.log("Données importées:", data);

      // Vérifier que nous avons les données attendues
      if (!data.tasks_data || !Array.isArray(data.tasks_data)) {
        throw new Error("Format de données invalide reçu du serveur");
      }

      // Appeler la fonction de callback avec les données importées
      if (onImportSuccess) {
        onImportSuccess(data);
      }

      setImportSuccess(`✅ Import ${algorithmName} réussi ! ${data.tasks_data.length} tâche(s) importée(s).`);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setImportSuccess(null), 3000);

      // Réinitialiser l'input file
      event.target.value = '';

    } catch (error) {
      console.error(`Erreur import Excel ${algorithmName}:`, error);
      setImportError(error.message);
      
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setImportError(null), 5000);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={isImporting}
          style={{
            position: 'absolute',
            opacity: 0,
            width: '100%',
            height: '100%',
            cursor: isImporting ? 'not-allowed' : 'pointer'
          }}
        />
        <button 
          className={`${styles.button} ${isImporting ? styles.disabled : ''}`}
          disabled={isImporting}
          type="button"
          style={{
            width: '100%',
            backgroundColor: isImporting ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '16px 20px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: isImporting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            textAlign: 'center',
            lineHeight: '1.4',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isImporting ? 'none' : '0 2px 4px rgba(40,167,69,0.3)'
          }}
        >
          {isImporting ? (
            <span>📥 Import {algorithmName} en cours...</span>
          ) : (
            <span>📥 Importer {algorithmName} depuis Excel</span>
          )}
        </button>
      </div>

      {/* Messages de feedback */}
      {importSuccess && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px 12px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: '4px',
          fontSize: '13px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {importSuccess}
        </div>
      )}
      
      {importError && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px 12px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          fontSize: '13px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {importError}
        </div>
      )}
    </div>
  );
}

export default ExcelImportSectionPrecedence; 