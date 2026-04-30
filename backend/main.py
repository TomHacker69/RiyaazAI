from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pitch_detector import analyze_pitch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Music Teacher Backend Running"}

@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...), target_note: str = "C4"):
    audio_bytes = await file.read()

    result = analyze_pitch(audio_bytes, target_note)

    return result