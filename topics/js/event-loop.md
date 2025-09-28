# 이벤트 루프

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => {
  console.log("C");
  setTimeout(() => console.log("D"), 0);
});

queueMicrotask(() => console.log("E"));

(async () => {
  console.log("F");
  await Promise.resolve();
  console.log("G");
})();

document.addEventListener("click", () => console.log("H"));
console.log("I");
```

---

**실행 순서:**
`A → F → I → C → E → G → B → D`

- **동기(콜스택)**: `A, F, I`
- **마이크로태스크**: `C → E → G`
- **태스크**: `B → D`
- **이벤트 리스너 H**: 클릭 없으면 실행 안 됨

---

## 마이크로태스크 예시

- `Promise.then / catch / finally`
- `queueMicrotask`
- `MutationObserver`

## 태스크 예시

- `setTimeout`, `setInterval`
- `MessageChannel`
- DOM 이벤트 핸들러 (예: 클릭)
- 네트워크 완료 콜백 (XHR, fetch 등)
