<?php
function conexionMysqli() {
    $host = "localhost";
    $user = "root";
    $pass = "";
    $db   = "dbtallerb";

    $conn = new mysqli($host, $user, $pass, $db);

    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    return $conn;
}
?>