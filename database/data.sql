-- ============================================
-- TIANGUIS DIGITAL - Datos de prueba
-- ============================================

-- Roles
INSERT INTO roles (nombre_rol) VALUES ('administrador'), ('comprador');

-- Usuarios (password real se genera con bcrypt desde el backend;
-- aquí usamos un hash de ejemplo para que la tabla no quede vacía)
INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono) VALUES
(1, 'Caleb', 'Admin', 'admin@tianguisdigital.mx', '$2a$10$ejemploHashAdmin000000000000000000000000000000', '3111234567'),
(2, 'Ana', 'Comprador', 'ana@correo.mx', '$2a$10$ejemploHashAna0000000000000000000000000000000', '3117654321');

-- Direcciones
INSERT INTO direcciones (id_usuario, calle, numero, colonia, codigo_postal, municipio, estado, pais) VALUES
(2, 'Av. México', '123', 'Centro', '63000', 'Tepic', 'Nayarit', 'México');

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica', 'Dispositivos y accesorios electrónicos'),
('Hogar', 'Artículos para el hogar'),
('Ropa', 'Prendas de vestir');

-- Productos
INSERT INTO productos (id_usuario_vendedor, id_categoria, nombre, descripcion, precio, existencia) VALUES
(1, 1, 'Laptop Lenovo', 'Laptop 15 pulgadas, 8GB RAM', 14999.00, 5),
(1, 1, 'Mouse Logitech', 'Mouse inalámbrico', 399.00, 20),
(1, 2, 'Licuadora Oster', 'Licuadora de 3 velocidades', 899.00, 10);

-- Imágenes (referencia, sin subir aún a Drive - eso va en el Video 6)
INSERT INTO imagenes (id_producto, drive_file_id, imagen_url, es_principal) VALUES
(1, 'pendiente_drive_id_1', 'https://drive.google.com/pendiente1', TRUE),
(2, 'pendiente_drive_id_2', 'https://drive.google.com/pendiente2', TRUE);

-- Carrito de la compradora de prueba
INSERT INTO carrito (id_usuario) VALUES (2);

INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad, precio_unitario) VALUES
(1, 1, 1, 14999.00),
(1, 2, 2, 399.00);