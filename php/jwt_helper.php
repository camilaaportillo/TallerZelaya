<?php
// php/jwt_helper.php
class JWTHelper {
    private static $secret_key = 'T4ll3rZ3l4y4_2024_B1c1cl3t4s_S3gur0_8x9AyZ2pQ7rKtW5m';
    private static $encrypt_method = 'HS256';

    public static function generarToken($payload) {
        $header = self::base64UrlEncode(json_encode([
            'alg' => self::$encrypt_method,
            'typ' => 'JWT'
        ]));

        $payload['iat'] = time(); // Fecha de emisión
        $payload['exp'] = time() + (5 * 60); // Expira en 5 minutos
        $payload['jti'] = bin2hex(random_bytes(16)); // ID único del token
        
        $payload_encoded = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload_encoded", self::$secret_key, true)
        );

        return "$header.$payload_encoded.$signature";
    }

    public static function verificarToken($token) {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                throw new Exception('Token inválido');
            }

            list($header, $payload, $signature) = $parts;

            // Verificar firma
            $valid_signature = self::base64UrlEncode(
                hash_hmac('sha256', "$header.$payload", self::$secret_key, true)
            );

            if (!hash_equals($signature, $valid_signature)) {
                throw new Exception('Firma inválida');
            }

            $payload_data = json_decode(self::base64UrlDecode($payload), true);

            // Verificar expiración
            if (isset($payload_data['exp']) && $payload_data['exp'] < time()) {
                throw new Exception('Token expirado');
            }

            // Verificar emisión
            if (isset($payload_data['iat']) && $payload_data['iat'] > time()) {
                throw new Exception('Token inválido');
            }

            return $payload_data;

        } catch (Exception $e) {
            error_log("Error JWT: " . $e->getMessage());
            return false;
        }
    }

    public static function invalidarToken($token) {
        // Para mayor seguridad, podrías almacenar tokens invalidados
        // en una tabla blacklist si quieres un nivel extra de seguridad
        return true;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}
?>