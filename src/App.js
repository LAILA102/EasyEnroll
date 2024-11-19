// src/App.js

import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import coursesData from "./data/courses.json";
import CourseCard from "./components/CourseCard";
import "./App.css";

// Helper function to normalize course codes
const normalizeCode = (code) => code.trim().toUpperCase();

// Function to extract and normalize course codes from course name
const extractCourseCodes = (courseName) => {
  const match = courseName.match(/^(.*?) -/);
  if (match) {
    const codePart = match[1].trim();
    // Extract prefix and numbers
    const prefixMatch = codePart.match(/^([A-Z]+)\s*(.*)/i);
    if (prefixMatch) {
      const prefix = prefixMatch[1].trim(); // e.g., "MACT"
      const numbersPart = prefixMatch[2].trim(); // e.g., "132/1122"
      // Split numbers by '/'
      const numbers = numbersPart.split("/").map((num) => num.trim());
      // Reconstruct course codes
      return numbers.map((num) => normalizeCode(`${prefix} ${num}`));
    } else {
      // If no prefix, return the codePart as is
      return [normalizeCode(codePart)];
    }
  }
  return [];
};

// Updated function to parse and normalize any dependency string
const parseDependencies = (dependencyString) => {
  if (
    !dependencyString ||
    dependencyString.trim().toLowerCase() === "nan" ||
    dependencyString.trim() === ""
  )
    return [];

  // Regular expression to match course codes (e.g., 'MACT 1122')
  const courseCodeRegex = /[A-Z]{2,4}\s*\d{3,4}/g;

  const matches = dependencyString.match(courseCodeRegex);
  if (matches) {
    return matches.map((code) => normalizeCode(code));
  }
  return [];
};

function App() {
  const semesters = [
    "Unassigned",
    "Fall 2023",
    "Spring 2024",
    "Summer 2024",
    "Fall 2024",
    "Spring 2025",
    "Summer 2025",
    "Fall 2025",
    "Spring 2026",
    "Summer 2026",
  ];

  // Initialize course code map and semester courses
  const [semesterCourses, setSemesterCourses] = useState(() => {
    const courseCodeMap = {};
    const coursesWithIds = coursesData.map((course, index) => {
      const courseCodes = extractCourseCodes(course["course name"]);
      // Add to course code map
      courseCodes.forEach((code) => {
        courseCodeMap[code] = {
          ...course,
          id: `course-${index}`,
          courseCodes,
        };
      });
      return {
        ...course,
        id: `course-${index}`,
        courseCodes,
      };
    });

    // Save the course code map to state
    return {
      semesterData: {
        Unassigned: coursesWithIds,
        "Fall 2023": [],
        "Spring 2024": [],
        "Summer 2024": [],
        "Fall 2024": [],
        "Spring 2025": [],
        "Summer 2025": [],
        "Fall 2025": [],
        "Spring 2026": [],
        "Summer 2026": [],
      },
      courseCodeMap, // Map of course codes to course data
    };
  });

  const [errorMessages, setErrorMessages] = useState([]);

  // Function to check dependencies for all courses
  const checkAllDependencies = useCallback(
    (semesterCourses) => {
      const newErrorMessages = [];

      // Map semesters to their order
      const semesterOrder = {
        "Fall 2023": 1,
        "Spring 2024": 2,
        "Summer 2024": 3,
        "Fall 2024": 4,
        "Spring 2025": 5,
        "Summer 2025": 6,
        "Fall 2025": 7,
        "Spring 2026": 8,
        "Summer 2026": 9,
      };

      // For each scheduled course (excluding 'Unassigned'), check its dependencies
      for (const [semester, courses] of Object.entries(
        semesterCourses.semesterData
      )) {
        if (semester === "Unassigned") {
          continue; // Skip courses in 'Unassigned' for dependency checking
        }
        for (const course of courses) {
          const destSemester = semester;
          const destIndex = semesterOrder[destSemester];

          // Helper function to find if a course code is scheduled
          const isCourseCodeScheduled = (code, semestersToCheck) => {
            for (const sem of semestersToCheck) {
              if (sem === "Unassigned") continue; // Exclude 'Unassigned' semester
              const semCourses = semesterCourses.semesterData[sem];
              if (semCourses.some((c) => c.courseCodes.includes(code))) {
                return true;
              }
            }
            return false;
          };

          // Prepare semester lists for different checks
          const previousSemesters = Object.keys(semesterOrder).filter(
            (sem) => semesterOrder[sem] < destIndex
          );

          // Check Prerequisites
          const prereqCodes = parseDependencies(course.prereq);
          if (prereqCodes.length > 0) {
            for (const prereqCode of prereqCodes) {
              // Check if the prereq code exists in the course code map
              if (!(prereqCode in semesterCourses.courseCodeMap)) {
                // Skip if the course code doesn't exist
                continue;
              }

              const prereqFound = isCourseCodeScheduled(
                prereqCode,
                previousSemesters
              );

              if (!prereqFound) {
                newErrorMessages.push(
                  `Prerequisite Error: "${course["course name"]}" requires "${prereqCode}" to be scheduled in an earlier semester.`
                );
              }
            }
          }

          // Check Corequisites
          const coreqCodes = parseDependencies(course.concurrent);
          if (coreqCodes.length > 0) {
            for (const coreqCode of coreqCodes) {
              // Check if the coreq code exists in the course code map
              if (!(coreqCode in semesterCourses.courseCodeMap)) {
                // Skip if the course code doesn't exist
                continue;
              }

              const coreqFound = isCourseCodeScheduled(coreqCode, [
                destSemester,
              ]);

              if (!coreqFound) {
                newErrorMessages.push(
                  `Corequisite Error: "${course["course name"]}" requires "${coreqCode}" to be scheduled in the same semester.`
                );
              }
            }
          }

          // Check Prerequisite or Corequisite
          const prereqCoreqCodes = parseDependencies(
            course["prereq or concurrent"]
          );
          if (prereqCoreqCodes.length > 0) {
            for (const code of prereqCoreqCodes) {
              // Check if the code exists in the course code map
              if (!(code in semesterCourses.courseCodeMap)) {
                // Skip if the course code doesn't exist
                continue;
              }

              // For prerequisite or corequisite, check both current and previous semesters
              const foundInPrevious = isCourseCodeScheduled(
                code,
                previousSemesters
              );
              const foundInCurrent = isCourseCodeScheduled(code, [
                destSemester,
              ]);

              if (!foundInPrevious && !foundInCurrent) {
                newErrorMessages.push(
                  `Prerequisite/Corequisite Error: "${course["course name"]}" requires "${code}" to be scheduled in the same or an earlier semester.`
                );
              }
            }
          }
        }
      }

      setErrorMessages(newErrorMessages);
    },
    [setErrorMessages, semesterCourses.courseCodeMap]
  );

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

    const sourceCourses = Array.from(
      semesterCourses.semesterData[sourceSemester]
    );
    const destCourses = Array.from(semesterCourses.semesterData[destSemester]);
    const [movedCourse] = sourceCourses.splice(source.index, 1);

    destCourses.splice(destination.index, 0, movedCourse);

    const updatedSemesterData = {
      ...semesterCourses.semesterData,
      [sourceSemester]: sourceCourses,
      [destSemester]: destCourses,
    };

    const updatedSemesterCourses = {
      ...semesterCourses,
      semesterData: updatedSemesterData,
    };

    setSemesterCourses(updatedSemesterCourses);

    // Re-check dependencies for all courses
    checkAllDependencies(updatedSemesterCourses);
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

  // Re-check dependencies whenever semesterCourses changes
  useEffect(() => {
    checkAllDependencies(semesterCourses);
  }, [semesterCourses, checkAllDependencies]);

  // Search state for unassigned courses
  const [searchQuery, setSearchQuery] = useState("");

  // Group semesters into rows (excluding 'Unassigned')
  const assignedSemesters = semesters.filter((s) => s !== "Unassigned");
  const semesterGroups = [
    assignedSemesters.slice(0, 4),
    assignedSemesters.slice(4, 8),
    assignedSemesters.slice(8),
  ];

  return (
    <div className="App">
      {errorMessages.length > 0 && (
        <div className="error-messages">
          <button onClick={() => setErrorMessages([])}>Clear All Errors</button>
          {errorMessages.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="main-container">
          {/* Unassigned Column */}
          <div className="unassigned-column">
            <div className="unassigned-header">
              <h2>Unassigned</h2>
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Droppable droppableId="Unassigned">
              {(provided) => (
                <div
                  className="unassigned-content"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {/* Filtered Unassigned Courses */}
                  {semesterCourses.semesterData["Unassigned"]
                    .filter((course) =>
                      course["course name"]
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((course, index) => (
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
                            <CourseCard
                              course={course}
                              hasError={errorMessages.some((error) =>
                                error.includes(`"${course["course name"]}"`)
                              )}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          {/* Semesters Container */}
          <div className="semesters-container">
            {/* Render Semesters in Rows */}
            {semesterGroups.map((group, groupIndex) => (
              <div className="semester-row" key={`group-${groupIndex}`}>
                {group.map((semester) => (
                  <Droppable droppableId={semester} key={semester}>
                    {(provided) => (
                      <div
                        className="semester-column"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <h2>{semester}</h2>
                        {semesterCourses.semesterData[semester].map(
                          (course, index) => (
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
                                  <CourseCard
                                    course={course}
                                    hasError={errorMessages.some((error) =>
                                      error.includes(
                                        `"${course["course name"]}"`
                                      )
                                    )}
                                  />
                                </div>
                              )}
                            </Draggable>
                          )
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
