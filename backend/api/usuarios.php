<?php
// api/usuarios.php
require 'header.php';

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'] ?? 0;


//$debug_sessao = [
//    'session_id_atual' => session_id(),
//    'tem_admin_id' => isset($_SESSION['admin_id']),
//    'valor_role' => $_SESSION['role'] ?? 'NÃO DEFINIDO',
//    'valor_variavel_role' => $role
//];

// 1. LISTAR USUÁRIOS (GET)
if ($method === 'GET') {
    // Traz todos, ordenados por nome
    $stmt = $pdo->query("SELECT id, username, role FROM usuarios ORDER BY username ASC");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($usuarios);
    exit;
}

// 2. CRIAR OU ATUALIZAR (POST)
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'erro' => 'Dados inválidos']);
        exit;
    }
    if ($_SESSION['role'] !== 'admin'){
        http_response_code(400);
        echo json_encode([
            'sucesso'=> false,
            'erro'=> 'Usuário não possui permissão para realizar esta ação.',
            'debug'=> $debug_sessao
        ]);
        exit;
    }

    try {
        // Ação: SALVAR (Insert ou Update)
        // Se vier "is_edit", fazemos UPDATE. Senão, INSERT.
        // --- Ação: EDITAR (UPDATE) ---
        if (isset($data->is_edit) && $data->is_edit === true) {
            // Verifica se a senha foi enviada para decidir se atualiza ela ou não
            if (!empty($data->password)) {
                // Se tem senha nova, atualiza tudo (com hash)
                $sql = "UPDATE usuarios SET password = ?, role = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                // CRÍTICO: Usar password_hash
                $stmt->execute([$data->password, $data->role, $data->id]);
            } else {
                // Se a senha está vazia, atualiza SÓ o role e mantém a senha antiga
                $sql = "UPDATE usuarios SET role = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data->role, $data->id]);
            }
            logAdmin($pdo, $admin_id, 'atualizar_usuario', ['alvo' => $data->username]);
        } else {
            // --- Ação: CRIAR (INSERT) ---
            if (empty($data->password)) {
                throw new Exception("A senha é obrigatória para novos usuários.");
            }
            
            $sql = "INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            // CRÍTICO: Usar password_hash
            $stmt->execute([$data->username, $data->password, $data->role]);
            logAdmin($pdo, $admin_id, 'criar_usuario', ['alvo' => $data->username]);
        }

        echo json_encode(['sucesso' => true]);

    } catch (PDOException $e) {
        // Erro comum: Username duplicada (código 23000)
        if ($e->getCode() == 23000) {
            echo json_encode(['sucesso' => false, 'erro' => 'Username já cadastrado.']);
        } else {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
        }
    }
    exit;
}
?>