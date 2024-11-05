// src/components/CourseCard.js
import React from "react";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <h4>{course["course name"]}</h4>
    </div>
  );
};

export default CourseCard;
