<?php
include "conexion.php"; // tu archivo de conexión

$id = $_POST['id'];

$sql = "DELETE FROM empresa WHERE id_empresa=$id";

if ($conn->query($sql) === TRUE) {
    echo "Empresa eliminada correctamente";
} else {
    echo "Error al eliminar: " . $conn->error;
}

$conn->close();
?>
