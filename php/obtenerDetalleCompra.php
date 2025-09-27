<?php
include("conexion.php");

header("Content-Type: application/json; charset=utf-8");

if (!isset($_GET["id"])) {
    echo json_encode(["error" => "Falta parámetro id"], JSON_UNESCAPED_UNICODE);
    exit;
}

$idCompra = intval($_GET["id"]);

$sql = "SELECT d.id_detalles_compra, d.cantidad, d.precioUnitario, d.subTotal,
               r.nombre AS producto, m.medida_bicicleta AS medida, ma.nombre AS marca
        FROM detallescompra d
        INNER JOIN repuesto r ON d.id_repuesto = r.id_repuesto
        INNER JOIN medida m ON r.id_medida = m.id_medida
        INNER JOIN marca ma ON ma.id_marca = r.id_marca
        WHERE d.id_compra = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idCompra);
$stmt->execute();
$result = $stmt->get_result();

$detalles = [];
while ($row = $result->fetch_assoc()) {
    $partes = [$row["producto"]];
    if (!empty($row["medida"])) $partes[] = $row["medida"];
    if (!empty($row["marca"])) $partes[] = $row["marca"];
    $nombreCompleto = implode(" ", $partes);

    $detalles[] = [
        "id_detalle"     => (int)$row["id_detalles_compra"],
        "producto"       => $nombreCompleto,
        "cantidad"       => (int)$row["cantidad"],
        "precio_unitario"=> (float)$row["precioUnitario"],
        "subtotal"       => (float)$row["subTotal"]
    ];
}

echo json_encode($detalles, JSON_UNESCAPED_UNICODE);
$conn->close();
?>

