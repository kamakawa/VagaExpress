-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS vagaexpress;
USE vagaexpress;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  verificado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de hotéis (exemplo básico)
CREATE TABLE IF NOT EXISTS hoteis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estrelas INT CHECK (estrelas >= 1 AND estrelas <= 5),
  preco DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  imagem VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  hotel_id INT NOT NULL,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  quartos INT DEFAULT 1,
  status ENUM('pendente', 'confirmada', 'cancelada') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hoteis(id) ON DELETE CASCADE
);

-- Inserir alguns hotéis de exemplo
INSERT INTO hoteis (nome, cidade, estrelas, preco, descricao, imagem) VALUES
('Hotel Centro Curitiba', 'Curitiba', 4, 150.00, 'Hotel confortável no centro da cidade', 'assets/hotel1.jpg'),
('Pousada Londrina', 'Londrina', 4, 120.00, 'Pousada acolhedora com café da manhã', 'assets/hotel2.jpg'),
('Hotel Maringá Plaza', 'Maringá', 4, 140.00, 'Hotel moderno com piscina', 'assets/hotel3.jpg'),
('Resort Foz do Iguaçu', 'Foz do Iguaçu', 5, 250.00, 'Resort luxuoso próximo às cataratas', 'assets/hotel4.jpg'),
('Hotel Cascavel', 'Cascavel', 3, 110.00, 'Hotel econômico com bom custo-benefício', 'assets/hotel5.jpg');