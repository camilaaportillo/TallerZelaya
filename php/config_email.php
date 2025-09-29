<?php
// php/config_email.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// RUTAS CORRECTAS para PHPMailer
if (file_exists(__DIR__ . '/phpmailer/src/Exception.php')) {
    require __DIR__ . '/phpmailer/src/Exception.php';
    require __DIR__ . '/phpmailer/src/PHPMailer.php';
    require __DIR__ . '/phpmailer/src/SMTP.php';
} else if (file_exists(__DIR__ . '/../phpmailer/src/Exception.php')) {
    require __DIR__ . '/../phpmailer/src/Exception.php';
    require __DIR__ . '/../phpmailer/src/PHPMailer.php';
    require __DIR__ . '/../phpmailer/src/SMTP.php';
} else {
    throw new Exception('No se pudo encontrar PHPMailer');
}

class ConfigEmail {
    private $mail;
    
    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->configurar();
    }
    
    private function configurar() {
        try {
            // Cargar configuración SMTP
            $config = include 'config_smtp.php';
            
            // Configuración del servidor
            $this->mail->isSMTP();
            $this->mail->Host = $config['host'];
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $config['usuario'];
            $this->mail->Password = $config['password'];
            $this->mail->SMTPSecure = $config['seguro'];
            $this->mail->Port = $config['puerto'];
            
            // Configuración del remitente
            $this->mail->setFrom($config['email_from'], $config['nombre_from']);
            $this->mail->isHTML(true);
            
            // Configuraciones para mejor compatibilidad
            $this->mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
            // Timeout más largo
            $this->mail->Timeout = 30;
            
        } catch (Exception $e) {
            error_log("Error configurando PHPMailer: " . $e->getMessage());
            throw new Exception("Error en configuración de email: " . $e->getMessage());
        }
    }
    
   public function enviarCorreoRecuperacion($destinatario, $nombre, $token) {
    try {
        $this->mail->clearAddresses();
        $this->mail->addAddress($destinatario, $nombre);
        
        $this->mail->Subject = 'Restablecer Contraseña - Taller de Bicicletas Zelaya';
        
        // Obtener la URL base automáticamente
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $base_url = $protocol . '://' . $host . '/tallerZelaya';
        
        // Cambiar a .php
        $link_recuperacion = $base_url . '/restablecer_password.php?token=' . $token;
        
        error_log("🔗 Enlace PHP generado: " . $link_recuperacion);
        
        $body = $this->crearCuerpoCorreoConEnlace($nombre, $link_recuperacion);
        $this->mail->Body = $body;
        $this->mail->AltBody = $this->crearCuerpoTextoPlanoConEnlace($nombre, $link_recuperacion);
        
        if ($this->mail->send()) {
            error_log("✅ Correo enviado exitosamente a: $destinatario");
            return true;
        } else {
            error_log("❌ Error PHPMailer: " . $this->mail->ErrorInfo);
            return false;
        }
        
    } catch (Exception $e) {
        error_log("💥 Exception enviando correo: " . $e->getMessage());
        return false;
    }
}

   private function crearCuerpoCorreoConEnlace($nombre, $link) {
    $fecha = date('d/m/Y H:i');
    $expiracion = date('d/m/Y H:i', time() + (15 * 60));
    
    return "
    <!DOCTYPE html>
    <html lang='es'>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; border: none; cursor: pointer; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            .link-box { background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🔧 Taller de Bicicletas Zelaya</h1>
                <p>Restablecimiento de Contraseña</p>
            </div>
            <div class='content'>
                <h2>Hola $nombre,</h2>
                <p>Has solicitado restablecer tu contraseña para el sistema del taller.</p>
                
                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                
                <div style='text-align: center;'>
                    <a href='$link' class='btn'>Restablecer Contraseña</a>
                </div>
                
                <p>O copia y pega este enlace en tu navegador:</p>
                <div class='link-box'>$link</div>
                
                <div class='warning'>
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este enlace expirará el: <strong>$expiracion</strong></li>
                        <li>No compartas este enlace con nadie</li>
                        <li>Si no solicitaste este cambio, ignora este correo</li>
                    </ul>
                </div>
                
                <p>Saludos cordiales,<br><strong>El equipo de Taller Zelaya</strong></p>
            </div>
            <div class='footer'>
                <p>Este es un correo automático, no respondas a este mensaje</p>
                <p>© " . date('Y') . " Taller de Bicicletas Zelaya</p>
            </div>
        </div>
    </body>
    </html>
    ";
}
    
    // ✅ AÑADE ESTE MÉTODO QUE FALTABA
    private function crearCuerpoTextoPlanoConEnlace($nombre, $link) {
        $expiracion = date('d/m/Y H:i', time() + (5 * 60));
        
        return "
RESTABLECER CONTRASEÑA - TALLER DE BICICLETAS ZELAYA
====================================================

Hola $nombre,

Has solicitado restablecer tu contraseña para el sistema del taller.

Para crear una nueva contraseña, visita el siguiente enlace:

$link

IMPORTANTE:
- Este enlace expirará el: $expiracion
- No compartas este enlace con nadie
<li><strong>⏰ Tienes solo 5 minutos para usarlo</strong></li>
- Si no solicitaste este cambio, ignora este correo

Saludos cordiales,
El equipo de Taller Zelaya

---------------------------------
Este es un correo automático, no respondas a este mensaje.
        ";
    }
}
?>