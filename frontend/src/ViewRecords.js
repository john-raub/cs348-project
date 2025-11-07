import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./ViewRecords.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


export default function ViewRecords() {
  const [allUserClasses, setAllUserClasses] = useState([]);
  const [allUserAssignments, setAllUserAssignments] = useState([]);
  const [allUserDistractionTypes, setAllUserDistractionTypes] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [selectedDistractionTypes, setSelectedDistractionTypes] = useState([]);
  const [filterClass, setFilterClass] = useState(false);
  const [filterAssignment, setFilterAssignment] = useState(false);
  const [filterDistractionType, setFilterDistractionType] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDates, setFilterDates] = useState(false);
  const [returnedRecords, setReturnedRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
        const fetchUserClasses = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/classes/getUserClasses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to load classes");
            setAllUserClasses(data);
        };
        const fetchUserAssignments = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/assignments/getUserAssignments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to load assignments");
            setAllUserAssignments(data);
        };
        const fetchUserDistractionTypes = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/distractions/getUserDistractionTypes", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to load distraction types");
            setAllUserDistractionTypes(data);
            console.log(data);
        };
        fetchUserClasses();
        fetchUserAssignments();
        fetchUserDistractionTypes();
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
  }, []);

  const handleAddSelectedClass = (e) => {
    const classId = e.target.value;
    console.log(allUserClasses);
    console.log(classId);
    if (!selectedClasses.find(cls => cls._id === classId)) {
      setSelectedClasses([...selectedClasses, { _id: classId, ...allUserClasses.find(cls => cls._id === classId) }]);
    }
    console.log(selectedClasses);
  };

  const handleAddSelectedAssignment = (e) => {
    const assignmentId = e.target.value;
    if (!selectedAssignments.find(a => a._id === assignmentId)) {
      setSelectedAssignments([...selectedAssignments, { _id: assignmentId, ...allUserAssignments.find(a => a._id === assignmentId) }]);
    }
  };

  const handleAddSelectedDistractionType = (e) => {
    const distractionType = e.target.value;
    if (!selectedDistractionTypes.find(dt => dt === distractionType)) {
      setSelectedDistractionTypes([...selectedDistractionTypes, distractionType]);
    }
  };

  const handleRemoveSelectedClass = (classId) => {
    setSelectedClasses(selectedClasses.filter(cls => cls._id !== classId));
  };

  const handleRemoveSelectedAssignment = (assignmentId) => {
    setSelectedAssignments(selectedAssignments.filter(a => a._id !== assignmentId));
  };

  const handleRemoveSelectedDistractionType = (distractionType) => {
    setSelectedDistractionTypes(selectedDistractionTypes.filter(dt => dt !== distractionType));
  };

  const handleSendFilters = () => {
    const filters = {
      filterClass,
      filterAssignment,
      filterDistractionType,
      filterDates,
      startDate,
      endDate,
      selectedClasses,
      selectedAssignments,
      selectedDistractionTypes
    };
    console.log("Sending filters:", filters);
    const sendFilters = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/records/getFilteredRecords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(filters)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch filtered records");
      console.log("Filtered records:", data);
      setReturnedRecords(data[0]);
    };
    sendFilters();
  }

  const productivityData =
  returnedRecords?.sessions?.map((session) => {
    const productivity = 1 - session.distractionFraction;
    return {
      date: session.datetime.split("T")[0],
      productivity: Math.round(productivity * 100),
    };
  }) || [];

  return (
    <div className="view-records-page">
        <button onClick={() => navigate("/profile")}>back</button>
        <h1>View Records</h1>
        <div className="filters">
            <div className="classes-filter">
                <h3>Filter by Classes</h3>
                <label>
                <input
                    type="checkbox"
                    onChange={() => setFilterClass(!filterClass)}
                    checked={filterClass}
                />
                Enable Class Filter
                </label>
                <select onChange={handleAddSelectedClass} defaultValue="">
                    <option value="" disabled>Select a class</option>
                    {allUserClasses.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.classId} - {cls.professor}</option>
                    ))}
                </select>
                <div className="selected-items">
                    {selectedClasses.map((cls) => (
                        <div key={cls._id} className="selected-item">
                            {cls.classId} - {cls.professor}
                            <button onClick={() => handleRemoveSelectedClass(cls._id)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="assignments-filter">
                <h3>Filter by Assignments</h3>
                <label>
                    <input
                        type="checkbox"
                        onChange={() => setFilterAssignment(!filterAssignment)}
                        checked={filterAssignment}
                    />
                    Enable Assignment Filter
                </label>
                <select onChange={handleAddSelectedAssignment} defaultValue="">
                    <option value="" disabled>Select an assignment</option>
                    {allUserAssignments.map((a) => (
                        <option key={a._id} value={a._id}>{a.title} - {a.class.classId}</option>
                    ))}
                </select>
                <div className="selected-items">
                    {selectedAssignments.map((a) => (
                        <div key={a._id} className="selected-item">
                            {a.title} - {a.dueDate}
                            <button onClick={() => handleRemoveSelectedAssignment(a._id)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="distraction-types-filter">
                <h3>Filter by Distraction Types</h3>
                <label>
                    <input
                        type="checkbox"
                        onChange={() => setFilterDistractionType(!filterDistractionType)}
                        checked={filterDistractionType}
                    />
                    Enable Distraction Type Filter
                </label>
                <select onChange={handleAddSelectedDistractionType} defaultValue="">
                    <option value="" disabled>Select a distraction type</option>
                    {allUserDistractionTypes.map((dt) => (
                        <option key={dt} value={dt}> {dt}</option>
                    ))}
                </select>
                <div className="selected-items">
                    {selectedDistractionTypes.map((dt) => (
                        <div key={dt} className="selected-item">
                            {dt}
                            <button onClick={() => handleRemoveSelectedDistractionType(dt)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="date-filter">
                <h3>Filter by Date Range</h3>
                <label>
                    <input
                        type="checkbox"
                        onChange={() => setFilterDates(!filterDates)}
                        checked={filterDates}
                    />
                    Enable Date Filter
                </label>
                <label>
                    Start Date:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    End Date:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
            </div>
        </div>
        <div className="apply-filters">
            <button onClick={handleSendFilters}>Apply Filters</button>
        </div>
        <div className="returned-records">
            <h2>Returned Records</h2>
            {returnedRecords.length === 0 ? (
                <p>No records found.</p>
            ) : (
                <div>
                    {returnedRecords.sessions && returnedRecords.sessions.length > 0 && (
                        <>
                            <h3>Summary</h3>
                            <p>Total Sessions: {returnedRecords.sessions.length}</p>
                            <p>Total Time: {returnedRecords.overall[0].AllSessionTime} minutes</p>
                            <p>Total Distraction Time: {returnedRecords.overall[0].AllDistractionTime} minutes</p>
                            <p>Total Study Time: {returnedRecords.overall[0].AllStudyTime} minutes</p>
                            <p>Total Assignment Time: {returnedRecords.overall[0].AllAssignmentTime} minutes</p>
                            <p>Distraction Percentage: {returnedRecords.overall[0].distractionFraction * 100}%</p>
                            <p>Study Percentage: {returnedRecords.overall[0].studyFraction * 100}%</p>
                            <p>Assignment Percentage: {returnedRecords.overall[0].assignmentFraction * 100}%</p>
                    
                            {returnedRecords.sessions.map((session) => (
                                <div key={session._id}>
                                    <h3>{session.title}</h3>
                                    <p>Date: {session.datetime.split("T")[0]}</p>
                                    <p>Total time: {session.totalSessionTime} minutes</p>
                                    <p>Distraction time: {session.totalDistractionTime} minutes</p>
                                    <p>Study time: {session.totalStudyTime} minutes</p>
                                    <p>Assignment time: {session.totalAssignmentTime} minutes</p>
                                    <p>Distraction Percentage: {(session.distractionFraction * 100).toFixed(2)}%</p>
                                    <p>Study Percentage: {(session.studyFraction * 100).toFixed(2)}%</p>
                                    <p>Assignment Percentage: {(session.assignmentFraction * 100).toFixed(2)}%</p>
                                    {session.assignmentworks && session.assignmentworks.length > 0 && (
                                        <div>
                                            <h4>Assignment Work:</h4>
                                            <ul>
                                                {session.assignmentworks.map((aw) => (
                                                    <li key={aw.assignment._id}>
                                                        <p>Title: {aw.assignment.title}</p>
                                                        <p>Time Spent: {aw.time} minutes</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {session.distractions && session.distractions.length > 0 && (
                                        <div>
                                            <h4>Distractions:</h4>
                                            <ul>
                                                {session.distractions.map((d) => (
                                                    <li key={d.type}>
                                                        <p>Type: {d.type}</p>
                                                        <p>Time Spent: {d.timeTaken} minutes</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {session.studies && session.studies.length > 0 && (
                                        <div>
                                            <h4>Study Materials:</h4>
                                            <ul>
                                                {session.studies.map((s) => (
                                                    <li key={s.what}>
                                                        <p>what: {s.what}</p>
                                                        <p>level of understanding: {s.understanding}</p>
                                                        <p>Time Spent: {s.time} minutes</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                    ))}</>)}
                </div>
            )}
            {returnedRecords.sessions && returnedRecords.sessions.length > 0 && (
            <div style={{ width: "80%", height: 400 }}>
                <h3>Productivity Over Time</h3>
                <ResponsiveContainer>
                <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend />
                    <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    dot={false}
                    name="Productivity (%)"
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
            )}
        </div>
    </div>
    );
}