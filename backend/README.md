# BloomTrack Backend

FastAPI backend for the BloomTrack flower stock tracking application.

## Prerequisites

- Python 3.10 or higher
- A [Supabase](https://supabase.com) project with `stock` and `waste` tables

## Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   ```bash
   # Create
   python -m venv venv

   # Activate (Windows)
   venv\Scripts\activate

   # Activate (macOS/Linux)
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**

   Copy the example env file and fill in your Supabase credentials:

   ```bash
   copy .env.example .env      # Windows
   cp .env.example .env        # macOS/Linux
   ```

   Edit `.env` and replace the placeholder values:

   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-or-service-key
   ```

5. **Run the server:**

   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at **http://localhost:8000**

## API Endpoints

| Method   | Path               | Description                    |
| -------- | ------------------ | ------------------------------ |
| `GET`    | `/health`          | Health check                   |
| `GET`    | `/stock?shop_code=`| Get all stock for a shop       |
| `POST`   | `/stock`           | Add a new stock item           |
| `PUT`    | `/stock/{id}`      | Update a stock item            |
| `DELETE` | `/stock/{id}`      | Delete a stock item            |
| `POST`   | `/waste`           | Log a waste entry              |
| `GET`    | `/waste?shop_code=`| Get waste logs for a shop      |

## Interactive Docs

Once the server is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Supabase Table Schemas

Create these tables in your Supabase dashboard (SQL Editor):

### `stock` table

```sql
create table stock (
  id uuid primary key default gen_random_uuid(),
  flower_name text not null,
  quantity integer not null,
  unit text not null,
  arrival_date date not null,
  colour text not null,
  cost_per_unit numeric not null,
  status text not null default 'available',
  shop_code text not null,
  created_at timestamptz not null default now()
);
```

### `waste` table

```sql
create table waste (
  id uuid primary key default gen_random_uuid(),
  stock_id uuid references stock(id),
  flower_name text not null,
  quantity_wasted integer not null,
  reason text not null,
  estimated_loss numeric not null,
  shop_code text not null,
  created_at timestamptz not null default now()
);