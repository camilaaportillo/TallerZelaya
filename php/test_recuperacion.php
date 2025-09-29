<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Test simple funcionando<br>";

// Test básico
$test_data = ['accion' => 'test', 'correo' => 'test@test.com'];
echo "Datos: " . json_encode($test_data) . "<br>";
echo "✅ Script ejecutándose correctamente";
?>