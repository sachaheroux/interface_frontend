import { useState } from "react";
import "./DecisionTree.css";

const DecisionTree = ({ onSystemRecommendation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);  
  const [currentPath, setCurrentPath] = useState([]);
  const [showResult, setShowResult] = useState(false);

  // Questions de l'arbre de décision du professeur
  const questions = [
    {
      id: 0,  
      question: "Votre système fabrique-t-il un produit standardisé (identique) ?",
      yesPath: 1,
      noPath: 2
    },
    {
      id: 1,
      question: "Y a-t-il un seul type de produit par ligne de production ?",
      yesPath: 3,
      noPath: 4  // 1.1.2 → gamme unique
    },
    {
      id: 2,
      question: "Le produit est-il modularisable (assemblage de composants standardisés) ?",
      yesPath: 4,  // 1.2.1 → gamme unique (rejoint 1.1.2)
      noPath: "Jobshop"  // 1.2.2
    },
    {
      id: 3,
      question: "Le procédé est-il très mécanisé et sujet à des pannes fréquentes ?",
      yesPath: "Ligne de transfert",  // 1.1.1.1
      noPath: "Ligne d'assemblage"    // 1.1.1.2 → ligne dédiée
    },
    {
      id: 4,
      question: "La gamme opératoire est-elle unique pour tous les produits ?",
      yesPath: 5,  // 1.1.2.1 / 1.2.1.1
      noPath: 6    // 1.1.2.2 / 1.2.1.2
    },
    {
      id: 5,
      question: "Le système est-il cadencé (rythme de production fixe) ?",
      yesPath: 7,  // 1.1.2.1.1
      noPath: 8    // 1.1.2.1.2
    },
    {
      id: 6,
      question: "Existe-t-il des familles de produits avec des gammes similaires ?",
      yesPath: 9,  // 1.1.2.2.1
      noPath: 10   // 1.1.2.2.2
    },
    {
      id: 7,
      question: "S'agit-il principalement d'un problème de séquencement des tâches ?",
      yesPath: "Flowshop",               // 1.1.2.1.1.1
      noPath: "Ligne d'assemblage"       // 1.1.2.1.1.2 → ligne non-cadencée
    },
    {
      id: 8,
      question: "Y a-t-il plusieurs types de produits à fabriquer ?",
      yesPath: "Ligne d'assemblage mixte",  // 1.1.2.1.2.1
      noPath: "Ligne d'assemblage"          // 1.1.2.1.2.2
    },
    {
      id: 9,
      question: "La demande de production est-elle fixe et prévisible ?",
      yesPath: 11,  // 1.1.2.2.1.1
      noPath: 12    // 1.1.2.2.1.2
    },
    {
      id: 10,
      question: "Le système est-il facilement automatisable ?",
      yesPath: "FMS",                    // 1.1.2.2.2.1
      noPath: "Ligne d'assemblage"       // 1.1.2.2.2.2 → ligne dédiée par produit
    },
    {
      id: 11,
      question: "Les machines sont-elles facilement déplaçables et reconfigurables ?",
      yesPath: "FMS",                    // 1.1.2.2.1.1.1 → cellules dynamiques
      noPath: "Ligne d'assemblage"       // 1.1.2.2.1.1.2 → cellules virtuelles
    },
    {
      id: 12,
      question: "Les machines peuvent-elles être déplacées et reconfigurées dynamiquement ?",
      yesPath: "FMS",                    // 1.1.2.2.1.2.1
      noPath: "Ligne d'assemblage"       // 1.1.2.2.1.2.2
    }
  ];

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "6amClub1945!") {
      setIsAuthenticated(true);
    } else {
      alert("Mot de passe incorrect");
    }
  };

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const nextStep = answer ? currentQuestion.yesPath : currentQuestion.noPath;
    
    // Ajouter la réponse au chemin
    const newPath = [...currentPath, { question: currentQuestion.question, answer }];
    setCurrentPath(newPath);

    if (typeof nextStep === "string") {
      // C'est un résultat final
      setShowResult(nextStep);
    } else {
      // C'est une autre question
      setCurrentQuestionIndex(nextStep);
    }
  };

  const resetTree = () => {
    setCurrentQuestionIndex(0);
    setCurrentPath([]);
    setShowResult(false);
  };

  const handleRecommendation = (system) => {
    onSystemRecommendation(system);
  };

  if (!isAuthenticated) {
    return (
      <div className="decision-tree-container">
        <div className="password-modal">
          <h2>🔒 Accès Protégé</h2>
          <p>Cette section est réservée aux enseignants</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
            />
            <button type="submit" className="password-submit">
              Accéder
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="decision-tree-container">
        <div className="result-container">
          <h2>🎯 Recommandation</h2>
          <div className="result-path">
            <h3>Votre parcours :</h3>
            {currentPath.map((step, index) => (
              <div key={index} className="path-step">
                <strong>Q{index + 1}:</strong> {step.question}
                <span className={`answer ${step.answer ? 'yes' : 'no'}`}>
                  {step.answer ? 'Oui' : 'Non'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="recommendation">
            <h3>Système recommandé :</h3>
            <div className="system-recommendation">
              <strong>{showResult}</strong>
            </div>
            
            <div className="action-buttons">
              <button 
                className="go-to-system-btn"
                onClick={() => handleRecommendation(showResult)}
              >
                Aller au système →
              </button>
              <button 
                className="restart-btn"
                onClick={resetTree}
              >
                Recommencer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="decision-tree-container">
      <div className="tree-header">
        <h2>🌳 Aide à la Décision</h2>
        <p>Répondez aux questions pour trouver le système optimal</p>
      </div>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${((currentPath.length + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div className="question-container">
        <div className="question-number">
          Question {currentPath.length + 1} / {questions.length}
        </div>
        
        <div className="question-text">
          {currentQuestion.question}
        </div>

        <div className="answer-buttons">
          <button 
            className="answer-btn yes-btn"
            onClick={() => handleAnswer(true)}
          >
            ✅ Oui
          </button>
          <button 
            className="answer-btn no-btn"
            onClick={() => handleAnswer(false)}
          >
            ❌ Non
          </button>
        </div>
      </div>

      {currentPath.length > 0 && (
        <div className="current-path">
          <h4>Réponses précédentes :</h4>
          {currentPath.map((step, index) => (
            <div key={index} className="path-item">
              <span className="path-question">Q{index + 1}:</span>
              <span className={`path-answer ${step.answer ? 'yes' : 'no'}`}>
                {step.answer ? 'Oui' : 'Non'}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="restart-btn-small" onClick={resetTree}>
        🔄 Recommencer
      </button>
    </div>
  );
};

export default DecisionTree; 