<?php
require("conf.php");

$mysqli = new mysqli($host, $user, $password);
if (mysqli_connect_errno()) {
    printf("Échec de la connexion : %s\n", mysqli_connect_error());
    exit();
}

$history = array();
$request = "INSERT INTO `chess` (
    `index` ,
    `origCol` ,
    `origRow` ,
    `origType` ,
    `origBlack` ,
    `destCol` ,
    `destRow` ,
    `destType` ,
    `destBlack`
    )
    VALUES ('0', '1', '2', '1', '0', '6', '5', '1', '1')";

if ($result = $mysqli->query($request) {
    $result->close();
    $status = "success";
} else $status = "Query has failed";

$mysqli->close();

header('Content-type: application/json');
echo json_encode(array("status" => $status));
?>
