import { useState, useEffect, useCallback } from 'react';
import type { Invoice, InvoiceItem } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setInvoices(data as Invoice[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refetch: fetchInvoices };
}

export async function fetchInvoiceWithItems(id: string): Promise<Invoice | null> {
  const { data: inv, error: invErr } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (invErr || !inv) return null;

  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('created_at', { ascending: true });

  return { ...inv, items: (items as InvoiceItem[]) || [] } as Invoice;
}

export async function saveInvoice(
  invoice: Invoice,
  items: InvoiceItem[]
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      supplier_name: invoice.supplier_name,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      gstin: invoice.gstin,
      customer_name: invoice.customer_name,
      supplier_address: invoice.supplier_address,
      taxable_amount: invoice.taxable_amount,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      grand_total: invoice.grand_total,
      raw_text: invoice.raw_text,
      image_url: invoice.image_url,
      status: invoice.status,
    })
    .select()
    .single();

  if (error || !data) return null;

  const invoiceId = data.id;

  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      invoice_id: invoiceId,
      product_name: item.product_name,
      hsn_code: item.hsn_code,
      quantity: item.quantity,
      rate: item.rate,
      gst_percent: item.gst_percent,
      total: item.total,
    }));

    await supabase.from('invoice_items').insert(itemsToInsert);
  }

  return { ...data, items } as Invoice;
}

export async function updateInvoice(
  id: string,
  invoice: Partial<Invoice>,
  items?: InvoiceItem[]
): Promise<boolean> {
  const { error } = await supabase
    .from('invoices')
    .update({
      supplier_name: invoice.supplier_name,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      gstin: invoice.gstin,
      customer_name: invoice.customer_name,
      supplier_address: invoice.supplier_address,
      taxable_amount: invoice.taxable_amount,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      grand_total: invoice.grand_total,
      status: invoice.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return false;

  if (items !== undefined) {
    // Delete existing items and re-insert
    await supabase.from('invoice_items').delete().eq('invoice_id', id);

    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        invoice_id: id,
        product_name: item.product_name,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        rate: item.rate,
        gst_percent: item.gst_percent,
        total: item.total,
      }));

      await supabase.from('invoice_items').insert(itemsToInsert);
    }
  }

  return true;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  return !error;
}
