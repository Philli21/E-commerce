import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  
  // Extract ID from URL (e.g., /listing-detail?id=uuid)
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return new Response("Missing ID", { status: 400 })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(*), listing_images(*)')
      .eq('id', id)
      .single()
    return new Response(JSON.stringify(data || error), { status: error ? 404 : 200 })
  }

  // Auth check for PUT/DELETE
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response("Unauthorized", { status: 401 })

  if (req.method === 'PUT') {
    const body = await req.json()
    const { data, error } = await supabase.from('listings').update(body).eq('id', id).select()
    return new Response(JSON.stringify(data || error), { status: error ? 400 : 200 })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    return new Response(JSON.stringify({ success: !error }), { status: error ? 400 : 200 })
  }
})