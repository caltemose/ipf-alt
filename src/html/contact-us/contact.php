<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require '_config.php';

// get POST data
$visitorName = Trim(stripslashes($_POST['name']));
$visitorEmail = Trim(stripslashes($_POST['email']));
$recipient = Trim(stripslashes($_POST['recipient']));
$message = stripslashes($_POST['message']);

// HONEYPOT
$email_address = Trim(stripslashes($_POST['email_address']));
if ($email_address !== '') {
    header('Content-Type: application/json');
    echo '{"success": "not-really"}';
    exit;
}

// validation flag
$valid=true;

$errors = array(
    "name"=>true,
    "email"=>true,
    "recipient"=>true,
    "message"=>true
);

// this is only used for testing.
$success = array(
    "name"=>true,
    "email"=>true,
    "recipient"=>true,
    "message"=>true
);

if ($visitorName === '') {
    $valid = false;
    $errors["name"] = false;
} else {
    $success["name"] = $visitorName;
}

if ($visitorEmail === '') {
    $valid = false;
    $errors["email"] = false;
} else {
    $success["email"] = $visitorEmail;
}

if ($recipient === '') {
    $valid = false;
    $errors["recipient"] = false;
} else {
    $success["recipient"] = $recipient;
}

if ($message === '') {
    $valid = false;
    $errors["message"] = false;
} else {
    $success["message"] = $message;
}

$spam = false;

function isSpam ($email) {
  $spam = false;
  /*
    supplement this list with addition regular expressions as needed.
    it may not be pretty but it helps prevent garbage.
   */
  $expressions = array(
    '/\.ru$/i',
    '/profunding247/i',
    '/businessfunding247/i',
    '/findfastbusinessfunds/i',
    '/getmybusinessfundednow/i'
  );
  foreach($expressions as $regex) {
    if (preg_match($regex, $email)) {
      $spam = true;
      break;
    }
  }
  return $spam;
}

function isSpamBody ($body) {
  return strpos($body, 'r.php?url=inmanparkfestival.org');
}

if (isSpam($visitorEmail)) {
    $spam = true;
    $valid = false;
    $errors['spam'] = 'probs1';
}

if (isSpamBody($msg)) {
    $spam = true;
    $valid = false;
    $errors['spam'] = 'probs2';
}

if (!$valid) {
    $res = '{"err":' . json_encode($errors) . '}';
    header("HTTP/1.0 400 Bad Request");
    header('Content-Type: application/json');
    echo $res;
    exit;
}

// determine true recipient(s)
$recipientList = '';
switch($recipient) {
    case 'chair':
        $recipientList = 'festival@inmanparkfestival.org';
        break;
    case 'dance':
        $recipientList = 'dance@inmanparkfestival.org';
        break;
    case 'market':
        $recipientList = 'vendors@inmanparkfestival.org';
        break;
    case 'parade':
        $recipientList = 'parade@inmanparkfestival.org';
        break;
    case 'food':
        $recipientList = 'food.vendors@inmanparkfestival.org';
        break;
    case 'music':
        $recipientList = 'entertainment@inmanparkfestival.org';
        break;
    case 'toh':
        $recipientList = 'tickets@inmanparkfestival.org';
        break;
    case 'sponsors':
        $recipientList = 'sponsors@inmanparkfestival.org';
        break;
    case 'volunteers':
        $recipientList = 'volunteer@inmanparkfestival.org';
        break;
    case 'marketing':
        $recipientList = 'advertising@inmanparkfestival.org';
        break;
    case 'support':
        $recipientList = 'support@inmanparkfestival.org';
        break;
    default:
        $recipientList = 'festival@inmanparkfestival.org';
}

$messageStart = "Email sent from the website contact form from:";

$messageBodyTxt = $messageStart . "\n";
$messageBodyTxt .= $visitorName . ' - ' . $visitorEmail . "\n\n";
$messageBodyTxt .= $message;

$messageBodyHTML = $messageStart . '<br>';
$messageBodyHTML .= $visitorName . ' - ' . $visitorEmail . '<br><br>';
$messageBodyHTML .= $message;

$mail = new PHPMailer(true);

try {
    $mail->SMTPDebug = SMTP::DEBUG_OFF; // DEBUG_CLIENT;
    $mail->SMTPAuth = true;
    $mail->isSMTP();
    $mail->Host = 'email-smtp.us-east-1.amazonaws.com';
    $mail->Username = $smtpUsername; // from _config
    $mail->Password = $smtpPassword; // from _config
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('admin@inmanparkfestival.org', 'Festival Admin');
    // $mail->addAddress('support@inmanparkfestival.org', 'IPF Staff: Sponsors');
    $mail->addAddress($recipientList);
    $mail->addReplyTo($visitorEmail, $visitorName);
    $mail->isHTML(true);
    $mail->Subject = 'Email from Festival Contact Form';
    $mail->Body = $messageBodyHTML; //'Email from form in HTML';
    $mail->AltBody = $messageBodyTxt; //'Email from form in text';

    $mail->send();

    $success["result"] = true;
    $success["recipientList"] = $recipientList;

    $res = json_encode($success);
    header('Content-Type: application/json');
    echo $res;

} catch (Exception $e) {
    // handle message not sent
    $success["result"] = false;
    $success["error"] = $mail->ErrorInfo;
    $res = json_encode($success);
    header('Content-Type: application/json');
    echo $res;
}


