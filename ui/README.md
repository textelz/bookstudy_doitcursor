# COZY 커피 주문 앱 - 프런트엔드

Vite와 React를 사용한 프런트엔드 애플리케이션입니다.

## 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

> **환경 변수 안내**  
> 백엔드 API와 통신하려면 `VITE_API_URL`을 설정해야 합니다.  
> - 로컬 개발 시: `ui/.env` 파일에 `VITE_API_URL=http://localhost:3000`  
> - Render 등 배포 환경: Static Site 설정에서 동일한 값을 환경 변수로 지정

## 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 미리보기

빌드된 파일을 미리보려면:

```bash
npm run preview
```

