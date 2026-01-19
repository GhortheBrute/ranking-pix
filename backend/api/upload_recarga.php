<?php
header('Content-Type: application/json');
require_once './config.php';

$arquivo_recarga_csv = file_get_contents('php://input');

try {
    if (!isset($pdo)) {
        $pdo = new PDO($dsn, $user, $pass, $options);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro de conexão: " . $e->getMessage()]);
    exit;
}

// Verifica se o arquivo foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES[$arquivo_recarga_csv])) {

    $csvFile = $_FILES[$arquivo_recarga_csv]['tmp_name'];

    if (($handle = fopen($csvFile, "r")) !== FALSE) {

        // Pula a primeira linha do CSV
        fgetcsv($handle, 1000, ";");

        // O "ON DUPLICATE KEY UPDATE" faz com que o valor seja atualizado se já existir a key
        $sql = "
            INSERT INTO rank_recarga (data, operador, qtd_recarga, valor_recarga)
                    VALUES (:data, :operador, :qtd_recarga, :valor_recarga)
                    ON DUPLICATE KEY UPDATE
                    qtd_recarga = VALUES(qtd_recarga),
                    valor_recarga = VALUES(valor_recarga)
        ";

        $stmt = $pdo->prepare($sql);

        // Inicia a Transação
        $pdo->beginTransaction();

        $linhasImportadas = 0;

        try{
            while(($data = fgetcsv($handle, 1000, ";", "\"")) !== FALSE) {
                /* Mapa de atributos
                 * $data[0] => Data(dd/mm/yyyy)
                 * $data[1] => Operador
                 * $data[2] => Quantidade de Recargas
                 * $data[3] => Valor da Recarga
                 */

                if (count($data) < 4) continue;

                // Converte Data de dd/mm/yyyy para yyyy-mm-dd
                $dataFormatada = DateTime::createFromFormat('d/m/Y', $data[0])->format('Y-m-d');

                // Limpa o valor monetário (troca vírgula por ponto se necessário)
                $valorLimpo = str_replace('.','',$data[3]);
                $valorFormatado = str_replace(',', '.', $valorLimpo);

                $stmt->execute([
                    ':data' => $dataFormatada,
                    ':operador' => $data[1],
                    ':qtd_recarga' => $data[2],
                    ':valor_recarga' => $valorFormatado
                ]);

                $linhasImportadas++;
            }

            // Se tudo deu certo, salva no banco de dados
            $pdo->commit();
            echo json_encode([
                "success" => true,
                "message" => "$linhasImportadas linhas importadas para Ranking PIX."
            ]);

            // ***Gatilho de Recalculo ***
            // Como os dados mudaram, podemos marcar o cache como sujo ou limpamos ele
            // $pdo->query("UPDATE ranking_cache SET expirado = 1 WHERE ...");
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }

        fclose($handle);
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Não foi possível abrir o arquivo CSV."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Arquivo não enviado."]);
}
