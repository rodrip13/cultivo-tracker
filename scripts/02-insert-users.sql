-- Insertar los 3 usuarios predefinidos con los nombres correctos
INSERT INTO users (username, password_hash, full_name) VALUES
  ('rodri', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Rodri'),
  ('lucas', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Lucas'),
  ('nico', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Nico')
ON CONFLICT (username) DO NOTHING;

-- Nota: En producción, las contraseñas deberían ser hasheadas apropiadamente
-- Para este ejemplo, todas las contraseñas son "123456"
