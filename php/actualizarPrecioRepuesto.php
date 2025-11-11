<?php
include "conexion.php";
include "bitacora_helper.php";

// Agregar headers para CORS y JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'mensaje' => 'Método no permitido']);
    exit;
}

// Log para debug
error_log("=== INICIO actualizarPrecioRepuesto.php ===");

try {
    $input = file_get_contents('php://input');
    error_log("Datos recibidos: " . $input);
    
    $datos = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    $id_repuesto = $datos['id_repuesto'] ?? null;
    $nuevo_precio = $datos['nuevo_precio'] ?? null;
    $id_usuario = $datos['id_usuario'] ?? null;
    $nombre_usuario = $datos['nombre_usuario'] ?? null;
    
    error_log("ID Repuesto: " . $id_repuesto);
    error_log("Nuevo Precio: " . $nuevo_precio);
    error_log("Usuario ID: " . $id_usuario);
    error_log("Usuario Nombre: " . $nombre_usuario);
    
    if (!$id_repuesto || !$nuevo_precio) {
        echo json_encode(['status' => 'error', 'mensaje' => 'Datos incompletos']);
        exit;
    }
    
    if ($nuevo_precio <= 0) {
        echo json_encode(['status' => 'error', 'mensaje' => 'El precio debe ser mayor a 0']);
        exit;
    }
    
    // Verificar que el repuesto existe
    $stmt = $conn->prepare("SELECT nombre, precio, codigo FROM repuesto WHERE id_repuesto = ?");
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id_repuesto);
    
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['status' => 'error', 'mensaje' => "Repuesto con ID $id_repuesto no encontrado"]);
        exit;
    }
    
    $repuesto = $result->fetch_assoc();
    $precio_anterior = $repuesto['precio'] ?? 0;
    $nombre_repuesto = $repuesto['nombre'];
    $codigo_repuesto = $repuesto['codigo'];
    
    error_log("Precio anterior: " . $precio_anterior);
    error_log("Nombre repuesto: " . $nombre_repuesto);
    error_log("Código repuesto: " . $codigo_repuesto);
    
    // Actualizar el precio
    $stmt = $conn->prepare("UPDATE repuesto SET precio = ? WHERE id_repuesto = ?");
    if (!$stmt) {
        throw new Exception("Error preparando update: " . $conn->error);
    }
    
    $stmt->bind_param("di", $nuevo_precio, $id_repuesto);
    
    if ($stmt->execute()) {
        error_log("✅ Precio actualizado en la base de datos");
        
        // INICIAR SESIÓN Y ESTABLECER VARIABLES DE SESIÓN ANTES DE LLAMAR A BITÁCORA
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Establecer las variables de sesión con los datos del usuario
        if ($id_usuario && $nombre_usuario) {
            $_SESSION['usuario_id'] = $id_usuario;
            $_SESSION['usuario_nombre'] = $nombre_usuario;
            error_log("✅ Variables de sesión establecidas: usuario_id=$id_usuario, usuario_nombre=$nombre_usuario");
        } else {
            error_log("⚠️ No se recibieron datos de usuario para la bitácora");
        }
        
        // REGISTRAR EN BITÁCORA - Ahora la función podrá acceder a las variables de sesión
        $descripcion = "Precio actualizado para repuesto {$codigo_repuesto} - {$nombre_repuesto}: " .
                      "De $" . number_format($precio_anterior, 2) . 
                      " a $" . number_format($nuevo_precio, 2);
        
        error_log("Intentando registrar en bitácora: " . $descripcion);
        
        // Llamar a la función de bitácora (usará las variables de sesión que acabamos de establecer)
        $resultado_bitacora = registrarEnBitacora(
            'ACTUALIZAR', 
            $descripcion, 
            'repuesto', 
            $id_repuesto, 
            'Inventario'
        );
        
        error_log("Resultado bitácora: " . ($resultado_bitacora ? '✅ Éxito' : '❌ Falló'));
        
        echo json_encode([
            'status' => 'success', 
            'mensaje' => "Precio actualizado correctamente de $" . 
                        number_format($precio_anterior, 2) . 
                        " a $" . number_format($nuevo_precio, 2),
            'bitacora_registrada' => $resultado_bitacora
        ]);
        
    } else {
        throw new Exception("Error al actualizar precio: " . $stmt->error);
    }
    
} catch (Exception $e) {
    error_log("❌ Error en actualizarPrecioRepuesto: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'mensaje' => 'Error en el servidor: ' . $e->getMessage()]);
}

error_log("=== FIN actualizarPrecioRepuesto.php ===");
$conn->close();
?>