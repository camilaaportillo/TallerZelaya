<?php
// php/recuperar_password.php

// HABILITAR ERRORES TEMPORALMENTE
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

session_start();
header('Content-Type: application/json');

// Permitir CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // Verificar archivos requeridos con rutas absolutas
    $base_dir = __DIR__ . '/';
    
    $archivos_requeridos = [
        'conexion.php' => $base_dir . 'conexion.php',
        'config_email.php' => $base_dir . 'config_email.php', 
        'jwt_helper.php' => $base_dir . 'jwt_helper.php'
    ];
    
    foreach ($archivos_requeridos as $nombre => $ruta) {
        if (!file_exists($ruta)) {
            throw new Exception("Archivo no encontrado: $ruta");
        }
        require_once $ruta;
    }

    // Obtener datos POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = $_POST; // Usar POST directo en lugar de json_decode
        
        $accion = $data['accion'] ?? '';
        
        if (empty($accion)) {
            echo json_encode(['exitoso' => false, 'mensaje' => 'Acción no especificada']);
            exit;
        }
        
        $recuperar = new RecuperarPassword();

        switch ($accion) {
            case 'solicitar_recuperacion':
                $correo = trim($data['correo'] ?? '');
                if (empty($correo)) {
                    echo json_encode(['exitoso' => false, 'mensaje' => 'El correo electrónico es requerido']);
                    exit;
                }
                echo json_encode($recuperar->solicitarRecuperacion($correo));
                break;

            case 'verificar_token':
                $token = $data['token'] ?? '';
                if (empty($token)) {
                    echo json_encode(['exitoso' => false, 'mensaje' => 'Token requerido']);
                    exit;
                }
                echo json_encode($recuperar->verificarToken($token));
                break;

            case 'cambiar_password':
                $token = $data['token'] ?? '';
                $nuevaPassword = $data['nuevaPassword'] ?? '';
                
                if (empty($token) || empty($nuevaPassword)) {
                    echo json_encode(['exitoso' => false, 'mensaje' => 'Token y nueva contraseña son requeridos']);
                    exit;
                }
                
                echo json_encode($recuperar->cambiarPasswordConToken($token, $nuevaPassword));
                break;

            default:
                echo json_encode(['exitoso' => false, 'mensaje' => 'Acción no válida: ' . $accion]);
        }
    } else {
        echo json_encode(['exitoso' => false, 'mensaje' => 'Método no permitido']);
    }

} catch (Exception $e) {
    error_log("💥 ERROR GENERAL: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'exitoso' => false, 
        'mensaje' => 'Error del sistema: ' . $e->getMessage()
    ]);
}

class RecuperarPassword {
    private $conn;
    private $emailSender;

    public function __construct() {
        global $conn;
        
        if (!$conn || $conn->connect_error) {
            throw new Exception('Error de conexión a la base de datos');
        }
        
        $this->conn = $conn;
        $this->emailSender = new ConfigEmail();
    }

public function solicitarRecuperacion($correo) {
    try {
        error_log("🔍 Buscando usuario: $correo");
        
        // Primero verificar si el correo existe (sin importar estado)
        $stmt = $this->conn->prepare("SELECT id_usuario, nombre, correo, estado FROM usuario WHERE correo = ?");
        
        if (!$stmt) {
            throw new Exception('Error preparando consulta: ' . $this->conn->error);
        }
        
        $stmt->bind_param("s", $correo);
        
        if (!$stmt->execute()) {
            throw new Exception('Error ejecutando consulta: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();

        // ⚠️ VERIFICAR SI EL CORREO NO EXISTE
        if (!$usuario) {
            error_log("❌ Correo no encontrado en BD: $correo");
            return [
                'exitoso' => false, 
                'mensaje' => '❌ El correo electrónico no está registrado en nuestro sistema.'
            ];
        }

        // ⚠️ VERIFICAR SI LA CUENTA ESTÁ INACTIVA
        if ($usuario['estado'] === 'Inactivo') {
            error_log("❌ Cuenta inactiva: $correo");
            return [
                'exitoso' => false, 
                'mensaje' => '❌ Tu cuenta está inactiva. Contacta al administrador del sistema.'
            ];
        }

        // ⚠️ VERIFICAR SI LA CUENTA ESTÁ ACTIVA
        if ($usuario['estado'] !== 'Activo') {
            error_log("❌ Estado de cuenta inválido: {$usuario['estado']} para $correo");
            return [
                'exitoso' => false, 
                'mensaje' => '❌ Estado de cuenta no válido. Contacta al administrador.'
            ];
        }

        error_log("✅ Usuario válido encontrado: " . $usuario['nombre']);

        // Generar token JWT seguro
        $payload = [
            'user_id' => $usuario['id_usuario'],
            'email' => $usuario['correo'],
            'action' => 'password_reset'
        ];

        $token = JWTHelper::generarToken($payload);

        // Enviar email con enlace seguro
        if ($this->emailSender->enviarCorreoRecuperacion($usuario['correo'], $usuario['nombre'], $token)) {
            error_log("✅ Email enviado exitosamente a: " . $usuario['correo']);
            return [
                'exitoso' => true, 
                'mensaje' => '✅ Se ha enviado un enlace de recuperación a tu correo. Revisa tu bandeja de entrada o spam.'
            ];
        } else {
            throw new Exception('No se pudo enviar el correo electrónico');
        }

    } catch (Exception $e) {
        error_log("💥 Error en solicitarRecuperacion: " . $e->getMessage());
        return [
            'exitoso' => false, 
            'mensaje' => '❌ Error del sistema: ' . $e->getMessage()
        ];
    }
}

   public function verificarToken($token) {
    try {
        $token_data = JWTHelper::verificarToken($token);
        
        if (!$token_data) {
            return ['exitoso' => false, 'mensaje' => '❌ Enlace inválido o expirado'];
        }

        if (!isset($token_data['action']) || $token_data['action'] !== 'password_reset') {
            return ['exitoso' => false, 'mensaje' => '❌ Token inválido'];
        }

        // VERIFICAR ESTADO DEL USUARIO TAMBIÉN AQUÍ
        $stmt = $this->conn->prepare("SELECT id_usuario, nombre, estado FROM usuario WHERE id_usuario = ?");
        $stmt->bind_param("i", $token_data['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();

        if (!$usuario) {
            return ['exitoso' => false, 'mensaje' => '❌ Usuario no encontrado'];
        }

        // ⚠️ VERIFICAR SI LA CUENTA ESTÁ INACTIVA
        if ($usuario['estado'] === 'Inactivo') {
            return ['exitoso' => false, 'mensaje' => '❌ Tu cuenta está inactiva. No puedes restablecer la contraseña.'];
        }

        if ($usuario['estado'] !== 'Activo') {
            return ['exitoso' => false, 'mensaje' => '❌ Estado de cuenta no válido.'];
        }

        return [
            'exitoso' => true, 
            'mensaje' => 'Token válido',
            'usuario' => [
                'id' => $usuario['id_usuario'],
                'nombre' => $usuario['nombre'],
                'email' => $token_data['email']
            ]
        ];

    } catch (Exception $e) {
        error_log("💥 Error en verificarToken: " . $e->getMessage());
        return ['exitoso' => false, 'mensaje' => '❌ Error al verificar el enlace'];
    }
}

    public function cambiarPasswordConToken($token, $nuevaPassword) {
        try {
            $token_data = JWTHelper::verificarToken($token);
            
            if (!$token_data) {
                return ['exitoso' => false, 'mensaje' => 'Enlace inválido o expirado'];
            }

            // Validar contraseña
            $validacion = $this->validarPassword($nuevaPassword);
            if (!$validacion['exitoso']) {
                return $validacion;
            }

            // Hash de la nueva contraseña
            $passwordHash = password_hash($nuevaPassword, PASSWORD_DEFAULT);

            // Actualizar contraseña
            $stmt = $this->conn->prepare("UPDATE usuario SET contrasena = ? WHERE id_usuario = ?");
            $stmt->bind_param("si", $passwordHash, $token_data['user_id']);
            
            if ($stmt->execute()) {
                return [
                    'exitoso' => true, 
                    'mensaje' => 'Contraseña cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
                ];
            } else {
                throw new Exception('Error al actualizar la contraseña');
            }

        } catch (Exception $e) {
            error_log("💥 Error en cambiarPasswordConToken: " . $e->getMessage());
            return ['exitoso' => false, 'mensaje' => 'Error del sistema'];
        }
    }

    private function validarPassword($password) {
        if (strlen($password) < 8) {
            return ['exitoso' => false, 'mensaje' => 'La contraseña debe tener al menos 8 caracteres'];
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            return ['exitoso' => false, 'mensaje' => 'La contraseña debe contener al menos una letra mayúscula'];
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            return ['exitoso' => false, 'mensaje' => 'La contraseña debe contener al menos una letra minúscula'];
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            return ['exitoso' => false, 'mensaje' => 'La contraseña debe contener al menos un número'];
        }

        return ['exitoso' => true];
    }
}
?>