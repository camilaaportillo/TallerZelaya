<?php
function conexionMysqli() {
    $host = "sql309.infinityfree.com";
    $user = "if0_40354505";
    $pass = "JADB894nH2";
    $db   = "if0_40354505_dbtallerb";

    $conn = new mysqli($host, $user, $pass, $db);

    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    return $conn;
}
?>