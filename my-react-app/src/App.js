// src/App.js
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import coursesData from "./data/courses.json";
import CourseCard from "./components/CourseCard";
import "./App.css";

function App() {
  const semesters = [
    "Unassigned",
    "Fall 2023",
    "Spring 2024",
    "Fall 2024",
    "Spring 2025",
  ];

  // Initialize state with courses and their IDs
  const [semesterCourses, setSemesterCourses] = useState(() => {
    const coursesWithIds = coursesData.map((course, index) => ({
      ...course,
      id: `course-${index}`,
    }));
    return {
      Unassigned: coursesWithIds,
      "Fall 2023": [],
      "Spring 2024": [],
      "Fall 2024": [],
      "Spring 2025": [],
    };
  });

  const [errorMessages, setErrorMessages] = useState([]);

  // Handle drag and drop events
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If the item is dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceSemester = source.droppableId;
    const destSemester = destination.droppableId;

    const sourceCourses = Array.from(semesterCourses[sourceSemester]);
    const destCourses = Array.from(semesterCourses[destSemester]);
    const [movedCourse] = sourceCourses.splice(source.index, 1);

    destCourses.splice(destination.index, 0, movedCourse);

    setSemesterCourses((prev) => ({
      ...prev,
      [sourceSemester]: sourceCourses,
      [destSemester]: destCourses,
    }));

    checkDependencies(movedCourse, destSemester);
  };

  // Function to parse prerequisites
  const parsePrerequisites = (prereqString) => {
    if (!prereqString || prereqString === "NaN") return [];
    // For simplicity, split by commas
    return prereqString.split(",").map((name) => name.trim());
  };

  // Function to check dependencies
  const checkDependencies = (movedCourse, destSemester) => {
    // Map semesters to their order
    const semesterOrder = {
      Unassigned: 0,
      "Fall 2023": 1,
      "Spring 2024": 2,
      "Fall 2024": 3,
      "Spring 2025": 4,
    };

    const destIndex = semesterOrder[destSemester];

    // Extract prerequisite course names
    const prereqNames = parsePrerequisites(movedCourse.prereq);

    // Check if all prerequisites are scheduled in previous semesters
    for (const prereqName of prereqNames) {
      let prereqFound = false;

      // Search for the prerequisite in earlier semesters
      for (const [semester, courses] of Object.entries(semesterCourses)) {
        if (semesterOrder[semester] < destIndex) {
          if (
            courses.some((course) => course["course name"].includes(prereqName))
          ) {
            prereqFound = true;
            break;
          }
        }
      }

      if (!prereqFound) {
        setErrorMessages((prevErrors) => [
          ...prevErrors,
          `Dependency Error: "${movedCourse["course name"]}" requires "${prereqName}" to be scheduled earlier.`,
        ]);
        break;
      }
    }
  };

  // Save and load semester courses from local storage
  useEffect(() => {
    const savedData = localStorage.getItem("semesterCourses");
    if (savedData) {
      setSemesterCourses(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("semesterCourses", JSON.stringify(semesterCourses));
  }, [semesterCourses]);

  return (
    <div className="App">
      {errorMessages.length > 0 && (
        <div className="error-messages">
          {errorMessages.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
          <button onClick={() => setErrorMessages([])}>Clear Errors</button>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="semesters-container">
          {semesters.map((semester) => (
            <Droppable droppableId={semester} key={semester}>
              {(provided) => (
                <div
                  className="semester-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{semester}</h2>
                  {semesterCourses[semester].map((course, index) => (
                    <Draggable
                      key={course.id}
                      draggableId={course.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CourseCard course={course} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
