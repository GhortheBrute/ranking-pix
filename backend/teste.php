<?php
$ranking = [];
$regras = json_decode($json_do_banco, true);

foreach ($dados_diarios as $operador_id => $dias) {
    $pontos_totais = 0;
    $acumulado_pix_qtd = 0;
    $sequencia_dias_meta = 0;

    foreach ($dias as $data => $metricas) {
        // --- 1. Regras Diárias (Ex: Datas Multiplicadoras) ---
        $multiplicador_dia = verificar_se_data_tem_bonus($data, $regras['datas_multiplicadoras']);

        // --- 2. Acumular Totais para Regras de "Pacote" ---
        $acumulado_pix_qtd += $metricas['qtd_pix'];
        $acumulado_recarga_val += $metricas['val_recarga'];

        // --- 3. Regras de Sequência (Lógica Complexa) ---
        // Ex: Se bateu a meta diária de recarga
        if ($metricas['val_recarga'] >= $regras['bonus']['meta_diaria_recarga']) {
            $sequencia_dias_meta++;
        } else {
            $sequencia_dias_meta = 0; // Quebrou a sequência
        }

        // Aplica bônus de sequência se atingiu X dias
        if ($sequencia_dias_meta >= $regras['bonus']['dias_para_bonus']) {
            $pontos_totais += $regras['bonus']['pontos_bonus'];
            $sequencia_dias_meta = 0; // Reinicia ou mantém dependendo da regra
        }
    }

    // --- 4. Cálculo Final (Modelo de Conquista - Piso) ---
    // Aplica a divisão inteira nos totais acumulados
    if (isset($regras['padrao']['pix_qtd'])) {
        $meta = $regras['padrao']['pix_qtd']['meta'];
        $pts  = $regras['padrao']['pix_qtd']['pontos'];
        // A matemática: (Total / Meta) arredondado para baixo * Pontos
        $pontos_totais += floor($acumulado_pix_qtd / $meta) * $pts;
    }

    if (isset($regras['padrao']['recarga_val'])) {
        $meta = $regras['padrao']['recarga_val']['meta'];
        $pts  = $regras['padrao']['recarga_val']['pontos'];
        $pontos_totais += floor($acumulado_recarga_val / $meta) * $pts;
    }

    $ranking[] = [
        'operador' => $operador_id,
        'nome' => $nome_operador,
        'pontos' => $pontos_totais,
        'detalhes' => [
            'total_pix' => $acumulado_pix_qtd,
            'total_recarga' => $acumulado_recarga_val
        ]
    ];
}

// Ordenar do maior para o menor
usort($ranking, fn($a, $b) => $b['pontos'] <=> $a['pontos']);
    }
}