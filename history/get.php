<?php
$origin = array(1, 2);
$destination = array(4, 3);
$move = array(origin => $origin, destination => $destination);
$history = array();
$history[0] = $move;
$origin = array(7, 0);
$destination = array(6, 4);
$move = array(origin => $origin, destination => $destination);
$history[1] = $move;

$data = json_encode($history);
header('Content-type: application/json');
echo $data;
?>
