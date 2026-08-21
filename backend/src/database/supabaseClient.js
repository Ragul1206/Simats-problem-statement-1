const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Standardize URL by stripping trailing slash and /rest/v1 if included by user
let rawUrl = process.env.SUPABASE_URL || 'https://fmbkkuccbkkmnighvopg.supabase.co';
let supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️ Warning: SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is missing in backend/.env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
