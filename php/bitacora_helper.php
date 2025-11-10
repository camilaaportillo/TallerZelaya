<?php
// bitacora_helper.php
function registrarEnBitacora($accion, $descripcion, $tabla_afectada = null, $id_registro_afectado = null, $modulo = 'Sistema') {
    try {
        include 'conexion.php';
        
        // Verificar si la sesión ya está iniciada sin usar session_start() dos veces
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Obtener usuario de la sesión
        $usuario_id = $_SESSION['usuario_id'] ?? null;
        $usuario_nombre = $_SESSION['usuario_nombre'] ?? 'Sistema';
        
        if (!$usuario_id) {
            return false;
        }
        
        $ip_address = getClientIp();
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido';
        
        $sql = "INSERT INTO bitacora (id_usuario, nombre_usuario, accion, descripcion, tabla_afectada, id_registro_afectado, ip_address, user_agent, modulo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("issssisss", 
                $usuario_id,
                $usuario_nombre,
                $accion,
                $descripcion,
                $tabla_afectada,
                $id_registro_afectado,
                $ip_address,
                $user_agent,
                $modulo
            );
            $result = $stmt->execute();
            $stmt->close();
        }
        
        $conn->close();
        return $result ?? false;
        
    } catch (Exception $e) {
        // Silenciar errores de bitácora para no afectar la operación principal
        return false;
    }
}

function getClientIp() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}
?>