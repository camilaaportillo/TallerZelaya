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
    
   public function enviarCorreoRecuperacion($destinatario, $nombre, $token = '', $codigo_verificacion = null) {
    try {
        $this->mail->clearAddresses();
        $this->mail->addAddress($destinatario, $nombre);
        
        // Obtener la URL base automáticamente
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $base_url = $protocol . '://' . $host . '/tallerZelaya';
        
        $link_recuperacion = $base_url . '/restablecer_password.php?token=' . $token;
        
        if ($codigo_verificacion) {
            $this->mail->Subject = 'Código de Verificación - Taller de Bicicletas Zelaya';
            $body = $this->crearCuerpoCorreoConCodigo($nombre, $link_recuperacion, $codigo_verificacion);
            $this->mail->AltBody = $this->crearCuerpoTextoPlanoConCodigo($nombre, $link_recuperacion, $codigo_verificacion);
        } else {
            $this->mail->Subject = 'Restablecer Contraseña - Taller de Bicicletas Zelaya';
            $body = $this->crearCuerpoCorreoConEnlace($nombre, $link_recuperacion);
            $this->mail->AltBody = $this->crearCuerpoTextoPlanoConEnlace($nombre, $link_recuperacion);
        }
        
        $this->mail->Body = $body;
        
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

// ✅ NUEVO MÉTODO: Cuerpo de email con código
private function crearCuerpoCorreoConCodigo($nombre, $link, $codigo) {
    $expiracion = date('d/m/Y H:i', time() + (5 * 60));
    
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
            .codigo { font-size: 32px; font-weight: bold; text-align: center; background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; color: #333; border: 2px dashed #667eea; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            .link-box { background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 10px 0; }
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
                
                <p>Usa el siguiente código de verificación:</p>
                
                <div class='codigo'>$codigo</div>
                
                <p><strong>Opcional:</strong> También puedes usar este enlace directo:</p>
                <div style='text-align: center;'>
                    <a href='$link' class='btn'>Restablecer Contraseña</a>
                </div>
                
                <div class='link-box'>$link</div>
                
                <div class='warning'>
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>El código expira el: <strong>$expiracion</strong></li>
                        <li>No compartas este código con nadie</li>
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

// ✅ NUEVO MÉTODO: Versión texto plano con código
private function crearCuerpoTextoPlanoConCodigo($nombre, $link, $codigo) {
    $expiracion = date('d/m/Y H:i', time() + (5 * 60));
    
    return "
CÓDIGO DE VERIFICACIÓN - TALLER DE BICICLETAS ZELAYA
=====================================================

Hola $nombre,

Has solicitado restablecer tu contraseña para el sistema del taller.

Tu código de verificación es:

    $codigo

También puedes usar este enlace directo:
$link

INFORMACIÓN IMPORTANTE:
- El código expira el: $expiracion
- No compartas este código con nadie
- Si no solicitaste este cambio, ignora este correo

Saludos cordiales,
El equipo de Taller Zelaya

---------------------------------
Este es un correo automático, no respondas a este mensaje.
© " . date('Y') . " Taller de Bicicletas Zelaya
    ";
}
}
?>