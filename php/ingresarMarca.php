<?php 
include "conexion.php";

$nombre = $_POST['nombre'];


$sql = "INSERT INTO marca (nombre, estado) 
        VALUES ('$nombre', 1)";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(["status" => "exito", "mensaje" => "Marca ingresada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al ingresar: " . $conn->error]);
}

exit;
?>
