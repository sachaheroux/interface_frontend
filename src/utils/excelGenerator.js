// Générateur de templates Excel pour Flowshop
// Utilise un format CSV propre qui s'ouvre parfaitement dans Excel

export const createFlowshopTemplate = (templateType = "exemple") => {
  const isExample = templateType === "exemple";
  
  let csvContent = "";
  
  if (isExample) {
    // Template avec exemple - Structure matrice comme l'interface
    csvContent = `Job,Découpe,Assemblage,Finition,Date Due
Job_A,4,2,3,12
Job_B,3,4,2,15
Job_C,5,2,4,18
Job_D,,,
Job_E,,,
Job_F,,,
Job_G,,,
Job_H,,,
Job_I,,,
Job_J,,,

INSTRUCTIONS - Comment utiliser ce template:
,
"1. STRUCTURE:",
"• Première colonne: Nom des jobs (Job_A Job_B etc.)",
"• Colonnes du milieu: Durées sur chaque machine",
"• Dernière colonne: Date d'échéance (Date Due)",
,
"2. PERSONNALISATION:",
"• Modifiez les noms des machines dans la première ligne",
"• Ajoutez des colonnes pour plus de machines",
"• Ajoutez des lignes pour plus de jobs",
"• Supprimez les lignes vides non utilisées",
,
"3. RÈGLES:",
"• Toutes les durées doivent être des nombres positifs",
"• Ne laissez pas de cellules vides dans les données",
"• Les noms de jobs doivent être uniques",
"• Sauvegardez au format .xlsx pour l'import",
,
"4. EXEMPLE:",
"Job_A: 4h sur Découpe 2h sur Assemblage 3h sur Finition",
"Date d'échéance: 12 heures"`;
  } else {
    // Template vide avec structure claire
    csvContent = `Job,Machine_0,Machine_1,Machine_2,Date Due
Job_1,,,
Job_2,,,
Job_3,,,
Job_4,,,
Job_5,,,
Job_6,,,
Job_7,,,
Job_8,,,
Job_9,,,
Job_10,,,

INSTRUCTIONS - Comment utiliser ce template:
,
"1. STRUCTURE:",
"• Première colonne: Nom des jobs",
"• Colonnes du milieu: Durées sur chaque machine",
"• Dernière colonne: Date d'échéance",
,
"2. ÉTAPES:",
"• Modifiez Machine_0 Machine_1 etc. avec vos vrais noms de machines",
"• Remplissez les durées pour chaque job sur chaque machine",
"• Indiquez la date d'échéance dans la dernière colonne",
"• Ajoutez des colonnes/lignes si nécessaire",
,
"3. RÈGLES:",
"• Utilisez uniquement des nombres positifs pour les durées",
"• Ne laissez pas de cellules vides dans les données",
"• Sauvegardez au format .xlsx pour l'import",
,
"4. CONSEIL:",
"Ce template est extensible! Ajoutez autant de machines et jobs que nécessaire"`;
  }
  
  return csvContent;
};

export const downloadTemplate = (templateType) => {
  try {
    const csvContent = createFlowshopTemplate(templateType);
    
    // Ajouter le BOM UTF-8 pour que Excel reconnaisse l'encodage
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Créer le lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Template_Flowshop_${templateType.charAt(0).toUpperCase() + templateType.slice(1)}.csv`;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erreur génération template:', error);
    return false;
  }
};

// Fonction utilitaire pour créer un aperçu du template (pour debug)
export const previewTemplate = (templateType) => {
  const content = createFlowshopTemplate(templateType);
  console.log("Aperçu du template:", content);
  return content;
}; 