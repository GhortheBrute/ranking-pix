<?php
header("Content-Type: application/json; charset=UTF-8");
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Listar Torneios
if ($method === 'GET') {
    // Traz todos, ordenados por criado_em
    $stmt = $pdo->query("SELECT t.*, r.nome as nome_regra
                                FROM torneios t
                                LEFT JOIN regras_modelos r ON t.regra_id = r.id
                                ORDER BY t.data_inicio DESC");
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
        // Validação de datas
        if ($data->data_fim < $data->data_inicio){
            echo json_encode(['success' => false, 'error' => 'A data final não pode ser anterior a data de início.']);
            exit;
        }

        // Ação: TOGGLE STATUS
        if (isset($data->acao) && $data->acao == 'toggle_status') {
            $sql = "UPDATE torneios SET ativo = NOT ativo WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->id]);
            echo json_encode(['success' => true, 'message' => 'Status alterado com sucesso!']);
            exit;
        }

        // Ação: SALVAR (Insert ou Update)
        // Se vier "is_edit", fazemos UPDATE. Senão, INSERT.
        if (isset($data->is_edit) && $data->is_edit === true) {
            // Atualiza Nome e Apelido
            $sql = "UPDATE torneios 
                    SET nome = ?, data_inicio=?, data_fim=?, regras_id = ? 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data->nome,
                $data->data_inicio,
                $data->data_fim,
                $data->regras_id,
                $data->id
            ]);
            logAdmin($pdo, $data->admin_id, 'atualizar_torneio', ['alvo' => $data->nome]);
        } else {
            // Cria Novo
            $sql = "INSERT INTO torneios ( nome, data_inicio, data_fim, regras_id) VALUES ( ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data->nome,
                $data->data_inicio,
                $data->data_fim,
                $data->regras_id
            ]);
            logAdmin($pdo, $data->admin_id, 'criar_torneio', ['alvo' => $data->nome]);
        }

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['sucesso' => false, 'erro' => 'Já existe um registro com esse nome.']);
        }
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}