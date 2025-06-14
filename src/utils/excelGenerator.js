// Utilitaire pour générer des fichiers Excel simples
// Utilise le format XML d'Excel pour créer des fichiers .xlsx basiques

export const generateFlowshopTemplate = (templateType = "exemple") => {
  // Données selon le type de template
  const isExample = templateType === "exemple";
  
  const machinesData = isExample 
    ? [
        ["ID_Machine", "Nom_Machine"],
        [0, "Découpe"],
        [1, "Assemblage"],
        [2, "Finition"]
      ]
    : [
        ["ID_Machine", "Nom_Machine"],
        [0, "[À remplir]"],
        [1, "[À remplir]"],
        [2, "[À remplir]"]
      ];

  const jobsData = isExample
    ? [
        ["Nom_Job", "Date_Echeance", "Machine_0", "Machine_1", "Machine_2"],
        ["Job_A", 12, 4, 2, 3],
        ["Job_B", 15, 3, 4, 2],
        ["Job_C", 18, 5, 2, 4]
      ]
    : [
        ["Nom_Job", "Date_Echeance", "Machine_0", "Machine_1", "Machine_2"],
        ["[À remplir]", "[À remplir]", "[À remplir]", "[À remplir]", "[À remplir]"],
        ["[À remplir]", "[À remplir]", "[À remplir]", "[À remplir]", "[À remplir]"],
        ["[À remplir]", "[À remplir]", "[À remplir]", "[À remplir]", "[À remplir]"]
      ];

  const instructionsData = [
    ["Section", "Description"],
    ["INSTRUCTIONS GÉNÉRALES", "Template pour import de données Flowshop (SPT, EDD, etc.)"],
    ["", ""],
    ["1. Structure du fichier", "- Onglet 'Machines': Définit les machines et leurs noms"],
    ["", "- Onglet 'Jobs': Définit les jobs avec leurs durées sur chaque machine"],
    ["", ""],
    ["2. Onglet Machines", "- ID_Machine: Numéro de la machine (0, 1, 2, ...)"],
    ["", "- Nom_Machine: Nom personnalisé de votre machine"],
    ["", ""],
    ["3. Onglet Jobs", "- Nom_Job: Nom de votre job/produit"],
    ["", "- Date_Echeance: Date limite en heures"],
    ["", "- Machine_X: Durée du job sur la machine X"],
    ["", ""],
    ["4. Règles importantes", "- Les ID machines doivent commencer à 0 et être consécutifs"],
    ["", "- Toutes les durées doivent être positives"],
    ["", "- Aucune cellule ne doit être vide dans les colonnes obligatoires"],
    ["", ""],
    ["5. Exemple de données", "Job_A: 4h sur Découpe, 2h sur Assemblage, 3h sur Finition"],
    ["", "Date d'échéance: 12 heures"]
  ];

  // Créer le contenu HTML qui sera interprété comme Excel
  const createWorksheet = (data, sheetName) => {
    let rows = data.map(row => 
      `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    ).join('');
    
    return `
      <table>
        <tr><td colspan="10" style="font-weight:bold; background-color:#e3f2fd;">${sheetName}</td></tr>
        ${rows}
        <tr><td colspan="10"></td></tr>
      </table>
    `;
  };

  // Créer le contenu complet
  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          td { border: 1px solid #ccc; padding: 8px; }
          tr:first-child td { font-weight: bold; background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        ${createWorksheet(machinesData, "MACHINES")}
        ${createWorksheet(jobsData, "JOBS")}
        ${createWorksheet(instructionsData, "INSTRUCTIONS")}
      </body>
    </html>
  `;

  return htmlContent;
};

export const downloadTemplate = (templateType) => {
  try {
    const htmlContent = generateFlowshopTemplate(templateType);
    
    // Créer le blob avec le type Excel
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    // Créer le lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Template_Flowshop_${templateType.charAt(0).toUpperCase() + templateType.slice(1)}.xls`;
    
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