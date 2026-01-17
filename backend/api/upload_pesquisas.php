<?php
header('Content-Type: application/json');
require_once './config.php';

$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

try {
    if (!isset($pdo)) {
        $pdo = new PDO($dsn, $user, $pass, $options);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro de conexão: " . $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $data !== null) {

        // O "ON DUPLICATE KEY UPDATE" faz com que o valor seja atualizado se já existir a key
        $sql = "
            INSERT INTO rank_pesquisa (torneio, operador, qtd_pesquisa)
                    VALUES (:torneio, :operador, :qtd_pesquisa)
                    ON DUPLICATE KEY UPDATE
                    qtd_pesquisa = VALUES(qtd_pesquisa)
        ";

        $stmt = $pdo->prepare($sql);
        try{
        // Inicia a Transação
        $pdo->beginTransaction();
        $linhasImportadas = 0;

            foreach ($data as $row) {
                /* Mapa de atributos
                 * row['torneio'] => id do Torneio
                 * $row['operador'] => Operador
                 * $row['qtd_pesquisa'] => Quantidade de Pesquisas
                 */

                // Validação simples para evitar erro de "Undefined index"
                if (!isset($row['torneio'], $row['operador'], $row['qtd_pesquisa'])) {
                    continue; // Pula linha inválida
                }

                $stmt->execute([
                    ':torneio' => $row['torneio'],
                    ':operador' => $row['operador'],
                    ':qtd_pesquisa' => $row['qtd_pesquisa'],
                ]);

                $linhasImportadas++;
            }

            // Se tudo deu certo, salva no banco de dados
            $pdo->commit();
            echo json_encode([
                'success' => true,
                'message' => "$linhasImportadas linhas importadas para Ranking_Pesquisas."
            ]);

            // ***Gatilho de Recalculo ***
            // Como os dados mudaram, podemos marcar o cache como sujo ou limpamos ele
            // $pdo->query("UPDATE ranking_cache SET expirado = 1 WHERE ...");
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Dados inválidos ou JSON malformado."]);
}