<?php
// api/header.php
session_start();
header('Content-Type: application/json; charset=utf-8');

require 'config.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['sucesso' => false, 'erro' => 'Acesso não autorizado! Faça o login.']);
    exit;
}

$admin_id = $_SESSION['admin_id'] ?? 0;
$admin_role = $_SESSION['admin_role'] ?? 'user';
