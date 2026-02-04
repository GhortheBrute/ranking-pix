<?php
require_once './config.php';
header('Content-Type: application/json');

$json = file_get_contents("php://input");

$data = json_decode($json, true);

$matricula = $data["matricula"] ?? null;
$startDate = $data["startDate"] ?? null;
$endDate = $data["endDate"] ?? null;
$torneioId = $data["torneioId"] ?? null;

function iniciarDia(&$mapa, $data): void
{
    if (!isset($mapa[$data])) {
        $mapa[$data] = [
            'data' => $data,
            'pix' => ['qtd' => 0, 'valor' => 0.00],
            'recarga' => ['qtd' => 0, 'valor' => 0.00]
        ];
    }
}

try {
    $mapaHistorico = [];

    $sqlPIX = "SELECT rp.data,
                COUNT(rp.transacao) AS qtd_pix,
                SUM(rp.valor_pix) AS valor_pix
                FROM rank_pix rp
                WHERE rp.operador = :matricula
                AND rp.data >= :startDate AND rp.data <= :endDate
                GROUP BY rp.data
";
    $stmt = $pdo->prepare($sqlPIX);
    $stmt->execute([':matricula' => $matricula, ':startDate' => $startDate, ':endDate' => $endDate]);
    $pixResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sqlRec = "SELECT rr.data,
                rr.operador,
                SUM(rr.qtd_recarga) AS qtd_recarga,
                SUM(rr.valor_recarga) AS valor_recarga
                FROM rank_recarga rr
                WHERE rr.operador = :matricula
                AND rr.data >= :startDate AND rr.data <= :endDate
                GROUP BY rr.data
";
    $stmt = $pdo->prepare($sqlRec);
    $stmt->execute([':matricula' => $matricula, ':startDate' => $startDate, ':endDate' => $endDate]);
    $recResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sqlRegras = "SELECT rm.regras
                    FROM rank_regras rm
                    LEFT JOIN rank_torneios t ON t.regra_id = rm.id
                    WHERE t.id = :torneio_id
";
    $stmt = $pdo->prepare($sqlRegras);
    $stmt->execute([':torneio_id' => $torneioId]);
    $regrasResults = $stmt->fetchColumn();
    $regrasJSON = $regrasResults ? json_decode($regrasResults, true) : null;

    foreach ($pixResults as $rows) {
        $data = $rows['data'];
        iniciarDia($mapaHistorico, $data);

        $mapaHistorico[$data]['pix']['qtd'] = (int)$rows['qtd_pix'];
        $mapaHistorico[$data]['pix']['valor'] = (int)$rows['valor_pix'];
    }

    foreach ($recResults as $rows) {
        $data = $rows['data'];
        iniciarDia($mapaHistorico, $data);

        $mapaHistorico[$data]['recarga']['qtd'] = (int)$rows['qtd_recarga'];
        $mapaHistorico[$data]['recarga']['valor'] = (int)$rows['valor_recarga'];
    }

    ksort($mapaHistorico);

    $listaFinal = array_values($mapaHistorico);


    // Debug Temporário
    /*if ($regrasJSON === null) {
        var_dump([
            'Passo 1: Encontrou a linha?' => $regrasResults ? 'SIM' : 'NÃO',
            'Passo 2: Tem a coluna regras?' => isset($regrasResults['regras']) ? 'SIM' : 'NÃO',
            'Passo 3: Conteúdo bruto' => $regrasResults['regras'] ?? 'VAZIO',
            'Passo 4: Erro do JSON' => json_last_error_msg()
        ]);
        exit;
    }*/

    echo json_encode([
        'torneio' => [
            'regras' => $regrasJSON
        ],
        'operador' => [
            'nome' => 'Fulano'
        ],
        'historico' => $listaFinal
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => $e->getMessage()]);
}

