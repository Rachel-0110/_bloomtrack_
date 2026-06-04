import sys
from pathlib import Path

# Add the backend folder to the Python path so imports work
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import the FastAPI app from backend/main.py
from main import app  # noqa: E402, F401