# Markdown Rendering Test

이 글은 `posts/markdown-test.md` 파일에 작성된 마크다운이 그대로 웹사이트에 올라가는지 확인하기 위한 테스트 포스트입니다. 한글 본문, 영어 문장, 표, 이미지, 코드블록, 인용문, 체크리스트, 수식을 한 번에 점검합니다.

## 1. Basic Text

As a quick experiment, this paragraph mixes **bold text**, *italic text*, inline `code`, and a [link to Lucide](https://lucide.dev/icons).

> 좋은 기록은 생각을 정리하는 도구이자, 다음 실험을 위한 설계도입니다.

## 2. List

- Mechanical Engineering
- Business Administration
- Film and Music
- Programming

1. Write the markdown file.
2. Register it in `posts/index.json`.
3. Render it through `post.html`.

## 3. Table

| Area | Tool | What To Check |
| --- | --- | --- |
| Programming | Python / C++ | Code block and inline code |
| Design | Fusion 360 | Image and caption flow |
| Finance | Accounting | Table alignment |
| Language | Japanese / Italian | Mixed-language typography |

## 4. Image

![Blueprint style test image](assets/img/markdown-test.svg)

## 5. Code

```js
const interests = ['film', 'music', 'finance', 'programming'];

for (const topic of interests) {
  console.log(`Exploring ${topic}`);
}
```

## 6. Math

Inline math should render like this: \\( E = mc^2 \\).

Block math should render like this:

\\[
\int_0^1 x^2\,dx = \frac{1}{3}
\\]

Another useful engineering equation:

\\[
F = ma
\\]

## 7. Divider

---

마크다운 렌더링 테스트 끝.
