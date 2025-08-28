<?php
include "conexion.php"; // ajusta la ruta si está en otra carpeta

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre   = $_POST['nombre'] ?? '';
    $correo   = $_POST['correo'] ?? '';
    $usuario  = $_POST['usuario'] ?? '';
    $password = $_POST['password'] ?? '';
    $rol      = $_POST['rol'] ?? '';

    if ($nombre && $correo && $usuario && $password && $rol) {
        $sql = "INSERT INTO usuario (nombre, correo, usuario, contrasena, id_rol) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $nombre, $correo, $usuario, $password, $rol);

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