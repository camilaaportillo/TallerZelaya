<?php
header("Content-Type: application/json; charset=UTF-8");
include "conexion.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status"=>"error","mensaje"=>"Método no permitido"]);
    exit;
}

$usuario_actual = isset($_POST['usuario_actual']) ? trim($_POST['usuario_actual']) : '';
$usuario_nuevo = isset($_POST['usuario_nuevo']) ? trim($_POST['usuario_nuevo']) : '';

if (empty($usuario_actual) || empty($usuario_nuevo)) {
    echo json_encode(["status"=>"error","mensaje"=>"Datos incompletos"]);
    exit;
}

try {
    $sql = "UPDATE usuario SET usuario=? WHERE usuario=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $usuario_nuevo, $usuario_actual);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status"=>"success","mensaje"=>"Alias actualizado correctamente"]);
        } else {
            echo json_encode(["status"=>"info","mensaje"=>"No se realizaron cambios (posiblemente es el mismo alias)"]);
        }
    } else {
        throw new Exception($stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["status"=>"error","mensaje"=>"Error interno"]);
}

$conn->close();
?>
