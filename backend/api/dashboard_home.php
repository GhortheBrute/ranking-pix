<?php
require 'header.php';

try {
    $response = [];

    // Torneio Vigente
    $hoje = date('Y-m-d');
    $sqlTorneio = "SELECT nome, data_fim, id
                   FROM rank_torneios
                   WHERE data_inicio <= :hoje_inicio AND data_fim >= :hoje_fim
                   ORDER BY id DESC LIMIT 1
    ";

    $stmt = $pdo->prepare($sqlTorneio);
    $stmt->execute([
        ':hoje_inicio' => $hoje,
        ':hoje_fim' => $hoje
        ]);
    $torneio = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($torneio) {
        $response['torneio'] = [
            'ativo' => true,
            'nome' => $torneio['nome'],
            'fim' => date('d/m/Y', strtotime($torneio['data_fim'])),
            'id' => $torneio['id']
        ];
    } else {
        $response['torneio'] = ['ativo' => false];
    }

    // Total de operadores ativos
    $sqlOps = "SELECT COUNT(*) as total
               FROM rank_operadores
               WHERE valido = 1
    ";
    $stmt = $pdo->query($sqlOps);
    $response['operadores'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Data da última atualização de dados
    $sqlPix = "SELECT MAX(data) as data FROM rank_pix";
    $sqlRecarga = "SELECT MAX(data) as data FROM rank_recarga";

    $maxPix = $pdo->query($sqlPix)->fetchColumn();
    $maxRecarga = $pdo->query($sqlRecarga)->fetchColumn();

    $ultimaData = ($maxPix > $maxRecarga) ? $maxPix : $maxRecarga;

    $response['ultima_atualizacao'] = $ultimaData ? date('d/m/Y', strtotime($ultimaData)) : 'Sem dados';

    echo json_encode($response);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => $e->getMessage()]);
}