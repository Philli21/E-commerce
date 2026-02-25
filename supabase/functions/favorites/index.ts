import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { listing_id } = await req.json()
  
  // Get User from JWT token
  const authHeader = req.headers.get('Authorization')!
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

  if (!user) return new Response("Unauthorized", { status: 401 })

  if (req.method === 'POST') {
    const { error } = await supabase.from('favorites').insert({ user_id: user.id, listing_id })
    return new Response(JSON.stringify({ success: !error }), { status: error ? 400 : 200 })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('favorites').delete().match({ user_id: user.id, listing_id })
    return new Response(JSON.stringify({ success: !error }), { status: error ? 400 : 200 })
  }
})