const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { extractQuoteData } = require('../services/aiExtractionService');

exports.uploadAndProcessQuote = async (req, res) => {
  try {
    const { rfq_id, vendor_id, manual_unit_price, manual_lead_time } = req.body;
    const file = req.file;

    if (!rfq_id || !vendor_id) {
      return res.status(400).json({ error: 'RFQ ID and Vendor ID are required' });
    }

    const rfq = db.prepare('SELECT r.*, p.unit_price as product_price FROM rfqs r JOIN products p ON r.product_id = p.id WHERE r.id = ?').get(rfq_id);
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(vendor_id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const filePath = file ? file.path : 'uploads/sample_quote.pdf';
    const fileName = file ? file.originalname : 'quotation_document.pdf';

    // Call AI Extraction Service
    const aiExtracted = await extractQuoteData(filePath, fileName, {
      unit_price: rfq.product_price,
      quantity: rfq.quantity
    });

    const finalUnitPrice = manual_unit_price ? parseFloat(manual_unit_price) : aiExtracted.unit_price;
    const finalLeadTime = manual_lead_time ? parseInt(manual_lead_time) : aiExtracted.lead_time_days;
    const finalSubtotal = finalUnitPrice * rfq.quantity;
    const finalTaxAmount = finalSubtotal * (aiExtracted.tax_rate / 100);
    const finalTotalAmount = finalSubtotal + finalTaxAmount;

    const quoteId = 'qte-' + uuidv4().substring(0, 8);
    const quoteNumber = 'QT-' + vendor.code.replace('VND-', '') + '-' + Math.floor(1000 + Math.random() * 9000);

    db.prepare(`
      INSERT INTO quotations (id, quotation_number, rfq_id, vendor_id, file_path, file_name, unit_price, tax_rate, tax_amount, total_amount, lead_time_days, warranty_period_months, payment_terms, supports_emi, quality_cert, ai_extracted, ai_confidence, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `).run(
      quoteId,
      quoteNumber,
      rfq_id,
      vendor_id,
      filePath,
      fileName,
      finalUnitPrice,
      aiExtracted.tax_rate,
      finalTaxAmount,
      finalTotalAmount,
      finalLeadTime,
      aiExtracted.warranty_period_months,
      aiExtracted.payment_terms,
      aiExtracted.supports_emi,
      aiExtracted.quality_cert,
      1,
      aiExtracted.ai_confidence
    );

    // Update RFQ status to 'Quotes Received'
    db.prepare("UPDATE rfqs SET status = 'Quotes Received' WHERE id = ?").run(rfq_id);

    // Update RFQ Vendor status
    db.prepare("UPDATE rfq_vendors SET status = 'Submitted' WHERE rfq_id = ? AND vendor_id = ?").run(rfq_id, vendor_id);

    const savedQuote = db.prepare('SELECT * FROM quotations WHERE id = ?').get(quoteId);

    res.status(201).json({
      message: 'Quotation uploaded and AI parsed successfully',
      quotation: savedQuote,
      aiExtractionSummary: aiExtracted
    });
  } catch (error) {
    console.error('Error processing quote upload:', error);
    res.status(500).json({ error: 'Failed to upload and process quotation' });
  }
};

exports.getQuotesByRFQ = (req, res) => {
  try {
    const { rfq_id } = req.params;
    const quotes = db.prepare(`
      SELECT q.*, v.name as vendor_name, v.code as vendor_code, v.rating as vendor_rating,
             v.medal_tier as vendor_medal_tier, v.b2b_trust_score as vendor_b2b_trust_score,
             v.quality_score as vendor_quality_score, v.gstin_verified as vendor_gstin_verified
      FROM quotations q
      JOIN vendors v ON q.vendor_id = v.id
      WHERE q.rfq_id = ?
      ORDER BY q.created_at DESC
    `).all(rfq_id);

    res.json({ quotes });
  } catch (error) {
    console.error('Error fetching RFQ quotes:', error);
    res.status(500).json({ error: 'Failed to retrieve quotations' });
  }
};
