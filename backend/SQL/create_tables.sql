DROP TABLE IF EXISTS rank_pix;
DROP TABLE IF EXISTS rank_recarga;
DROP TABLE IF EXISTS rank_pesquisa;
DROP TABLE IF EXISTS operadores;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS ranking_cache;

-- 1. Tabela de Operadores (Foco no Ranking)
CREATE TABLE operadores (
                            matricula INT PRIMARY KEY,
                            nome VARCHAR(100) NOT NULL,
                            apelido VARCHAR(30),
                            valido BOOLEAN NOT NULL DEFAULT true -- Se false, não aparece nos rankings
);

-- 2. Tabela de Usuários do Sistema (Foco no Acesso)
CREATE TABLE usuarios (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          username VARCHAR(50) NOT NULL UNIQUE, -- Login único
                          password VARCHAR(255) NOT NULL, -- Hash BCRYPT
                          role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela Pix (Com a chave para update)
CREATE TABLE rank_pix (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          data DATE NOT NULL,
                          operador INT NOT NULL,
                          caixa VARCHAR(20) NOT NULL,
                          transacao INT NOT NULL,
                          qtd_pix INT DEFAULT 1,
                          valor_pix DECIMAL(10,2) NOT NULL,

                          CONSTRAINT fk_pix_operador FOREIGN KEY (operador) REFERENCES operadores(matricula),

    -- Se vier Data+Operador+Caixa+Transacao igual, é a mesma venda.
                          UNIQUE KEY unique_transacao (data, operador, caixa, transacao),
                          INDEX idx_data_operador (data, operador)
);

-- 4. Tabela Recarga (Com a chave para update)
CREATE TABLE rank_recarga (
                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                              data DATE NOT NULL,
                              operador INT NOT NULL,
                              qtd_recarga INT NOT NULL,
                              valor_recarga DECIMAL(10,2) NOT NULL,

                              CONSTRAINT fk_recarga_operador FOREIGN KEY (operador) REFERENCES operadores(matricula),

    -- Se vier Data+Operador igual, atualizamos os valores totais
                              UNIQUE KEY unique_recarga_dia (data, operador),
                              INDEX idx_data (data)
);

-- 6. Tabela de Torneios
    CREATE TABLE torneios (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            nome VARCHAR(100) NOT NULL,
                            data_inicio DATE NOT NULL,
                            data_fim    DATE NOT NULL,
                            regras JSON NOT NULL,
                            ativo BOOLEAN DEFAULT TRUE
    );

-- 5. Tabela de Pesquisa
create table rank_pesquisa (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            torneio INT NOT NULL,
                            operador int NOT NULL,
                            qtd_pesquisa int NOT NULL DEFAULT 0,
                            CONSTRAINT fk_pesquisa_torneio
                                    FOREIGN KEY (torneio)
                                    REFERENCES torneios (id)
                                    ON DELETE CASCADE ,
                            CONSTRAINT fk_pesquisa_operador
                                    FOREIGN KEY (operador)
                                    REFERENCES operadores(matricula),
                            UNIQUE KEY unique_pesquisa_torneio (torneio, operador)
);

-- 6. Tabela de Cache
CREATE TABLE ranking_cache (
                               torneio_id INT PRIMARY KEY,
                               ultimo_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               dados_json LONGTEXT,
                               CONSTRAINT fk_cache_torneio
                                   FOREIGN KEY (torneio_id)
                                       REFERENCES torneios(id)
                                       ON DELETE CASCADE
);

-- 7. Tabela de Regras para os torneios
CREATE TABLE regras(
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            regras JSON NOT NULL
);