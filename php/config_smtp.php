<?php
// php/config_smtp.php
// CONFIGURACIÓN SMTP CON GMAIL - TALLER ZELAYA
// ============================================

// DATOS DE LA CUENTA GMAIL DEL SISTEMA
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USERNAME', 'tallerzelaya104@gmail.com'); // tu email
define('SMTP_PASSWORD', 'bjtq htae aebh fqds'); // tu contraseña de aplicación
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');

// CONFIGURACIÓN DEL REMITENTE
define('EMAIL_FROM', 'tallerzelaya104@gmail.com'); // Mismo que SMTP_USERNAME
define('NOMBRE_FROM', 'Taller de Bicicletas Zelaya');

return [
    'host' => SMTP_HOST,
    'usuario' => SMTP_USERNAME,
    'password' => SMTP_PASSWORD,
    'puerto' => SMTP_PORT,
    'seguro' => SMTP_SECURE,
    'email_from' => EMAIL_FROM,
    'nombre_from' => NOMBRE_FROM
];
?>