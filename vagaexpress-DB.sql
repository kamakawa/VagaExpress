DROP DATABASE IF EXISTS vagaexpress;
CREATE DATABASE vagaexpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vagaexpress;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha TEXT NOT NULL
);

CREATE TABLE hoteis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  estrelas DECIMAL(2,1) DEFAULT 4.0,
  imagem TEXT NOT NULL
);

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  hotel_id INT NOT NULL,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  quartos INT DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hoteis(id) ON DELETE CASCADE
);

INSERT INTO hoteis (nome, cidade, preco, estrelas, imagem) VALUES
('Hotel Centro Curitiba',      'Curitiba',      150.00, 4.5, 'assets/hotel1.jpg'),
('Pousada Londrina',           'Londrina',      120.00, 4.0, 'assets/hotel2.jpg'),
('Hotel Maringá Plaza',        'Maringá',       140.00, 4.2, 'assets/hotel3.jpg'),
('Resort Foz do Iguaçu',       'Foz do Iguaçu', 250.00, 5.0, 'assets/hotel4.jpg'),
('Hotel Cascavel',             'Cascavel',      110.00, 3.8, 'assets/hotel5.jpg'),
('Pousada Ponta Grossa',       'Ponta Grossa',  130.00, 4.1, 'assets/hotel6.jpg'),
('Hotel Apucarana',            'Apucarana',     100.00, 3.5, 'assets/hotel7.jpg'),
('Hotel Paranavaí',            'Paranavaí',     160.00, 4.3, 'assets/hotel8.jpg'),
('Centro Hotel Curitiba 2',    'Curitiba',      180.00, 4.7, 'assets/hotel9.jpg'),
('Pousada Londrina Norte',     'Londrina',      115.00, 3.9, 'assets/hotel10.jpg'),
('Hotel Maringá Central',      'Maringá',       155.00, 4.4, 'assets/hotel11.jpg'),
('Eco Resort Foz',             'Foz do Iguaçu', 220.00, 4.8, 'assets/hotel12.jpg'),
('Hotel Cascavel Sul',         'Cascavel',      125.00, 4.0, 'assets/hotel13.jpg'),
('Pousada Ponta Grossa Verde', 'Ponta Grossa',  105.00, 3.7, 'assets/hotel14.jpg'),
('Hotel Apucarana Plaza',      'Apucarana',     170.00, 4.6, 'assets/hotel15.jpg'),
('Hotel Paranavaí Lago',       'Paranavaí',     145.00, 4.2, 'assets/hotel16.jpg');
