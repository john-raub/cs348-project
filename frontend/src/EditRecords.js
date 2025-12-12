import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

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
  const [userSessions, setUserSessions] = useState([]);
  const [newSession, setNewSession] = useState({ title: "", datetime: "" });
  const [editingSession, setEditingSession] = useState(null);
  const [sessionEditForm, setSessionEditForm] = useState({ title: "", datetime: "" });
  const [selectedSession, setSelectedSession] = useState(null);
  const [allAssignments, setAllAssignments] = useState([]);
  const [allSessionWork, setAllSessionWork] = useState([]);
  const [workEditForm, setWorkEditForm] = useState({ time: "" });
  const [editingWork, setEditingWork] = useState(null);
  const [newWork, setNewWork] = useState({ assignmentId: "", time: "" });
  const [selectedWork, setselectedWork] = useState(null);
  const [allSessionStudy, setAllSessionStudy] = useState([]);
  const [newStudy, setNewStudy] = useState({ what: "", understanding: "", time: "" });
  const [editingStudy, setEditingStudy] = useState(null);
  const [studyEditForm, setStudyEditForm] = useState({ what: "", understanding: "", time: "" });
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [allSessionDistractions, setAllSessionDistractions] = useState([]);
  const [newDistraction, setNewDistraction] = useState({ type: "", timeTaken: "" });
  const [editingDistraction, setEditingDistraction] = useState(null);
  const [distractionEditForm, setDistractionEditForm] = useState({ type: "", timeTaken: "" });
  const [selectedDistraction, setSelectedDistraction] = useState(null);
  const navigate = useNavigate();

  // Fetch semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await fetch(`${API_URL}/api/semesters/getUserSemesters`, {
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
        const res = await fetch(`${API_URL}/api/classes/getClasses/${selectedSemester._id}`, {
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
        const res = await fetch(`${API_URL}/api/assignments/getAssignments/${selectedClass._id}`, {
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

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sessions/getUserSessions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setUserSessions(data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchSessionWork = async () => {
      if (!selectedSession) {
        setAllSessionWork([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/works/getSessionWorks/${selectedSession._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setAllSessionWork(data);
      } catch (err) {
        console.error("Error fetching session work:", err);
      }
    };
    fetchSessionWork();
  }, [selectedSession]);

  useEffect(() => {
    const fetchAllAssignments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/assignments/getUserAssignments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setAllAssignments(data);
      } catch (err) {
        console.error("Error fetching all assignments:", err);
      }
    };
    fetchAllAssignments();
  }, [classAssignments]);

  useEffect(() => {
    const fetchAllStudy = async () => {
      if (!selectedSession) {
        setAllSessionStudy([]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/study/getStudies/${selectedSession._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setAllSessionStudy(data);
      } catch (err) {
        console.error("Error fetching all study:", err);
      }
    };
    fetchAllStudy();
  }, [selectedSession]);

  useEffect(() => {
    const fetchAllDistractions = async () => {
      if (!selectedSession) {
        setAllSessionDistractions([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/distractions/getDistractions/${selectedSession._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setAllSessionDistractions(data);
      } catch (err) {
        console.error("Error fetching all distractions:", err);
      }
    };
    fetchAllDistractions();
  }, [selectedSession]);

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

  const handleSelectSession = (id) => {
    const session = userSessions.find((s) => s._id === id);
    setSelectedSession(session);
    setEditingSession(null);
  }

  const handleSelectWork = (id) => {
    const work = allSessionWork.find((w) => w._id === id);
    setselectedWork(work);
    setEditingWork(null);
  };

  const handleSelectStudy = (id) => {
    const study = allSessionStudy.find((s) => s._id === id);
    setSelectedStudy(study);
    setEditingStudy(null);
  };

  const handleSelectDistraction = (id) => {
    const distraction = allSessionDistractions.find((d) => d._id === id);
    setSelectedDistraction(distraction);
    setEditingDistraction(null);
  };

  const handleCreateSemester = async () => {
    try {
      const res = await fetch(`${API_URL}/api/semesters/create`, {
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
      const res = await fetch(`${API_URL}/api/classes/createClass`, {
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
      const res = await fetch(`${API_URL}/api/assignments/createAssignment`, {
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

    const handleCreateSession = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/createSession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newSession),
      });
      const data = await res.json();
      setUserSessions([...userSessions, data]);
      setNewSession({ title: "", datetime: "" });
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const handleCreateWork = async () => {
    try {
      const res = await fetch(`${API_URL}/api/works/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newWork, sessionId: selectedSession._id }),
      });
      const data = await res.json();
      setNewWork({ assignmentId: "", time: "" });
    } catch (err) {
      console.error("Error creating work:", err);
    }

    if (!selectedSession) {
        setAllSessionWork([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/works/getSessionWorks/${selectedSession._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setAllSessionWork(data);
      } catch (err) {
        console.error("Error fetching session work:", err);
      }
  };

  const handleCreateStudy = async () => {
    try {
      const res = await fetch(`${API_URL}/api/study/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newStudy, session: selectedSession._id }),
      });
      const data = await res.json();
      setAllSessionStudy([...allSessionStudy, data]);
      setNewStudy({ what: "", understanding: "", time: "" });
    } catch (err) {
      console.error("Error creating study:", err);
    }
  };

  const handleCreateDistraction = async () => {
    try {
      const res = await fetch(`${API_URL}/api/distractions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newDistraction, session: selectedSession._id }),
      });
      const data = await res.json();
      setAllSessionDistractions([...allSessionDistractions, data]);
      setNewDistraction({ type: "", timeTaken: "" });
    } catch (err) {
      console.error("Error creating distraction:", err);
    }
  };

  const handleDeleteSemester = async (id) => {
    try {
      await fetch(`${API_URL}/api/semesters/delete/${id}`, {
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
      await fetch(`${API_URL}/api/classes/deleteClass/${id}`, {
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
      await fetch(`${API_URL}/api/assignments/deleteAssignment/${id}`, {  
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClassAssignments(classAssignments.filter((a) => a._id !== id));
      if (selectedAssignment?._id === id) setSelectedAssignment(null);
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await fetch(`${API_URL}/api/sessions/deleteSession/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserSessions(userSessions.filter((s) => s._id !== id));
      if (selectedSession?._id === id) setSelectedSession(null);
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleDeleteWork = async (id) => {
    try {
      await fetch(`${API_URL}/api/works/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllSessionWork(allSessionWork.filter((w) => w._id !== id));
      if (selectedWork === id) setselectedWork(null);
    } catch (err) {
      console.error("Error deleting work:", err);
    }
  };

  const handleDeleteStudy = async (id) => {
    try {
      await fetch(`${API_URL}/api/study/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllSessionStudy(allSessionStudy.filter((s) => s._id !== id));
      if (selectedStudy?._id === id) setSelectedStudy(null);
    } catch (err) {
      console.error("Error deleting study:", err);
    }
  };

  const handleDeleteDistraction = async (id) => {
    try {
      await fetch(`${API_URL}/api/distractions/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllSessionDistractions(allSessionDistractions.filter((d) => d._id !== id));
      if (selectedDistraction?._id === id) setSelectedDistraction(null);
    } catch (err) {
      console.error("Error deleting distraction:", err);
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

  const handleEditSession = (session) => {
    setEditingSession(session._id);
    setSessionEditForm({ title: session.title, datetime: session.datetime });
  };

  const handleEditWork = (work) => { 
    setEditingWork(work._id);
    setWorkEditForm({ time: work.time });
  };

  const handleEditStudy = (study) => {
    setEditingStudy(study._id);
    setStudyEditForm({ what: study.what, understanding: study.understanding, time: study.time });
  };

  const handleEditDistraction = (distraction) => {
    setEditingDistraction(distraction._id);
    setDistractionEditForm({ type: distraction.type, timeTaken: distraction.timeTaken });
  };

  const handleSaveSemesterEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/semesters/updateSemester/${id}`, {
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
      const res = await fetch(`${API_URL}/api/classes/updateClass/${id}`, {
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
      const res = await fetch(`${API_URL}/api/assignments/updateAssignment/${id}`, {
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

  const handleSaveSessionEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/updateSession/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(sessionEditForm),
      });
      const updated = await res.json();
      setUserSessions(userSessions.map((s) => (s._id === id ? updated : s)));
      setEditingSession(null);
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const handleSaveWorkEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/works/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(workEditForm),
      });
      const updated = await res.json();
      setEditingWork(null);
    } catch (err) {
      console.error("Error updating work:", err);
    }

    if (!selectedSession) {
        setAllSessionWork([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/works/getSessionWorks/${selectedSession._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setAllSessionWork(data);
      } catch (err) {
        console.error("Error fetching session work:", err);
      }
  };

  const handleSaveStudyEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/study/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(studyEditForm),
      });
      const updated = await res.json();
      setAllSessionStudy(allSessionStudy.map((s) => (s._id === id ? updated : s)));
      setEditingStudy(null);
    } catch (err) {
      console.error("Error updating study:", err);
    }
  };

  const handleSaveDistractionEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/distractions/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(distractionEditForm),
      });
      const updated = await res.json();
      setAllSessionDistractions(allSessionDistractions.map((d) => (d._id === id ? updated : d)));
      setEditingDistraction(null);
    } catch (err) {
      console.error("Error updating distraction:", err);
    }
  };

  return (
    <div>
    <button onClick={() => navigate("/profile")}>back</button>
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
      <div className="sessions-section">
      <h2>Study Sessions</h2>
      <select
        value={selectedSession?._id || ""}
        onChange={(e) => handleSelectSession(e.target.value)}
      >
        <option value="">Select a session</option>
        {userSessions.map((session) => (
          <option key={session._id} value={session._id}>
            {session.title} {session.datetime.slice(0,10)}
          </option>
        ))}
      </select>
      {/* Inline editing for sessions */}
      {selectedSession && (
        <div>
          <label>
            Title:
            <input
              type="text"
              value={sessionEditForm.title}
              onChange={(e) =>
                setSessionEditForm({ ...sessionEditForm, title: e.target.value })
              }
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              value={sessionEditForm.datetime}
              onChange={(e) =>
                setSessionEditForm({ ...sessionEditForm, datetime: e.target.value })
              }
            />
          </label>
          <button onClick={() => handleSaveSessionEdit(selectedSession._id)}>
            Save
          </button>
          <button onClick={() => handleDeleteSession(selectedSession._id)}>
            Delete selected session
          </button>
          <button onClick={() => setEditingSession(null)}>Cancel</button>
        </div>
      )}
      {/* Create new session */}
      <div>
        <h3>Create New Study Session</h3>
        <label>
          Title:
          <input
            type="text"
            value={newSession.title}
            onChange={(e) =>
              setNewSession({ ...newSession, title: e.target.value })
            }
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            value={newSession.datetime}
            onChange={(e) =>
              setNewSession({ ...newSession, datetime: e.target.value })
            }
          />
        </label>
        <button onClick={handleCreateSession}>Add Session</button>
      </div>
    </div>

    <div className="work-section">
      <h2>Work for Selected Session</h2>
      {selectedSession === null ? (
        <p>Please select a session to view its work.</p>
      ) : (
        <div>
          <h3>Existing Work</h3>
          {allSessionWork.length === 0 ? (
            <p>No work found for this session.</p>
          ) : (
            <div>
              <select
                value={selectedWork?._id || ""}
                onChange={(e) => handleSelectWork(e.target.value)}
              >
                <option value="">Select a work item</option>
                {allSessionWork.map((work) => (
                  <option key={work._id} value={work._id}>
                    {work.time} minutes - {work.assignment.title}
                  </option>
                ))}
              </select>
              <button onClick={() => handleDeleteWork(selectedWork._id)}>
                Delete selected work
              </button>
              <button onClick={() => setEditingWork(selectedWork._id)}>Edit selected work</button>
            </div>    
          )}
          <h3>Create New Work</h3>
          <label>
            Minutes Spent:
            <input
              type="number"
              value={newWork.time}
              onChange={(e) =>
                setNewWork({ ...newWork, time: e.target.value })
              }
            />
          </label>
          <label>
            assignment:
            <select
              value={newWork.assignmentId}
              onChange={(e) =>
                setNewWork({ ...newWork, assignmentId: e.target.value })
              }
            >
              <option value="">Select an assignment</option>
              {allAssignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title} - {assignment.class.classId}
                </option>
              ))}
            </select>
          </label>
          <button onClick={handleCreateWork}>Add Work</button>
        </div>
      )}

      <div className="edit-work">
      {editingWork && (
        <div>
          <h3>Edit Work</h3>
          <label>
            Minutes Spent:
            <input
              type="number"
              value={workEditForm.time}
              onChange={(e) =>
                setWorkEditForm({ ...workEditForm, time: e.target.value })
              }
            />
          </label>
          <button onClick={() => handleSaveWorkEdit(selectedWork._id)}>
            Save
          </button>
          <button onClick={() => setEditingWork(null)}>Cancel</button>
        </div>
      )}
      </div>
      </div>
    <div className="study-section">
      <h2>Study Records for Selected Session</h2>
      {selectedSession === null ? (
        <p>Please select a session to view its study records.</p>
      ) : (
        <div>
          <h3>Existing Study Records</h3>
          {allSessionStudy.length === 0 ? (
            <p>No study records found for this session.</p>
          ) : (
            <select
              value={selectedStudy?._id || ""}
              onChange={(e) => handleSelectStudy(e.target.value)}
            >
              <option value="">Select a study record</option>
              {allSessionStudy.map((study) => (
                <option key={study._id} value={study._id}>
                  {study.what} - {study.understanding} - {study.time} minutes
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      {/* Create new study record */}
      <div>
        <h3>Create New Study Record</h3>
        <label>
          What I Studied:
          <input
            type="text"
            value={newStudy.what}
            onChange={(e) =>
              setNewStudy({ ...newStudy, what: e.target.value })
            }
          />
        </label>
        <label>
          Understanding Level:
          <input
            type="number"
            value={newStudy.understanding}
            onChange={(e) =>
              setNewStudy({ ...newStudy, understanding: e.target.value })
            }
          />
        </label>
        <label>
          Time Spent (minutes):
          <input
            type="number"
            value={newStudy.time}
            onChange={(e) =>
              setNewStudy({ ...newStudy, time: e.target.value })
            }
          />
        </label>
        <button onClick={handleCreateStudy}>Add Study Record</button>
        </div>
        {/* Inline editing for study records */}
        {selectedStudy && (
          <div>
            <h3>Edit Study Record</h3>
            <label>
              What I Studied:
              <input
                type="text"
                value={studyEditForm.what}
                onChange={(e) =>
                  setStudyEditForm({ ...studyEditForm, what: e.target.value })
                }
              />
            </label>
            <label>
              Understanding Level:
              <input
                type="number"
                value={studyEditForm.understanding}
                onChange={(e) =>
                  setStudyEditForm({ ...studyEditForm, understanding: e.target.value })
                }
              />
            </label>
            <label>
              Time Spent (minutes):
              <input
                type="number"
                value={studyEditForm.time}
                onChange={(e) =>
                  setStudyEditForm({ ...studyEditForm, time: e.target.value })
                }
              />
            </label>
            <button onClick={() => handleSaveStudyEdit(selectedStudy._id)}>
              Save
            </button>
            <button onClick={() => handleDeleteStudy(selectedStudy._id)}>
              Delete selected study record
            </button>
            <button onClick={() => setSelectedStudy(null)}>Cancel</button>
          </div>
        )}
        </div>
        <div className="distraction-section">
          <h2>Distractions for Selected Session</h2>
          {selectedSession === null ? (
            <p>Please select a session to view its distractions.</p>
          ) : (
            <div>
              <h3>Existing Distractions</h3>
              {allSessionDistractions.length === 0 ? (
                <p>No distractions found for this session.</p>
              ) : (
                <div>
                <select
                  value={selectedDistraction?._id || ""}
                  onChange={(e) => handleSelectDistraction(e.target.value)}
                >
                  <option value="">Select a distraction</option>
                  {allSessionDistractions.map((distraction) => (
                    <option key={distraction._id} value={distraction._id}>
                      {distraction.type} - {distraction.timeTaken} minutes
                    </option>
                  ))}
                </select>
                <button onClick={() => handleDeleteDistraction(selectedDistraction._id)}>
                  Delete selected distraction
                </button>
                <button onClick={() => setEditingDistraction(selectedDistraction._id)}>Edit selected distraction</button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Create new distraction */}
        {selectedSession && (
          <div>
            <h3>Create New Distraction</h3>
            <label>
              Distraction Type:
              <input
                type="text"
                value={newDistraction.type}
                onChange={(e) =>
                  setNewDistraction({ ...newDistraction, type: e.target.value })
                }
              />
            </label>
            <label>
              Time Taken (minutes):
              <input
                type="number"
                value={newDistraction.timeTaken}
                onChange={(e) =>
                  setNewDistraction({ ...newDistraction, timeTaken: e.target.value })
                }
              />
            </label>
            <button onClick={handleCreateDistraction}>Add Distraction</button>
          </div>
        )}
        {/* Inline editing for distractions */}
        {editingDistraction && (
          <div>
            <h3>Edit Distraction</h3>
            <label>
              Distraction Type:
              <input
                type="text"
                value={distractionEditForm.type}
                onChange={(e) =>
                  setDistractionEditForm({ ...distractionEditForm , type: e.target.value })
                }
              />
            </label>
            <label>
              Time Taken (minutes):
              <input
                type="number"
                value={distractionEditForm.timeTaken}
                onChange={(e) =>
                  setDistractionEditForm({ ...distractionEditForm, timeTaken: e.target.value })
                }
              />
            </label>
            <button onClick={() => handleSaveDistractionEdit(selectedDistraction._id)}>
              Save
            </button>
            <button onClick={() => setEditingDistraction(null)}>Cancel</button>
          </div>
        )}
      </div>
      </div>
  );
}
