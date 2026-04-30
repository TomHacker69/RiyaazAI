import librosa
import numpy as np
import tempfile
import soundfile as sf


NOTE_FREQUENCIES = {
    "C4": 261.63,
    "D4": 293.66,
    "E4": 329.63,
    "F4": 349.23,
    "G4": 392.00,
    "A4": 440.00,
    "B4": 493.88,
}


def analyze_pitch(audio_bytes, target_note):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        temp_audio.write(audio_bytes)
        temp_audio_path = temp_audio.name

    y, sr = librosa.load(temp_audio_path)

    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)

    pitch_values = []

    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        pitch = pitches[index, t]
        if pitch > 0:
            pitch_values.append(pitch)

    if not pitch_values:
        return {
            "status": "error",
            "message": "No clear pitch detected. Try singing louder and clearer."
        }

    avg_pitch = float(np.mean(pitch_values))
    target_freq = NOTE_FREQUENCIES.get(target_note, 261.63)

    difference = abs(avg_pitch - target_freq)

    if difference <= 10:
        feedback = "Excellent! Your pitch is very close."
        score = 95
    elif difference <= 25:
        feedback = "Good attempt. Slight pitch correction needed."
        score = 75
    else:
        feedback = "Needs practice. Try matching the note more carefully."
        score = 50

    return {
        "status": "success",
        "target_note": target_note,
        "target_frequency": target_freq,
        "detected_frequency": round(avg_pitch, 2),
        "difference": round(difference, 2),
        "score": score,
        "feedback": feedback
    }