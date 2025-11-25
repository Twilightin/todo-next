DROP TABLE IF EXISTS anime;

CREATE TABLE anime (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  status VARCHAR(20) DEFAULT 'watching',  -- 'watching', 'completed', 'plan_to_watch', 'dropped'
  score DECIMAL(3,1)                     -- 评分 0.0-10.0
);

-- 测试数据
INSERT INTO anime (title, status, score) VALUES
('进击的巨人', 'completed', 9.1),
('鬼灭之刃', 'completed', 8.6),
('间谍过家家', 'watching', 8.8),
('葬送的芙莉莲', 'completed', 9.3),
('咒术回战', 'watching', 8.7),
('紫罗兰永恒花园', 'completed', 8.9),
('钢之炼金术师', 'completed', 9.2),
('你的名字', 'completed', 8.9),
('死亡笔记', 'completed', 9.0),
('一拳超人', 'watching', 8.5),
('电锯人', 'completed', 8.7),
('蓝色监狱', 'plan_to_watch', NULL);