<?php
require_once './config.php';
// Removemos o ob_gzhandler por enquanto para evitar conflitos de buffer em alguns servidores,
// mas pode manter se o seu servidor suportar bem.
header('Content-Type: application/json');

try {
    $ranking = [];
    
    // 1. Validar o ID do Torneio
    $torneioId = $_GET['torneio_id'] ?? null;

    if (!$torneioId) {
        throw new Exception("ID do torneio é obrigatório.");
    }

    // 2. Buscar dados do Torneio (Datas e Tipo)
    $sqlTorneio = "SELECT tipo, data_inicio, data_fim FROM rank_torneios WHERE id = :id";
    $stmtTorneio = $pdo->prepare($sqlTorneio);
    $stmtTorneio->execute([':id' => $torneioId]);
    $torneio = $stmtTorneio->fetch(PDO::FETCH_ASSOC);

    if (!$torneio) {
        throw new Exception("Torneio não encontrado.");
    }

    $inicio = $torneio['data_inicio'];
    $fim    = $torneio['data_fim'];
    $tipo   = $torneio['tipo']; // 'LOCAL' ou 'MATRIZ'

    // 3. Buscar PIX (Base de tudo - Traz todos os operadores válidos)
    // A query de PIX usa as datas do torneio para filtrar as transações
    $sqlPix = "SELECT 
                    o.matricula, o.nome, o.apelido,
                    COUNT(rp.transacao) as total_qtd_pix,
                    SUM(rp.valor_pix) as total_valor_pix
                FROM rank_operadores o
                LEFT JOIN rank_pix rp ON o.matricula = rp.operador 
                    AND rp.data BETWEEN :inicio AND :fim
                WHERE o.valido = 1
                GROUP BY o.matricula";

    $stmtPix = $pdo->prepare($sqlPix);
    $stmtPix->execute([':inicio' => $inicio, ':fim' => $fim]);

    while ($row = $stmtPix->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['matricula'];
        $ranking[$id] = [
            'matricula' => $id,
            'nome'      => $row['apelido'] ?: $row['nome'],
            'pix'       => [
                'qtd'   => (int)$row['total_qtd_pix'],
                // Se for nulo (sem pix), retorna 0
                'valor' => (float)($row['total_valor_pix'] ?? 0)
            ],
            // Valores padrão (serão preenchidos apenas se for LOCAL)
            'recarga'   => ['qtd' => 0, 'valor' => 0],
            'pesquisas' => 0,
            'pontos'    => 0 // O front vai calcular, mas deixamos a chave aqui
        ];
    }

    // 4. Se for Torneio LOCAL, busca Recargas e Pesquisas
    if ($tipo === 'LOCAL') {
        
        // --- RECARGAS ---
        $sqlRecarga = "SELECT 
                            operador, 
                            SUM(qtd_recarga) as total_qtd, 
                            SUM(valor_recarga) as total_valor
                       FROM rank_recarga
                       WHERE data BETWEEN :inicio AND :fim
                       GROUP BY operador";
        
        $stmtRecarga = $pdo->prepare($sqlRecarga);
        $stmtRecarga->execute([':inicio' => $inicio, ':fim' => $fim]);

        while ($row = $stmtRecarga->fetch(PDO::FETCH_ASSOC)) {
            $id = $row['operador'];
            if (isset($ranking[$id])) {
                $ranking[$id]['recarga']['qtd']   = (int)$row['total_qtd'];
                $ranking[$id]['recarga']['valor'] = (float)$row['total_valor'];
            }
        }

        // --- PESQUISAS ---
        // Aqui aplicamos a lógica que você pediu:
        // Sem SUM(), pois a chave (torneio, operador) é única.
        $sqlPesquisa = "SELECT operador, quantidade 
                        FROM rank_pesquisa 
                        WHERE torneio_id = :id";
        
        $stmtPesquisa = $pdo->prepare($sqlPesquisa);
        $stmtPesquisa->execute([':id' => $torneioId]);

        while ($row = $stmtPesquisa->fetch(PDO::FETCH_ASSOC)) {
            $id = $row['operador'];
            if (isset($ranking[$id])) {
                $ranking[$id]['pesquisas'] = (int)$row['quantidade'];
            }
        }
    }

    // 5. Preparar Resposta
    $listaFinal = array_values($ranking);

    // Ordenação padrão pelo PIX (Qtd) para já vir bonitinho, 
    // mas o Front pode reordenar depois pelos Pontos.
    usort($listaFinal, function ($a, $b) {
        return $b['pix']['qtd'] <=> $a['pix']['qtd'];
    });

    echo json_encode([
        "torneio" => [
            "id" => $torneioId,
            "tipo" => $tipo,
            "inicio" => $inicio,
            "fim" => $fim
        ],
        "data" => $listaFinal
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}