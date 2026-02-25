import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const url = new URL(req.url)
    const category = url.searchParams.get('category')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const location = url.searchParams.get('location')
    const search = url.searchParams.get('q')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles (full_name, avatar_url, location),
        listing_images (image_url, is_primary)
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) query = query.eq('category_id', category)
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
    if (location) query = query.ilike('location', `%${location}%`)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    const { data, error, count } = await query

    if (error) throw error

    return new Response(
      JSON.stringify({
        data,
        pagination: { page, limit, total: count, pages: Math.ceil(count! / limit) }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})