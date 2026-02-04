<?php
// api/admin.php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require 'config.php';


$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));
$admin_id = $data->admin_id ?? 0;
$role = $data->role ?? "user";
$acao = $_GET['acao'] ?? ($data->acao ?? '');

// --- 1. LOGIN ---
if ($acao === 'login' && $method === 'POST') {
    // 1. Busca só pelo login
    $stmt = $pdo->prepare("SELECT id, username, role, password FROM rank_usuarios WHERE username = ?");
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
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            session_write_close();
            echo json_encode([
                'sucesso' => true,
                'usuario' => $user,
                'session_id_login' => session_id(),
            ]);
            exit;
        }
    }

    echo json_encode(['sucesso' => false, 'erro' => 'Credenciais inválidas']);
    exit;
}
?>