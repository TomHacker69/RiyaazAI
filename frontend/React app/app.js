
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("C4");

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(blob);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  const sendAudio = async () => {
    const formData = new FormData();
    formData.append("file", audioBlob);

    const response = await axios.post(
      `http://127.0.0.1:8000/analyze-audio?target_note=${note}`,
      formData
    );

    setResult(response.data);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🎵 AI Music Teacher</h1>

      {/* Note Selector */}
      <select value={note} onChange={(e) => setNote(e.target.value)}>
        <option value="C4">C4</option>
        <option value="D4">D4</option>
        <option value="E4">E4</option>
        <option value="F4">F4</option>
        <option value="G4">G4</option>
        <option value="A4">A4</option>
        <option value="B4">B4</option>
      </select>

      <br /><br />

      {/* Record Button */}
      {!recording ? (
        <button onClick={startRecording}>🎤 Start Recording</button>
      ) : (
        <button onClick={stopRecording}>⏹ Stop Recording</button>
      )}

      <br /><br />

      {/* Send Button */}
      {audioBlob && (
        <button onClick={sendAudio}>📤 Analyze</button>
      )}

      <br /><br />

      {/* Result Card */}
      {result && (
        <div style={{
          border: "1px solid black",
          padding: "20px",
          margin: "20px auto",
          width: "300px",
          borderRadius: "10px"
        }}>
          <h3>Result</h3>
          <p><b>Detected Pitch:</b> {result.detected_frequency} Hz</p>
          <p><b>Target:</b> {result.target_note}</p>
          <p><b>Score:</b> {result.score}</p>
          <p><b>Feedback:</b> {result.feedback}</p>
        </div>
      )}
    </div>
  );
}

export default App;
