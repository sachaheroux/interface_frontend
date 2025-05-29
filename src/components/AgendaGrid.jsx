import React, { useState } from "react";
import styles from "./AgendaGrid.module.css";

function AgendaGrid({ agendaData }) {
  const [dayOffset, setDayOffset] = useState(0);

  if (!agendaData) return null;
  const { groups, items, opening_hours } = agendaData;

  // Heures affichées dynamiques selon les données
  const startHour = opening_hours?.start ? parseInt(opening_hours.start.split(":")[0], 10) : 8;
  const endHour = opening_hours?.end ? parseInt(opening_hours.end.split(":")[0], 10) : 17;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => `${(startHour + i).toString().padStart(2, "0")}:00`);

  // Calcul de la date affichée (jour de départ + offset)
  const baseDate = new Date(items[0]?.start_time || Date.now());
  const displayDate = new Date(baseDate);
  displayDate.setDate(baseDate.getDate() + dayOffset);
  const displayDateStr = displayDate.toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Couleurs des jobs
  const colors = ["#4f46e5", "#e11d48", "#059669", "#f59e0b", "#0ea5e9", "#9333ea", "#14b8a6"];

  return (
    <div className={styles.agendaContainer}>
      {/* Navigation */}
      <div className={styles.navigationBar}>
        <button onClick={() => setDayOffset(dayOffset - 1)}>&larr; Jour précédent</button>
        <strong>{displayDateStr}</strong>
        <button onClick={() => setDayOffset(dayOffset + 1)}>Jour suivant &rarr;</button>
      </div>

      {/* En-têtes horaires */}
      <div className={styles.timeHeader}>
        <div className={styles.machineHeader}></div>
        {hours.map((hour, i) => (
          <div key={i} className={styles.timeCell}>{hour}</div>
        ))}
      </div>

      {/* Corps de l'agenda */}
      <div className={styles.gridBody}>
        {groups.map((group) => (
          <div key={group.id} className={styles.machineRow}>
            <div className={styles.machineName}>{group.title}</div>
            <div className={styles.machineTimeline}>
              {items
                .filter(item => item.group === group.id)
                .filter(item => {
                  const date = new Date(item.start_time);
                  return date.toDateString() === displayDate.toDateString();
                })
                .map((item, index) => {
                  const start = new Date(item.start_time);
                  const end = new Date(item.end_time);
                  const startMinutes = (start.getHours() * 60 + start.getMinutes()) - startHour * 60;
                  const duration = (end - start) / (1000 * 60);
                  return (
                    <div
                      key={item.id}
                      className={styles.taskBlock}
                      style={{
                        left: `${(startMinutes / 60) * 100}px`,
                        width: `${(duration / 60) * 100}px`,
                        backgroundColor: colors[index % colors.length],
                      }}
                    >
                      {item.title}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgendaGrid;
