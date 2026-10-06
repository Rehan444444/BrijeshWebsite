import type { ParsedInvoice, InvoiceItem, FieldConfidence } from './types';

const high = (value: string): FieldConfidence => ({ value, confidence: 'high' });
const med = (value: string): FieldConfidence => ({ value, confidence: 'medium' });
const low = (value: string): FieldConfidence => ({ value, confidence: 'low' });

function cleanNumber(s: string): string {
  return s.replace(/[,₹\s]/g, '').replace(/[^\d.]/g, '');
}

function parseNumber(s: string): number {
  const cleaned = cleanNumber(s);
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function findMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function extractGSTIN(text: string): FieldConfidence {
  // GSTIN format: 2 digit state code + 10 char PAN + 1 entity + 1 Z + 1 check digit = 15 chars
  const patterns: RegExp[] = [
    /gstin\s*[:\-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i,
    /([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/,
  ];
  const result = findMatch(text, patterns);
  if (result) {
    // High confidence if it was found with the GSTIN label
    const hasLabel = /gstin/i.test(text.substring(text.indexOf(result) - 10, text.indexOf(result)));
    return hasLabel ? high(result) : med(result);
  }
  return low('');
}

function extractInvoiceNumber(text: string): FieldConfidence {
  const patterns: RegExp[] = [
    /invoice\s*(?:no|number|#)\s*[:\-]?\s*([A-Z0-9\/\-]{3,20})/i,
    /bill\s*(?:no|number|#)\s*[:\-]?\s*([A-Z0-9\/\-]{3,20})/i,
    /inv\s*[:\-]?\s*([A-Z0-9\/\-]{3,20})/i,
    /(?:no|number)\s*[:\-]?\s*([A-Z]{2,5}[\-]?\d{2,10})/i,
  ];
  const result = findMatch(text, patterns);
  if (result) return high(result);
  return low('');
}

function extractDate(text: string): FieldConfidence {
  const patterns: RegExp[] = [
    /invoice\s*date\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /date\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /dated\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
  ];
  const result = findMatch(text, patterns);
  if (result) {
    // Check if found with a date label
    const idx = text.indexOf(result);
    const context = text.substring(Math.max(0, idx - 15), idx).toLowerCase();
    if (context.includes('date') || context.includes('dated')) {
      return high(result);
    }
    return med(result);
  }
  return low('');
}

function extractTotal(text: string): FieldConfidence {
  const patterns: RegExp[] = [
    /grand\s*total\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
    /total\s*amount\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
    /total\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
    /amount\s*payable\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
    /net\s*payable\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
  ];
  const result = findMatch(text, patterns);
  if (result) {
    const idx = text.indexOf(result);
    const context = text.substring(Math.max(0, idx - 20), idx + result.length + 10).toLowerCase();
    if (context.includes('grand') || context.includes('payable')) {
      return high(result);
    }
    return med(result);
  }
  return low('');
}

function extractTaxableAmount(text: string): FieldConfidence {
  const patterns: RegExp[] = [
    /taxable\s*(?:amount|value)\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
    /sub\s*total\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
    /subtotal\s*[:\-]?\s*[₹]?\s*([\d,]+\.?\d*)/i,
  ];
  const result = findMatch(text, patterns);
  return result ? high(result) : low('');
}

function extractTax(text: string, type: 'cgst' | 'sgst' | 'igst'): FieldConfidence {
  const patterns: RegExp[] = [
    new RegExp(`${type}\\s*[:\-]?\\s*[₹]?\\s*([\\d,]+\\.?\\d*)`, 'i'),
    new RegExp(`${type}\\s*amount\\s*[:\\-]?\\s*[₹]?\\s*([\\d,]+\\.?\\d*)`, 'i'),
  ];
  const result = findMatch(text, patterns);
  return result ? high(result) : low('');
}

function extractSupplierName(text: string): FieldConfidence {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // Try to find a tax invoice header first
  const taxInvoiceIdx = lines.findIndex((l) => /tax\s*invoice/i.test(l));

  // The supplier name is usually one of the first few meaningful lines,
  // often right after "TAX INVOICE" header
  if (taxInvoiceIdx >= 0 && taxInvoiceIdx + 1 < lines.length) {
    const candidate = lines[taxInvoiceIdx + 1];
    if (candidate.length > 2 && !/gstin|invoice|date|bill/i.test(candidate)) {
      return med(candidate);
    }
  }

  // Otherwise, look at first few non-trivial lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      line.length > 3 &&
      line.length < 60 &&
      !/gstin|invoice|date|bill no|tax|total|amount|qty|hsn|product|description|rate|signature|for |authorised/i.test(line) &&
      !/^\d/.test(line)
    ) {
      return low(line);
    }
  }

  return low('');
}

function extractCustomerName(text: string): FieldConfidence {
  const patterns: RegExp[] = [
    /bill\s*to\s*[:\-]?\s*(.+)/i,
    /ship\s*to\s*[:\-]?\s*(.+)/i,
    /customer\s*(?:name)?\s*[:\-]?\s*(.+)/i,
    /buyer\s*[:\-]?\s*(.+)/i,
    /billed\s*to\s*[:\-]?\s*(.+)/i,
    /party\s*name\s*[:\-]?\s*(.+)/i,
  ];
  const result = findMatch(text, patterns);
  if (result) {
    // Clean up: take first line only
    const cleaned = result.split('\n')[0].trim();
    if (cleaned.length > 1) return med(cleaned);
  }
  return low('');
}

function extractSupplierAddress(text: string): FieldConfidence {
  // Look for address-like patterns near supplier name
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // Find lines that look like addresses (contain numbers + common address words)
  const addressLines: string[] = [];
  for (const line of lines) {
    if (
      /\d/.test(line) &&
      /street|road|nagar|colony|market|area|sector|industrial|complex|building|plot|survey|dist|district|tal|tehsil/i.test(line)
    ) {
      addressLines.push(line);
    }
  }

  if (addressLines.length > 0) {
    return med(addressLines.slice(0, 3).join(', '));
  }

  // Try to find a line with pincode
  const pinLine = lines.find((l) => /\b\d{6}\b/.test(l));
  if (pinLine) return med(pinLine);

  return low('');
}

function extractLineItems(text: string): InvoiceItem[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const items: InvoiceItem[] = [];

  // Try to detect the table header and parse rows after it
  let tableStartIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/hsn|sac/i.test(lines[i]) && /qty|rate|amount|total/i.test(lines[i])) {
      tableStartIdx = i + 1;
      break;
    }
    // Also check for lines with HSN and quantity indicators
    if (/hsn/i.test(lines[i]) && i + 1 < lines.length) {
      tableStartIdx = i + 1;
      break;
    }
  }

  // If no table header found, try to detect line items by pattern
  const startIdx = tableStartIdx >= 0 ? tableStartIdx : 0;
  const endIdx = lines.findIndex(
    (l, i) => i > startIdx && /total|sub.?total|taxable|cgst|sgst|igst|grand|amount payable/i.test(l)
  );
  const effectiveEnd = endIdx > 0 ? endIdx : lines.length;

  for (let i = startIdx; i < effectiveEnd; i++) {
    const line = lines[i];

    // Skip header-like lines, empty lines, totals
    if (/total|taxable|cgst|sgst|igst|grand|sub.?total|amount payable|tax|signature|for |authorised|rupees|in words/i.test(line)) {
      continue;
    }
    if (line.length < 3) continue;

    // Try to parse: Product Name | HSN | Qty | Rate | GST% | Amount
    // Be flexible: the order and presence of fields varies

    const hsnMatch = line.match(/\b(\d{4,8})\b/);
    const numbers = line.match(/(\d[\d,]*\.?\d*)/g) || [];

    // Need at least a product name and some numbers to be a line item
    if (numbers.length < 2) continue;

    // Extract product name: text before the first number or HSN
    let productName = line;
    if (hsnMatch && hsnMatch.index !== undefined) {
      productName = line.substring(0, hsnMatch.index).trim();
    } else if (numbers[0]) {
      const firstNumIdx = line.indexOf(numbers[0]);
      if (firstNumIdx > 0) {
        productName = line.substring(0, firstNumIdx).trim();
      }
    }

    // Clean product name
    productName = productName.replace(/[^\w\s\-&.,()]/g, '').trim();
    if (productName.length < 2) continue;
    if (/^\d+$/.test(productName)) continue;

    // Parse the numbers
    const parsedNumbers = numbers.map(parseNumber);

    // HSN code
    const hsnCode = hsnMatch ? hsnMatch[1] : '';

    // Determine quantity, rate, total from numbers
    // Typical: Qty Rate Amount  OR  Qty Rate GST% Amount
    let quantity = 1;
    let rate = 0;
    let total = 0;
    let gstPercent = 0;

    // Check for GST percentage (usually a number like 5, 12, 18, 28, 0.25 followed by %)
    const gstMatch = line.match(/(\d+\.?\d*)\s*%/);
    if (gstMatch) {
      gstPercent = parseFloat(gstMatch[1]);
    }

    // Filter out the GST percentage from the number list if present
    let amountNumbers = parsedNumbers;
    if (gstMatch) {
      const gstVal = parseFloat(gstMatch[1]);
      amountNumbers = parsedNumbers.filter((n) => Math.abs(n - gstVal) > 0.01 || n === 0);
    }

    // Also filter out HSN code from amounts
    if (hsnMatch) {
      const hsnVal = parseFloat(hsnMatch[1]);
      amountNumbers = amountNumbers.filter((n) => Math.abs(n - hsnVal) > 0.01 || n === 0);
    }

    if (amountNumbers.length >= 3) {
      quantity = amountNumbers[0] || 1;
      rate = amountNumbers[1] || 0;
      total = amountNumbers[amountNumbers.length - 1] || 0;
    } else if (amountNumbers.length === 2) {
      quantity = amountNumbers[0] || 1;
      total = amountNumbers[1] || 0;
      rate = quantity > 0 ? total / quantity : 0;
    } else if (amountNumbers.length === 1) {
      total = amountNumbers[0] || 0;
    }

    // Validate: total should roughly equal qty * rate (+ gst)
    const expectedTotal = quantity * rate * (1 + gstPercent / 100);
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (total > 0 && expectedTotal > 0) {
      const ratio = total / expectedTotal;
      if (ratio > 0.9 && ratio < 1.1) {
        confidence = 'high';
      }
    }

    items.push({
      product_name: productName,
      hsn_code: hsnCode,
      quantity,
      rate,
      gst_percent: gstPercent,
      total,
      confidence,
    });
  }

  // If we found no items with the table approach, try a looser approach
  if (items.length === 0) {
    for (const line of lines) {
      if (/total|taxable|cgst|sgst|igst|grand|sub.?total|amount payable|tax|signature|for |authorised|rupees|in words|gstin|invoice|date|bill no/i.test(line)) {
        continue;
      }
      if (line.length < 5) continue;

      const numbers = line.match(/(\d[\d,]*\.?\d*)/g) || [];
      if (numbers.length < 2) continue;

      const hsnMatch = line.match(/\b(\d{4,8})\b/);
      let productName = line;
      if (numbers[0]) {
        const firstNumIdx = line.indexOf(numbers[0]);
        if (firstNumIdx > 2) {
          productName = line.substring(0, firstNumIdx).trim().replace(/[^\w\s\-&.,()]/g, '');
        }
      }

      if (productName.length < 2 || /^\d/.test(productName)) continue;

      const parsedNumbers = numbers.map(parseNumber);
      items.push({
        product_name: productName,
        hsn_code: hsnMatch ? hsnMatch[1] : '',
        quantity: parsedNumbers[0] || 1,
        rate: parsedNumbers[1] || 0,
        gst_percent: 0,
        total: parsedNumbers[parsedNumbers.length - 1] || 0,
        confidence: 'low',
      });
    }
  }

  return items.slice(0, 50); // cap at 50 items
}

export function parseInvoice(rawText: string): ParsedInvoice {
  const text = rawText;

  return {
    supplier_name: extractSupplierName(text),
    invoice_number: extractInvoiceNumber(text),
    invoice_date: extractDate(text),
    gstin: extractGSTIN(text),
    customer_name: extractCustomerName(text),
    supplier_address: extractSupplierAddress(text),
    taxable_amount: extractTaxableAmount(text),
    cgst: extractTax(text, 'cgst'),
    sgst: extractTax(text, 'sgst'),
    igst: extractTax(text, 'igst'),
    grand_total: extractTotal(text),
    items: extractLineItems(text),
  };
}
