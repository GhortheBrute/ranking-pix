<?php
require_once './config.php';
ob_start("ob_gzhandler");

// Parâmetros via GET (ex: ?inicio=2023-10-01&fim=2023-10-31)
$inicio = $_GET['inicio'] ?? date('Y-m-01'); // Padrão dia 1 do mês atual
$fim = $_GET['fim'] ?? date('Y-m-t'); // Padrão último dia do mês atual

try{
    // Array mestre que armazena os dados consolidados
    $ranking = [];

    // Total de PIX
    $sqlPix = "SELECT
                    o.matricula, o.nome, o.apelido,
                    COUNT(rp.transacao) as total_qtd_pix,
                    SUM(rp.valor_pix) as total_valor_pix
                FROM operadores o
                LEFT JOIN rank_pix rp ON o.matricula = rp.operador
                    AND rp.data BETWEEN :inicio AND :fim
                WHERE o.valido = 1
                GROUP BY o.matricula
    ";

    $stmtPix = $pdo->prepare($sqlPix);
    $stmtPix->execute([':inicio' => $inicio, ':fim' => $fim]);

    while($row = $stmtPix->fetch()) {
        $id = $row['matricula'];
        $ranking[$id] = [
            'matricula' => $id,
            'nome' => $row['apelido'] ?: $row['nome'],
            'pix' => [
                'qtd' => $row['total_qtd_pix'],
                'valor' => $row['total_valor_pix']
            ],
            'recarga' => [
                'qtd' => 0,
                'valor' => 0.00
            ],
            'pontuacao_geral' => 0
        ];
    }

    // Busca o total de Recarga e mescla no array existente
    $sqlRecarga = "SELECT
                        operador,
                        SUM(qtd_recarga) as total_qtd_recarga,
                        SUM(valor_recarga) as total_valor_recarga
                    FROM rank_recarga
                    WHERE data BETWEEN :inicio AND :fim
                    GROUP BY operador
    ";

    $stmtRecarga = $pdo->prepare(($sqlRecarga));
    $stmtRecarga->execute([':inicio' => $inicio, ':fim' => $fim]);

    while($row = $stmtRecarga->fetch()) {
        $id = $row['operador'];
        if (isset($ranking[$id])) {
            $ranking[$id]['recarga']['qtd'] = (int)$row['total_qtd_recarga'];
            $ranking[$id]['recarga']['valor'] = (float)$row['total_valor_recarga'];
        }
    }

    // Transforma o array associativo em uma lista indexada para o JSON
    $listaFinal = array_values($ranking);

    // Ordena por maior quantidade de PIX
    usort($listaFinal, function ($a, $b) {
        return $b['pix']['qtd'] <=> $a['pix']['qtd'];
    });

    echo json_encode([
        "periodo" => ["inicio" => $inicio, "fim" => $fim],
        "data" => $listaFinal
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}