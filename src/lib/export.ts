import type { Invoice, InvoiceItem } from './types';

function toCSVRow(values: string[]): string {
  return values.map((v) => {
    const needsQuote = /[",\n]/.test(v);
    const escaped = v.replace(/"/g, '""');
    return needsQuote ? `"${escaped}"` : escaped;
  }).join(',');
}

export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const headers = [
    'Supplier Name',
    'Invoice Number',
    'Invoice Date',
    'GSTIN',
    'Customer Name',
    'Taxable Amount',
    'CGST',
    'SGST',
    'IGST',
    'Grand Total',
    'Status',
    'Created At',
  ];

  const rows = invoices.map((inv) =>
    toCSVRow([
      inv.supplier_name,
      inv.invoice_number,
      inv.invoice_date,
      inv.gstin,
      inv.customer_name,
      String(inv.taxable_amount),
      String(inv.cgst),
      String(inv.sgst),
      String(inv.igst),
      String(inv.grand_total),
      inv.status,
      inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '',
    ])
  );

  const csv = [toCSVRow(headers), ...rows].join('\n');
  downloadFile(csv, 'invoices.csv', 'text/csv');
}

export function exportItemsToCSV(invoices: Invoice[]): void {
  const headers = [
    'Supplier Name',
    'Invoice Number',
    'Invoice Date',
    'Product Name',
    'HSN Code',
    'Quantity',
    'Rate',
    'GST %',
    'Total',
  ];

  const rows: string[] = [];
  for (const inv of invoices) {
    for (const item of inv.items || []) {
      rows.push(
        toCSVRow([
          inv.supplier_name,
          inv.invoice_number,
          inv.invoice_date,
          item.product_name,
          item.hsn_code,
          String(item.quantity),
          String(item.rate),
          String(item.gst_percent),
          String(item.total),
        ])
      );
    }
  }

  const csv = [toCSVRow(headers), ...rows].join('\n');
  downloadFile(csv, 'invoice_items.csv', 'text/csv');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportInvoiceToPDF(invoice: Invoice): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const items = invoice.items || [];
  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Invoice ${invoice.invoice_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
  .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
  .supplier h1 { font-size: 24px; color: #0f766e; }
  .supplier p { color: #555; margin-top: 4px; font-size: 13px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 28px; color: #0f766e; margin-bottom: 8px; }
  .invoice-meta p { font-size: 14px; margin: 2px 0; color: #444; }
  .parties { display: flex; gap: 40px; margin-bottom: 30px; }
  .party { flex: 1; }
  .party-label { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .party-name { font-size: 16px; font-weight: 600; }
  .party-detail { font-size: 13px; color: #555; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th { background: #0f766e; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
  td.right, th.right { text-align: right; }
  .totals { margin-left: auto; width: 300px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .totals .grand { border-top: 2px solid #0f766e; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 700; color: #0f766e; }
</style>
</head>
<body>
  <div class="header">
    <div class="supplier">
      <h1>${escapeHtml(invoice.supplier_name)}</h1>
      <p>${escapeHtml(invoice.supplier_address)}</p>
      <p>GSTIN: ${escapeHtml(invoice.gstin)}</p>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>Invoice No:</strong> ${escapeHtml(invoice.invoice_number)}</p>
      <p><strong>Date:</strong> ${escapeHtml(invoice.invoice_date)}</p>
    </div>
  </div>
  <div class="parties">
    <div class="party">
      <div class="party-label">Billed To</div>
      <div class="party-name">${escapeHtml(invoice.customer_name)}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>HSN</th>
        <th class="right">Qty</th>
        <th class="right">Rate</th>
        <th class="right">GST %</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item) => `
        <tr>
          <td>${escapeHtml(item.product_name)}</td>
          <td>${escapeHtml(item.hsn_code)}</td>
          <td class="right">${item.quantity}</td>
          <td class="right">₹${formatNum(item.rate)}</td>
          <td class="right">${item.gst_percent}%</td>
          <td class="right">₹${formatNum(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Taxable Amount</span><span>₹${formatNum(invoice.taxable_amount)}</span></div>
    ${invoice.cgst > 0 ? `<div class="row"><span>CGST</span><span>₹${formatNum(invoice.cgst)}</span></div>` : ''}
    ${invoice.sgst > 0 ? `<div class="row"><span>SGST</span><span>₹${formatNum(invoice.sgst)}</span></div>` : ''}
    ${invoice.igst > 0 ? `<div class="row"><span>IGST</span><span>₹${formatNum(invoice.igst)}</span></div>` : ''}
    <div class="row grand"><span>Grand Total</span><span>₹${formatNum(invoice.grand_total)}</span></div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatNum(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
