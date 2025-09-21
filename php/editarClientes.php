<?php
include "conexion.php";

// Validar si llegaron los datos
if (!isset($_POST['id_cliente']) || !isset($_POST['nombre'])) {
    echo json_encode(["status" => "error", "mensaje" => "Datos incompletos"]);
    exit;
}

$id = intval($_POST['id_cliente']);
$nombre = mysqli_real_escape_string($conn, $_POST['nombre']);
$telefono = isset($_POST['telefono']) && $_POST['telefono'] !== "" ? mysqli_real_escape_string($conn, $_POST['telefono']) : null;
$correo = isset($_POST['correo']) && $_POST['correo'] !== "" ? mysqli_real_escape_string($conn, $_POST['correo']) : null;

// Evitar duplicados en nombre
$sql_check = "SELECT id_cliente FROM cliente WHERE nombre = '$nombre' AND id_cliente != $id";
$result_check = mysqli_query($conn, $sql_check);

if (mysqli_num_rows($result_check) > 0) {
    echo json_encode(["status" => "error", "mensaje" => "Ya existe un cliente con ese nombre"]);
    exit;
}

// Actualizar cliente
$sql = "UPDATE cliente 
        SET nombre = '$nombre', 
            telefono = " . ($telefono ? "'$telefono'" : "NULL") . ", 
            correo = " . ($correo ? "'$correo'" : "NULL") . " 
        WHERE id_cliente = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Cliente actualizado correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo actualizar el cliente"]);
}

exit;
?>
