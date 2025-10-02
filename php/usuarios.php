<?php
// ✅ SOLO incluir conexión al inicio
include "conexion.php";

// ✅ Manejar validación INMEDIATAMENTE (sin login.php)
if (isset($_GET['accion']) && $_GET['accion'] === 'validar') {
    validarCampo();
    exit;
}

// ✅ Para reactivar, incluir login.php solo cuando sea necesario
if (isset($_GET['accion']) && $_GET['accion'] === 'reactivar') {
    include "login.php";
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
// ✅ NUEVA FUNCIÓN: Contar administradores activos
if (isset($_GET['accion']) && $_GET['accion'] === 'contar_administradores') {
    contarAdministradores();
    exit;
}

function contarAdministradores() {
    global $conn;
    
    $id_excluir = isset($_GET['id_excluir']) ? (int)$_GET['id_excluir'] : 0;
    
    $sql = "SELECT COUNT(*) as total FROM usuario WHERE id_rol = 1 AND estado = 'Activo'";
    if ($id_excluir > 0) {
        $sql .= " AND id_usuario != ?";
    }
    
    $stmt = $conn->prepare($sql);
    
    if ($id_excluir > 0) {
        $stmt->bind_param("i", $id_excluir);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $stmt->close();
    
    $maximo = 2; // Límite máximo de administradores
    $puedeCrear = $data['total'] < $maximo;
    
    echo json_encode([
        "total" => $data['total'],
        "maximo" => $maximo,
        "puedeCrear" => $puedeCrear
    ]);
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

// ✅ NUEVA FUNCIÓN: Verificar límite de administradores
function puedeCrearAdministrador() {
    global $conn;
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM usuario WHERE id_rol = 1 AND estado = 'Activo'");
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $stmt->close();
    
    return $data['total'] < 2; // Máximo 2 administradores
}

// ✅ NUEVA FUNCIÓN: Obtener ID del usuario en sesión (simulado)
function obtenerUsuarioSesion() {
    // En un sistema real, esto vendría de la sesión
    // Por ahora, simulamos que el usuario con ID 1 está en sesión
    return 1; // Cambiar por el ID real de la sesión
}

// ✅ Para POST, NO incluir login.php (no lo necesitas para crear usuario)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre   = $_POST['nombre'] ?? '';
    $correo   = $_POST['correo'] ?? '';
    $usuario  = $_POST['usuario'] ?? '';
    $password = $_POST['password'] ?? '';
    $rol      = $_POST['rol'] ?? '';

    // ✅ VALIDACIÓN 1: Límite de administradores
    if ($rol == 1 && !puedeCrearAdministrador()) {
        echo json_encode([
            "status" => "error",
            "mensaje" => "No se pueden crear más de 2 administradores en el sistema"
        ]);
        exit;
    }

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

// ✅ NUEVA SECCIÓN: Para actualización/edición de usuarios (debes agregar esto)
if ($_SERVER["REQUEST_METHOD"] == "PUT" || isset($_POST['accion_edicion'])) {
    // Incluir login.php para obtener datos de sesión
    include "login.php";
    
    $id_usuario = $_POST['id_usuario'] ?? 0;
    $estado = $_POST['estado'] ?? '';
    $rol = $_POST['rol'] ?? '';
    
    // ✅ VALIDACIÓN 2: No permitir desactivarse a sí mismo
    $usuario_sesion_id = obtenerUsuarioSesion();
    
    if ($id_usuario == $usuario_sesion_id && $estado == 'Inactivo') {
        echo json_encode([
            "status" => "error",
            "mensaje" => "No puedes desactivar tu propia cuenta"
        ]);
        exit;
    }
    
    // ✅ VALIDACIÓN 3: Límite de administradores al editar
    if ($rol == 1 && !puedeCrearAdministrador() && $estado == 'Activo') {
        // Verificar si este usuario ya era administrador
        $stmt_check = $conn->prepare("SELECT id_rol FROM usuario WHERE id_usuario = ?");
        $stmt_check->bind_param("i", $id_usuario);
        $stmt_check->execute();
        $result_check = $stmt_check->get_result();
        $usuario_actual = $result_check->fetch_assoc();
        $stmt_check->close();
        
        // Si no era administrador antes, aplicar límite
        if ($usuario_actual['id_rol'] != 1) {
            echo json_encode([
                "status" => "error",
                "mensaje" => "No se pueden tener más de 2 administradores activos en el sistema"
            ]);
            exit;
        }
    }
    
    // Aquí iría el código para actualizar el usuario...
    // (debes adaptar esto a tu sistema de edición)
}
?>