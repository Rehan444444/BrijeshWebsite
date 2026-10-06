export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_name: string;
  hsn_code: string;
  quantity: number;
  rate: number;
  gst_percent: number;
  total: number;
  confidence?: 'high' | 'medium' | 'low';
}

export interface Invoice {
  id?: string;
  supplier_name: string;
  invoice_number: string;
  invoice_date: string;
  gstin: string;
  customer_name: string;
  supplier_address: string;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grand_total: number;
  raw_text: string;
  image_url: string;
  status: 'draft' | 'verified' | 'saved';
  created_at?: string;
  updated_at?: string;
  items?: InvoiceItem[];
}

export type FieldConfidence = {
  value: string;
  confidence: 'high' | 'medium' | 'low';
};

export type ParsedInvoice = {
  supplier_name: FieldConfidence;
  invoice_number: FieldConfidence;
  invoice_date: FieldConfidence;
  gstin: FieldConfidence;
  customer_name: FieldConfidence;
  supplier_address: FieldConfidence;
  taxable_amount: FieldConfidence;
  cgst: FieldConfidence;
  sgst: FieldConfidence;
  igst: FieldConfidence;
  grand_total: FieldConfidence;
  items: InvoiceItem[];
};
