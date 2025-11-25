DROP TABLE IF EXISTS books;

-- books 表
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  genre VARCHAR(50), -- 类型：'fiction', 'non-fiction', 'science', 'history', 'biography'
  language VARCHAR(20) DEFAULT 'zh-CN', -- 'zh-CN', 'en-US', 'ja-JP'
  pages INTEGER,
  price DECIMAL(10, 2),
  published_year INTEGER,
  publisher VARCHAR(100),
  rating DECIMAL(3, 2), -- 评分 0.00 - 5.00
  stock INTEGER DEFAULT 0, -- 库存数量
  is_available BOOLEAN DEFAULT true, -- 是否可借阅
  description TEXT,
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT INTO books (title, author, isbn, genre, language, pages, price, published_year, publisher, rating, stock, is_available, description) VALUES
('三体', '刘慈欣', '9787536692930', 'science-fiction', 'zh-CN', 302, 23.00, 2008, '重庆出版社', 4.8, 5, true, '地球往事三部曲第一部，讲述了地球文明和三体文明的信息交流'),
('活着', '余华', '9787506365437', 'fiction', 'zh-CN', 191, 20.00, 2012, '作家出版社', 4.7, 3, true, '讲述了一个人和他命运之间的友情'),
('JavaScript高级程序设计', 'Nicholas C. Zakas', '9787115275790', 'technology', 'zh-CN', 747, 99.00, 2012, '人民邮电出版社', 4.6, 8, true, '前端开发经典书籍，深入讲解JavaScript语言'),
('人类简史', '尤瓦尔·赫拉利', '9787508647357', 'history', 'zh-CN', 440, 68.00, 2014, '中信出版社', 4.9, 2, true, '从十万年前到二十一世纪，人类如何崛起'),
('百年孤独', '加西亚·马尔克斯', '9787544253994', 'fiction', 'zh-CN', 360, 39.50, 2011, '南海出版公司', 4.5, 0, false, '魔幻现实主义文学代表作'),
('Python编程：从入门到实践', 'Eric Matthes', '9787115428028', 'technology', 'zh-CN', 459, 89.00, 2016, '人民邮电出版社', 4.7, 6, true, 'Python编程入门经典教程'),
('1984', 'George Orwell', '9780451524935', 'fiction', 'en-US', 328, 156.00, 1949, 'Signet Classic', 4.6, 4, true, 'Dystopian social science fiction novel'),
('设计模式', 'Erich Gamma等', '9787111211358', 'technology', 'zh-CN', 254, 79.00, 2007, '机械工业出版社', 4.8, 3, true, '软件开发经典书籍，面向对象设计模式'),
('挪威的森林', '村上春树', '9787532754465', 'fiction', 'zh-CN', 380, 35.00, 2007, '上海译文出版社', 4.3, 7, true, '讲述青春期的孤独、彷徨和成长'),
('数据结构与算法分析', 'Mark Allen Weiss', '9787111128090', 'technology', 'zh-CN', 540, 75.00, 2004, '机械工业出版社', 4.5, 2, true, '使用C语言描述的数据结构与算法经典教材'),
('小王子', '安东尼·德·圣-埃克苏佩里', '9787532754462', 'fiction', 'zh-CN', 115, 22.00, 2003, '人民文学出版社', 4.9, 10, true, '一个关于爱与责任的童话故事'),
('深入理解计算机系统', 'Randal E. Bryant', '9787111321330', 'technology', 'zh-CN', 702, 139.00, 2011, '机械工业出版社', 4.9, 4, true, '从程序员视角全面解析计算机系统');