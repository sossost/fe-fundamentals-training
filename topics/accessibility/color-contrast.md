# 색상과 대비 (Color & Contrast)

## 개요

색상은 웹 디자인의 핵심 요소이지만, 색각 이상(색맹/색약)이 있는 사용자, 저시력 사용자, 노인 사용자 등을 고려해야 합니다. 충분한 색상 대비와 색상에만 의존하지 않는 디자인은 모든 사용자에게 접근성을 보장합니다.

## 색각 이상 통계

- 전 세계 남성의 약 **8%**, 여성의 약 **0.5%**가 색각 이상
- 가장 흔한 유형: 적록색맹 (Red-Green Color Blindness)
- 한국 남성 약 **5.9%**가 색각 이상 보유

---

## WCAG 대비 비율 기준

### 대비 비율이란?

두 색상 간의 밝기 차이를 숫자로 표현한 것입니다.
- 최소값: **1:1** (동일한 색상)
- 최대값: **21:1** (검정과 흰색)

### WCAG 기준

| 레벨 | 일반 텍스트 | 큰 텍스트 | UI 컴포넌트 |
|------|------------|----------|-------------|
| AA (최소) | 4.5:1 | 3:1 | 3:1 |
| AAA (향상) | 7:1 | 4.5:1 | - |

> **큰 텍스트**: 18pt(24px) 이상 또는 14pt(18.5px) Bold 이상

### 예시

```css
/* ✅ 좋은 대비 */
.good-contrast {
  color: #1a1a1a;        /* 거의 검정 */
  background: #ffffff;   /* 흰색 */
  /* 대비 비율: 약 17:1 */
}

/* ❌ 나쁜 대비 */
.bad-contrast {
  color: #999999;        /* 회색 */
  background: #ffffff;   /* 흰색 */
  /* 대비 비율: 약 2.8:1 - AA 기준 미달 */
}

/* ⚠️ 경계선 대비 */
.borderline {
  color: #767676;        /* 어두운 회색 */
  background: #ffffff;   /* 흰색 */
  /* 대비 비율: 약 4.5:1 - AA 기준 딱 통과 */
}
```

### 자주 쓰는 색상 대비 예시

```css
/* 검정 배경에서 */
.on-black {
  background: #000000;
  /* ✅ 흰색: 21:1 */
  /* ✅ #AAAAAA (밝은 회색): 7:1 */
  /* ❌ #666666: 5.7:1 - AA 통과, AAA 미달 */
}

/* 흰색 배경에서 */
.on-white {
  background: #ffffff;
  /* ✅ 검정: 21:1 */
  /* ✅ #595959: 7:1 (AAA 통과) */
  /* ✅ #767676: 4.5:1 (AA 통과) */
  /* ❌ #949494: 3:1 (큰 텍스트만 통과) */
}

/* 브랜드 컬러 예시 */
.brand-blue {
  background: #0066cc;
  /* ✅ 흰색: 5.4:1 */
  /* ❌ 검정: 3.9:1 - 미달 */
}
```

---

## 색상에만 의존하지 않기

### ❌ 잘못된 예: 색상만으로 상태 표시

```html
<!-- 색맹 사용자는 빨간색/초록색 구분 불가 -->
<style>
  .error { color: red; }
  .success { color: green; }
</style>

<span class="error">이메일 형식이 잘못되었습니다</span>
<span class="success">저장되었습니다</span>
```

### ✅ 올바른 예: 색상 + 아이콘/텍스트

```html
<style>
  .error { 
    color: #dc2626; 
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .success { 
    color: #16a34a;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>

<span class="error">
  <svg aria-hidden="true"><!-- X 아이콘 --></svg>
  오류: 이메일 형식이 잘못되었습니다
</span>

<span class="success">
  <svg aria-hidden="true"><!-- 체크 아이콘 --></svg>
  성공: 저장되었습니다
</span>
```

### 차트/그래프에서의 대안

```tsx
// ❌ 색상만으로 구분
const BadChart = () => (
  <div>
    <div style={{ background: 'red', width: '100px' }} />
    <div style={{ background: 'green', width: '150px' }} />
    <div style={{ background: 'blue', width: '80px' }} />
  </div>
);

// ✅ 패턴 + 라벨 추가
const GoodChart = () => (
  <div>
    <div style={{ background: 'red' }}>
      <span>매출 (100)</span>
      {/* 또는 패턴 오버레이 추가 */}
    </div>
    <div style={{ 
      background: 'green',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)'
    }}>
      <span>비용 (150)</span>
    </div>
  </div>
);
```

### 링크 구분

```css
/* ❌ 색상만으로 링크 구분 */
a {
  color: blue;
  text-decoration: none;
}

/* ✅ 밑줄 또는 다른 시각적 구분 추가 */
a {
  color: #0066cc;
  text-decoration: underline;
}

/* 또는 호버 시 밑줄 + 다른 스타일 */
a {
  color: #0066cc;
  text-decoration: underline;
  text-underline-offset: 2px;
}

a:hover {
  text-decoration-thickness: 2px;
}
```

### 폼 에러 상태

```css
/* ❌ 테두리 색상만 변경 */
input.error {
  border-color: red;
}

/* ✅ 아이콘 + 텍스트 + 색상 */
.form-field.error input {
  border-color: #dc2626;
  border-width: 2px;
}

.form-field.error::after {
  content: '⚠️';
  /* 또는 에러 아이콘 표시 */
}

.form-field .error-message {
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-field .error-message::before {
  content: '⚠';
}
```

---

## 다크모드 지원

### CSS 미디어 쿼리

```css
:root {
  /* 라이트모드 변수 */
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e5e5e5;
  --color-primary: #0066cc;
  --color-error: #dc2626;
  --color-success: #16a34a;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* 다크모드 변수 */
    --color-bg: #1a1a1a;
    --color-text: #f5f5f5;
    --color-text-secondary: #a3a3a3;
    --color-border: #404040;
    --color-primary: #60a5fa;
    --color-error: #f87171;
    --color-success: #4ade80;
  }
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

### 수동 테마 전환

```tsx
type Theme = 'light' | 'dark' | 'system';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

```css
:root,
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #f5f5f5;
}
```

### 테마 전환 버튼 접근성

```tsx
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  const getLabel = () => {
    switch (theme) {
      case 'light': return '라이트 모드 (클릭하여 다크 모드로 전환)';
      case 'dark': return '다크 모드 (클릭하여 시스템 설정으로 전환)';
      case 'system': return '시스템 설정 (클릭하여 라이트 모드로 전환)';
    }
  };
  
  return (
    <button
      onClick={cycleTheme}
      aria-label={getLabel()}
    >
      {theme === 'light' && '☀️'}
      {theme === 'dark' && '🌙'}
      {theme === 'system' && '💻'}
    </button>
  );
};
```

### 다크모드에서 대비 확인

```css
/* ⚠️ 라이트모드에서 괜찮았던 색상이 다크모드에서 대비 부족할 수 있음 */

/* 라이트모드 */
.light-mode {
  background: #ffffff;
  color: #666666;  /* 대비 5.7:1 ✅ */
}

/* 다크모드 - 같은 텍스트 색상 사용 시 */
.dark-mode {
  background: #1a1a1a;
  color: #666666;  /* 대비 3.1:1 ❌ 미달! */
}

/* ✅ 다크모드용 색상 조정 */
.dark-mode {
  background: #1a1a1a;
  color: #a3a3a3;  /* 대비 6.3:1 ✅ */
}
```

---

## 고대비 모드 (High Contrast Mode)

### Windows 고대비 모드 지원

```css
/* forced-colors 미디어 쿼리 */
@media (forced-colors: active) {
  /* 시스템 색상 사용 */
  .button {
    border: 2px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
  
  .button:hover {
    border-color: Highlight;
  }
  
  .button:focus {
    outline: 3px solid Highlight;
  }
  
  /* 비활성화 상태 */
  .button:disabled {
    color: GrayText;
    border-color: GrayText;
  }
  
  /* 링크 */
  a {
    color: LinkText;
  }
  
  /* 선택된 상태 */
  .selected {
    background: Highlight;
    color: HighlightText;
  }
}
```

### 시스템 색상 키워드

| 키워드 | 설명 |
|--------|------|
| `Canvas` | 문서 배경 |
| `CanvasText` | 문서 텍스트 |
| `LinkText` | 링크 |
| `ButtonFace` | 버튼 배경 |
| `ButtonText` | 버튼 텍스트 |
| `Highlight` | 선택된 항목 배경 |
| `HighlightText` | 선택된 항목 텍스트 |
| `GrayText` | 비활성화된 텍스트 |

### 아이콘/이미지 처리

```css
@media (forced-colors: active) {
  /* 아이콘이 사라지지 않도록 */
  .icon {
    forced-color-adjust: none;
    /* 또는 */
    forced-color-adjust: preserve-parent-color;
  }
  
  /* 장식용 요소 숨기기 */
  .decorative {
    display: none;
  }
}
```

---

## CSS 색상 함수 활용

### 상대적 밝기 조절

```css
:root {
  --primary: #0066cc;
  --primary-light: color-mix(in srgb, var(--primary), white 20%);
  --primary-dark: color-mix(in srgb, var(--primary), black 20%);
}

/* 또는 HSL 사용 */
:root {
  --primary-h: 210;
  --primary-s: 100%;
  --primary-l: 40%;
  
  --primary: hsl(var(--primary-h), var(--primary-s), var(--primary-l));
  --primary-light: hsl(var(--primary-h), var(--primary-s), 60%);
  --primary-dark: hsl(var(--primary-h), var(--primary-s), 25%);
}
```

### 반투명 오버레이

```css
/* 반투명 배경 위의 텍스트도 대비 확인 필요 */
.overlay {
  background: rgba(0, 0, 0, 0.7);  /* 70% 불투명 */
  color: #ffffff;
  /* 최종 대비는 배경 이미지에 따라 달라짐 */
}

/* ✅ 텍스트 가독성 보장 */
.overlay-text {
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 1rem;
  /* 배경을 더 불투명하게 */
}
```

---

## React 컴포넌트 패턴

### 상태별 색상 + 아이콘

```tsx
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type Status = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  status: Status;
  children: React.ReactNode;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    className: 'alert-success',
    label: '성공',
  },
  error: {
    icon: XCircle,
    className: 'alert-error',
    label: '오류',
  },
  warning: {
    icon: AlertCircle,
    className: 'alert-warning',
    label: '경고',
  },
  info: {
    icon: Info,
    className: 'alert-info',
    label: '안내',
  },
};

const Alert = ({ status, children }: AlertProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={`alert ${config.className}`} role="alert">
      <Icon aria-hidden="true" className="alert-icon" />
      <span className="sr-only">{config.label}:</span>
      <div className="alert-content">{children}</div>
    </div>
  );
};
```

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.alert-success {
  background: #f0fdf4;
  border-color: #16a34a;
  color: #166534;
}

.alert-error {
  background: #fef2f2;
  border-color: #dc2626;
  color: #991b1b;
}

.alert-warning {
  background: #fffbeb;
  border-color: #d97706;
  color: #92400e;
}

.alert-info {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1e40af;
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  .alert-success {
    background: #052e16;
    color: #86efac;
  }
  
  .alert-error {
    background: #450a0a;
    color: #fca5a5;
  }
  /* ... */
}
```

### 뱃지 컴포넌트

```tsx
type BadgeVariant = 'default' | 'success' | 'warning' | 'error';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const Badge = ({ variant = 'default', children }: BadgeProps) => {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
};
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-default {
  background: #f3f4f6;
  color: #374151;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}

/* 대비 확인 필요! 배경과 텍스트 색상 조합 */
```

---

## 색상 대비 확인 도구

### 브라우저 개발자 도구

1. **Chrome DevTools**
   - Elements > Styles에서 색상 클릭
   - Contrast ratio 표시됨
   - AA/AAA 충족 여부 확인

2. **Firefox DevTools**
   - Accessibility Inspector 사용
   - 대비 문제 자동 감지

### 온라인 도구

| 도구 | URL | 특징 |
|------|-----|------|
| WebAIM Contrast Checker | webaim.org/resources/contrastchecker | 가장 널리 사용 |
| Coolors Contrast Checker | coolors.co/contrast-checker | UI가 직관적 |
| Colour Contrast Analyzer | tpgi.com/color-contrast-checker | 설치형, 스포이드 |
| Stark | getstark.co | Figma/Sketch 플러그인 |

### 색맹 시뮬레이터

| 도구 | 설명 |
|------|------|
| Chrome DevTools | Rendering > Emulate vision deficiencies |
| Sim Daltonism (Mac) | 실시간 색맹 시뮬레이션 앱 |
| Color Oracle | 무료 색맹 시뮬레이터 |

### 자동화 테스트

```tsx
// jest-axe 사용
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('색상 대비 접근성', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 실용적인 색상 팔레트

### 접근성 기준 충족하는 그레이스케일

```css
:root {
  /* 흰색 배경(#fff)에서 AA 기준 충족하는 그레이 */
  --gray-50: #f9fafb;   /* 배경용 */
  --gray-100: #f3f4f6;  /* 배경용 */
  --gray-200: #e5e7eb;  /* 테두리용 */
  --gray-300: #d1d5db;  /* 비활성 테두리 */
  --gray-400: #9ca3af;  /* 플레이스홀더 - 큰 텍스트만 ⚠️ */
  --gray-500: #6b7280;  /* 보조 텍스트 ✅ 4.6:1 */
  --gray-600: #4b5563;  /* 보조 텍스트 ✅ 7:1 */
  --gray-700: #374151;  /* 본문 텍스트 ✅ 10:1 */
  --gray-800: #1f2937;  /* 제목 ✅ 14:1 */
  --gray-900: #111827;  /* 강조 텍스트 ✅ 17:1 */
}
```

### 시맨틱 컬러

```css
:root {
  /* Primary - 브랜드 컬러 */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;  /* 흰색 배경: 3.1:1 큰 텍스트만 */
  --primary-600: #2563eb;  /* 흰색 배경: 4.5:1 ✅ */
  --primary-700: #1d4ed8;  /* 흰색 배경: 6.0:1 ✅ */
  
  /* Success - 성공/확인 */
  --success-600: #16a34a;  /* 흰색 배경: 4.5:1 ✅ */
  --success-700: #15803d;  /* 흰색 배경: 5.9:1 ✅ */
  
  /* Warning - 경고 */
  --warning-600: #d97706;  /* 흰색 배경: 3.4:1 큰 텍스트만 */
  --warning-700: #b45309;  /* 흰색 배경: 4.8:1 ✅ */
  
  /* Error - 에러 */
  --error-600: #dc2626;    /* 흰색 배경: 4.0:1 큰 텍스트만 */
  --error-700: #b91c1c;    /* 흰색 배경: 5.3:1 ✅ */
}
```

---

## 체크리스트

- [ ] 일반 텍스트의 대비 비율이 4.5:1 이상인가?
- [ ] 큰 텍스트(24px+)의 대비 비율이 3:1 이상인가?
- [ ] UI 컴포넌트(버튼, 입력필드)의 대비 비율이 3:1 이상인가?
- [ ] 색상만으로 정보를 전달하지 않는가? (아이콘/텍스트 추가)
- [ ] 링크가 색상 외의 방법으로 구분되는가? (밑줄 등)
- [ ] 에러/성공 상태가 색상 외의 방법으로도 구분되는가?
- [ ] 다크모드에서도 대비 기준을 충족하는가?
- [ ] 고대비 모드(forced-colors)를 지원하는가?
- [ ] 색맹 시뮬레이터로 확인했는가?

---

## 참고 자료

- [WCAG 2.1 - Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM - Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [MDN - CSS color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
- [Inclusive Design - Color](https://inclusive-toolkit.design/color/)
- [A11y Color Tokens](https://www.radix-ui.com/colors)

