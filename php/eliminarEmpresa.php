<?php
include "conexion.php"; // tu archivo de conexión

$id = $_POST['id'];

$sql = "UPDATE `empresa` SET `estado` = 'Inactivo' WHERE `empresa`.`id_empresa` = $id";

if ($conn->query($sql) === TRUE) {
    echo "Empresa eliminada correctamente";
} else {
    echo "Error al eliminar: " . $conn->error;
}

$conn->close();
?>
