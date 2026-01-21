<?php
// api/admin.php
header("Content-Type: application/json; charset=UTF-8");
require 'config.php';


// FUNÇÃO DE LOG
function logAdmin($pdo, $admin_id, $acao, $detalhes) {
    $stmt = $pdo->prepare("INSERT INTO rank_admin_logs (admin_id, acao, detalhes, ip) VALUES (?, ?, ?, ?)");
    $ip = $_SERVER['REMOTE_ADDR'];
    $stmt->execute([$admin_id, $acao, json_encode($detalhes), $ip]);
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));
$admin_id = $data->admin_id ?? 0;
$acao = $_GET['acao'] ?? ($data->acao ?? '');

// FUNÇÃO AUXILIAR DE PERMISSÃO
function checkPermissao($pdo, $id, $roleNecessario = 'admin'){
    $stmt = $pdo->prepare("SELECT role FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return ($user && $user['role'] === $roleNecessario);
}

// --- 1. LOGIN ---
if ($acao === 'login' && $method === 'POST') {
    // 1. Busca só pelo login
    $stmt = $pdo->prepare("SELECT id, username, role, password FROM usuarios WHERE username = ?");
    $stmt->execute([$data->login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Verifica a senha (compatível com texto puro legado OU hash novo)
    if ($user) {
        $senhaValida = false;
        // Verifica se é hash (começa com $) ou texto puro (legado)
        if (password_verify($data->senha, $user['password'])) {
            $senhaValida = true;
        } elseif ($data->senha === $user['password']) { // Fallback para senhas antigas não hasheadas
            $senhaValida = true;
        }

        if ($senhaValida) {
            unset($user['password']); // Nunca devolva o hash para o frontend
            echo json_encode(['sucesso' => true, 'usuario' => $user]);
            exit;
        }
    }

    echo json_encode(['sucesso' => false, 'erro' => 'Credenciais inválidas']);
    exit;
}

// ALTERAR A PRÓPRIA SENHA
if ($acao === 'alterar_minha_senha' && $method === 'POST') {
    if (!empty($data->nova_senha)) {
        // Atualiza a senha APENAS do próprio ID enviado
        $sql = "UPDATE usuarios SET password = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);

        if ($stmt->execute([$data->nova_senha, $admin_id])) {
            logAdmin($pdo, $admin_id, 'alterou_senha_propria', []);
            echo json_encode(['sucesso' => true]);
        } else {
            echo json_encode(['sucesso' => false]);
        }
    }
}

// --- 2. GESTÃO DE USUÁRIOS ---
if ($acao === 'listar_usuarios') {
    $stmt = $pdo->query("SELECT id, username, role FROM usuarios ORDER BY username ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($acao === 'salvar_usuario' && $method === 'POST') {
    // Checagem de permissão
    if (!checkPermissao($pdo, $admin_id, 'admin')) {
        echo json_encode(['sucesso' => false, 'erro' => 'Acesso negado. Apenas admins podem alterar a senha de outro usuário.']);
        exit;
    }
    // Se tem ID, é update. Se não, insert.
    if (!empty($data->id)) {
        // Update
        $inativo_em = ($data->ativo == 0) ? date('Y-m-d H:i:s') : null;

        $sql = "UPDATE usuarios SET username=?, role=? WHERE id=?";
        $params = [$data->username, $data->role, $data->id];
        // Se enviou senha nova, atualiza
        if (!empty($data->senha)) {
            $sql = "UPDATE usuarios SET username=?, role=?, password=? WHERE id=?";
            $params = [$data->username, $data->role, $data->senha, $data->id];
        }

        $stmt = $pdo->prepare($sql);
        if($stmt->execute($params)) {
            logAdmin($pdo, $admin_id, 'editar_usuario', ['alvo' => $data->username]);
            echo json_encode(['sucesso' => true]);
        }
    } else {
        // Insert
        $sql = "INSERT INTO usuarios (username, role, password) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        if($stmt->execute([$data->username, $data->role, $data->password])) {
            logAdmin($pdo, $admin_id, 'criar_usuario', ['username' => $data->username]);
            echo json_encode(['sucesso' => true]);
        }
    }

    exit;
}


// C. Logs do Admin
if ($acao === 'listar_logs') {
    $sql = "SELECT l.*, u.username as admin_username 
            FROM rank_admin_logs l 
            JOIN usuarios u ON l.admin_id = u.id 
            ORDER BY l.data DESC LIMIT 100";
    $stmt = $pdo->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}
?>