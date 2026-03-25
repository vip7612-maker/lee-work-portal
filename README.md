# 이경진 업무포털 (Lee Work Portal)

Dia 브라우저 스타일의 업무 관리 포털. Next.js + Turso DB + Google OAuth.

## 🚀 배포 URL
**https://lee-work-portal.vercel.app**

## 📦 기술 스택
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: Turso (LibSQL)
- **Auth**: NextAuth v5 (Google OAuth)
- **Deploy**: Vercel
- **Style**: Vanilla CSS + Lucide Icons

## 🔧 다른 컴퓨터에서 개발 시작하기

### 1. 클론
```bash
git clone https://github.com/vip7612-maker/lee-work-portal.git
cd lee-work-portal
npm install
```

### 2. 환경변수 설정
`.env.local` 파일 생성:
```env
TURSO_DATABASE_URL=libsql://lee-work-portal-vip7612-maker.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=<Turso 인증 토큰>
AUTH_SECRET=<openssl rand -base64 32 로 생성>
AUTH_GOOGLE_ID=71589075515-iatrmr991ng3c3i9fve39fnd4h71ed22.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=<Google OAuth Client Secret>
GOOGLE_CLIENT_ID=71589075515-iatrmr991ng3c3i9fve39fnd4h71ed22.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<Google OAuth Client Secret>
AUTH_URL=http://localhost:3000
```

> **참고**: Turso 토큰은 `turso db tokens create lee-work-portal` 로 새로 발급 가능

### 3. 로컬 실행
```bash
npm run dev
```
http://localhost:3000 에서 확인

### 4. Vercel 배포
```bash
npx vercel --prod
```

## 📁 프로젝트 구조
```
src/
├── app/
│   ├── page.tsx          # 메인 포털 UI (모든 컴포넌트 포함)
│   ├── globals.css       # 전체 스타일
│   ├── layout.tsx        # 루트 레이아웃 (SessionProvider)
│   ├── providers.tsx     # NextAuth SessionProvider 래퍼
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # Google OAuth
│       ├── projects/route.ts            # 프로젝트 CRUD
│       ├── checklists/route.ts          # 체크리스트 CRUD
│       ├── links/route.ts               # 링크 버튼 CRUD
│       ├── comments/route.ts            # 메모/댓글 CRUD
│       └── viewport-tabs/route.ts       # 뷰포트 서브탭 CRUD
└── lib/
    ├── turso.ts          # Turso DB 클라이언트
    └── auth.ts           # NextAuth 설정
```

## 🗄️ DB 스키마 (Turso)
```sql
-- 프로젝트 (좌측 사이드바)
CREATE TABLE projects (id TEXT PK, label TEXT, url TEXT, pinned INT, color TEXT, sort_order INT, archived INT);

-- 체크리스트 (우측 패널)
CREATE TABLE checklists (id TEXT PK, project_id TEXT, text TEXT, checked INT, sort_order INT);

-- 링크 버튼 (우측 패널)
CREATE TABLE link_buttons (id TEXT PK, project_id TEXT, label TEXT, url TEXT, sort_order INT);

-- 메모 (우측 패널)
CREATE TABLE comments (id TEXT PK, project_id TEXT, text TEXT, created_at TEXT);

-- 뷰포트 서브탭 (가운데 탭바)
CREATE TABLE viewport_tabs (id TEXT PK, project_id TEXT, name TEXT, url TEXT, sort_order INT);
```

## 🔑 Google OAuth 설정
- **GCP 프로젝트**: lee-work-portal
- **OAuth 동의 화면**: 테스트 모드 (vip7612@gmail.com 등록됨)
- **리디렉션 URI**:
  - `https://lee-work-portal.vercel.app/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`

## 📋 주요 기능
| 기능 | 설명 |
|------|------|
| 좌측 사이드바 | 프로젝트 관리 (드래그정렬, 즐겨찾기 핀, 보관/복원) |
| 가운데 뷰포트 | 서브탭 + URL바 + iframe (Google Docs 편집 가능) |
| 우측 패널 | 체크리스트 / 링크 / 메모 3탭 |
| 인증 | Google 로그인 (로그인 전 콘텐츠 비공개) |
| 데이터 저장 | 모든 데이터 Turso DB에 영구 저장 |
