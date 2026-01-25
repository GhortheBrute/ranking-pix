<?php
// api/logs.php
require 'header.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. LISTAR LOGS (GET)
if ($method === 'GET') {
    // Traz todos, ordenados por data, limitados a 100 registros
    $stmt = $pdo->query("SELECT l.*, u.username as usuario_nome
                                FROM logs l
                                LEFT JOIN usuarios u ON l.usuario_id = u.id
                                ORDER BY data DESC LIMIT 100");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);
    exit;
}
?>