<?php
    $host = "sql309.infinityfree.com";
    $user = "if0_40354505";
    $pass = "JADB894nH2";
    $db   = "if0_40354505_dbtallerb";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>