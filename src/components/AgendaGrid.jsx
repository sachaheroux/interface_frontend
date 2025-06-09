import React, { useState } from "react";
import styles from "./AgendaGrid.module.css";

function AgendaGrid({ agendaData, dueDates = {} }) {
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);

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
  const displayDateStr = displayDate.toLocaleDateString("fr-FR", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  // Couleurs des jobs (cohérentes avec le Gantt)
  const jobColors = {
    "Job 0": "#4f46e5",
    "Job 1": "#ef4444", 
    "Job 2": "#10b981",
    "Job 3": "#f59e0b",
    "Job 4": "#6366f1",
    "Job 5": "#8b5cf6",
    "Job 6": "#14b8a6",
    "Job 7": "#f97316"
  };

  const getJobColor = (jobTitle) => {
    const jobKey = jobTitle.split(" (")[0]; // Enlever "(1/2)", "(2/2)" etc.
    return jobColors[jobKey] || "#6b7280";
  };

  const calculateTimeBeforeDueDate = (taskEndTime, jobTitle) => {
    const endTime = new Date(taskEndTime);
    const jobKey = jobTitle.split(" (")[0];
    const dueDate = dueDates[jobKey];
    
    if (!dueDate) return null;
    
    const dueDateHours = parseFloat(dueDate);
    const taskEndHours = (endTime - baseDate) / (1000 * 60 * 60);
    const remainingTime = dueDateHours - taskEndHours;
    
    return remainingTime;
  };

  const handleTaskClick = (task) => {
    const timeBeforeDue = calculateTimeBeforeDueDate(task.end_time, task.title);
    setSelectedTask({
      ...task,
      timeBeforeDue,
      duration: ((new Date(task.end_time) - new Date(task.start_time)) / (1000 * 60)).toFixed(0)
    });
  };

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString("fr-FR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className={styles.agendaContainer}>
      {/* Navigation */}
      <div className={styles.navigationBar}>
        <button 
          className={styles.navButton}
          onClick={() => setDayOffset(dayOffset - 1)}
        >
          ← Jour précédent
        </button>
        <div className={styles.currentDate}>
          <strong>{displayDateStr}</strong>
        </div>
        <button 
          className={styles.navButton}
          onClick={() => setDayOffset(dayOffset + 1)}
        >
          Jour suivant →
        </button>
      </div>

      {/* En-têtes horaires */}
      <div className={styles.timeHeader}>
        <div className={styles.machineHeader}>Machines</div>
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
              {/* Grille horaire de fond */}
              {hours.map((hour, i) => (
                <div 
                  key={i} 
                  className={styles.hourSlot}
                  style={{ left: `${i * 100}px`, width: "100px" }}
                />
              ))}
              
              {/* Pauses et congés */}
              {/* Vérifier si c'est un weekend ou férié */}
              {(() => {
                const dayOfWeek = displayDate.getDay();
                const dateStr = displayDate.toISOString().split('T')[0];
                const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
                const isHoliday = agendaData.agenda_config?.jours_feries?.includes(dateStr);
                
                if (isWeekend || isHoliday) {
                  return (
                    <div 
                      className={styles.holidayOverlay}
                      style={{ left: "0px", width: `${hours.length * 100}px` }}
                      title={isHoliday ? "Jour férié" : "Weekend"}
                    >
                      {isHoliday ? '🎄 Jour férié' : '📅 Weekend'}
                    </div>
                  );
                }
                
                // Afficher toutes les pauses configurées si ce n'est pas un jour chômé
                const pausesConfig = agendaData.pauses || [{ start: "12:00", end: "13:00", name: "Pause déjeuner" }];
                return (
                  <>
                    {pausesConfig.map((pause, index) => {
                      const [startHourPause, startMinPause] = pause.start.split(':').map(Number);
                      const [endHourPause, endMinPause] = pause.end.split(':').map(Number);
                      const pauseStartPos = (startHourPause + startMinPause/60 - startHour) * 100;
                      const pauseDuration = (endHourPause + endMinPause/60) - (startHourPause + startMinPause/60);
                      const pauseWidth = pauseDuration * 100;
                      
                      return (
                        <div 
                          key={index}
                          className={styles.lunchBreak}
                          style={{
                            left: `${pauseStartPos}px`,
                            width: `${pauseWidth}px`
                          }}
                          title={pause.name}
                        >
                          {pause.name.toLowerCase().includes('déjeuner') ? '🍽️' : '⏸️'}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
              
              {/* Tâches */}
              {items
                .filter(item => item.group === group.id)
                .filter(item => {
                  const date = new Date(item.start_time);
                  return date.toDateString() === displayDate.toDateString();
                })
                .map((item) => {
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
                        width: `${Math.max((duration / 60) * 100, 80)}px`,
                        backgroundColor: getJobColor(item.title),
                      }}
                      onClick={() => handleTaskClick(item)}
                      title={`${item.title} - ${formatTime(item.start_time)} à ${formatTime(item.end_time)}`}
                    >
                      <div className={styles.taskContent}>
                        <span className={styles.taskTitle}>{item.title}</span>
                        <span className={styles.taskTime}>
                          {formatTime(item.start_time)}-{formatTime(item.end_time)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Popup de détails de tâche */}
      {selectedTask && (
        <div className={styles.taskDetailsOverlay} onClick={() => setSelectedTask(null)}>
          <div className={styles.taskDetails} onClick={(e) => e.stopPropagation()}>
            <h3>📋 Détails de la tâche</h3>
            <div className={styles.detailItem}>
              <strong>Tâche :</strong> {selectedTask.title}
            </div>
            <div className={styles.detailItem}>
              <strong>Machine :</strong> {groups.find(g => g.id === selectedTask.group)?.title}
            </div>
            <div className={styles.detailItem}>
              <strong>Début :</strong> {formatTime(selectedTask.start_time)}
            </div>
            <div className={styles.detailItem}>
              <strong>Fin :</strong> {formatTime(selectedTask.end_time)}
            </div>
            <div className={styles.detailItem}>
              <strong>Durée :</strong> {selectedTask.duration} minutes
            </div>
            {selectedTask.timeBeforeDue !== null && (
              <div className={styles.detailItem}>
                <strong>Temps avant échéance :</strong> 
                <span className={selectedTask.timeBeforeDue < 0 ? styles.overdue : styles.onTime}>
                  {selectedTask.timeBeforeDue.toFixed(1)} heures
                  {selectedTask.timeBeforeDue < 0 ? " (EN RETARD)" : ""}
                </span>
              </div>
            )}
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedTask(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendaGrid;
