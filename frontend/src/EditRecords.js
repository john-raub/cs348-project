import React, { useState, useEffect } from "react";

export default function EditRecords() {
  const [userSemesters, setUserSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [editingSemester, setEditingSemester] = useState(null);
  const [semesterEditForm, setSemesterEditForm] = useState({ year: "", season: "" });
  const [newSemester, setNewSemester] = useState({ year: "", season: "" });
  const [semesterClasses, setSemesterClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classEditForm, setClassEditForm] = useState({ classId: "", professor: "", grade: "" });
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({ classId: "", professor: "", grade: "" });
  const [classAssignments, setClassAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ title: "" });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentEditForm, setAssignmentEditForm] = useState({ title: "" });
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Fetch semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await fetch("/api/semesters/getUserSemesters", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setUserSemesters(data);
      } catch (err) {
        console.error("Error fetching semesters:", err);
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedSemester) {
        setSemesterClasses([]);
        return;
      }
      try {
        const res = await fetch(`/api/classes/getClasses/${selectedSemester._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setSemesterClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, [selectedSemester]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedClass) {
        setClassAssignments([]);
        return;
      }
      try {
        const res = await fetch(`/api/assignments/getAssignments/${selectedClass._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setClassAssignments(data);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };
    fetchAssignments();
  }, [selectedClass]);

  const handleSelectSemester = (id) => {
    const semester = userSemesters.find((s) => s._id === id);
    setSelectedSemester(semester);
    setEditingSemester(null);
  };

  const handleSelectClass = (id) => {
    const classItem = semesterClasses.find((c) => c._id === id);
    setSelectedClass(classItem);
    setEditingClass(null);
  }

  const handleSelectAssignment = (id) => {  
    const assignment = classAssignments.find((a) => a._id === id);
    setSelectedAssignment(assignment);
    setEditingAssignment(null);
  };

  const handleCreateSemester = async () => {
    try {
      const res = await fetch("/api/semesters/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newSemester),
      });
      const data = await res.json();
      setUserSemesters([...userSemesters, data]);
      setNewSemester({ year: "", season: "" });
    } catch (err) {
      console.error("Error creating semester:", err);
    }
  };

  const handleCreateClass = async () => {
    try {
      const res = await fetch("/api/classes/createClass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newClass, semesterId: selectedSemester._id }),
      });
      const data = await res.json();
      setSemesterClasses([...semesterClasses, data]);
      setNewClass({ classId: "", professor: "", grade: "" });
    } catch (err) {
      console.error("Error creating class:", err);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const res = await fetch("/api/assignments/createAssignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newAssignment, classId: selectedClass._id }),
      });
      const data = await res.json();
      setClassAssignments([...classAssignments, data]);
      setNewAssignment({ title: "" });
    } catch (err) {
      console.error("Error creating assignment:", err);
    }
  };

  const handleDeleteSemester = async (id) => {
    try {
      await fetch(`/api/semesters/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserSemesters(userSemesters.filter((s) => s._id !== id));
      if (selectedSemester?._id === id) setSelectedSemester(null);
    } catch (err) {
      console.error("Error deleting semester:", err);
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      await fetch(`/api/classes/deleteClass/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSemesterClasses(semesterClasses.filter((c) => c._id !== id));
      if (selectedClass?._id === id) setSelectedClass(null);
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await fetch(`/api/assignments/deleteAssignment/${id}`, {  
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClassAssignments(classAssignments.filter((a) => a._id !== id));
      if (selectedAssignment?._id === id) setSelectedAssignment(null);
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  const handleEditSemester = (semester) => {
    setEditingSemester(semester._id);
    setSemesterEditForm({ year: semester.year, season: semester.season });
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem._id);
    setClassEditForm({ classId: classItem.classId, professor: classItem.professor, grade: classItem.grade });
  }

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment._id);
    setAssignmentEditForm({ title: assignment.title });
  }

  const handleSaveSemesterEdit = async (id) => {
    try {
      const res = await fetch(`/api/semesters/updateSemester/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(semesterEditForm),
      });
      const updated = await res.json();
      setUserSemesters(userSemesters.map((s) => (s._id === id ? updated : s)));
      setEditingSemester(null);
    } catch (err) {
      console.error("Error updating semester:", err);
    }
  };

  const handleSaveClassEdit = async (id) => {
    try {
      const res = await fetch(`/api/classes/updateClass/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(classEditForm),
      });
      const updated = await res.json();
      setSemesterClasses(semesterClasses.map((c) => (c._id === id ? updated : c)));
      setEditingClass(null);
    } catch (err) {
      console.error("Error updating class:", err);
    }
  };

  const handleSaveAssignmentEdit = async (id) => {
    try {
      const res = await fetch(`/api/assignments/updateAssignment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(assignmentEditForm),
      });
      const updated = await res.json();
      setClassAssignments(classAssignments.map((a) => (a._id === id ? updated : a)));
      setEditingAssignment(null);
    } catch (err) {
      console.error("Error updating assignment:", err);
    }
  };

  return (
    <div className="semester-manager">
      <h2>Manage Semesters</h2>

      {/* Dropdown for selecting semester */}
      <select
        value={selectedSemester?._id || ""}
        onChange={(e) => handleSelectSemester(e.target.value)}
      >
        <option value="">Select a semester</option>
        {userSemesters.map((semester) => (
          <option key={semester._id} value={semester._id}>
            {semester.season} {semester.year}
          </option>
        ))}
      </select>

      {/* Inline editing section */}
      {selectedSemester && (
        <div className="semester-details">
          <h3>
            Selected: {selectedSemester.season} {selectedSemester.year}
          </h3>

          {editingSemester === selectedSemester._id ? (
            <div>
              <label>
                Season:
                <select
                  value={semesterEditForm.season}
                  onChange={(e) =>
                    setSemesterEditForm({ ...semesterEditForm, season: e.target.value })
                  }
                >
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </select>
              </label>
              <label>
                Year:
                <input
                  type="number"
                  value={semesterEditForm.year}
                  onChange={(e) =>
                    setSemesterEditForm({ ...semesterEditForm, year: e.target.value })
                  }
                />
              </label>
              <button onClick={() => handleSaveSemesterEdit(selectedSemester._id)}>
                Save
              </button>
              <button onClick={() => setEditingSemester(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <button onClick={() => handleEditSemester(selectedSemester)}>
                Edit
              </button>
              <button
                onClick={() => handleDeleteSemester(selectedSemester._id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create new semester */}
      <div className="create-semester">
        <h3>Create New Semester</h3>
        <label>
          Season:
          <select
            value={newSemester.season}
            onChange={(e) =>
              setNewSemester({ ...newSemester, season: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </label>

        <label>
          Year:
          <input
            type="number"
            value={newSemester.year}
            onChange={(e) =>
              setNewSemester({ ...newSemester, year: e.target.value })
            }
          />
        </label>
        <button onClick={handleCreateSemester}>Add Semester</button>
      </div>
      <div className="classes-section">
      <h2>Classes for Selected Semester</h2>
      {selectedSemester === null ? (
        <div>Please select a semester to view details.</div>
      ) : (
        <div>
          <select
            value={selectedClass?._id || ""}
            onChange={(e) => handleSelectClass(e.target.value)}
          >
            <option value="">Select a class</option>
            {semesterClasses.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.classId} - {classItem.professor} ({classItem.grade})
              </option>
            ))}
          </select>
          {/* Inline editing for classes */}
            {selectedClass && (
              <div>
                <label>
                  Class ID:
                  <input
                    type="text"
                    value={classEditForm.classId}
                    onChange={(e) =>
                      setClassEditForm({ ...classEditForm, classId: e.target.value })
                    }
                  />
                </label>
                <label>
                  Professor:
                  <input
                    type="text"
                    value={classEditForm.professor}
                    onChange={(e) =>
                      setClassEditForm({ ...classEditForm, professor: e.target.value })
                    }
                  />
                </label>
                <label>
                  Grade:
                  <input
                    type="text"
                    value={classEditForm.grade}
                    onChange={(e) =>
                      setClassEditForm({ ...classEditForm, grade: e.target.value })
                    }
                  />
                </label>
                <button onClick={() => handleSaveClassEdit(selectedClass._id)}>
                  Save
                </button>
                <button onClick={() => handleDeleteClass(selectedClass._id)}>
                  Delete selected class
                </button>
                <button onClick={() => setEditingClass(null)}>Cancel</button>
              </div>
            )}
            {/* Create new class */}
            <div>
              <h3>Create New Class</h3>
              <label>
                Class ID:
                <input
                  type="text"
                  value={newClass.classId}
                  onChange={(e) =>
                    setNewClass({ ...newClass, classId: e.target.value })
                  }
                />
              </label>
              <label>
                Professor:
                <input
                  type="text"
                  value={newClass.professor}
                  onChange={(e) =>
                    setNewClass({ ...newClass, professor: e.target.value })
                  }
                />
              </label>
              <label>
                Grade:
                <input
                  type="text"
                  value={newClass.grade}
                  onChange={(e) =>
                    setNewClass({ ...newClass, grade: e.target.value })
                  }
                />
              </label>
              <button onClick={handleCreateClass}>Add Class</button>
            </div>
        </div>
      )}
    </div>
    <div className="assignments-section">
      <h2>Assignments for Selected Class</h2>
      {selectedClass === null ? (
        <div>Please select a class to view assignments.</div>
      ) : (
        <div>
          <select
            value={selectedAssignment?._id || ""}
            onChange={(e) => handleSelectAssignment(e.target.value)}
          >
            <option value="">Select an assignment</option>
            {classAssignments.map((assignment) => (
              <option key={assignment._id} value={assignment._id}>
                {assignment.title}
              </option>
            ))}
          </select>
          {/* Inline editing for assignments */}
          {selectedAssignment && (
            <div>
              <label>
                Title:
                <input
                  type="text"
                  value={assignmentEditForm.title}
                  onChange={(e) =>
                    setAssignmentEditForm({ ...assignmentEditForm, title: e.target.value })
                  }
                />
              </label>
              <button onClick={() => handleSaveAssignmentEdit(selectedAssignment._id)}>
                Save
              </button>
              <button onClick={() => handleDeleteAssignment(selectedAssignment._id)}>
                Delete selected assignment
              </button>
              <button onClick={() => setEditingAssignment(null)}>Cancel</button>
            </div>
          )}
          {/* Create new assignment */}
          <div>
            <h3>Create New Assignment</h3>
            <label>
              Title:
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, title: e.target.value })
                }
              />
            </label>
            <button onClick={handleCreateAssignment}>Add Assignment</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
