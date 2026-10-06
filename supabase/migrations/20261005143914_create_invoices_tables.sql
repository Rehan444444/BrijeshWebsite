/*
# Create invoices and invoice_items tables (single-tenant, no auth)

1. New Tables
- `invoices`: Stores bill-level details extracted from scanned bills.
  - id (uuid, PK)
  - supplier_name (text)
  - invoice_number (text)
  - invoice_date (text)
  - gstin (text)
  - customer_name (text)
  - supplier_address (text)
  - taxable_amount (numeric)
  - cgst (numeric)
  - sgst (numeric)
  - igst (numeric)
  - grand_total (numeric)
  - raw_text (text) - raw OCR text
  - image_url (text) - stored image data URL or path
  - status (text) - 'draft' | 'verified' | 'saved'
  - created_at (timestamptz)
  - updated_at (timestamptz)
- `invoice_items`: Stores product-level line items for each invoice.
  - id (uuid, PK)
  - invoice_id (uuid, FK -> invoices.id ON DELETE CASCADE)
  - product_name (text)
  - hsn_code (text)
  - quantity (numeric)
  - rate (numeric)
  - gst_percent (numeric)
  - total (numeric)
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (single-tenant app, no sign-in).
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name text DEFAULT '',
  invoice_number text DEFAULT '',
  invoice_date text DEFAULT '',
  gstin text DEFAULT '',
  customer_name text DEFAULT '',
  supplier_address text DEFAULT '',
  taxable_amount numeric DEFAULT 0,
  cgst numeric DEFAULT 0,
  sgst numeric DEFAULT 0,
  igst numeric DEFAULT 0,
  grand_total numeric DEFAULT 0,
  raw_text text DEFAULT '',
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
CREATE POLICY "anon_select_invoices" ON invoices FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
CREATE POLICY "anon_insert_invoices" ON invoices FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
CREATE POLICY "anon_update_invoices" ON invoices FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;
CREATE POLICY "anon_delete_invoices" ON invoices FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_name text DEFAULT '',
  hsn_code text DEFAULT '',
  quantity numeric DEFAULT 0,
  rate numeric DEFAULT 0,
  gst_percent numeric DEFAULT 0,
  total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_invoice_items" ON invoice_items;
CREATE POLICY "anon_select_invoice_items" ON invoice_items FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_invoice_items" ON invoice_items;
CREATE POLICY "anon_insert_invoice_items" ON invoice_items FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_invoice_items" ON invoice_items;
CREATE POLICY "anon_update_invoice_items" ON invoice_items FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_invoice_items" ON invoice_items;
CREATE POLICY "anon_delete_invoice_items" ON invoice_items FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_name ON invoices(supplier_name);
