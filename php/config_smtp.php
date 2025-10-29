<?php
// php/config_smtp.php
// CONFIGURACIÓN SMTP CON GMAIL - TALLER ZELAYA
// ============================================

// Verificar si las constantes ya están definidas
if (!defined('SMTP_HOST')) {
    define('SMTP_HOST', 'smtp.gmail.com');
    define('SMTP_USERNAME', 'tallerzelaya104@gmail.com');
    define('SMTP_PASSWORD', 'bjtq htae aebh fqds');
    define('SMTP_PORT', 587);
    define('SMTP_SECURE', 'tls');
    define('EMAIL_FROM', 'tallerzelaya104@gmail.com');
    define('NOMBRE_FROM', 'Taller de Bicicletas Zelaya');
}

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