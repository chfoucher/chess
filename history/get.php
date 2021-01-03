<?php
$test = array('a');

$data = '{"data": [{"origin": {"r": 1, "c": 2}, "destination": {"origin": 4, "destination": 3}}]}';
header('Content-type: application/json');
echo $data;
?>
