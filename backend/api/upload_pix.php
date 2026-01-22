<?php
header('Content-Type: application/json; charset=utf-8');
require_once './config.php';

function formatarPDV($codigoOriginal) {
    $codigo = trim($codigoOriginal);

    // Regra 1 - PDV - Começa com "UN"
    if(strpos($codigo, 'UN') === 0) {
        $numero = (int)preg_replace('/[^0-9]/', '', $codigo);
        return "PDV $numero";
    }

    if(strpos($codigo, 'SE') === 0) {
        $numero = (int)preg_replace('/[^0-9]/', '', $codigo);

        if ($numero >= 100) {
            $numeroFinal = $numero - 100;
            return "Empresa $numeroFinal";
        } else {
            return "Empresa $numero";
        }
    }

    return $codigoOriginal;
}

function validaCabecalho($cabecalho): mixed {
    $cabecalhoEsperado = [
        'Data',
        'Operador',
        'PDV',
        'Cupom Fiscal',
        'Quantidade de Transacoes',
        'Valor Total'
    ];

    // Limpa caracteres invisíveis
    if (isset($cabecalho[0])) {
        $cabecalho[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $cabecalho[0]);
    }

    // Compara os dois arrays
    if ($cabecalho !== $cabecalhoEsperado) {
        return false;
    }

    return true;
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

$nomeDoArquivo = 'arquivo_pix_csv';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES[$nomeDoArquivo])) {
    $csvFile = $_FILES[$nomeDoArquivo]['tmp_name'];

    if (($handle = fopen($csvFile, "r")) !== FALSE) {
        
        // 1. Valida Cabeçalho
        $cabecalho = fgetcsv($handle, 1000, ";", "\"");
        if (!validaCabecalho($cabecalho)) {
            fclose($handle);
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Cabeçalho inválido."]);
            exit;
        }

        // 2. Carrega tudo para a Memória
        $dadosCSV = [];
        $idsNoCSV = [];

        while (($linha = fgetcsv($handle, 1000, ";", "\"")) !== FALSE) {
            if (count($linha) < 6) continue;
            
            // Guarda a linha completa para processar depois
            $dadosCSV[] = $linha;
            
            // Guarda só o ID do operador (coluna index 1)
            // Usamos (int) para garantir a comparação correta
            $idsNoCSV[] = (int)$linha[1]; 
        }
        fclose($handle);

        if (empty($dadosCSV)) {
            echo json_encode(["success" => false, "error" => "O arquivo está vazio (além do cabeçalho)."]);
            exit;
        }

        // 3. Verifica Operadores Faltantes
        $idsUnicosCSV = array_unique($idsNoCSV);
        
        if (!empty($idsUnicosCSV)) {
            // Cria string de placeholders (?,?,?) para a query
            $placeholders = implode(',', array_fill(0, count($idsUnicosCSV), '?'));
            
            $sqlCheck = "SELECT matricula FROM operadores WHERE matricula IN ($placeholders)";
            $stmtCheck = $pdo->prepare($sqlCheck);
            $stmtCheck->execute(array_values($idsUnicosCSV));
            
            // Pega o que o banco encontrou
            $idsNoBanco = $stmtCheck->fetchAll(PDO::FETCH_COLUMN); // Retorna array simples [100, 101...]
            
            // Compara: O que tem no CSV - O que tem no Banco = Faltantes
            $idsFaltantes = array_diff($idsUnicosCSV, $idsNoBanco);

            if (!empty($idsFaltantes)) {
                // PARE TUDO! Retorna os IDs para o front abrir o modal
                echo json_encode([
                    "success" => false,
                    "error" => "operadores_inexistentes", // Código de erro específico para o front tratar
                    "ids" => array_values($idsFaltantes) // Reindexa array para JSON bonito
                ]);
                exit; 
            }
        }

        // 4. Se chegou aqui, todos existem. Inserir!
        $sql = "INSERT INTO rank_pix (data, operador, caixa, transacao, qtd_pix, valor_pix)
                VALUES (:data, :operador, :caixa, :transacao, :qtd_pix, :valor_pix)
                ON DUPLICATE KEY UPDATE
                qtd_pix = VALUES(qtd_pix),
                valor_pix = VALUES(valor_pix)";

        $stmt = $pdo->prepare($sql);

        try {
            $pdo->beginTransaction();
            $linhasImportadas = 0;

            foreach ($dadosCSV as $data) {
                // Tratamento de Data
                $dataObj = DateTime::createFromFormat('d/m/Y', $data[0]);
                if (!$dataObj) continue;
                
                // Formatações
                $caixaFormatado = formatarPDV($data[2]);
                $valorLimpo = str_replace(['.', 'R$', ' '], '', $data[5]);
                $valorFormatado = str_replace(',', '.', $valorLimpo);

                $stmt->execute([
                    ':data'       => $dataObj->format('Y-m-d'),
                    ':operador'   => $data[1],
                    ':caixa'      => $caixaFormatado,
                    ':transacao'  => (int)$data[3],
                    ':qtd_pix'    => $data[4],
                    ':valor_pix'  => $valorFormatado
                ]);
                $linhasImportadas++;
            }

            $pdo->commit();
            echo json_encode([
                "success" => true,
                "message" => "$linhasImportadas linhas processadas com sucesso."
            ]);

        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
    }
}
?>