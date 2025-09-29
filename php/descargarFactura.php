<?php
// descarga segura de la imagen
include("conexion.php");

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo "ID inválido";
    exit;
}

// Buscar la factura en la BD
$sql = "SELECT facturaImagen FROM compra WHERE id_compra = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row || empty($row["facturaImagen"])) {
    http_response_code(404);
    echo "Factura no encontrada";
    exit;
}

$fileName = $row["facturaImagen"];
// Nota: subimos un nivel para salir de /php y entrar a /facturas
$filePath = dirname(__DIR__) . "/facturas/" . $fileName;

if (!file_exists($filePath)) {
    http_response_code(404);
    echo "Archivo no encontrado en: $filePath";
    exit;
}

// Enviar cabeceras y archivo
$mime = mime_content_type($filePath);
header("Content-Type: $mime");
header("Content-Disposition: attachment; filename=\"$fileName\"");
header("Content-Length: " . filesize($filePath));
readfile($filePath);
exit;
