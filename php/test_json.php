<?php
header('Content-Type: application/json; charset=utf-8');

// Fuerza salida de JSON
echo json_encode([
    "status" => "exito",
    "mensaje" => "Prueba JSON OK"
]);
