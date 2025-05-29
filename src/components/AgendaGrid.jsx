import React from "react";
import styles from "./AgendaGrid.module.css";

function AgendaGrid({ agendaData }) {
  if (!agendaData) return null;

  const { groups, items } = agendaData;

  // Heures affichées (08:00 à 17:00 par défaut)
  const startHour = 8;
  const endHour = 17;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => `${(startHour + i).toString().padStart(2, "0")}:00`);

  // Couleurs des jobs
  const colors = ["#4f46e5", "#e11d48", "#059669", "#f59e0b", "#0ea5e9", "#9333ea", "#14b8a6"];

  return (
    <div className={styles.agendaContainer}>
      <div className={styles.timeHeader}>
        <div className={styles.machineHeader}></div>
        {hours.map((hour, i) => (
          <div key={i} className={styles.timeCell}>{hour}</div>
        ))}
      </div>
      <div className={styles.gridBody}>
        {groups.map((group) => (
          <div key={group.id} className={styles.machineRow}>
            <div className={styles.machineName}>{group.title}</div>
            <div className={styles.machineTimeline}>
              {items.filter(item => item.group === group.id).map((item, index) => {
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
