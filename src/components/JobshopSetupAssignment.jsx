import React from 'react';
import './JobshopSetupAssignment.css';

const JobshopSetupAssignment = () => {
  return (
    <div className="jobshop-setup-assignment">
      <div className="assignment-header">
        <h1>Devoir : Ordonnancement Jobshop avec Temps de Setup</h1>
        <div className="assignment-info">
          <p><strong>Durée estimée :</strong> 45 minutes</p>
          <p><strong>Points :</strong> 25 points</p>
          <p><strong>Date limite :</strong> À définir par l'enseignant</p>
        </div>
      </div>

      <div className="assignment-context">
        <h2>Contexte du Problème</h2>
        <div className="context-content">
          <p>
            Vous travaillez dans un atelier de fabrication qui produit des composants automobiles personnalisés. 
            L'atelier dispose de <strong>4 postes de travail</strong> spécialisés :
          </p>
          <ul>
            <li><strong>Poste 1 :</strong> Découpe et formage des métaux</li>
            <li><strong>Poste 2 :</strong> Perçage et taraudage</li>
            <li><strong>Poste 3 :</strong> Assemblage et soudage</li>
            <li><strong>Poste 4 :</strong> Contrôle qualité et finition</li>
          </ul>
          
          <p>
            Vous devez traiter <strong>4 commandes (jobs)</strong> différentes, chacune avec des spécifications 
            uniques nécessitant des temps de traitement différents sur chaque poste.
          </p>

          <div className="problem-objective">
            <h3>Objectif Principal</h3>
            <p>
              <strong>Minimiser le flowtime moyen</strong> de toutes les commandes pour améliorer la satisfaction 
              client et réduire les coûts de stockage.
            </p>
          </div>

          <div className="setup-times-note">
            <h3>Note Importante</h3>
            <p>
              <strong>Les temps de setup entre les jobs sont significatifs</strong> et varient selon la séquence 
              de traitement. Ces temps représentent le temps nécessaire pour reconfigurer les machines, 
              changer les outils, et préparer les matériaux pour le job suivant.
            </p>
          </div>
        </div>
      </div>

      <div className="data-section">
        <h2>Données du Problème</h2>
        
        <div className="data-grid">
          <div className="data-card">
            <h3>Matrice des Temps de Traitement (minutes)</h3>
            <p>Chaque job a des temps de traitement différents selon le poste</p>
            <div className="matrix-container">
              <table className="data-matrix">
                <thead>
                  <tr>
                    <th>Job\Poste</th>
                    <th>Poste 1<br/>Découpe</th>
                    <th>Poste 2<br/>Perçage</th>
                    <th>Poste 3<br/>Assemblage</th>
                    <th>Poste 4<br/>Contrôle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Job 1</strong><br/>Moteur</td>
                    <td>15</td>
                    <td>8</td>
                    <td>12</td>
                    <td>6</td>
                  </tr>
                  <tr>
                    <td><strong>Job 2</strong><br/>Transmission</td>
                    <td>10</td>
                    <td>12</td>
                    <td>15</td>
                    <td>8</td>
                  </tr>
                  <tr>
                    <td><strong>Job 3</strong><br/>Freinage</td>
                    <td>8</td>
                    <td>15</td>
                    <td>10</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td><strong>Job 4</strong><br/>Direction</td>
                    <td>12</td>
                    <td>6</td>
                    <td>8</td>
                    <td>15</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="data-card">
            <h3>Matrice des Temps de Setup (minutes)</h3>
            <p>Temps de reconfiguration entre jobs consécutifs</p>
            <div className="matrix-container">
              <table className="data-matrix">
                <thead>
                  <tr>
                    <th>Job\Suivant</th>
                    <th>Job 1<br/>Moteur</th>
                    <th>Job 2<br/>Transmission</th>
                    <th>Job 3<br/>Freinage</th>
                    <th>Job 4<br/>Direction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Job 1</strong><br/>Moteur</td>
                    <td>0</td>
                    <td>5</td>
                    <td>8</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td><strong>Job 2</strong><br/>Transmission</td>
                    <td>5</td>
                    <td>0</td>
                    <td>4</td>
                    <td>7</td>
                  </tr>
                  <tr>
                    <td><strong>Job 3</strong><br/>Freinage</td>
                    <td>8</td>
                    <td>4</td>
                    <td>0</td>
                    <td>6</td>
                  </tr>
                  <tr>
                    <td><strong>Job 4</strong><br/>Direction</td>
                    <td>3</td>
                    <td>7</td>
                    <td>6</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="example-sequence">
          <h3>Exemple de Séquençage</h3>
          <p>
            <strong>Séquence actuelle :</strong> Job 1 → Job 2 → Job 3 → Job 4
          </p>
          <div className="sequence-visualization">
            <div className="sequence-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>Job 1 (Moteur)</strong><br/>
                <span className="step-details">Temps total: 41 min + Setup: 5 min</span>
              </div>
            </div>
            <div className="sequence-arrow">→</div>
            <div className="sequence-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>Job 2 (Transmission)</strong><br/>
                <span className="step-details">Temps total: 45 min + Setup: 4 min</span>
              </div>
            </div>
            <div className="sequence-arrow">→</div>
            <div className="sequence-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>Job 3 (Freinage)</strong><br/>
                <span className="step-details">Temps total: 45 min + Setup: 6 min</span>
              </div>
            </div>
            <div className="sequence-arrow">→</div>
            <div className="sequence-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <strong>Job 4 (Direction)</strong><br/>
                <span className="step-details">Temps total: 41 min</span>
              </div>
            </div>
          </div>
          <div className="sequence-summary">
            <p><strong>Temps total de la séquence :</strong> 176 minutes</p>
            <p><strong>Flowtime moyen :</strong> 44 minutes</p>
          </div>
        </div>
      </div>

      <div className="questions-section">
        <h2>Questions du Devoir</h2>
        
        <div className="question-card">
          <div className="question-header">
            <h3>Question 1 : Choix de l'Algorithme (8 points)</h3>
            <span className="question-points">8 pts</span>
          </div>
          <div className="question-content">
            <p>
              Parmi les trois algorithmes étudiés en classe (SPT, EDD, et par contraintes), 
              quel algorithme pensez-vous être le plus approprié pour ce problème de minimisation 
              du flowtime moyen ? Justifiez votre choix en expliquant :
            </p>
            <ul>
              <li>Pourquoi cet algorithme est le plus adapté</li>
              <li>Comment il traite l'objectif de minimisation du flowtime moyen</li>
              <li>Quelles sont ses limitations dans ce contexte</li>
            </ul>
            <div className="question-tips">
              <h4>Conseils :</h4>
              <ul>
                <li>Réfléchissez à la définition du flowtime moyen</li>
                <li>Considérez les caractéristiques de chaque algorithme</li>
                <li>Pensez aux contraintes spécifiques du jobshop</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="question-card">
          <div className="question-header">
            <h3>Question 2 : Adaptation aux Temps de Setup (7 points)</h3>
            <span className="question-points">7 pts</span>
          </div>
          <div className="question-content">
            <p>
              Les algorithmes vus en classe ne prennent pas en compte les temps de setup. 
              Expliquez en détail comment vous modifieriez l'algorithme choisi à la question 1 
              pour intégrer ces temps de setup :
            </p>
            <ul>
              <li>Comment calculer le temps total d'un job (traitement + setup)</li>
              <li>Quelles modifications apporter à la logique de l'algorithme</li>
              <li>Comment gérer les dépendances entre postes</li>
              <li>Quels nouveaux critères de décision considérer</li>
            </ul>
            <div className="question-tips">
              <h4>Conseils :</h4>
              <ul>
                <li>Pensez à la matrice de temps de setup</li>
                <li>Considérez l'impact sur la séquence optimale</li>
                <li>Réfléchissez aux heuristiques possibles</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="question-card">
          <div className="question-header">
            <h3>Question 3 : Implémentation Excel (10 points)</h3>
            <span className="question-points">10 pts</span>
          </div>
          <div className="question-content">
            <p>
              Créez un fichier Excel qui implémente votre algorithme modifié avec les temps de setup. 
              Votre fichier doit inclure :
            </p>
            <ul>
              <li>Une matrice des temps de traitement (4 jobs × 4 postes)</li>
              <li>Une matrice des temps de setup (4 jobs × 4 jobs)</li>
              <li>Le calcul automatique du flowtime pour chaque job</li>
              <li>Le calcul du flowtime moyen total</li>
              <li>Une visualisation de l'ordonnancement (diagramme de Gantt simplifié)</li>
            </ul>
            
            <div className="excel-requirements">
              <h4>Exigences Excel :</h4>
              <div className="excel-grid">
                <div className="excel-section">
                  <h5>Matrice des Temps de Traitement</h5>
                  <p>Utilisez les données fournies dans ce devoir</p>
                </div>
                <div className="excel-section">
                  <h5>Matrice des Temps de Setup</h5>
                  <p>Utilisez les données fournies dans ce devoir</p>
                </div>
                <div className="excel-section">
                  <h5>Calculs Automatiques</h5>
                  <p>Utilisez des formules Excel pour calculer les flowtimes</p>
                </div>
                <div className="excel-section">
                  <h5>Visualisation</h5>
                  <p>Créez un graphique en barres pour l'ordonnancement</p>
                </div>
              </div>
            </div>

            <div className="file-upload">
              <h4>Soumission du Fichier :</h4>
              <p>
                <strong>Note :</strong> Vous devez créer le fichier Excel et le soumettre 
                séparément via la plateforme de cours. Assurez-vous que votre fichier est bien nommé 
                avec votre nom et la date.
              </p>
              <div className="excel-template">
                <h5>Structure Recommandée :</h5>
                <ul>
                  <li><strong>Onglet 1 :</strong> Données et paramètres</li>
                  <li><strong>Onglet 2 :</strong> Calculs et algorithmes</li>
                  <li><strong>Onglet 3 :</strong> Résultats et visualisation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="assignment-footer">
        <div className="footer-info">
          <p><strong>Rappel :</strong> Ce devoir doit être soumis via la plateforme de cours avec votre fichier Excel.</p>
          <p><strong>Durée recommandée :</strong> 45 minutes pour la réflexion et la création du fichier Excel.</p>
        </div>
      </div>
    </div>
  );
};

export default JobshopSetupAssignment; 