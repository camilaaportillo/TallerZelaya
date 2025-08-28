<?php
header('Content-Type: application/json');
include "conexion.php"; 

$sql = "SELECT u.id_usuario, u.nombre, u.correo, u.usuario, u.estado, r.id_rol, r.nombre_rol AS rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        ORDER BY u.id_usuario ASC";

$result = $conn->query($sql);

$usuarios = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
}

echo json_encode($usuarios);
$conn->close();