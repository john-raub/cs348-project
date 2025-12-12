import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    username: "",
    startYear: "",
    school: ""
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load profile");
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startYear: profileData.startYear,
          school: profileData.school,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      setProfileData(data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      <h1>Welcome, {profileData.username}!</h1>

      {editing ? (
        <>
          <label>
            Start Year:
            <input
              type="number"
              name="startYear"
              value={profileData.startYear}
              onChange={handleChange}
            />
          </label>

          <label>
            School:
            <input
              type="text"
              name="school"
              value={profileData.school}
              onChange={handleChange}
            />
          </label>

          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p><strong>Start Year:</strong> {profileData.startYear}</p>
          <p><strong>School:</strong> {profileData.school || "Not provided"}</p>
          <button onClick={() => setEditing(true)}>Edit</button>
        </>
      )}

      <hr />
      <button onClick={() => navigate("/RecordEdit")}>Edit Records</button>
      <button onClick={() => navigate("/RecordView")}>View Records</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
