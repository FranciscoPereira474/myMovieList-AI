/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching a random review to get a user...');
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('id, user_id')
    .limit(1)
    .single();

  if (reviewError) {
    console.error('Error fetching review:', reviewError);
    return;
  }

  console.log('Found review:', review);
  const userId = review.user_id;
  const excludeReviewId = review.id;

  console.log(`Testing getUserTopReviews logic for user ${userId}, excluding review ${excludeReviewId}`);

  // The logic from getUserTopReviews
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      movie_id,
      created_at,
      movie:movies (
        id,
        title
      )
    `)
    .eq("user_id", userId)
    .neq("id", excludeReviewId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error in query:", error);
  } else {
    console.log("Query result:", reviews);
    console.log("Result count:", reviews.length);
  }
  
  // Check if user has other reviews at all
  const { count } = await supabase
    .from("reviews")
    .select('*', { count: 'exact', head: true })
    .eq("user_id", userId);
    
  console.log(`Total reviews for user ${userId}:`, count);
}

run();
