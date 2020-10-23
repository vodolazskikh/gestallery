import React from "react";
import { Video } from "./components/video";

function App() {
  return (
    <div style={{ height: "100%", display: "flex", justifyContent: "center" }}>
      <div className="App" style={{ height: "100%", maxWidth: 800 }}>
        <Video />
      </div>
    </div>
  );
}

export default App;
