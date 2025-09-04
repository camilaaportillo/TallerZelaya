<?php
header('Content-Type: application/json; charset=UTF-8');
include "conexion.php";

$estado = isset($_GET['estado']) ? $_GET['estado'] : null;
$filtrar = in_array($estado, ['Activo','Inactivo'], true);

$sql = "SELECT 
            u.id_usuario, 
            u.nombre, 
            u.correo, 
            u.usuario, 
            u.estado, 
            u.id_rol, 
            r.nombre_rol AS rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol" ;

if ($filtrar) {
    $sql .= " WHERE u.estado = ?";
}
$sql .= " ORDER BY u.id_usuario DESC";

$stmt = $conn->prepare($sql);
if ($filtrar) {
    $stmt->bind_param("s", $estado);
}
$stmt->execute();
$result = $stmt->get_result();

$usuarios = [];
while ($row = $result->fetch_assoc()) {
    $usuarios[] = $row;
}

echo json_encode($usuarios);
$stmt->close();
$conn->close();
