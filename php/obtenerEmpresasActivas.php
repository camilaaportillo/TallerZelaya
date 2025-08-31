<?php
include "conexion.php";

$sql = "SELECT id_empresa, nombre FROM empresa WHERE estado = 1"; 
$result = mysqli_query($conn, $sql);

$empresas = [];
while ($row = mysqli_fetch_assoc($result)) {
    $empresas[] = $row;
}

echo json_encode($empresas);
exit;
?>
