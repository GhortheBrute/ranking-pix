<?php
require 'header.php';

$method = $_SERVER['REQUEST_METHOD'];

// 1. LISTAR REGRAS (GET)
if ($method === 'GET') {
    // Traz todos, ordenados por criado_em
    $stmt = $pdo->query("SELECT * FROM regras_modelos ORDER BY criado_em DESC");
    $regras = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($regras);
    exit;
}

// 2. CRIAR OU ATUALIZAR (POST)
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if(!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dados Inválidos!']);
        exit;
    }

    try {
        // Ação: TOGGLE STATUS
        if (isset($data->acao) && $data->acao == 'toggle_status') {
            $sql = "UPDATE regras_modelos SET ativo = NOT ativo WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->id]);
            logAdmin($pdo, $_SESSION['admin_id'], 'toggle_regra', ['alvo' => $data->nome]);
            echo json_encode(['success' => true]);
            exit;
        }

        // Tratamento do JSON de Regras
        $regrasJSON = $data->regras;
        if (!is_string($regrasJSON)) {
            $regrasJSON = json_encode($regrasJSON);
        }

        // Ação: SALVAR (Insert ou Update)
        // Se vier "is_edit", fazemos UPDATE. Senão, INSERT.
        if (isset($data->is_edit) && $data->is_edit === true) {
            // Atualiza Nome e Apelido
            $sql = "UPDATE regras_modelos SET nome = ?, regras = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->nome, $regrasJSON, $data->id]);
            logAdmin($pdo, $_SESSION['admin_id'], 'atualizar_regra', ['alvo' => $data->nome]);
        } else {
            // Cria Novo
            $sql = "INSERT INTO regras_modelos ( nome, regras, ativo) VALUES ( ?, ?, 1)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->nome, $regrasJSON]);
            logAdmin($pdo, $_SESSION['admin_id'], 'criar_regra', ['alvo' => $data->nome]);
        }

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['sucesso' => false, 'erro' => 'Já existe um registro com esse nome.']);
        }
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}