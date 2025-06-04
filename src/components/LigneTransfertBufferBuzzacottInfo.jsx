import React from "react";
import styles from "./LigneTransfertBufferBuzzacottForm.module.css";

export default function LigneTransfertBufferBuzzacottInfo() {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoHeader}>
        <h3>Analyse Buffer Buzzacott</h3>
      </div>
      
      <div className={styles.infoContent}>
        <div className={styles.infoSection}>
          <h4>Principe</h4>
          <p>
            Le modèle de Buzzacott permet d'analyser l'efficacité d'un buffer inter-stations 
            dans une ligne de transfert à deux stations. Il calcule l'impact du buffer sur 
            la production en considérant les pannes et réparations.
          </p>
        </div>

        <div className={styles.infoSection}>
          <h4>Paramètres clés</h4>
          <ul>
            <li><strong>α₁, α₂</strong> : Taux de panne des stations (probabilité par unité de temps)</li>
            <li><strong>b₁⁻¹, b₂⁻¹</strong> : Temps moyen avant réparation</li>
            <li><strong>Z</strong> : Taille du buffer (nombre de pièces stockables)</li>
            <li><strong>Production nominale</strong> : Capacité théorique sans panne</li>
          </ul>
        </div>

        <div className={styles.infoSection}>
          <h4>Calculs effectués</h4>
          <ul>
            <li>Efficacité sans buffer E(0)</li>
            <li>Efficacité avec buffer E(Z)</li>
            <li>Production réelle avec/sans buffer</li>
            <li>Gain de production</li>
            <li>Impact économique annuel</li>
          </ul>
        </div>

        <div className={styles.infoSection}>
          <h4>Applications</h4>
          <p>
            Dimensionnement optimal de buffers, analyse coût-bénéfice, 
            amélioration de la productivité des lignes de transfert.
          </p>
        </div>
      </div>
    </div>
  );
} 