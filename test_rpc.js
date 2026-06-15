const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://tseuiikhtllyudbvovkk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZXVpaWtodGxseXVkYnZvdmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODI1MjcsImV4cCI6MjA5NjI1ODUyN30.aOsVg-JeodzldvTo5XahsuLU20WG1qFQrZeJukV9xJs');

async function testRPC() {
  // We need valid UUIDs. Let's just fetch two profiles.
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(2);
  if (pError || !profiles || profiles.length < 2) {
    console.log("Error fetching profiles:", pError, profiles);
    return;
  }
  const targetUser = profiles[0].id;
  const reactorUser = profiles[1].id;

  console.log(`Calling toggle_profile_reaction for target: ${targetUser}, reactor: ${reactorUser}`);
  const { data, error } = await supabase.rpc("toggle_profile_reaction", {
    target_user: targetUser,
    reactor: reactorUser,
    reaction: "like",
  });
  console.log("RPC Data:", data);
  console.log("RPC Error:", error);

  const { data: updatedProfile } = await supabase.from('profiles').select('reactions_like').eq('id', targetUser).single();
  console.log("Updated Profile:", updatedProfile);
}

testRPC();
