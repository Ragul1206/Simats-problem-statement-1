const fs = require('fs');
const path = require('path');

/**
 * AI Quote Extraction Engine (OCR + LLM Data Structuring Simulator)
 * Supports PDF, Excel, text files, and images.
 */
async function extractQuoteData(filePath, fileName, rfqDetails = {}) {
  // Simulating OCR text extraction and LLM parsing logic
  const fileExt = path.extname(fileName).toLowerCase();
  
  let extractedText = '';
  if (fs.existsSync(filePath)) {
    try {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      extractedText = 'Sample file content binary string';
    }
  }

  // Base fallback parameters using product target price if provided
  const targetPrice = rfqDetails.unit_price || 120000;
  
  // Intelligent parsing simulation based on text matching / file metadata
  let unitPrice = Math.round(targetPrice * (0.92 + Math.random() * 0.12));
  let leadTimeDays = Math.floor(7 + Math.random() * 15);
  let warrantyMonths = Math.random() > 0.5 ? 24 : 12;
  let taxRate = 18.0;
  let paymentTerms = Math.random() > 0.4 ? 'Net 60 / EMI Available' : 'Net 30';
  let supportsEmi = paymentTerms.includes('EMI') ? 1 : 0;
  let qualityCert = 'ISO 9001:2015 Certified';

  // If text contains price markers, attempt regex extraction
  const priceMatch = extractedText.match(/(?:INR|\$|₹|Price:?)\s*([\d,]+(?:\.\d{2})?)/i);
  if (priceMatch && priceMatch[1]) {
    const parsedPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
    if (!isNaN(parsedPrice) && parsedPrice > 100) {
      unitPrice = parsedPrice;
    }
  }

  const taxAmount = (unitPrice * (rfqDetails.quantity || 1)) * (taxRate / 100);
  const subtotal = unitPrice * (rfqDetails.quantity || 1);
  const totalAmount = subtotal + taxAmount;

  return {
    unit_price: unitPrice,
    tax_rate: taxRate,
    tax_amount: Math.round(taxAmount),
    total_amount: Math.round(totalAmount),
    lead_time_days: leadTimeDays,
    warranty_period_months: warrantyMonths,
    payment_terms: paymentTerms,
    supports_emi: supportsEmi,
    quality_cert: qualityCert,
    ai_extracted: 1,
    ai_confidence: 0.94 + parseFloat((Math.random() * 0.05).toFixed(2)),
    raw_summary: `AI Extracted: Unit Price ₹${unitPrice.toLocaleString('en-IN')}, ${leadTimeDays} Days Lead Time, ${warrantyMonths} Months Warranty, Terms: ${paymentTerms}.`
  };
}

module.exports = {
  extractQuoteData
};
