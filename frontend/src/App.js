import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(res => setMessage(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
  axios.get("http://localhost:5000/test-db");
  }, []);


  return (
    <div>
      <h1>Hello World!</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
