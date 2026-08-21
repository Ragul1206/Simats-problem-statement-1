/**
 * AI Multi-Criteria Vendor Recommendation Engine
 * Calculates weighted score across Price, Quality, Delivery, B2B Medal Tier, Rating, and Payment Terms.
 */
function evaluateAndRecommendQuotes(quotes, customWeights = {}) {
  if (!quotes || quotes.length === 0) {
    return { evaluatedQuotes: [], recommendedQuoteId: null, savingsSummary: null };
  }

  // Weight Configuration (Default sum = 100%)
  const weights = {
    price: customWeights.price !== undefined ? customWeights.price : 35,
    quality: customWeights.quality !== undefined ? customWeights.quality : 20,
    delivery: customWeights.delivery !== undefined ? customWeights.delivery : 15,
    medalTrust: customWeights.medalTrust !== undefined ? customWeights.medalTrust : 15,
    rating: customWeights.rating !== undefined ? customWeights.rating : 8,
    payment: customWeights.payment !== undefined ? customWeights.payment : 7,
  };

  // Find min/max ranges for normalization
  const prices = quotes.map(q => q.unit_price);
  const leadTimes = quotes.map(q => q.lead_time_days);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minLeadTime = Math.min(...leadTimes);
  const maxLeadTime = Math.max(...leadTimes);

  // B2B Medal Tier Scores
  const medalScores = {
    'Diamond': 100,
    'Platinum': 85,
    'Gold': 70,
    'Silver': 50,
    'Bronze': 30
  };

  const evaluatedQuotes = quotes.map(quote => {
    // 1. Price Score (Lowest price = 100%)
    let priceScore = 100;
    if (maxPrice > minPrice) {
      priceScore = Math.max(30, 100 - ((quote.unit_price - minPrice) / (maxPrice - minPrice)) * 70);
    }

    // 2. Quality & Warranty Score
    const baseQuality = quote.vendor_quality_score || 80.0;
    const warrantyBonus = Math.min(20, ((quote.warranty_period_months || 12) / 24) * 20);
    const qualityScore = Math.min(100, baseQuality * 0.8 + warrantyBonus);

    // 3. Delivery Speed Score (Fastest lead time = 100%)
    let deliveryScore = 100;
    if (maxLeadTime > minLeadTime) {
      deliveryScore = Math.max(30, 100 - ((quote.lead_time_days - minLeadTime) / (maxLeadTime - minLeadTime)) * 70);
    }

    // 4. B2B Medal & GSTIN Trust Score
    const medalTier = quote.vendor_medal_tier || 'Bronze';
    let trustScore = medalScores[medalTier] || 40;
    if (quote.vendor_gstin_verified) trustScore = Math.min(100, trustScore + 5);

    // 5. Vendor Rating Score (1-5 converted to 0-100)
    const ratingScore = ((quote.vendor_rating || 4.0) / 5.0) * 100;

    // 6. Payment & EMI Flexibility Score
    let paymentScore = 60;
    if ((quote.payment_terms || '').includes('Net 60')) paymentScore = 90;
    else if ((quote.payment_terms || '').includes('Net 45')) paymentScore = 80;
    else if ((quote.payment_terms || '').includes('Net 30')) paymentScore = 70;
    if (quote.supports_emi) paymentScore = Math.min(100, paymentScore + 10);

    // Calculate Final Weighted Score
    const totalScore = (
      (priceScore * weights.price) +
      (qualityScore * weights.quality) +
      (deliveryScore * weights.delivery) +
      (trustScore * weights.medalTrust) +
      (ratingScore * weights.rating) +
      (paymentScore * weights.payment)
    ) / 100;

    const roundedScore = parseFloat(totalScore.toFixed(1));

    return {
      ...quote,
      scores: {
        priceScore: Math.round(priceScore),
        qualityScore: Math.round(qualityScore),
        deliveryScore: Math.round(deliveryScore),
        trustScore: Math.round(trustScore),
        ratingScore: Math.round(ratingScore),
        paymentScore: Math.round(paymentScore),
        totalScore: roundedScore
      }
    };
  });

  // Sort quotes descending by total score
  evaluatedQuotes.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  const topQuote = evaluatedQuotes[0];

  // Calculate Savings
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const maxQuotedPrice = maxPrice;
  const totalQuantity = topQuote.quantity || 1;

  const totalSavingsVsMax = (maxQuotedPrice - topQuote.unit_price) * totalQuantity;
  const totalSavingsVsAvg = (avgPrice - topQuote.unit_price) * totalQuantity;
  const savingsPercent = Math.round(((maxQuotedPrice - topQuote.unit_price) / maxQuotedPrice) * 100);

  // Generate Natural Language Rationale Explanation
  const reasonText = `🏆 AI RECOMMENDED WINNER: ${topQuote.vendor_name} (${topQuote.vendor_medal_tier || 'Verified'} B2B Supplier) scored highest (${topQuote.scores.totalScore}/100).\n` +
    `• Unit Cost: ₹${topQuote.unit_price.toLocaleString('en-IN')} (Saves ₹${totalSavingsVsMax.toLocaleString('en-IN')} / ${savingsPercent}% vs highest bid).\n` +
    `• Reliability: ${topQuote.vendor_medal_tier} Medal Tier with ${topQuote.vendor_rating || 4.5}⭐ rating & GSTIN verified.\n` +
    `• Delivery & Terms: Delivered in ${topQuote.lead_time_days} days with ${topQuote.warranty_period_months}M warranty & ${topQuote.payment_terms}.`;

  return {
    evaluatedQuotes,
    recommendedQuoteId: topQuote.id,
    weights,
    savingsSummary: {
      bestUnitPrice: topQuote.unit_price,
      highestUnitPrice: maxQuotedPrice,
      avgUnitPrice: Math.round(avgPrice),
      totalSavingsVsMax: Math.round(totalSavingsVsMax),
      totalSavingsVsAvg: Math.round(totalSavingsVsAvg),
      savingsPercent
    },
    recommendationReason: reasonText
  };
}

module.exports = {
  evaluateAndRecommendQuotes
};
