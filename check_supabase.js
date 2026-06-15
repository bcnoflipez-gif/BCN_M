const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://tseuiikhtllyudbvovkk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZXVpaWtodGxseXVkYnZvdmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODI1MjcsImV4cCI6MjA5NjI1ODUyN30.aOsVg-JeodzldvTo5XahsuLU20WG1qFQrZeJukV9xJs');
async function run() {
  const { data, error } = await supabase.from('profiles').select('avatar_url, bio, social_instagram, social_telegram, social_twitter').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
