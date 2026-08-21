const fs = require('fs');
const path = require('path');
const os = require('os');

const dataDir = process.env.VERCEL ? path.join(os.tmpdir(), 'data') : path.join(__dirname, '../../data');
const dbFile = path.join(dataDir, 'procurement_store.json');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  console.warn('Data directory creation warning:', e.message);
}

let store = {
  users: [],
  vendors: [],
  products: [],
  rfqs: [],
  rfq_vendors: [],
  quotations: [],
  purchase_orders: [],
  inventory_transactions: [],
  invoices: [],
  emi_schedules: [],
  warranty_claims: [],
  discount_offers: [],
  audit_logs: []
};

function loadStore() {
  if (fs.existsSync(dbFile)) {
    try {
      const content = fs.readFileSync(dbFile, 'utf8');
      store = { ...store, ...JSON.parse(content) };
    } catch (e) {
      console.error('Failed to parse database file, resetting store:', e.message);
    }
  }
}

function saveStore() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist database file:', e.message);
  }
}

loadStore();

// Auto-seed in-memory store if empty on serverless cold start
if (!store.users || store.users.length === 0) {
  try {
    const seedFn = require('./seed');
    if (typeof seedFn === 'function') {
      seedFn();
    }
  } catch (err) {
    console.warn('Auto-seed fallback warning:', err.message);
  }
}

// Pure JS SQL-compatible Database Interface
const db = {
  exec(sql) {
    if (sql.includes('DELETE FROM')) {
      const match = sql.match(/DELETE FROM (\w+)/gi);
      if (match) {
        match.forEach(m => {
          const tbl = m.replace(/DELETE FROM /i, '').trim();
          if (store[tbl]) store[tbl] = [];
        });
      }
    }
    saveStore();
  },

  prepare(sql) {
    const trimmed = sql.trim();

    return {
      all(...params) {
        loadStore();
        return querySelector(trimmed, params, 'all');
      },
      get(...params) {
        loadStore();
        return querySelector(trimmed, params, 'get');
      },
      run(...params) {
        loadStore();
        const result = queryMutator(trimmed, params);
        saveStore();
        return result;
      }
    };
  }
};

function queryMutator(sql, params) {
  const isInsert = /INSERT INTO (\w+)/i.test(sql);
  const isUpdate = /UPDATE (\w+)/i.test(sql);
  const isDelete = /DELETE FROM (\w+)/i.test(sql);

  if (isInsert) {
    const tableMatch = sql.match(/INSERT INTO (\w+)/i);
    const tableName = tableMatch ? tableMatch[1] : null;
    if (tableName && store[tableName]) {
      const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
      if (columnsMatch) {
        const cols = columnsMatch[1].split(',').map(c => c.trim());
        const record = {};
        cols.forEach((col, idx) => {
          record[col] = params[idx] !== undefined ? params[idx] : null;
        });
        if (!record.created_at) record.created_at = new Date().toISOString();
        store[tableName].push(record);
        return { changes: 1 };
      }
    }
  } else if (isUpdate) {
    const tableMatch = sql.match(/UPDATE (\w+)/i);
    const tableName = tableMatch ? tableMatch[1] : null;
    const whereIdMatch = sql.match(/WHERE id = \?/i);
    const whereRfqVendorMatch = sql.match(/WHERE rfq_id = \? AND vendor_id = \?/i);

    if (tableName && store[tableName]) {
      if (whereRfqVendorMatch) {
        const rfqId = params[params.length - 2];
        const vendorId = params[params.length - 1];
        const records = store[tableName].filter(r => r.rfq_id === rfqId && r.vendor_id === vendorId);
        records.forEach(r => {
          if (sql.includes('status = ?')) r.status = params[0];
        });
        return { changes: records.length };
      } else if (whereIdMatch) {
        const targetId = params[params.length - 1];
        const record = store[tableName].find(r => r.id === targetId);
        if (record) {
          if (sql.includes('b2b_trust_score')) {
            record.name = params[0] !== undefined ? params[0] : record.name;
            record.contact_person = params[1] !== undefined ? params[1] : record.contact_person;
            record.email = params[2] !== undefined ? params[2] : record.email;
            record.phone = params[3] !== undefined ? params[3] : record.phone;
            record.address = params[4] !== undefined ? params[4] : record.address;
            record.gstin = params[5] !== undefined ? params[5] : record.gstin;
            record.owner_name = params[6] !== undefined ? params[6] : record.owner_name;
            record.owner_email = params[7] !== undefined ? params[7] : record.owner_email;
            record.owner_phone = params[8] !== undefined ? params[8] : record.owner_phone;
            record.owner_pan = params[9] !== undefined ? params[9] : record.owner_pan;
            record.medal_tier = params[10] !== undefined ? params[10] : record.medal_tier;
            record.b2b_trust_score = params[11] !== undefined ? params[11] : record.b2b_trust_score;
            record.rating = params[12] !== undefined ? params[12] : record.rating;
            record.quality_score = params[13] !== undefined ? params[13] : record.quality_score;
            record.delivery_score = params[14] !== undefined ? params[14] : record.delivery_score;
            record.payment_terms = params[15] !== undefined ? params[15] : record.payment_terms;
            record.supports_emi = params[16] !== undefined ? params[16] : record.supports_emi;
            record.status = params[17] !== undefined ? params[17] : record.status;
          } else if (sql.includes('stock_quantity = stock_quantity +')) {
            const qty = params[0];
            record.stock_quantity = (record.stock_quantity || 0) + qty;
            record.incoming_stock = Math.max(0, (record.incoming_stock || 0) - qty);
          } else if (sql.includes('incoming_stock = incoming_stock +')) {
            record.incoming_stock = (record.incoming_stock || 0) + params[0];
          } else if (sql.includes('ai_score = ?')) {
            record.ai_score = params[0];
            record.ai_recommendation_reason = params[1];
            record.status = params[2];
          } else if (sql.includes('status = ?') && params.length === 2) {
            record.status = params[0];
          } else if (sql.includes('paid_installments = ?')) {
            record.paid_installments = params[0];
            record.status = params[1];
          } else if (sql.includes('resolution_notes = ?')) {
            record.status = params[0];
            record.resolution_notes = params[1];
            record.resolution_date = new Date().toISOString().split('T')[0];
          }
          return { changes: 1 };
        }
      }
    }
  }

  return { changes: 0 };
}

function querySelector(sql, params, mode) {
  let results = [];

  if (sql.includes('FROM users')) {
    results = [...store.users];
    if (params.length > 0) {
      if (sql.includes('WHERE email = ?') || sql.includes('WHERE LOWER(email) = ?')) {
        results = results.filter(u => u.email && u.email.trim().toLowerCase() === String(params[0]).trim().toLowerCase());
      } else if (sql.includes('WHERE id = ?')) {
        results = results.filter(u => u.id === params[0]);
      }
    }
  } else if (sql.includes('FROM vendors')) {
    results = store.vendors.map(v => ({ ...v }));
    if (params.length > 0) {
      if (sql.includes('WHERE id = ?')) results = results.filter(v => v.id === params[0]);
    }
  } else if (sql.includes('FROM products')) {
    results = store.products.map(p => ({ ...p }));
    if (params.length > 0 && sql.includes('WHERE id = ?')) {
      results = results.filter(p => p.id === params[0]);
    }
  } else if (sql.includes('FROM rfqs')) {
    results = store.rfqs.map(r => {
      const p = store.products.find(prod => prod.id === r.product_id) || {};
      const u = store.users.find(usr => usr.id === r.created_by) || {};
      const qCount = store.quotations.filter(q => q.rfq_id === r.id).length;
      const vCount = store.rfq_vendors.filter(rv => rv.rfq_id === r.id).length;
      return {
        ...r,
        product_name: p.name || 'Unknown Product',
        product_sku: p.sku || 'N/A',
        product_base_price: p.unit_price || 0,
        product_category: p.category || 'General',
        quotation_count: qCount,
        assigned_vendor_count: vCount,
        creator_name: u.name || 'Admin',
        creator_email: u.email || 'admin@company.com'
      };
    });

    if (params.length > 0) {
      if (sql.includes('WHERE r.id = ?') || sql.includes('WHERE id = ?')) {
        results = results.filter(r => r.id === params[0]);
      } else if (sql.includes('WHERE r.customer_id = ?')) {
        results = results.filter(r => r.customer_id === params[0]);
      }
    }
  } else if (sql.includes('FROM quotations')) {
    results = store.quotations.map(q => {
      const v = store.vendors.find(vend => vend.id === q.vendor_id) || {};
      const r = store.rfqs.find(rf => rf.id === q.rfq_id) || {};
      return {
        ...q,
        vendor_name: v.name || 'Vendor',
        vendor_code: v.code || 'VND-00',
        vendor_rating: v.rating || 4.0,
        vendor_medal_tier: v.medal_tier || 'Bronze',
        vendor_b2b_trust_score: v.b2b_trust_score || 70,
        vendor_quality_score: v.quality_score || 80.0,
        vendor_gstin_verified: v.gstin_verified || 1,
        rfq_title: r.title || 'RFQ',
        quantity: r.quantity || 1
      };
    });

    if (params.length > 0) {
      if (sql.includes('WHERE q.rfq_id = ?') || sql.includes('WHERE rfq_id = ?')) {
        results = results.filter(q => q.rfq_id === params[0]);
      } else if (sql.includes('WHERE q.vendor_id = ?')) {
        results = results.filter(q => q.vendor_id === params[0]);
      } else if (sql.includes('WHERE q.id = ?') || sql.includes('WHERE id = ?')) {
        results = results.filter(q => q.id === params[0]);
      }
    }
  } else if (sql.includes('FROM purchase_orders')) {
    results = store.purchase_orders.map(po => {
      const p = store.products.find(prod => prod.id === po.product_id) || {};
      const v = store.vendors.find(vend => vend.id === po.vendor_id) || {};
      const r = store.rfqs.find(rf => rf.id === po.rfq_id) || {};
      const q = store.quotations.find(qte => qte.id === po.quotation_id) || {};
      return {
        ...po,
        product_name: p.name || 'Product',
        product_sku: p.sku || 'N/A',
        product_category: p.category || 'Hardware',
        vendor_name: v.name || 'Vendor',
        vendor_code: v.code || 'VND',
        vendor_gstin: v.gstin || 'N/A',
        vendor_owner: v.owner_name || 'Owner',
        vendor_phone: v.phone || '',
        vendor_email: v.email || '',
        vendor_address: v.address || '',
        vendor_medal_tier: v.medal_tier || 'Bronze',
        rfq_number: r.rfq_number || 'RFQ',
        warranty_period_months: q.warranty_period_months || 12
      };
    });

    if (params.length > 0) {
      if (sql.includes('WHERE po.id = ?') || sql.includes('WHERE id = ?')) {
        results = results.filter(po => po.id === params[0]);
      } else if (sql.includes('WHERE po.customer_id = ?')) {
        results = results.filter(po => po.customer_id === params[0]);
      } else if (sql.includes('WHERE po.vendor_id = ?')) {
        results = results.filter(po => po.vendor_id === params[0]);
      }
    }
  } else if (sql.includes('FROM invoices')) {
    results = store.invoices.map(inv => {
      const v = store.vendors.find(vend => vend.id === inv.vendor_id) || {};
      const po = store.purchase_orders.find(p => p.id === inv.po_id) || {};
      return {
        ...inv,
        vendor_name: v.name || 'Vendor',
        vendor_code: v.code || 'VND',
        po_number: po.po_number || 'PO-2026-000'
      };
    });

    if (params.length > 0) {
      if (sql.includes('WHERE inv.customer_id = ?')) {
        results = results.filter(inv => inv.customer_id === params[0]);
      } else if (sql.includes('WHERE inv.vendor_id = ?')) {
        results = results.filter(inv => inv.vendor_id === params[0]);
      } else if (sql.includes('WHERE inv.id = ?') || sql.includes('WHERE id = ?')) {
        results = results.filter(inv => inv.id === params[0]);
      } else if (sql.includes('WHERE po_id = ?')) {
        results = results.filter(inv => inv.po_id === params[0]);
      }
    }
  } else if (sql.includes('FROM emi_schedules')) {
    results = store.emi_schedules.map(emi => {
      const v = store.vendors.find(vend => vend.id === emi.vendor_id) || {};
      const po = store.purchase_orders.find(p => p.id === emi.po_id) || {};
      const inv = store.invoices.find(i => i.id === emi.invoice_id) || {};
      return {
        ...emi,
        vendor_name: v.name || 'Vendor',
        po_number: po.po_number || 'PO-2026',
        invoice_number: inv.invoice_number || 'INV-00'
      };
    });

    if (params.length > 0) {
      if (sql.includes('WHERE emi.vendor_id = ?')) {
        results = results.filter(emi => emi.vendor_id === params[0]);
      } else if (sql.includes('WHERE po_id = ?')) {
        results = results.filter(emi => emi.po_id === params[0]);
      } else if (sql.includes('WHERE id = ?')) {
        results = results.filter(emi => emi.id === params[0]);
      }
    }
  } else if (sql.includes('FROM warranty_claims')) {
    results = store.warranty_claims.map(wc => {
      const p = store.products.find(prod => prod.id === wc.product_id) || {};
      const v = store.vendors.find(vend => vend.id === wc.vendor_id) || {};
      const po = store.purchase_orders.find(p => p.id === wc.po_id) || {};
      return {
        ...wc,
        product_name: p.name || 'Product',
        vendor_name: v.name || 'Vendor',
        vendor_code: v.code || 'VND',
        po_number: po.po_number || 'PO-2026'
      };
    });

    if (params.length > 0) {
      if (sql.includes('WHERE wc.vendor_id = ?')) {
        results = results.filter(wc => wc.vendor_id === params[0]);
      } else if (sql.includes('WHERE wc.id = ?') || sql.includes('WHERE id = ?')) {
        results = results.filter(wc => wc.id === params[0]);
      }
    }
  } else if (sql.includes('FROM rfq_vendors')) {
    results = store.rfq_vendors.map(rv => {
      const v = store.vendors.find(vend => vend.id === rv.vendor_id) || {};
      return {
        ...rv,
        ...v,
        rfq_vendor_status: rv.status
      };
    });
    if (params.length > 0 && sql.includes('WHERE rv.rfq_id = ?')) {
      results = results.filter(rv => rv.rfq_id === params[0]);
    }
  } else if (sql.includes('FROM inventory_transactions')) {
    results = store.inventory_transactions.map(it => {
      const p = store.products.find(prod => prod.id === it.product_id) || {};
      return {
        ...it,
        product_name: p.name || 'Product',
        product_sku: p.sku || 'N/A'
      };
    });
  } else if (sql.includes('FROM discount_offers')) {
    results = store.discount_offers;
  } else if (sql.includes('FROM audit_logs')) {
    results = store.audit_logs;
  }

  // Sorting
  if (sql.includes('ORDER BY created_at DESC')) {
    results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } else if (sql.includes('ORDER BY b2b_trust_score DESC')) {
    results.sort((a, b) => (b.b2b_trust_score || 0) - (a.b2b_trust_score || 0));
  }

  if (mode === 'get') {
    return results[0] || null;
  }
  return results;
}

db.supabase = require('./supabaseClient');

module.exports = db;
