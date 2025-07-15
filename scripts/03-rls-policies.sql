-- Habilitar Row Level Security en la tabla weather_records
ALTER TABLE weather_records ENABLE ROW LEVEL SECURITY;

-- 1. Política para SELECT (Leer): Todos los usuarios autenticados pueden ver todos los registros.
-- Esto asegura que Rodri, Lucas y Nico puedan ver los registros de todos.
CREATE POLICY "All authenticated users can view all weather records"
ON weather_records FOR SELECT
USING (TRUE);

-- 2. Política para INSERT (Agregar): Todos los usuarios autenticados pueden agregar registros.
-- El registro se asociará con el user_id del usuario que lo crea.
CREATE POLICY "All authenticated users can insert weather records"
ON weather_records FOR INSERT
WITH CHECK (TRUE); -- Opcionalmente, WITH CHECK (user_id = auth.uid()) si usas Supabase Auth y el user_id de la tabla 'users' es el mismo que auth.uid()

-- 3. Política para DELETE (Borrar): Solo Rodri puede borrar registros.
-- Esta política busca el ID de Rodri en la tabla 'users' y permite borrar solo si el user_id del registro coincide.
-- NOTA: Esta política solo funcionará si el usuario que realiza la petición está autenticado a través de Supabase Auth
-- y su 'auth.uid()' corresponde al 'id' de Rodri en tu tabla 'users'.
-- Con el login simulado actual, esta política NO se aplicará correctamente desde el cliente.
CREATE POLICY "Rodri can delete weather records"
ON weather_records FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE username = 'rodri')
);
