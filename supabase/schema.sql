-- Run once in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chunks (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1024),
  doc_type TEXT NOT NULL DEFAULT 'policy'
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  last_name TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'on_time',
  delay_hours NUMERIC,
  context_notes TEXT
);
