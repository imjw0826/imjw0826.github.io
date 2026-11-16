# imjw0826.github.io

## 1. 프로젝트 소개

임정원(Jungwon Im)의 개인 포트폴리오 웹사이트입니다. 자기소개와 학력, 만든 프로젝트 목록, 블로그 글, 연락처를 한곳에 모아 두는 것이 목적입니다. 졸업 이수 현황 관리 페이지와 CED Robocon 시뮬레이션도 함께 올려 두었습니다.

## 2. 기술 스택

- **웹사이트:** HTML, CSS, JavaScript (빌드 과정 없는 정적 사이트)
- **블로그 렌더링:** marked, highlight.js, MathJax
- **이수 현황 페이지:** Firebase
- **배포:** GitHub Pages

## 3. 이용 방법

**웹사이트:** https://imjw0826.github.io/

- **Home:** 소개와 학력
- **Projects:** 프로젝트 목록과 각 프로젝트 사이트·소스 링크
- **Blog:** 마크다운으로 작성한 글 (코드 강조와 수식 지원)
- **Contact:** 연락처
- **/snu-graduate, /karts-graduate:** 졸업 요건 대비 과목 이수 현황 관리
- **/simulation.html:** CED Robocon 경기 시뮬레이션

로컬에서 보려면 저장소를 받아 정적 서버로 엽니다.

```sh
git clone https://github.com/imjw0826/imjw0826.github.io.git
cd imjw0826.github.io
python3 -m http.server 8000
```

블로그 글은 `posts/`에 마크다운 파일을 추가하고 `posts/index.json`에 등록합니다.

## 4. 최근 업데이트

2026-11-09
