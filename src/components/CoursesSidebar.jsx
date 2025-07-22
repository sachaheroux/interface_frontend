import React from 'react';
import { 
  BookOpen, 
  Play, 
  FileText,
  GraduationCap,
  Users,
  Settings
} from "lucide-react";
import "./CoursesSidebar.css";

export default function CoursesSidebar({ 
  selectedCategory,
  selectedCourse,
  onCategoryChange,
  onCourseChange,
  coursesConfig
}) {
  
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Cours Théoriques": <BookOpen size={20} />,
      "Simulations Interactives": <Play size={20} />,
      "Exercices Pratiques": <FileText size={20} />
    };
    return icons[categoryName] || <GraduationCap size={20} />;
  };

  const categories = Object.keys(coursesConfig);

  return (
    <div className="courses-sidebar">
      <div className="sidebar-header">
        <div className="system-badge">
          <GraduationCap size={20} />
        </div>
        <div className="title-text">
          <h3>Section Cours</h3>
          <p className="algorithm-count">Contenu pédagogique</p>
        </div>
      </div>

      <div className="categories-list">
        {categories.map((category) => (
          <div key={category} className="category-section">
            <button
              className={`category-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              <span className="category-icon">{getCategoryIcon(category)}</span>
              <span className="category-name">{category}</span>
            </button>
            
            {selectedCategory === category && (
              <div className="courses-submenu">
                {coursesConfig[category].map((course) => (
                  <button
                    key={course}
                    className={`course-item ${selectedCourse === course ? 'active' : ''}`}
                    onClick={() => onCourseChange(course)}
                  >
                    <span className="course-dot" />
                    <span className="course-name">{course}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="sidebar-actions">
        <button 
          className="action-btn primary" 
          title="Aide pédagogique"
        >
          <span className="action-icon">❓</span>
          Aide
        </button>
      </div>
    </div>
  );
} 