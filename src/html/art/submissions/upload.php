<?php
/*
echo '{err:"' . $err . '"}';
exit();
*/

$target_dir = 'uploads/';
$uploadOk = 1;
$errors = [];
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
$target_file = $target_dir . time() . '--' . basename($_FILES["file"]["name"]);

// Check if image file is a actual image or fake image
if(getimagesize($_FILES["file"]["tmp_name"]) !== false) {
    $uploadOk = 1;
} else {
    array_push($errors, "Not a valid image file.");
    $uploadOk = 0;
}

// Check if file already exists
if (file_exists($target_file)) {
    array_push($errors, "File already exists. Maybe try renaming your file.");
    $uploadOk = 0;
}

// Check file size
if ($_FILES["file"]["size"] > 6000000) { // bigger than Javascript max to be on the safe side
    array_push($errors, "File is too large. Maximum upload size is 5MB.");
    $uploadOk = 0;
}

// Allow certain file formats
if (!in_array($imageFileType, ['jpg', 'jpeg', 'png', 'pdf', 'gif'])) {
    array_push($errors, "Sorry, only JPG, JPEG, PNG & GIF files are allowed.");
    $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk) {
    header('Content-type: application/json');
    echo ('{err:"' . implode('<br>', $errors) . '"}');
    exit();
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        //echo "The file ". basename( $_FILES["file"]["name"]). " has been uploaded.";
        header('Content-type: application/json');
        $msg = '{"msg":"The file ' . basename( $_FILES["file"]["name"]) . ' has been uploaded.",';
        $msg .= '"file":"' . $target_file . '",';
        $msg .= '"http_referer":"' . $_SERVER['HTTP_REFERER'] . '"}';
        echo $msg;
    } else {
        header('Content-type: application/json');
        echo '{err: "Sorry, there was an error uploading your file."}';
    }
}
