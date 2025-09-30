<?php
// php/recuperar_password.php

// ✅ DESHABILITAR COMPLETAMENTE LA VISUALIZACIÓN DE ERRORES
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// ✅ BUFFER MÁS AGRESIVO
if (ob_get_level()) ob_end_clean();
ob_start();

session_start();

// ✅ HEADERS DESPUÉS DEL BUFFER
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ✅ FUNCIÓN PARA ENVIAR JSON LIMPIO
function enviarJson($datos) {
    if (ob_get_level()) ob_end_clean();
    echo json_encode($datos);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    enviarJson(['exitoso' => true]);
}

try {
    // ✅ INCLUIR ARCHIVOS SIN MOSTRAR WARNINGS
    $base_dir = __DIR__ . '/';
    
    // Silenciar posibles warnings al incluir archivos
    $conexion = @include_once $base_dir . 'conexion.php';
    $config_email = @include_once $base_dir . 'config_email.php';
    $jwt_helper = @include_once $base_dir . 'jwt_helper.php';
    
    if (!$conexion || !$config_email || !$jwt_helper) {
        throw new Exception('Error al cargar archivos requeridos');
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        enviarJson(['exitoso' => false, 'mensaje' => 'Método no permitido']);
    }

    $data = $_POST;
    $accion = $data['accion'] ?? '';
    
    if (empty($accion)) {
        enviarJson(['exitoso' => false, 'mensaje' => 'Acción no especificada']);
    }
    
    $recuperar = new RecuperarPassword();

    switch ($accion) {
        case 'solicitar_recuperacion':
            $correo = trim($data['correo'] ?? '');
            if (empty($correo)) {
                enviarJson(['exitoso' => false, 'mensaje' => 'El correo electrónico es requerido']);
            }
            enviarJson($recuperar->solicitarRecuperacion($correo));
            break;

        case 'verificar_codigo':
            $correo = trim($data['correo'] ?? '');
            $codigo = trim($data['codigo'] ?? '');
            if (empty($correo) || empty($codigo)) {
                enviarJson(['exitoso' => false, 'mensaje' => 'Correo y código son requeridos']);
            }
            enviarJson($recuperar->verificarCodigo($correo, $codigo));
            break;

        case 'reenviar_codigo':
            $correo = trim($data['correo'] ?? '');
            if (empty($correo)) {
                enviarJson(['exitoso' => false, 'mensaje' => 'El correo electrónico es requerido']);
            }
            enviarJson($recuperar->reenviarCodigo($correo));
            break;

        case 'verificar_token':
            $token = $data['token'] ?? '';
            if (empty($token)) {
                enviarJson(['exitoso' => false, 'mensaje' => 'Token requerido']);
            }
            enviarJson($recuperar->verificarToken($token));
            break;

        case 'cambiar_password':
            $token = $data['token'] ?? '';
            $nuevaPassword = $data['nuevaPassword'] ?? '';
            
            if (empty($token) || empty($nuevaPassword)) {
                enviarJson(['exitoso' => false, 'mensaje' => 'Token y nueva contraseña son requeridos']);
            }
            
            enviarJson($recuperar->cambiarPasswordConToken($token, $nuevaPassword));
            break;

        default:
            enviarJson(['exitoso' => false, 'mensaje' => 'Acción no válida: ' . $accion]);
    }

} catch (Exception $e) {
    error_log("💥 ERROR GENERAL: " . $e->getMessage());
    enviarJson([
        'exitoso' => false, 
        'mensaje' => 'Error del sistema'
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
            // Buscar usuario
            $stmt = $this->conn->prepare("SELECT id_usuario, nombre, correo, estado FROM usuario WHERE correo = ?");
            
            if (!$stmt) {
                throw new Exception('Error preparando consulta');
            }
            
            $stmt->bind_param("s", $correo);
            
            if (!$stmt->execute()) {
                throw new Exception('Error ejecutando consulta');
            }
            
            $result = $stmt->get_result();
            $usuario = $result->fetch_assoc();

            if (!$usuario) {
                return [
                    'exitoso' => false, 
                    'mensaje' => '❌ El correo electrónico no está registrado en nuestro sistema.'
                ];
            }

            if ($usuario['estado'] !== 'Activo') {
                return [
                    'exitoso' => false, 
                    'mensaje' => '❌ Tu cuenta está inactiva. Contacta al administrador del sistema.'
                ];
            }

            // Generar token JWT seguro
            $payload = [
                'user_id' => $usuario['id_usuario'],
                'email' => $usuario['correo'],
                'action' => 'password_reset'
            ];

            $token = JWTHelper::generarToken($payload);

            // Generar código de 6 dígitos
            $codigo_verificacion = $this->generarCodigoVerificacion($usuario['id_usuario']);
            
            if (!$codigo_verificacion) {
                throw new Exception('No se pudo generar el código de verificación');
            }

            // Enviar email con enlace seguro Y código
            if ($this->emailSender->enviarCorreoRecuperacion($usuario['correo'], $usuario['nombre'], $token, $codigo_verificacion)) {
                return [
                    'exitoso' => true, 
                    'mensaje' => '✅ Se ha enviado un código de verificación a tu correo. También puedes usar el enlace directo.',
                    'mostrar_modal_codigo' => true,
                    'correo' => $correo
                ];
            } else {
                throw new Exception('No se pudo enviar el correo electrónico');
            }

        } catch (Exception $e) {
            error_log("💥 Error en solicitarRecuperacion: " . $e->getMessage());
            return [
                'exitoso' => false, 
                'mensaje' => '❌ Error del sistema'
            ];
        }
    }

   private function generarCodigoVerificacion($id_usuario) {
    try {
        error_log("🎯 [DEBUG-GENERAR-CODIGO] Generando código para usuario: " . $id_usuario);
        
        // Limpiar códigos expirados
        $this->limpiarCodigosExpirados();
        
        // Generar código de 6 dígitos
        $codigo = sprintf("%06d", mt_rand(1, 999999));
        error_log("🎯 [DEBUG-GENERAR-CODIGO] Código generado: " . $codigo);
        
        // Insertar en la base de datos
        $sql = "INSERT INTO codigos_recuperacion (id_usuario, codigo, expiracion) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))";
        
        $stmt = $this->conn->prepare($sql);
        
        if (!$stmt) {
            $error_msg = 'Error preparando inserción: ' . $this->conn->error;
            error_log("💥 [DEBUG-GENERAR-CODIGO] " . $error_msg);
            throw new Exception($error_msg);
        }
        
        $stmt->bind_param("is", $id_usuario, $codigo);
        
        if (!$stmt->execute()) {
            $error_msg = 'Error ejecutando inserción: ' . $stmt->error;
            error_log("💥 [DEBUG-GENERAR-CODIGO] " . $error_msg);
            throw new Exception($error_msg);
        }
        
        $stmt->close();
        
        error_log("✅ [DEBUG-GENERAR-CODIGO] Código insertado exitosamente");
        return $codigo;
        
    } catch (Exception $e) {
        error_log("💥 [DEBUG-GENERAR-CODIGO] Error: " . $e->getMessage());
        return false;
    }
}
    private function limpiarCodigosExpirados() {
        try {
            $this->conn->query("DELETE FROM codigos_recuperacion WHERE expiracion < NOW() OR utilizado = 1");
        } catch (Exception $e) {
            error_log("💥 Error en limpiarCodigosExpirados: " . $e->getMessage());
        }
    }

    public function verificarCodigo($correo, $codigo) {
        try {
            // Buscar usuario
            $stmt = $this->conn->prepare("SELECT id_usuario FROM usuario WHERE correo = ?");
            $stmt->bind_param("s", $correo);
            $stmt->execute();
            $result = $stmt->get_result();
            $usuario = $result->fetch_assoc();
            
            if (!$usuario) {
                return ['exitoso' => false, 'mensaje' => 'Usuario no encontrado'];
            }
            
            // Buscar código válido
            $stmt = $this->conn->prepare("
                SELECT id_codigo 
                FROM codigos_recuperacion 
                WHERE id_usuario = ? AND codigo = ? AND expiracion > NOW() AND utilizado = 0
            ");
            $stmt->bind_param("is", $usuario['id_usuario'], $codigo);
            $stmt->execute();
            $result = $stmt->get_result();
            $codigo_valido = $result->fetch_assoc();
            
            if (!$codigo_valido) {
                return ['exitoso' => false, 'mensaje' => '❌ Código inválido o expirado'];
            }
            
            // Marcar código como utilizado
            $stmt = $this->conn->prepare("UPDATE codigos_recuperacion SET utilizado = 1 WHERE id_codigo = ?");
            $stmt->bind_param("i", $codigo_valido['id_codigo']);
            $stmt->execute();
            
            // Generar token para restablecimiento
            $payload = [
                'user_id' => $usuario['id_usuario'],
                'email' => $correo,
                'action' => 'password_reset'
            ];
            
            $token = JWTHelper::generarToken($payload);
            
            return [
                'exitoso' => true, 
                'mensaje' => '✅ Código verificado correctamente',
                'token' => $token
            ];
            
        } catch (Exception $e) {
            error_log("💥 Error verificando código: " . $e->getMessage());
            return ['exitoso' => false, 'mensaje' => 'Error del sistema al verificar código'];
        }
    }

 public function reenviarCodigo($correo) {
    try {
        error_log("🎯 [DEBUG-REENVIO] Iniciando reenvío para: " . $correo);

        // 1. BUSCAR USUARIO
        error_log("🎯 [DEBUG-REENVIO] Buscando usuario...");
        $stmt = $this->conn->prepare("SELECT id_usuario, nombre, correo, estado FROM usuario WHERE correo = ?");
        if (!$stmt) {
            error_log("💥 [DEBUG-REENVIO] Error preparando consulta: " . $this->conn->error);
            throw new Exception('Error preparando consulta');
        }
        
        $stmt->bind_param("s", $correo);
        
        if (!$stmt->execute()) {
            error_log("💥 [DEBUG-REENVIO] Error ejecutando consulta: " . $stmt->error);
            throw new Exception('Error ejecutando consulta');
        }
        
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();
        $stmt->close();
        
        if (!$usuario) {
            error_log("❌ [DEBUG-REENVIO] Usuario no encontrado: " . $correo);
            return [
                'exitoso' => false, 
                'mensaje' => '❌ El correo electrónico no está registrado.'
            ];
        }

        error_log("✅ [DEBUG-REENVIO] Usuario encontrado: " . $usuario['nombre'] . " (ID: " . $usuario['id_usuario'] . ")");

        // 2. VERIFICAR ESTADO
        if ($usuario['estado'] !== 'Activo') {
            error_log("❌ [DEBUG-REENVIO] Usuario inactivo. Estado: " . $usuario['estado']);
            return [
                'exitoso' => false, 
                'mensaje' => '❌ Tu cuenta está inactiva. Contacta al administrador.'
            ];
        }

        // 3. GENERAR NUEVO TOKEN (¡ESTO FALTABA!)
        error_log("🎯 [DEBUG-REENVIO] Generando nuevo token...");
        $payload = [
            'user_id' => $usuario['id_usuario'],
            'email' => $usuario['correo'],
            'action' => 'password_reset'
        ];
        $token = JWTHelper::generarToken($payload);
        error_log("✅ [DEBUG-REENVIO] Token generado");

        // 4. LIMPIAR CÓDIGOS ANTERIORES
        error_log("🎯 [DEBUG-REENVIO] Limpiando códigos anteriores...");
        $this->limpiarCodigosUsuario($usuario['id_usuario']);

        // 5. GENERAR NUEVO CÓDIGO
        error_log("🎯 [DEBUG-REENVIO] Generando nuevo código...");
        $codigo_verificacion = $this->generarCodigoVerificacion($usuario['id_usuario']);
        
        if (!$codigo_verificacion) {
            error_log("💥 [DEBUG-REENVIO] Error generando código");
            throw new Exception('No se pudo generar el nuevo código de verificación');
        }

        error_log("✅ [DEBUG-REENVIO] Nuevo código generado: " . $codigo_verificacion);

        // 6. INTENTAR ENVIAR EMAIL (CON TOKEN VÁLIDO)
        error_log("🎯 [DEBUG-REENVIO] Enviando email con token...");
        $email_enviado = $this->emailSender->enviarCorreoRecuperacion(
            $usuario['correo'], 
            $usuario['nombre'], 
            $token, // ✅ AHORA CON TOKEN VÁLIDO
            $codigo_verificacion
        );

        if ($email_enviado) {
            error_log("✅ [DEBUG-REENVIO] Email enviado exitosamente");
            return [
                'exitoso' => true, 
                'mensaje' => '✅ Se ha enviado un nuevo código de verificación a tu correo.'
            ];
        } else {
            // ✅ FALLBACK: Mostrar el código en pantalla si falla el email
            error_log("⚠️ [DEBUG-REENVIO] Email falló, mostrando código en pantalla");
            return [
                'exitoso' => true, 
                'mensaje' => '✅ Código de verificación: ' . $codigo_verificacion . ' (Servidor de email temporalmente no disponible)',
                'codigo_directo' => $codigo_verificacion
            ];
        }

    } catch (Exception $e) {
        error_log("💥 [DEBUG-REENVIO] Error crítico: " . $e->getMessage());
        return [
            'exitoso' => false, 
            'mensaje' => '❌ Error del sistema: ' . $e->getMessage()
        ];
    }
}

    private function limpiarCodigosUsuario($id_usuario) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM codigos_recuperacion WHERE id_usuario = ?");
            if ($stmt) {
                $stmt->bind_param("i", $id_usuario);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
            error_log("⚠️ Error limpiando códigos anteriores: " . $e->getMessage());
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

            $stmt = $this->conn->prepare("SELECT id_usuario, nombre, estado FROM usuario WHERE id_usuario = ?");
            $stmt->bind_param("i", $token_data['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $usuario = $result->fetch_assoc();

            if (!$usuario) {
                return ['exitoso' => false, 'mensaje' => '❌ Usuario no encontrado'];
            }

            if ($usuario['estado'] !== 'Activo') {
                return ['exitoso' => false, 'mensaje' => '❌ Tu cuenta está inactiva. No puedes restablecer la contraseña.'];
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