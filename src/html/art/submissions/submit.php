<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/*
// INACTIVE FORM - - - - - - - - - - - - - - - - - - - - - - - - 
echo '{err:"' . $err . '"}';
exit();
*/


// ACTIVE FORM - - - - - - - - - - - - - - - - - - - - - - - - - 

function sendError ($err) {
    header('Content-type: application/json');
    echo '{err:"' . $err . '"}';
    exit();
}

function cleanInput ($input) {
    return filter_var($input, FILTER_SANITIZE_STRING);
}

$target_dir = "uploads/";

$json = file_get_contents('php://input');
$post_data = json_decode($json);

$artistName = cleanInput($post_data->artistName);
$artistPhone = cleanInput($post_data->artistPhone);
$artistEmail = cleanInput($post_data->artistEmail);
$images = $post_data->images;

$validPhone = false;
$validEmail = false;


/*
stdClass Object ( 
    [artistName] => Chad Altemose
    [artistPhone] => 4045634039
    [artistEmail] => chad@chadzilla.com
    [images] => Array (
        [0] => http://inmanparkfestival.org/art/submissions/uploads/1569583390--is-near-death9.png 
    ) 
)
*/


if (!isset($artistName) || strlen($artistName) < 2) {
  sendError("You must supply a valid name.");
}

if (!isset($images) || count($images) < 1) {
  sendError("You must submit at least one image.");
}

if (isset($artistPhone) && strlen($artistPhone) > 9) {
  $validPhone = true;
}

if (isset($artistEmail) && strlen($artistEmail) > 5) {
  $validEmail = true;
}

if (!$validPhone || !$validEmail) {
  sendError("You must supply a valid phone number or email address.");
}

$emailMsg = "Art submitted:" . "\n" . "\n";
$emailMsg .= 'Name: ' . $artistName . "\n";
$emailMsg .= 'Phone: ' . $artistPhone . "\n";
$emailMsg .= 'Email: ' . $artistEmail . "\n";
$emailMsg .= "\n";
$emailMsg .= "Files:\n";
for($i=0; $i<count($images); $i++) {
  $emailMsg .= $images[$i] . "\n";
}

require '../../contact-us/vendor/autoload.php';
use Mailgun\Mailgun;
require '../../contact-us/_config.php';

# Instantiate the client.
$mgClient = new Mailgun($mailgunKey);
$domain = "inmanparkfestival.org";

# Make the call to the client.
$result = $mgClient->sendMessage($domain, array(
    'from'    => 'Site Admin' . ' <' . 'support@inmanparkfestival.org' . '>',
    'to'      => 'chad@chadzilla.com', 
    'subject' => 'Email from Festival Contact Form',
    'text'    => $emailMsg
));
//,ipnamarketing@gmail.com',  

$success["result"] = $result;
$res = json_encode($success);

header('Content-type: application/json');
echo $res;
