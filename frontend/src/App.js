import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";
import ProfilePage from "./ProfilePage";
import EditRecords from "./EditRecords";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Edit Records Route */}
        <Route
          path="/RecordEdit"
          element={
            <ProtectedRoute>
              <EditRecords />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
