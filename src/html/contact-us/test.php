<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require '_config.php';

$mail = new PHPMailer(true);

try {
    // DEBUG_CLIENT, DEBUG_SERVER, DEBUG_OFF
    $mail->SMTPDebug = SMTP::DEBUG_CLIENT;
    $mail->SMTPAuth = true;
    $mail->isSMTP();
    $mail->Host = 'email-smtp.us-east-1.amazonaws.com';
    $mail->Username = $smtpUsername; // from _config
    $mail->Password = $smtpPassword; // from _config
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('admin@inmanparkfestival.org', 'Festival Admin');
    $mail->addAddress('support@inmanparkfestival.org', 'IPF Staff: Sponsors');
    $mail->isHTML(true);
    $mail->Subject = 'Initial test with smtp + php';
    $mail->Body = 'This is a test email with some <strong>html</strong>';
    $mail->AltBody = 'This is a test email without html';

    $mail->send();

} catch (Exception $e) {
    echo "Message not sent: {$mail->ErrorInfo}";
}

