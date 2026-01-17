<?php
header('Content-Type: application/json; charset=utf-8');
require_once './config.php';

try {
    if (!isset($pdo)) {
        $pdo = new PDO($dsn, $user, $pass, $options);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro de conexão: " . $e->getMessage()]);
    exit;
}

$arquivo_pix_csv = file_get_contents('php://input');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES[$arquivo_pix_csv])) {

    $csvFile = $_FILES[$arquivo_pix_csv]['tmp_name'];

    if (($handle = fopen($csvFile, "r")) !== FALSE) {

        // Pula a primeira linha do CSV
        fgetcsv($handle, 1000, ",");

        // O "ON DUPLICATE KEY UPDATE" faz com que o valor seja atualizado se já existir a key
        $sql = "
            INSERT INTO rank_pix (data, operador, caixa, transacao, qtd_pix, valor_pix)
                    VALUES (:data, :operador, :caixa, :transacao, :qtd_pix, :valor_pix)
                    ON DUPLICATE KEY UPDATE
                    qtd_pix = VALUES(qtd_pix),
                    valor_pix = VALUES(valor_pix)
        ";

        $stmt = $pdo->prepare($sql);
        try{
            // Inicia a Transação
            $pdo->beginTransaction();
            $linhasImportadas = 0;

            while(($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                /* Mapa de atributos
                 * $data[0] => Data(dd/mm/yyyy)
                 * $data[1] => Operador
                 * $data[2] => Caixa
                 * $data[3] => Transação
                 * $data[4] => Quantidade de PIX
                 * $data[5] => Valor de PIX
                 */

                // Verifica se a linha tem o mínimo de colunas
                if (count($data) < 6) continue;

                // Converte Data de dd/mm/yyyy para yyyy-mm-dd
                $dataObj = DateTime::createFromFormat('d/m/Y', $data[0]);
                if (!$dataObj) continue; // Pula se data for inválida
                $dataFormatada = $dataObj->format('Y-m-d');

                // Limpa o valor monetário (troca vírgula por ponto se necessário)
                $valorFormatado = str_replace(['R$', ' ', ','], ['', '', '.'], $data[5]);

                $stmt->execute([
                    ':data' => $dataFormatada,
                    ':operador' => $data[1],
                    ':caixa' => $data[2],
                    ':transacao' => $data[3],
                    ':qtd_pix' => $data[4],
                    ':valor_pix' => $valorFormatado
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
?>