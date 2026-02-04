<?php
require 'config.php';

header('Content-Type: application/json');

// 1. Inicializa a resposta padrão (O "contrato" com o front)
$finalResponse = [
    'local' => null,
    'matriz' => null
];

try {
    $hoje = date('Y-m-d');
    // 2. Busca TODOS os torneios ativos hoje (sem LIMIT)
    $sqlTorneios = "SELECT t.id, t.nome, t.tipo, t.data_inicio, t.data_fim,
                            r.regras AS json_regras
                    FROM rank_torneios t
                    LEFT JOIN rank_regras r ON r.id = t.regra_id
                    WHERE data_inicio <= :inicio AND data_fim >= :fim AND t.ativo = 1";

    $stmtTorneios = $pdo->prepare($sqlTorneios);
    $stmtTorneios->execute([':inicio' => $hoje, ':fim' => $hoje]);

    // 3. Itera sobre os resultados encontrados (pode ser 0, 1 ou 2)
    while ($torneio = $stmtTorneios->fetch(PDO::FETCH_ASSOC)) {
        $ranking = [];
        
        // Identifica onde salvar: 'local' ou 'matriz'
        $tipoChave = strtolower($torneio['tipo']);
        $inicio = $torneio['data_inicio'];
        $fim    = $torneio['data_fim'];

        // regras
        $regrasObjeto = $torneio['json_regras'] ? json_decode($torneio['json_regras'], true) : null;
        
        // AQUI entra a lógica de buscar os pontos dos operadores...
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
        $stmtPix->execute([":inicio"=> $inicio, ":fim" => $fim]);

        while ($row = $stmtPix->fetch(PDO::FETCH_ASSOC)) {
            $id = $row['matricula'];
            $ranking[$id] = [
                'matricula' => $id,
                'nome'      => $row['apelido'] ?: $row['nome'],
                'pix'       => [
                    'qtd'   => (int)$row['total_qtd_pix'] ?? 0,
                    // Se for nulo (sem pix), retorna 0
                    'valor' => (float)($row['total_valor_pix'] ?? 0)
                ],
                // Valores padrão (serão preenchidos apenas se for LOCAL)
                'recarga'   => ['qtd' => 0, 'valor' => 0],
                'pesquisas' => 0,
                'pontos'    => 0 // O front vai calcular, mas deixamos a chave aqui
            ];
        }

        // Se for tipo LOCAL busca recarga e pesquisa, senão, ignora.
        if ($tipoChave === 'local') {

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
            $sqlPesquisa = "SELECT operador, qtd_pesquisa AS quantidade 
                            FROM rank_pesquisa 
                            WHERE torneio_id = :id";
            
            $stmtPesquisa = $pdo->prepare($sqlPesquisa);
            $stmtPesquisa->execute([':id' => $torneio['id']]);

            while ($row = $stmtPesquisa->fetch(PDO::FETCH_ASSOC)) {
                $id = $row['operador'];
                if (isset($ranking[$id])) {
                    $ranking[$id]['pesquisas'] = (int)$row['quantidade'];
                }
            }
        }

        // Preparar Resposta
        $listaRanking = array_values($ranking);

        usort($listaRanking, function ($a, $b) {
            return $b['pix']['qtd'] <=> $a['pix']['qtd'];
        });
        
        // Monta o objeto para esse tipo
        $finalResponse[$tipoChave] = [
            'torneio' => [
                'id' => $torneio['id'],
                'nome' => $torneio['nome'],
                'tipo' => $torneio['tipo'],
                'data_inicio' => $torneio['data_inicio'],
                'data_fim' => $torneio['data_fim'],
                'regras' => $regrasObjeto
            ],
            'data' => $listaRanking // A lista final de operadores
        ];
    }

    echo json_encode($finalResponse);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}


