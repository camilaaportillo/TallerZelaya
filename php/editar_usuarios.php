<?php
header("Content-Type: application/json; charset=UTF-8");
include "conexion.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = (int) $_POST['id_usuario'];
    $nombre = $_POST['nombre'];
    $correo = $_POST['correo'];
    $rol = (int) $_POST['rol'];
    $estado = $_POST['estado'];

    $sql = "UPDATE usuario SET nombre=?, correo=?, id_rol=?, estado=? WHERE id_usuario=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $nombre, $correo, $rol, $estado, $id);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "mensaje" => "Usuario actualizado correctamente"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "mensaje" => "Error: " . $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();
}
?>
