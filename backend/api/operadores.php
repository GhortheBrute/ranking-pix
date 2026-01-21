<?php
// api/operadores.php
header("Content-Type: application/json; charset=UTF-8");
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. LISTAR OPERADORES (GET)
if ($method === 'GET') {
    // Traz todos, ordenados por nome
    $stmt = $pdo->query("SELECT * FROM operadores ORDER BY nome ASC");
    $operadores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($operadores);
    exit;
}

// 2. CRIAR OU ATUALIZAR (POST)
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'erro' => 'Dados inválidos']);
        exit;
    }

    try {
        // Ação: TOGGLE STATUS (Ativar/Desativar)
        if (isset($data->acao) && $data->acao === 'toggle_status') {
            $sql = "UPDATE operadores SET valido = NOT valido WHERE matricula = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->matricula]);
            echo json_encode(['sucesso' => true]);
            exit;
        }

        // Ação: SALVAR (Insert ou Update)
        // Se vier "is_edit", fazemos UPDATE. Senão, INSERT.
        if (isset($data->is_edit) && $data->is_edit === true) {
            // Atualiza Nome e Apelido
            $sql = "UPDATE operadores SET nome = ?, apelido = ? WHERE matricula = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->nome, $data->apelido, $data->matricula]);
        } else {
            // Cria Novo (Matrícula deve ser única)
            $sql = "INSERT INTO operadores (matricula, nome, apelido, valido) VALUES (?, ?, ?, 1)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->matricula, $data->nome, $data->apelido]);
        }

        echo json_encode(['sucesso' => true]);

    } catch (PDOException $e) {
        // Erro comum: Matrícula duplicada (código 23000)
        if ($e->getCode() == 23000) {
            echo json_encode(['sucesso' => false, 'erro' => 'Esta matrícula já está cadastrada.']);
        } else {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
        }
    }
    exit;
}
?>