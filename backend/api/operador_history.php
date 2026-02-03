$sqlPIX = "SELECT rp.data,
        rp.operador,
        COUNT(rp.transacao) AS qtd_pix,
        SUM(rp.valor_pix) AS valor_pix,
        o.apelido AS nome,
        FROM rank_pix rp
        LEFT JOIN operadores o ON o.matricula = rp.operador
        WHERE rp.operador = :matricula
        AND rp.data >= :startDate AND rp.data <= :endDate
";

$sqlRec = "SELECT rr.data,
        rr.operador,
        SUM(rr.qtd_recarga) AS qtd_recarga,
        SUM(rr.valor_pix) AS valor_pix,
        o.apelido AS nome,
        FROM rank_pix rr
        LEFT JOIN operadores o ON o.matricula = rr.operador
        WHERE rr.operador = :matricula
        AND rr.data >= :startDate AND rr.data <= :endDate
";

$sqlRegras = "SELECT rm.regras
        FROM regras_modelo rm
        LEFT JOIN torneios t ON t.regra_id = rm.id
        WHERE t.id = :torneio_id
";