<?php
session_start();
header('Content-Type: application/json');

include 'conexion.php';
include 'bitacora_helper.php'; // Agregar esta línea

class LoginSystem
{
    private $conn;

    public function __construct()
    {
        global $conn;
        $this->conn = $conn;
    }

    public function verificarLogin($correo, $contrasena)
    {
        try {
            // Verificar intentos fallidos recientes desde sesión
            $intentos = $this->obtenerIntentosFallidos($correo);
            
            // Buscar usuario por correo con JOIN a la tabla de roles
            $stmt = $this->conn->prepare("
                SELECT u.*, r.nombre_rol 
                FROM usuario u 
                INNER JOIN rol r ON u.id_rol = r.id_rol 
                WHERE u.correo = ?
            ");
            $stmt->bind_param("s", $correo);
            $stmt->execute();
            $result = $stmt->get_result();
            $usuario = $result->fetch_assoc();

            if ($usuario) {

                // Verificar si la cuenta está inactiva
                if ($usuario['estado'] === 'Inactivo') {
                    return [
                        'exitoso' => false,
                        'mensaje' => 'Tu cuenta está inactiva. Contacta al administrador.',
                        'bloqueado' => false
                    ];
                }

                // Resto del código igual...
                // Verificar la contraseña
                if ($this->verificarContrasena($contrasena, $usuario['contrasena'])) {
                    // Login exitoso - resetear intentos fallidos
                    $this->resetearIntentosFallidos($correo);
                    
                    $nombreRol = $usuario['nombre_rol'];
                    
                    $_SESSION['usuario_id'] = $usuario['id_usuario'];
                    $_SESSION['usuario_correo'] = $usuario['correo'];
                    $_SESSION['usuario_nombre'] = $usuario['nombre'];
                    $_SESSION['usuario_usuario'] = $usuario['usuario'];
                    $_SESSION['usuario_rol'] = $nombreRol;
                    $_SESSION['usuario_id_rol'] = $usuario['id_rol'];
                    $_SESSION['loggedin'] = true;

                    // ====== REGISTRAR EN BITÁCORA - LOGIN EXITOSO ======
                    registrarEnBitacora(
                        'LOGIN',
                        'Inicio de sesión exitoso - Rol: ' . $nombreRol,
                        null,
                        null,
                        'Autenticación'
                    );

                    return [
                        'exitoso' => true,
                        'mensaje' => 'Login exitoso',
                        'usuario' => [
                            'id' => $usuario['id_usuario'],
                            'nombre' => $usuario['nombre'],
                            'usuario' => $usuario['usuario'],
                            'correo' => $usuario['correo'],
                            'rol' => $nombreRol,
                            'id_rol' => $usuario['id_rol']
                        ]
                    ];
                } else {
                    // Contraseña incorrecta - incrementar intentos fallidos
                    $nuevosIntentos = $this->incrementarIntentosFallidos($correo);
                    $intentosRestantes = 5 - $nuevosIntentos;
                    
                    error_log("🔐 Intento fallido para: " . $correo . ", intentos: " . $nuevosIntentos . "/5");
                    
                    // ✅ DESACTIVAR CUENTA después de 5 intentos
                    if ($nuevosIntentos >= 5) {
                        error_log("🚨 DESACTIVANDO CUENTA por 5 intentos fallidos. Correo: " . $correo . ", Usuario ID: " . $usuario['id_usuario']);
                        
                        $this->desactivarCuenta($usuario['id_usuario']);
                        
                        return [
                            'exitoso' => false,
                            'mensaje' => 'Demasiados intentos fallidos. Tu cuenta ha sido desactivada por seguridad. Contacta al administrador.',
                            'bloqueado' => false,
                            'cuenta_desactivada' => true
                        ];
                    }
                    
                    return [
                        'exitoso' => false,
                        'mensaje' => "Contraseña incorrecta. Te quedan {$intentosRestantes} intentos.",
                        'intentos_restantes' => $intentosRestantes,
                        'bloqueado' => false
                    ];
                }
            } else {
                // Correo no existe - incrementar intentos para prevenir enumeración
                $nuevosIntentos = $this->incrementarIntentosFallidos($correo);
                
                // ✅ BLOQUEO TEMPORAL después de 5 intentos (solo para correos que no existen)
                if ($nuevosIntentos >= 5) {
                    error_log("🚫 FORMULARIO BLOQUEADO para correo inexistente: " . $correo);
                    return [
                        'exitoso' => false,
                        'mensaje' => 'Demasiados intentos fallidos. El formulario está bloqueado por 30 segundos.',
                        'bloqueado' => true
                    ];
                }
                
                return [
                    'exitoso' => false,
                    'mensaje' => 'Correo electrónico o contraseña incorrectos',
                    'bloqueado' => false
                ];
            }
        } catch (Exception $e) {
            error_log("Error en login: " . $e->getMessage());
            return [
                'exitoso' => false,
                'mensaje' => 'Error en el sistema. Intente nuevamente.',
                'bloqueado' => false
            ];
        }
    }

    // ✅ NUEVA FUNCIÓN para obtener estado del usuario
    private function obtenerEstadoUsuario($usuarioId)
    {
        try {
            $stmt = $this->conn->prepare("SELECT estado FROM usuario WHERE id_usuario = ?");
            $stmt->bind_param("i", $usuarioId);
            $stmt->execute();
            $result = $stmt->get_result();
            $usuario = $result->fetch_assoc();
            $stmt->close();
            
            return $usuario['estado'] ?? 'NO ENCONTRADO';
        } catch (Exception $e) {
            return 'ERROR: ' . $e->getMessage();
        }
    }

    private function obtenerIntentosFallidos($correo)
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $clave = "intentos_{$ip}_{$correo}";
        
        if (!isset($_SESSION[$clave])) {
            $_SESSION[$clave] = [
                'intentos' => 0,
                'timestamp' => time()
            ];
        }
        
        // Limpiar intentos después de 30 minutos
        if (time() - $_SESSION[$clave]['timestamp'] > 1800) {
            $_SESSION[$clave] = [
                'intentos' => 0,
                'timestamp' => time()
            ];
        }
        
        return $_SESSION[$clave]['intentos'];
    }

    private function incrementarIntentosFallidos($correo)
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $clave = "intentos_{$ip}_{$correo}";
        
        if (!isset($_SESSION[$clave])) {
            $_SESSION[$clave] = [
                'intentos' => 0,
                'timestamp' => time()
            ];
        }
        
        $_SESSION[$clave]['intentos']++;
        $_SESSION[$clave]['timestamp'] = time();
        
        return $_SESSION[$clave]['intentos'];
    }

    public function resetearIntentosFallidos($correo)
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $clave = "intentos_{$ip}_{$correo}";
        unset($_SESSION[$clave]);
        error_log("🔄 Intentos reseteados para: " . $correo);
    }

    private function desactivarCuenta($usuarioId)
    {
        try {
            error_log("🔄 Ejecutando UPDATE: UPDATE usuario SET estado = 'Inactivo' WHERE id_usuario = " . $usuarioId);
            
            $stmt = $this->conn->prepare("UPDATE usuario SET estado = 'Inactivo' WHERE id_usuario = ?");
            
            // DEBUG: Verificar si la preparación fue exitosa
            if ($stmt === false) {
                error_log("❌ ERROR en preparar consulta desactivarCuenta: " . $this->conn->error);
                return;
            }
            
            $stmt->bind_param("i", $usuarioId);
            $resultado = $stmt->execute();
            
            // DEBUG: Verificar si la ejecución fue exitosa
            if ($resultado === false) {
                error_log("❌ ERROR al ejecutar desactivarCuenta: " . $stmt->error);
            } else {
                error_log("✅ Cuenta desactivada EXITOSAMENTE para usuario ID: " . $usuarioId . ", filas afectadas: " . $stmt->affected_rows);
                
                // Verificar el estado DESPUÉS de desactivar
                $stmtCheck = $this->conn->prepare("SELECT estado FROM usuario WHERE id_usuario = ?");
                $stmtCheck->bind_param("i", $usuarioId);
                $stmtCheck->execute();
                $resultCheck = $stmtCheck->get_result();
                $estadoDespues = $resultCheck->fetch_assoc();
                error_log("🔍 Estado DESPUÉS de desactivar: " . ($estadoDespues['estado'] ?? 'NO ENCONTRADO'));
                $stmtCheck->close();
            }
            
            $stmt->close();
            
        } catch (Exception $e) {
            error_log("💥 EXCEPCIÓN en desactivarCuenta: " . $e->getMessage());
        }
    }

    private function actualizarUltimoLogin($usuarioId)
    {
        try {
            $stmt = $this->conn->prepare("UPDATE usuario SET ultimo_login = NOW() WHERE id_usuario = ?");
            $stmt->bind_param("i", $usuarioId);
            $stmt->execute();
        } catch (Exception $e) {
            error_log("Error al actualizar último login: " . $e->getMessage());
        }
    }

    private function verificarContrasena($contrasenaPlana, $contrasenaHash)
    {
        // Si la contraseña está en texto plano (para testing temporal)
        if ($contrasenaPlana === $contrasenaHash) {
            return true;
        }

        // Verificar contraseña hasheada
        if (password_verify($contrasenaPlana, $contrasenaHash)) {
            return true;
        }

        return false;
    }

    public function resetearIntentosPorCorreo($correo)
    {
        try {
            // Buscar y eliminar todas las sesiones de intentos para este correo
            foreach ($_SESSION as $clave => $valor) {
                if (strpos($clave, 'intentos_') === 0 && strpos($clave, $correo) !== false) {
                    unset($_SESSION[$clave]);
                    error_log("🔄 Intentos reseteados por correo: " . $correo . " (sesión eliminada: " . $clave . ")");
                }
            }
            return true;
        } catch (Exception $e) {
            error_log("Error en resetearIntentosPorCorreo: " . $e->getMessage());
            return false;
        }
    }
}

// Manejar la solicitud
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = trim($_POST['correo'] ?? '');
    $contrasena = $_POST['contrasena'] ?? '';

    if (empty($correo) || empty($contrasena)) {
        echo json_encode([
            'exitoso' => false,
            'mensaje' => 'Por favor, complete todos los campos'
        ]);
        exit;
    }

    $loginSystem = new LoginSystem();
    $resultado = $loginSystem->verificarLogin($correo, $contrasena);
    
    // ✅ AGREGAR: Si el login es exitoso, incluir datos para sessionStorage
    if ($resultado['exitoso']) {
        $resultado['session_data'] = [
            'usuario' => $resultado['usuario'],
            'loggedin' => 'true',
            'usuario_rol' => $resultado['usuario']['rol']
        ];
    }
    echo json_encode($resultado);
} else {
    echo json_encode([
        'exitoso' => false,
        'mensaje' => 'Método no permitido'
    ]);
}
?>