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
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5175",
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


class ShopCreate(BaseModel):
    """Payload for registering a new shop."""
    shop_name: str
    owner_name: str
    email: str


# ── Helpers ──────────────────────────────────────────────────────────────────

import random
import string

def generate_access_code() -> str:
    """Generate a unique 8-character access code (4 letters + 4 digits)."""
    letters = "".join(random.choices(string.ascii_uppercase, k=4))
    digits = "".join(random.choices(string.digits, k=4))
    return letters + digits


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


# ── Shop endpoints ───────────────────────────────────────────────────────────

@app.post("/shops", status_code=201)
def create_shop(shop: ShopCreate):
    """Register a new shop and return a generated access code."""
    # Check for duplicate email
    existing = (
        supabase.table("shops")
        .select("id")
        .eq("email", shop.email.lower().strip())
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=409,
            detail="A shop with this email already exists."
        )

    # Generate a unique access code (retry up to 5 times on collision)
    access_code = None
    for _ in range(5):
        code = generate_access_code()
        code_check = (
            supabase.table("shops")
            .select("id")
            .eq("access_code", code)
            .execute()
        )
        if not code_check.data:
            access_code = code
            break
    if not access_code:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate a unique access code. Please try again."
        )

    data = {
        "shop_name": shop.shop_name.strip(),
        "owner_name": shop.owner_name.strip(),
        "email": shop.email.lower().strip(),
        "access_code": access_code,
    }

    response = supabase.table("shops").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to register shop")

    return {"access_code": access_code, "shop_name": shop.shop_name.strip()}


@app.get("/shops/verify")
def verify_shop(email: str = Query(..., description="Email to look up access code")):
    """Retrieve the access code for a given email (forgot access code flow)."""
    response = (
        supabase.table("shops")
        .select("access_code, shop_name")
        .eq("email", email.lower().strip())
        .execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="No shop found with that email address."
        )
    return response.data[0]


@app.get("/shops/verify-by-code")
def verify_access_code(access_code: str = Query(..., description="Access code to verify")):
    """Verify if an access code exists in the shops table (for login validation)."""
    response = (
        supabase.table("shops")
        .select("access_code, shop_name")
        .eq("access_code", access_code.upper().strip())
        .execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Invalid access code."
        )
    return {"valid": True, "shop_name": response.data[0]["shop_name"]}
