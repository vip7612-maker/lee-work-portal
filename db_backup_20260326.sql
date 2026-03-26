PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT DEFAULT '',
  pinned INTEGER DEFAULT 0,
  color TEXT DEFAULT '#000',
  sort_order INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0
);
INSERT INTO projects VALUES('p3','Calendar','calendar.google.com',1,'#fbbc04',2,0);
INSERT INTO projects VALUES('p2','Drive','drive.google.com',1,'#34a853',1,0);
INSERT INTO projects VALUES('2','vip7612-maker/lee-work-portal','github.com',0,'#24292e',6,1);
INSERT INTO projects VALUES('mn5q29j3hrpo','지앤엠 2025 사업 결과보고','https://docs.google.com/document/d/1ONo92C7xGY74-KJf5HRZVKQNmCcG_7nBKJtFffjMZPo/edit?usp=sharing',0,'#00bcd4',6,0);
INSERT INTO projects VALUES('mn6s3mwflhlx','The Next Fellowship','https://the-next-fellowship.vercel.app/',0,'#673ab7',5,0);
CREATE TABLE IF NOT EXISTS checklists (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  text TEXT NOT NULL,
  checked INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO checklists VALUES('mn5pubp443ud','1','일단 2023자료를 2025자료로 세팅',0,0);
CREATE TABLE IF NOT EXISTS link_buttons (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO link_buttons VALUES('mn5pw6z4n8o5','1','해밀학교홈페이지','http://haemillschool.com',0);
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS viewport_tabs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO viewport_tabs VALUES('mn5s5gn2i560','1','사업신청서류','https://docs.google.com/document/d/1ONo92C7xGY74-KJf5HRZVKQNmCcG_7nBKJtFffjMZPo/edit?usp=sharing',1);
INSERT INTO viewport_tabs VALUES('mn6s809ya6ph','mn6s3mwflhlx','신청상황','https://the-next-fellowship.vercel.app/#/admin',0);
INSERT INTO viewport_tabs VALUES('mn6tf6i8abj8','p2','사업폴더','https://drive.google.com/drive/folders/1nqxsU0iG-MOJsJaX78OFsHCS1puU4T6N',0);
INSERT INTO viewport_tabs VALUES('mn6thnh5g48e','mn5q29j3hrpo','구글드라이브','https://drive.google.com/drive/folders/1nqxsU0iG-MOJsJaX78OFsHCS1puU4T6N',0);
COMMIT;
