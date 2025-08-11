import React, { useState } from 'react';
import './JobshopSetupAssignment.css';

const JobshopSetupAssignment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: ''
  });

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Devoir soumis:', answers);
    alert('Devoir soumis avec succès !');
  };

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

      <div className="assignment-questions">
        <div className="question-navigation">
          <button 
            className={`nav-btn ${currentQuestion === 1 ? 'active' : ''}`}
            onClick={() => setCurrentQuestion(1)}
          >
            Question 1
          </button>
          <button 
            className={`nav-btn ${currentQuestion === 2 ? 'active' : ''}`}
            onClick={() => setCurrentQuestion(2)}
          >
            Question 2
          </button>
          <button 
            className={`nav-btn ${currentQuestion === 3 ? 'active' : ''}`}
            onClick={() => setCurrentQuestion(3)}
          >
            Question 3
          </button>
        </div>

        {/* Question 1 */}
        {currentQuestion === 1 && (
          <div className="question-content">
            <h2>Question 1 : Choix de l'Algorithme (8 points)</h2>
            <div className="question-text">
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
            </div>
            <textarea
              className="answer-textarea"
              placeholder="Tapez votre réponse ici..."
              value={answers.question1}
              onChange={(e) => handleAnswerChange('question1', e.target.value)}
              rows={8}
            />
            <div className="question-tips">
              <h4>Conseils :</h4>
              <ul>
                <li>Réfléchissez à la définition du flowtime moyen</li>
                <li>Considérez les caractéristiques de chaque algorithme</li>
                <li>Pensez aux contraintes spécifiques du jobshop</li>
              </ul>
            </div>
          </div>
        )}

        {/* Question 2 */}
        {currentQuestion === 2 && (
          <div className="question-content">
            <h2>Question 2 : Adaptation aux Temps de Setup (7 points)</h2>
            <div className="question-text">
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
            </div>
            <textarea
              className="answer-textarea"
              placeholder="Tapez votre réponse ici..."
              value={answers.question2}
              onChange={(e) => handleAnswerChange('question2', e.target.value)}
              rows={8}
            />
            <div className="question-tips">
              <h4>Conseils :</h4>
              <ul>
                <li>Pensez à la matrice de temps de setup</li>
                <li>Considérez l'impact sur la séquence optimale</li>
                <li>Réfléchissez aux heuristiques possibles</li>
              </ul>
            </div>
          </div>
        )}

        {/* Question 3 */}
        {currentQuestion === 3 && (
          <div className="question-content">
            <h2>Question 3 : Implémentation Excel (10 points)</h2>
            <div className="question-text">
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
            </div>
            
            <div className="excel-requirements">
              <h4>Exigences Excel :</h4>
              <div className="excel-grid">
                <div className="excel-section">
                  <h5>Matrice des Temps de Traitement</h5>
                  <p>Créez une table 4×4 avec des temps réalistes (entre 5 et 30 minutes)</p>
                </div>
                <div className="excel-section">
                  <h5>Matrice des Temps de Setup</h5>
                  <p>Créez une table 4×4 avec des temps de setup (entre 2 et 15 minutes)</p>
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
                <strong>Note :</strong> Pour ce devoir, vous devez créer le fichier Excel et le soumettre 
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
        )}
      </div>

      <div className="assignment-footer">
        <div className="navigation-buttons">
          {currentQuestion > 1 && (
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              ← Précédent
            </button>
          )}
          {currentQuestion < 3 && (
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
            >
              Suivant →
            </button>
          )}
          {currentQuestion === 3 && (
            <button 
              className="btn btn-success"
              onClick={handleSubmit}
            >
              Soumettre le Devoir
            </button>
          )}
        </div>
        
        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentQuestion / 3) * 100}%` }}
            ></div>
          </div>
          <span>Question {currentQuestion} sur 3</span>
        </div>
      </div>
    </div>
  );
};

export default JobshopSetupAssignment; 