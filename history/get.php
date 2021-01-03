<?php
require("conf.php");

$mysqli = new mysqli($host, $user, $password);
if (mysqli_connect_errno()) {
    printf("Échec de la connexion : %s\n", mysqli_connect_error());
    exit();
}

$history = array();

if ($result = $mysqli->query("SELECT * FROM chess")) {
	$i = 0;
   while ($row = $result->fetch_row()) {
		  $origin = array(intval($row[1]), intval($row[2]), intval($row[3]), intval($row[4]));
		  $destination = array(intval($row[5]), intval($row[6]), intval($row[7]), intval($row[8]));
		  $move = array(origin => $origin, destination => $destination);
		  $history[intval($row[0])] = $move;
   }
	$result->close();
} else printf("Query has failed\n");

$mysqli->close();

$data = json_encode($history);
header('Content-type: application/json');
echo $data;
?>
