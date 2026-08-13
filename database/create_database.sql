-- ============================================
-- TIANGUIS DIGITAL - Creación de base de datos
-- Examen U3 - Desarrollo Web Integral
-- ============================================

-- 1. ROLES
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(20) NOT NULL UNIQUE
);

-- 2. USUARIOS
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(10),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_telefono CHECK (telefono IS NULL OR telefono ~ '^[0-9]{10}$')
);

CREATE INDEX idx_usuarios_email ON usuarios(email);

-- 3. DIRECCIONES
CREATE TABLE direcciones (
    id_direccion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    calle VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    colonia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(5) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    pais VARCHAR(50) NOT NULL DEFAULT 'México',
    CONSTRAINT chk_codigo_postal CHECK (codigo_postal ~ '^[0-9]{5}$')
);

-- 4. CATEGORIAS
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. PRODUCTOS
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    id_usuario_vendedor INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    existencia INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_existencia_positiva CHECK (existencia >= 0),
    CONSTRAINT chk_estado_producto CHECK (estado IN ('activo', 'inactivo'))
);

CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);

-- 6. IMAGENES
CREATE TABLE imagenes (
    id_imagen SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    drive_file_id VARCHAR(150) NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    orden INTEGER NOT NULL DEFAULT 0
);

-- 7. CARRITO
CREATE TABLE carrito (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. DETALLE_CARRITO
CREATE TABLE detalle_carrito (
    id_detalle SERIAL PRIMARY KEY,
    id_carrito INTEGER NOT NULL REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT uq_carrito_producto UNIQUE (id_carrito, id_producto)
);

-- 9. PEDIDOS
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_direccion INTEGER NOT NULL REFERENCES direcciones(id_direccion),
    fecha_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
    subtotal NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    CONSTRAINT chk_estado_pedido CHECK (
        estado IN ('pendiente','confirmado','preparando','enviado','entregado','cancelado')
    )
);

-- 10. DETALLE_PEDIDO
CREATE TABLE detalle_pedido (
    id_detalle_pedido SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_cantidad_pedido_positiva CHECK (cantidad > 0)
);