<?php
require 'header.php';

$nomeDoArquivo = 'arquivo_recarga_csv';

// --- Funções Auxiliares ---
function validaCabecalho($cabecalho) {
    $cabecalhoEsperado = [
        'Data',
        'Operador',
        'Quantidade de Transações', // Verifique se no CSV está acentuado ou "Transacoes"
        'Valor Total'
    ];

    if (isset($cabecalho[0])) {
        $cabecalho[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $cabecalho[0]);
    }

    return $cabecalho === $cabecalhoEsperado;
}

try {
    if (!isset($pdo)) {
        $pdo = new PDO($dsn, $user, $pass, $options);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro de conexão: " . $e->getMessage()]);
    exit;
}

// --- Processamento ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES[$nomeDoArquivo])) {

    $csvFile = $_FILES[$nomeDoArquivo]['tmp_name'];

    if (($handle = fopen($csvFile, "r")) !== FALSE) {

        // 1. Validação de Cabeçalho
        $cabecalho = fgetcsv($handle, 1000, ";");
        if (!validaCabecalho($cabecalho)) {
            fclose($handle); // Sempre bom fechar antes de sair
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Cabeçalho inválido."]);
            exit;
        }

        // 2. Carrega para Memória
        $dadosCSV = [];
        $idsNoCSV = [];

        while (($linha = fgetcsv($handle, 1000, ";", "\"")) !== FALSE) {
            // CORREÇÃO 1: Recarga tem 4 colunas, não 6
            if (count($linha) < 4) continue;

            $dadosCSV[] = $linha;
            $idsNoCSV[] = (int)$linha[1];
        }
        fclose($handle); // Arquivo fechado aqui. Não podemos usar $handle depois.

        if (empty($dadosCSV)) {
            echo json_encode(["success" => false, "error" => "O arquivo está vazio."]);
            exit;
        }

        // 3. Verifica Operadores Faltantes
        $idsUnicosCSV = array_unique($idsNoCSV);

        if (!empty($idsUnicosCSV)) {
            $placeholders = implode(',', array_fill(0, count($idsUnicosCSV), '?'));
            $sqlCheck = "SELECT matricula FROM rank_operadores WHERE matricula IN ($placeholders)";
            $stmtCheck = $pdo->prepare($sqlCheck);
            $stmtCheck->execute(array_values($idsUnicosCSV));
            $idsNoBanco = $stmtCheck->fetchAll(PDO::FETCH_COLUMN);

            $idsFaltantes = array_diff($idsUnicosCSV, $idsNoBanco);

            if (!empty($idsFaltantes)) {
                echo json_encode([
                    "success" => false,
                    "error" => "operadores_inexistentes",
                    "ids" => array_values($idsFaltantes)
                ]);
                exit;
            }
        }

        // 4. Inserção no Banco
        $sql = "INSERT INTO rank_recarga (data, operador, qtd_recarga, valor_recarga)
                VALUES (:data, :operador, :qtd_recarga, :valor_recarga)
                ON DUPLICATE KEY UPDATE
                qtd_recarga = VALUES(qtd_recarga),
                valor_recarga = VALUES(valor_recarga)";

        $stmt = $pdo->prepare($sql);

        try {
            $pdo->beginTransaction();
            $linhasImportadas = 0;

            // CORREÇÃO 2: Usamos o array da memória ($dadosCSV), não o arquivo fechado ($handle)
            foreach ($dadosCSV as $data) {

                // Validação extra de segurança
                if (count($data) < 4) continue;

                // CORREÇÃO 3: Segurança na conversão de data
                $dataObj = DateTime::createFromFormat('d/m/Y', $data[0]);
                if (!$dataObj) continue; // Pula se a data for inválida

                // Formatações
                $valorLimpo = str_replace(['.', 'R$', ' '], '', $data[3]); // Limpeza extra
                $valorFormatado = str_replace(',', '.', $valorLimpo);

                $stmt->execute([
                    ':data' => $dataObj->format('Y-m-d'),
                    ':operador' => $data[1],
                    ':qtd_recarga' => $data[2],
                    ':valor_recarga' => $valorFormatado
                ]);

                $linhasImportadas++;
            }

            $pdo->commit();
            echo json_encode([
                "success" => true,
                "message" => "$linhasImportadas linhas importadas para Ranking Recarga." // Ajustei o texto PIX -> Recarga
            ]);

        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }

    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Não foi possível abrir o arquivo CSV."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Arquivo não enviado."]);
}
?>