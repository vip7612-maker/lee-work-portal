# 이경진 업무포털 - 개발 환경 설정 가이드

## 🔗 주요 링크
- **배포 URL**: https://lee-work-portal.vercel.app
- **GitHub**: https://github.com/vip7612-maker/lee-work-portal
- **Turso DB**: libsql://lee-work-portal-vip7612-maker.aws-ap-northeast-1.turso.io

## 🖥️ 다른 컴퓨터에서 개발 시작하기

### 1. 사전 요구사항

```bash
# Node.js 18+ 설치 확인
node -v

# npm 설치 확인
npm -v
```

### 2. 프로젝트 클론

```bash
git clone https://github.com/vip7612-maker/lee-work-portal.git
cd lee-work-portal
npm install
```

### 3. 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://lee-work-portal-vip7612-maker.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=<Turso 토큰>

# NextAuth
AUTH_SECRET=<시크릿 키>
AUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=<Google Client ID>
AUTH_GOOGLE_SECRET=<Google Client Secret>
GOOGLE_CLIENT_ID=<Google Client ID>
GOOGLE_CLIENT_SECRET=<Google Client Secret>
```

#### 환경변수 값 얻는 방법:

| 변수 | 획득 방법 |
|------|-----------|
| `TURSO_AUTH_TOKEN` | `turso db tokens create lee-work-portal` |
| `AUTH_SECRET` | `npx auth secret` 또는 `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |

### 4. CLI 도구 설치 (선택)

```bash
# Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login

# Vercel CLI
npm i -g vercel
vercel login
```

### 5. 로컬 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 확인
```

### 6. Vercel 배포

```bash
vercel --prod
```

## 📦 DB 백업 & 복원

### 백업
```bash
turso db shell lee-work-portal ".dump" > db_backup_$(date +%Y%m%d).sql
```

### 복원
```bash
turso db shell lee-work-portal < db_backup_20260326.sql
```

## 🗄️ DB 스키마

```sql
-- 프로젝트
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT DEFAULT '',
  pinned INTEGER DEFAULT 0,
  memo TEXT DEFAULT '',
  color TEXT DEFAULT '#4285f4',
  sort_order INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0
);

-- 체크리스트
CREATE TABLE checklists (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  text TEXT NOT NULL,
  checked INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- 링크 버튼
CREATE TABLE link_buttons (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 메모
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 뷰포트 탭
CREATE TABLE viewport_tabs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
```

## 🛠️ 기술 스택
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일**: Vanilla CSS (globals.css)
- **DB**: Turso (libSQL)
- **인증**: NextAuth v5 (Google Provider)
- **배포**: Vercel
- **아이콘**: Lucide React
