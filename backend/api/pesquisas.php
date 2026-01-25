<?php
require 'header.php';

$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);
$method = $_SERVER['REQUEST_METHOD'];

try {
    if (!isset($pdo)) {
        $pdo = new PDO($dsn, $user, $pass, $options);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro de conexão: " . $e->getMessage()]);
    exit;
}

if ($method === 'GET') {
    $torneio_id = $_GET['torneio_id'] ?? null;

    // Se não tem ID, lista todos os torneios ativos
    if(!$torneio_id) {
        $hoje = date("Y-m-d");

        // Busca torneios ativos, ordenados por data DESC
        $sql = "SELECT id, nome, data_inicio, data_fim
                FROM torneios
                WHERE ativo = 1
                ORDER BY data_inicio DESC";
        $stmt = $pdo->query($sql);
        $torneios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Separa que é "Vigente" (acontecendo agora)
        $resposta = [
            'vigente' => null,
            'outros' => []
        ];

        foreach ($torneios as $t) {
            // Vigente é aquele em que hoje está entre as datas início e fim
            if (!$resposta['vigente'] && $hoje >=$t['data_inicio'] && $hoje <= $t['data_fim']) {
                $resposta['vigente'] = $t;
            } else {
                $resposta['outros'][] = $t;
            }
        }

        echo json_encode($resposta);
        exit;
    }

    // Se tem ID, carrega os detalhes
    if ($torneio_id) {
        // Dados do Torneio
        $stmt = $pdo->prepare("SELECT id, nome FROM torneios WHERE id = ?");
        $stmt->execute([$torneio_id]);
        $torneio = $stmt->fetch(PDO::FETCH_ASSOC);

        // Operadores disponíveis para DROPDOWN - Apenas validos
        $stmtOp = $pdo->query("SELECT matricula, nome FROM operadores WHERE valido = 1");
        $operadores = $stmtOp->fetchAll(PDO::FETCH_ASSOC);

        // Pesquisas já lançadas neste torneio
        $sqlPesq = "SELECT p.operador AS matricula, p.qtd_pesquisa AS quantidade, o.nome
                    FROM rank_pesquisa p 
                    LEFT JOIN operadores o ON p.operador = o.matricula
                    WHERE p.torneio_id = ?
                    ORDER BY o.nome";
        $stmtPesq = $pdo->prepare($sqlPesq);
        $stmtPesq->execute([$torneio_id]);
        $lancamentos = $stmtPesq->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'torneio' => $torneio,
            'operadores' => $operadores,
            'lancamentos' => $lancamentos
        ]);
        exit;
    }
}


if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'));

    if (!$data || !isset($data->torneio_id) || !isset($data->itens)) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'erro' => 'Dados incompletos']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $torneio_id = $data->torneio_id;
        $itens = $data->itens;

        $ids_para_manter = [];

        foreach ($itens as $i) {
            $matricula = $i->matricula;
            $ids_para_manter[] = $matricula;

            $sql = "INSERT INTO rank_pesquisa (torneio_id, operador, qtd_pesquisa)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE qtd_pesquisa = VALUES(qtd_pesquisa)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$torneio_id, $matricula, $i->quantidade]);
        }

        if (!empty($ids_para_manter)) {
            $inQuery = implode(',', array_fill(0, count($ids_para_manter), '?'));
            $sqlDelete = "DELETE FROM rank_pesquisa WHERE torneio_id = ? AND operador NOT IN ($inQuery)";
            array_unshift($ids_para_manter, $torneio_id);
            $stmtDelete = $pdo->prepare($sqlDelete);
            $stmtDelete->execute($ids_para_manter);
        } else {
            $stmtDelete = $pdo->prepare("DELETE FROM rank_pesquisa WHERE torneio_id = ?");
            $stmtDelete->execute([$torneio_id]);
        }

        $admin_id = $_SESSION['admin_id'] ?? 0;
        logAdmin($pdo, $admin_id, 'atualizar_pesquisas', ["ID" => $torneio_id ]);

        $pdo->commit();
        echo json_encode(['sucesso' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
    }
}
?>