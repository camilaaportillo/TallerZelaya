<?php
// php/login.php
session_start();
header('Content-Type: application/json');

include 'conexion.php';

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
            // Buscar usuario por correo (incluyendo verificación de estado activo)
            $stmt = $this->conn->prepare("SELECT * FROM usuario WHERE correo = ? AND estado = 'activo'");
            $stmt->bind_param("s", $correo);
            $stmt->execute();
            $result = $stmt->get_result();
            $usuario = $result->fetch_assoc();

            if ($usuario) {
                // Verificar la contraseña
                if ($this->verificarContrasena($contrasena, $usuario['contrasena'])) {
                    // Login exitoso
                    $_SESSION['usuario_id'] = $usuario['id_usuario'];
                    $_SESSION['usuario_correo'] = $usuario['correo'];
                    $_SESSION['usuario_nombre'] = $usuario['nombre'];
                    $_SESSION['usuario_usuario'] = $usuario['usuario'];
                    $_SESSION['usuario_rol'] = $usuario['id_rol'];
                    $_SESSION['loggedin'] = true;

                    return [
                        'exitoso' => true,
                        'mensaje' => 'Login exitoso',
                        'usuario' => [
                            'id' => $usuario['id_usuario'],
                            'nombre' => $usuario['nombre'],
                            'usuario' => $usuario['usuario'],
                            'correo' => $usuario['correo'],
                            'rol' => $usuario['id_rol']
                        ]
                    ];
                } else {
                    return [
                        'exitoso' => false,
                        'mensaje' => 'Contraseña incorrecta'
                    ];
                }
            } else {
                // Verificar si el usuario existe pero está inactivo
                $stmt = $this->conn->prepare("SELECT * FROM usuario WHERE correo = ? AND estado = 'inactivo'");
                $stmt->bind_param("s", $correo);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    return [
                        'exitoso' => false,
                        'mensaje' => 'Tu cuenta está inactiva. Contacta al administrador.'
                    ];
                } else {
                    return [
                        'exitoso' => false,
                        'mensaje' => 'Correo electrónico no encontrado'
                    ];
                }
            }
        } catch (Exception $e) {
            error_log("Error en login: " . $e->getMessage());
            return [
                'exitoso' => false,
                'mensaje' => 'Error en el sistema. Intente nuevamente.'
            ];
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

    echo json_encode($resultado);
} else {
    echo json_encode([
        'exitoso' => false,
        'mensaje' => 'Método no permitido'
    ]);
}
