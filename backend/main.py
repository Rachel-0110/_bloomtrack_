"""
BloomTrack Backend — FastAPI application for tracking flower stock and waste.

Run with:
    uvicorn main:app --reload

Environment variables required (see .env.example):
    SUPABASE_URL  — Your Supabase project URL
    SUPABASE_KEY  — Your Supabase anon/service key
"""

import os
from typing import Optional
from datetime import date, datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# ── Supabase client ──────────────────────────────────────────────────────────

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_KEY must be set in .env or environment"
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── FastAPI app ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="BloomTrack API",
    description="Backend API for tracking flower stock freshness and waste logs.",
    version="1.0.0",
)

# Allow the Vite dev server (and optionally production frontend) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic models ─────────────────────────────────────────────────────────

class StockCreate(BaseModel):
    """Payload for creating a new stock item."""
    flower_name: str
    quantity: int
    unit: str
    arrival_date: date
    colour: str
    cost_per_unit: float
    status: str = "available"
    shop_code: str


class StockUpdate(BaseModel):
    """Payload for updating an existing stock item."""
    flower_name: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    arrival_date: Optional[date] = None
    colour: Optional[str] = None
    cost_per_unit: Optional[float] = None
    status: Optional[str] = None
    shop_code: Optional[str] = None


class WasteCreate(BaseModel):
    """Payload for logging a waste entry."""
    stock_id: str
    flower_name: str
    quantity_wasted: int
    reason: str
    estimated_loss: float
    shop_code: str


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok"}


# ── Stock endpoints ──────────────────────────────────────────────────────────

@app.get("/stock")
def get_stock(shop_code: str = Query(..., description="Shop code to filter stock")):
    """Fetch all stock items for a given shop."""
    response = (
        supabase.table("stock")
        .select("*")
        .eq("shop_code", shop_code)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


@app.post("/stock", status_code=201)
def create_stock(item: StockCreate):
    """Add a new stock item."""
    data = item.model_dump()
    # Convert date to ISO string for Supabase
    data["arrival_date"] = data["arrival_date"].isoformat()

    response = supabase.table("stock").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create stock item")
    return response.data[0]


@app.put("/stock/{stock_id}")
def update_stock(stock_id: str, item: StockUpdate):
    """Update an existing stock item by ID."""
    # Build update payload from only the fields that were provided
    data = {k: v for k, v in item.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Convert date to ISO string if present
    if "arrival_date" in data:
        data["arrival_date"] = data["arrival_date"].isoformat()

    response = (
        supabase.table("stock")
        .update(data)
        .eq("id", stock_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return response.data[0]


@app.delete("/stock/{stock_id}")
def delete_stock(stock_id: str):
    """Delete a stock item by ID."""
    response = (
        supabase.table("stock")
        .delete()
        .eq("id", stock_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return {"detail": "Stock item deleted", "id": stock_id}


# ── Waste endpoints ──────────────────────────────────────────────────────────

@app.post("/waste", status_code=201)
def create_waste(entry: WasteCreate):
    """Log a new waste entry."""
    data = entry.model_dump()

    response = supabase.table("waste_log").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create waste entry")
    return response.data[0]


@app.get("/waste")
def get_waste(shop_code: str = Query(..., description="Shop code to filter waste logs")):
    """Fetch all waste logs for a given shop."""
    response = (
        supabase.table("waste_log")
        .select("*")
        .eq("shop_code", shop_code)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data