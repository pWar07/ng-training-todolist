<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cors {
    public function enable_cors() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");

        header("X-Debug-Cors: hook-ran");


        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
