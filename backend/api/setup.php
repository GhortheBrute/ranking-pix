<?php
// backend/api/setup.php

// Se o config já existe, bloqueia o acesso por segurança
if (file_exists('config.php')) {
    die("O sistema já está instalado. Por segurança, apague o arquivo 'config.php' se quiser reinstalar, ou remova este arquivo 'setup.php'.");
}

$mensagem = '';
$tipoMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = $_POST['db_host'] ?? 'localhost';
    $dbName = $_POST['db_name'] ?? '';
    $dbUser = $_POST['db_user'] ?? '';
    $dbPass = $_POST['db_pass'] ?? '';
    
    $adminUser = $_POST['admin_user'] ?? 'admin';
    $adminPass = $_POST['admin_pass'] ?? '';

    if (!$dbName || !$dbUser || !$adminPass) {
        $mensagem = "Preencha todos os campos obrigatórios.";
        $tipoMsg = "error";
    } else {
        try {
            // 1. Testa Conexão
            $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // 2. Gera o arquivo config.php
            $configContent = "<?php
// Gerado automaticamente pelo instalador
\$host = '$dbHost';
\$dbname = '$dbName';
\$username = '$dbUser';
\$password = '$dbPass';

try {
    \$pdo = new PDO(\"mysql:host=\$host;dbname=\$dbname;charset=utf8mb4\", \$username, \$password);
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException \$e) {
    // Em produção, evite mostrar o erro detalhado
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão com o banco de dados']);
    exit;
}
?>";
            file_put_contents('config.php', $configContent);

            // 3. Lê e Executa o SQL de Criação (create_tables.sql)
            // Assumindo que o arquivo está em ../SQL/create_tables.sql relativo à API
            $sqlFile = __DIR__ . '/../SQL/create_tables.sql';
            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                // O PDO não executa múltiplos statements de uma vez por padrão em algumas configurações,
                // mas para CREATE TABLE geralmente funciona. Se falhar, precisaríamos quebrar por ';'.
                $pdo->exec($sql);
            }

            // 4. Cria o Usuário Admin
            $senhaHash = password_hash($adminPass, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO usuarios (username, password, role) VALUES (?, ?, 'admin')");
            $stmt->execute([$adminUser, $senhaHash]);

            $mensagem = "Instalação concluída com sucesso! <br><strong>IMPORTANTE:</strong> Apague este arquivo <code>setup.php</code> agora.";
            $tipoMsg = "success";

        } catch (PDOException $e) {
            $mensagem = "Erro ao conectar no banco: " . $e->getMessage();
            $tipoMsg = "error";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalação Ranking PIX</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold text-blue-900 mb-6 text-center">Configuração Inicial 🚀</h1>

        <?php if ($mensagem): ?>
            <div class="p-4 mb-4 rounded text-sm <?php echo $tipoMsg === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                <?php echo $mensagem; ?>
            </div>
            <?php if ($tipoMsg === 'success'): ?>
                <div class="text-center">
                    <a href="../" class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Ir para o Sistema</a>
                </div>
            <?php exit; endif; ?>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <div>
                <h3 class="font-semibold text-gray-700 border-b pb-2 mb-3">Banco de Dados</h3>
                <input type="text" name="db_host" placeholder="Host (ex: localhost)" value="localhost" class="w-full p-2 border rounded mb-2" required>
                <input type="text" name="db_name" placeholder="Nome do Banco" class="w-full p-2 border rounded mb-2" required>
                <input type="text" name="db_user" placeholder="Usuário do Banco" class="w-full p-2 border rounded mb-2" required>
                <input type="password" name="db_pass" placeholder="Senha do Banco" class="w-full p-2 border rounded">
            </div>

            <div>
                <h3 class="font-semibold text-gray-700 border-b pb-2 mb-3 mt-6">Primeiro Admin</h3>
                <input type="text" name="admin_user" placeholder="Usuário Admin" value="admin" class="w-full p-2 border rounded mb-2" required>
                <input type="password" name="admin_pass" placeholder="Senha do Admin" class="w-full p-2 border rounded" required>
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition duration-200 mt-4">
                Instalar Sistema
            </button>
        </form>
    </div>
</body>
</html>