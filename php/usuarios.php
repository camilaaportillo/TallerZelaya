<?php
include "conexion.php";
include "login.php";
if (isset($_GET['accion']) && $_GET['accion'] === 'validar') {
    validarCampo();
    exit;
}

// ✅ NUEVA ACCIÓN: Reactivar usuario y resetear intentos
if (isset($_GET['accion']) && $_GET['accion'] === 'reactivar') {
    reactivarUsuario();
    exit;
}

header('Content-Type: application/json; charset=utf-8');
function reactivarUsuario() {
    global $conn;
    
    $id_usuario = isset($_GET['id_usuario']) ? (int)$_GET['id_usuario'] : 0;
    $correo = isset($_GET['correo']) ? trim($_GET['correo']) : '';

    if ($id_usuario <= 0 || empty($correo)) {
        echo json_encode(["status" => "error", "mensaje" => "Parámetros incompletos"]);
        return;
    }

    try {
        // 1. Reactivar el usuario en la base de datos
        $stmt = $conn->prepare("UPDATE usuario SET estado = 'Activo' WHERE id_usuario = ?");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        
        // 2. Resetear los intentos fallidos
        $loginSystem = new LoginSystem();
        $loginSystem->resetearIntentosPorCorreo($correo);
        
        echo json_encode([
            "status" => "success", 
            "mensaje" => "Usuario reactivado correctamente e intentos reseteados"
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            "status" => "error", 
            "mensaje" => "Error al reactivar usuario: " . $e->getMessage()
        ]);
    }
}

function validarCampo() {
    global $conn;
    
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
    $valor = isset($_GET['valor']) ? trim($_GET['valor']) : '';
    $id_excluir = isset($_GET['id_excluir']) ? (int)$_GET['id_excluir'] : 0;

    if (empty($tipo) || empty($valor)) {
        echo json_encode(["valido" => false, "mensaje" => "Parámetros incompletos"]);
        return;
    }

    if ($tipo === 'correo') {
        // Validar correo
        if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["valido" => false, "mensaje" => "Formato de correo no válido"]);
            return;
        }

        $sql = "SELECT id_usuario FROM usuario WHERE correo = ?";
        if ($id_excluir > 0) {
            $sql .= " AND id_usuario != ?";
        }

        $stmt = $conn->prepare($sql);
        if ($id_excluir > 0) {
            $stmt->bind_param("si", $valor, $id_excluir);
        } else {
            $stmt->bind_param("s", $valor);
        }

    } elseif ($tipo === 'usuario') {
        // Validar usuario
        $sql = "SELECT id_usuario FROM usuario WHERE usuario = ?";
        if ($id_excluir > 0) {
            $sql .= " AND id_usuario != ?";
        }

        $stmt = $conn->prepare($sql);
        if ($id_excluir > 0) {
            $stmt->bind_param("si", $valor, $id_excluir);
        } else {
            $stmt->bind_param("s", $valor);
        }

    } else {
        echo json_encode(["valido" => false, "mensaje" => "Tipo de validación no válido"]);
        return;
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $mensaje = $tipo === 'correo' ? "Este correo ya está registrado" : "Este usuario ya existe";
        echo json_encode(["valido" => false, "mensaje" => $mensaje]);
    } else {
        $mensaje = $tipo === 'correo' ? "Correo disponible" : "Usuario disponible";
        echo json_encode(["valido" => true, "mensaje" => $mensaje]);
    }

    $stmt->close();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre   = $_POST['nombre'] ?? '';
    $correo   = $_POST['correo'] ?? '';
    $usuario  = $_POST['usuario'] ?? '';
    $password = $_POST['password'] ?? '';
    $rol      = $_POST['rol'] ?? '';

    if ($nombre && $correo && $usuario && $password && $rol) {
        //ENCRIPTA LA CONTRASEÑA ANTES DE GUARDAR
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO usuario (nombre, correo, usuario, contrasena, id_rol) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
      
        $stmt->bind_param("sssss", $nombre, $correo, $usuario, $passwordHash, $rol);

        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "mensaje" => "Usuario creado correctamente"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "mensaje" => "Error en la base de datos: " . $stmt->error
            ]);
        }
        $stmt->close();
    } else {
        echo json_encode([
            "status" => "error",
            "mensaje" => "Faltan datos en el formulario"
        ]);
    }
}
$conn->close();
?>
