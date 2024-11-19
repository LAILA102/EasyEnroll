// src/components/CourseCard.js

import React from "react";
import "./CourseCard.css";

function CourseCard({ course, hasError }) {
  return (
    <div className={`course-card ${hasError ? "course-error" : ""}`}>
      <h3>{course["course name"]}</h3>
      {/* Include additional course details if needed */}
    </div>
  );
}

export default CourseCard;
