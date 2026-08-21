const db = require('../database/db');
const { evaluateAndRecommendQuotes } = require('../services/aiRecommendationService');

exports.recommendVendorForRFQ = (req, res) => {
  try {
    const { rfq_id, customWeights } = req.body;

    if (!rfq_id) {
      return res.status(400).json({ error: 'RFQ ID is required' });
    }

    const rfq = db.prepare('SELECT r.*, p.name as product_name FROM rfqs r JOIN products p ON r.product_id = p.id WHERE r.id = ?').get(rfq_id);
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const quotes = db.prepare(`
      SELECT q.*, v.name as vendor_name, v.code as vendor_code, v.rating as vendor_rating,
             v.medal_tier as vendor_medal_tier, v.b2b_trust_score as vendor_b2b_trust_score,
             v.quality_score as vendor_quality_score, v.gstin_verified as vendor_gstin_verified,
             r.quantity
      FROM quotations q
      JOIN vendors v ON q.vendor_id = v.id
      JOIN rfqs r ON q.rfq_id = r.id
      WHERE q.rfq_id = ?
    `).all(rfq_id);

    if (quotes.length === 0) {
      return res.status(400).json({ error: 'No quotations found for this RFQ to perform AI recommendation' });
    }

    const evaluation = evaluateAndRecommendQuotes(quotes, customWeights || {});

    // Save AI Scores & Reason into database for persistence
    evaluation.evaluatedQuotes.forEach(eq => {
      const isWinner = eq.id === evaluation.recommendedQuoteId;
      db.prepare(`
        UPDATE quotations 
        SET ai_score = ?, ai_recommendation_reason = ?, status = ?
        WHERE id = ?
      `).run(
        eq.scores.totalScore,
        isWinner ? evaluation.recommendationReason : `Evaluated Score: ${eq.scores.totalScore}/100`,
        isWinner ? 'Selected' : 'Under Evaluation',
        eq.id
      );
    });

    res.json({
      rfq,
      evaluation
    });
  } catch (error) {
    console.error('Error running AI vendor recommendation:', error);
    res.status(500).json({ error: 'Failed to generate AI vendor recommendation' });
  }
};
