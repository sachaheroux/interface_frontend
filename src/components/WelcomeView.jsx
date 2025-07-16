import { useState, useEffect } from "react";
import { 
  Brain, 
  Cog, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle, 
  ChevronDown, 
  ArrowRight 
} from "lucide-react";
import "./WelcomeView.css";

export default function WelcomeView({ onNavigateToDecisionTree, onNavigateToSystems }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleFeatureClick = (feature) => {
    switch(feature) {
      case 'decision-tree':
        if (onNavigateToDecisionTree) onNavigateToDecisionTree();
        break;
      case 'systems':
        if (onNavigateToSystems) onNavigateToSystems();
        break;
      case 'visualization':
        // Pour plus tard - peut naviguer vers un exemple
        console.log('Navigation vers visualisation');
        break;
      case 'education':
        // Pour plus tard - peut naviguer vers documentation
        console.log('Navigation vers mode éducatif');
        break;
      default:
        break;
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="welcome-container welcome-view">
      {/* Hero Section avec Vidéo */}
      <section className="hero-section">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="hero-video"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoLoaded(false)}
        >
          <source src="/factory-automation.mp4.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-robot-working-in-a-production-line-34651-large.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/5699456/5699456-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          {/* Fallback pour navigateurs qui ne supportent pas la vidéo */}
        </video>
        
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">
              Optimisez vos Systèmes Industriels
            </h1>
            <p className="hero-subtitle">
              Plateforme intelligente d'optimisation et de modélisation pour l'industrie 4.0
            </p>
            <p className="hero-description">
              Des algorithmes avancés, une interface intuitive, des résultats concrets
            </p>
            <button className="scroll-indicator" onClick={scrollToFeatures}>
              <span>Découvrir les fonctionnalités</span>
              <div className="scroll-arrow"><ChevronDown size={20} /></div>
            </button>
          </div>
        </div>

        {/* Fallback image si vidéo ne charge pas */}
        {!isVideoLoaded && (
          <div className="hero-fallback">
            <img src="/fond.jpg" alt="Industrie moderne" />
          </div>
        )}
      </section>

      {/* Features Showcase */}
      <section id="features-section" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Fonctionnalités Principales</h2>
            <p>Découvrez les outils qui révolutionnent l'optimisation industrielle</p>
          </div>
          
          <div className="features-grid">
            <div 
              className="feature-card" 
              onClick={() => handleFeatureClick('decision-tree')}
            >
              <div className="feature-icon"><Brain size={32} /></div>
              <h3>Aide à la Décision</h3>
              <p>Arbre de décision intelligent pour identifier automatiquement le système de production optimal selon vos contraintes</p>
              <span className="card-action">Essayer <ArrowRight size={16} /></span>
            </div>

            <div 
              className="feature-card" 
              onClick={() => handleFeatureClick('systems')}
            >
              <div className="feature-icon"><Cog size={32} /></div>
              <h3>Algorithmes Avancés</h3>
              <p>SPT, EDD, Johnson, contraintes OR-Tools et bien plus. Algorithmes éprouvés pour tous types de systèmes</p>
              <span className="card-action">Explorer <ArrowRight size={16} /></span>
            </div>

            <div 
              className="feature-card" 
              onClick={() => handleFeatureClick('visualization')}
            >
              <div className="feature-icon"><TrendingUp size={32} /></div>
              <h3>Visualisation Intelligente</h3>
              <p>Diagrammes de Gantt interactifs, métriques de performance en temps réel et exports professionnels</p>
              <span className="card-action">Voir <ArrowRight size={16} /></span>
            </div>

            <div 
              className="feature-card" 
              onClick={() => handleFeatureClick('education')}
            >
              <div className="feature-icon"><GraduationCap size={32} /></div>
              <h3>Mode Éducatif</h3>
              <p>Interface pédagogique parfaite pour l'apprentissage et l'enseignement de l'optimisation industrielle</p>
              <span className="card-action">Apprendre <ArrowRight size={16} /></span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Explication 1 */}
      <section className="explanation-section">
        <div className="container">
          <div className="explanation-grid">
            <div className="explanation-text">
              <h2>Pourquoi Optimiser vos Systèmes ?</h2>
              <p>
                L'optimisation des systèmes de production peut <strong>réduire les coûts de 15-30%</strong> 
                et <strong>améliorer la productivité de 25%</strong>. Dans un contexte industriel moderne, 
                chaque minute d'inefficacité représente des pertes significatives.
              </p>
              <ul className="benefits-list">
                <li><CheckCircle size={18} /> Réduction des temps de cycle</li>
                <li><CheckCircle size={18} /> Minimisation des goulots d'étranglement</li>
                <li><CheckCircle size={18} /> Optimisation des ressources</li>
                <li><CheckCircle size={18} /> Amélioration de la qualité</li>
              </ul>
            </div>
            <div className="explanation-visual">
              <div className="stats-card">
                <div className="stat">
                  <span className="stat-number">30%</span>
                  <span className="stat-label">Réduction des coûts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">25%</span>
                  <span className="stat-label">Gain de productivité</span>
                </div>
                <div className="stat">
                  <span className="stat-number">40%</span>
                  <span className="stat-label">Moins de gaspillage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Explication 2 */}
      <section className="explanation-section alt">
        <div className="container">
          <div className="explanation-grid reverse">
            <div className="explanation-visual">
              <div className="process-flow">
                <div className="process-step">
                  <span className="step-number">1</span>
                  <span className="step-text">Analyse</span>
                </div>
                <div className="process-arrow"><ArrowRight size={24} /></div>
                <div className="process-step">
                  <span className="step-number">2</span>
                  <span className="step-text">Modélisation</span>
                </div>
                <div className="process-arrow"><ArrowRight size={24} /></div>
                <div className="process-step">
                  <span className="step-number">3</span>
                  <span className="step-text">Optimisation</span>
                </div>
                <div className="process-arrow"><ArrowRight size={24} /></div>
                <div className="process-step">
                  <span className="step-number">4</span>
                  <span className="step-text">Résultats</span>
                </div>
              </div>
            </div>
            <div className="explanation-text">
              <h2>Comment Ça Marche ?</h2>
              <p>
                Notre plateforme simplifie le processus complexe d'optimisation industrielle 
                en 4 étapes claires. Que vous soyez étudiant ou ingénieur expérimenté, 
                l'interface vous guide vers les meilleures décisions.
              </p>
              <div className="process-details">
                <div className="detail">
                  <strong>1. Analyse</strong> - Identifiez votre type de système
                </div>
                <div className="detail">
                  <strong>2. Modélisation</strong> - Saisissez vos données de production
                </div>
                <div className="detail">
                  <strong>3. Optimisation</strong> - Exécutez les algorithmes adaptés
                </div>
                <div className="detail">
                  <strong>4. Résultats</strong> - Visualisez et exportez vos solutions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à Optimiser ?</h2>
            <p>Rejoignez les ingénieurs qui utilisent déjà notre plateforme pour améliorer leurs systèmes de production</p>
            <div className="cta-buttons">
              <button 
                className="btn-primary"
                onClick={() => handleFeatureClick('decision-tree')}
              >
                <Brain size={18} /> Commencer l'Aide à la Décision
              </button>
              <button 
                className="btn-secondary"
                onClick={() => handleFeatureClick('systems')}
              >
                <Cog size={18} /> Explorer les Systèmes
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
