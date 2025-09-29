<?php
header('Content-Type: application/json; charset=utf-8');
include("conexion.php");

// Verificar si se envió el id
if (!isset($_GET["id"])) {
    echo json_encode(["error" => "No se proporcionó un id de compra"]);
    exit;
}

$id_compra = $_GET["id"];

// Consulta para obtener la compra, empresa, proveedor y usuario
$sqlCompra = "SELECT c.id_compra, c.precio, c.fecha, c.facturaImagen,
                     p.nombre AS proveedor, p.telefono AS proveedor_telefono, p.correo AS proveedor_correo,
                     e.nombre AS empresa, e.correo AS empresa_correo, e.telefono AS empresa_telefono,
                     u.nombre AS usuario
              FROM compra c
              INNER JOIN proveedor p ON c.id_proveedor = p.id_proveedor
              INNER JOIN empresa e ON p.id_empresa = e.id_empresa
              INNER JOIN usuario u ON c.id_usuario = u.id_usuario
              WHERE c.id_compra = ?";

$stmt = $conn->prepare($sqlCompra);
$stmt->bind_param("i", $id_compra);
$stmt->execute();
$result = $stmt->get_result();
$compra = $result->fetch_assoc();

if (!$compra) {
    echo json_encode(["error" => "Compra no encontrada"]);
    exit;
}

// Consulta para los detalles
$sqlDetalles = "SELECT d.cantidad, d.precioUnitario, d.subTotal,
                       r.codigo, r.nombre AS repuesto
                FROM detallescompra d
                INNER JOIN repuesto r ON d.id_repuesto = r.id_repuesto
                WHERE d.id_compra = ?";
$stmt = $conn->prepare($sqlDetalles);
$stmt->bind_param("i", $id_compra);
$stmt->execute();
$result = $stmt->get_result();

$detalles = [];
while ($row = $result->fetch_assoc()) {
    $detalles[] = $row;
}

// Respuesta en JSON
echo json_encode([
    "compra" => $compra,
    "detalles" => $detalles
], JSON_UNESCAPED_UNICODE);

$conn->close();
?>
