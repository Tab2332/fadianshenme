import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Connecting to Supabase...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 测试连接
supabase.from('quotes').select('count').single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error)
    } else {
      console.log('Successfully connected to Supabase')
    }
  }) 