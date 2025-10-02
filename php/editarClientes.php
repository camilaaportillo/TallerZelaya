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
    echo json_encode(["status" => "duplicado", "mensaje" => "Ya existe un cliente con ese nombre"]);
    exit;
}

// Construir la consulta UPDATE correctamente para valores NULL
$sql = "UPDATE cliente SET nombre = '$nombre'";

// Agregar teléfono (manejar NULL correctamente)
if ($telefono !== null) {
    $sql .= ", telefono = '$telefono'";
} else {
    $sql .= ", telefono = NULL";
}

// Agregar correo (manejar NULL correctamente)
if ($correo !== null) {
    $sql .= ", correo = '$correo'";
} else {
    $sql .= ", correo = NULL";
}

$sql .= " WHERE id_cliente = $id";

// Ejecutar la consulta
if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Cliente actualizado correctamente"]);
} else {
    // Para debugging - mostrar el error real
    echo json_encode(["status" => "error", "mensaje" => "Error en la base de datos: " . mysqli_error($conn)]);
}

exit;
?>