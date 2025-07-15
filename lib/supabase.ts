import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * En entorno local/preview puede que no existan las variables de entorno.
 * Para evitar el error “supabaseUrl is required” usamos valores de relleno
 * y mostramos una advertencia clara en consola.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "local-dev-anon-key"

/**
 * Si los datos son los de relleno, avisamos al desarrollador.
 * En un entorno real (Vercel, producción, etc.) debes definir:
 *  - NEXT_PUBLIC_SUPABASE_URL
 *  - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
if (supabaseUrl === "http://localhost:54321" || supabaseAnonKey === "local-dev-anon-key") {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Variables de entorno no definidas. " +
      'Configura "NEXT_PUBLIC_SUPABASE_URL" y "NEXT_PUBLIC_SUPABASE_ANON_KEY" ' +
      "para conectar con tu proyecto Supabase.",
  )
}

export const IS_SUPABASE_CONFIGURED = !(
  supabaseUrl === "http://localhost:54321" || supabaseAnonKey === "local-dev-anon-key"
)

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    /**
     * Deshabilitamos la persistencia de sesión en preview para evitar
     * advertencias en el navegador cuando no hay backend real.
     */
    persistSession: false,
    autoRefreshToken: false,
  },
})

export type WeatherRecord = {
  id: string
  user_id: string
  temperature: number
  humidity: number
  status: "green" | "yellow" | "red"
  recorded_at: string
  created_at: string
  users?: {
    username: string
    full_name: string
  }
}

export type User = {
  id: string
  username: string
  full_name: string
}
