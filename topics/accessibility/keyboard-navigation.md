# 키보드 접근성 (Keyboard Accessibility)

## 개요

키보드 접근성은 마우스를 사용할 수 없는 사용자가 키보드만으로 웹사이트의 모든 기능을 사용할 수 있게 하는 것입니다. 이는 운동 장애가 있는 사용자, 스크린 리더 사용자, 파워 유저 등 다양한 사용자에게 필수적입니다.

## 왜 중요한가?

### 대상 사용자

- **운동 장애 사용자**: 마우스 사용이 어려운 사용자
- **시각 장애 사용자**: 스크린 리더는 키보드로 탐색
- **일시적 장애**: 손 부상, RSI(반복 긴장 손상) 등
- **파워 유저**: 키보드 단축키 선호
- **고령 사용자**: 정밀한 마우스 조작이 어려운 경우

### WCAG 요구사항

- **2.1.1 Keyboard (Level A)**: 모든 기능이 키보드로 조작 가능해야 함
- **2.1.2 No Keyboard Trap (Level A)**: 키보드 포커스가 갇히면 안 됨
- **2.4.3 Focus Order (Level A)**: 논리적인 포커스 순서
- **2.4.7 Focus Visible (Level AA)**: 포커스가 시각적으로 보여야 함

---

## tabindex 이해하기

### tabindex="0"

요소를 자연스러운 탭 순서에 포함시킵니다.

```html
<!-- 기본적으로 포커스 불가능한 요소를 포커스 가능하게 -->
<div tabindex="0" role="button" onclick="handleClick()">
  커스텀 버튼
</div>

<span tabindex="0">포커스 가능한 텍스트</span>
```

### tabindex="-1"

프로그래밍 방식으로만 포커스 가능 (탭으로 접근 불가)

```html
<!-- 탭 순서에서는 제외, JavaScript로 포커스 가능 -->
<div id="modal-content" tabindex="-1">
  모달 내용
</div>

<script>
  // 모달이 열릴 때 프로그래밍 방식으로 포커스
  document.getElementById('modal-content').focus();
</script>
```

### tabindex="1" 이상 (양수) ❌

> **절대 사용하지 마세요!**

```html
<!-- ❌ 탭 순서가 엉망이 됨 -->
<button tabindex="3">세 번째로 포커스</button>
<button tabindex="1">첫 번째로 포커스</button>
<button tabindex="2">두 번째로 포커스</button>

<!-- ✅ DOM 순서로 자연스럽게 -->
<button>첫 번째</button>
<button>두 번째</button>
<button>세 번째</button>
```

### 기본적으로 포커스 가능한 요소

다음 요소들은 tabindex 없이도 포커스 가능합니다:

- `<a href="...">`
- `<button>`
- `<input>`, `<textarea>`, `<select>`
- `<details>`, `<summary>`
- `contenteditable="true"` 요소

```html
<!-- 이미 포커스 가능 - tabindex 불필요 -->
<a href="/page">링크</a>
<button>버튼</button>
<input type="text" />
```

---

## 포커스 스타일

### 기본 포커스 스타일 유지

```css
/* ❌ 절대 하지 마세요! */
*:focus {
  outline: none;
}

button:focus {
  outline: 0;
}
```

### 커스텀 포커스 스타일

```css
/* ✅ 기본 스타일을 더 나은 것으로 대체 */
button:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* ✅ 또는 box-shadow 사용 */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5);
}
```

### :focus-visible 활용

마우스 클릭 시에는 포커스 링 숨기고, 키보드 탐색 시에만 표시

```css
/* 키보드 탐색 시에만 포커스 스타일 표시 */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

```css
/* 전역 포커스 스타일 설정 */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--focus-color, #005fcc);
  outline-offset: 2px;
}

/* 입력 필드는 항상 포커스 표시 */
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--focus-color, #005fcc);
  outline-offset: 2px;
}
```

### 고대비 모드 지원

```css
/* 고대비 모드에서도 포커스 표시 */
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid CanvasText;
  }
}
```

---

## Skip Link (본문 바로가기)

### 왜 필요한가?

키보드 사용자가 매번 네비게이션을 탭으로 통과해야 하는 것을 방지합니다.

### 구현

```html
<body>
  <!-- Skip Link: 페이지 맨 처음에 위치 -->
  <a href="#main-content" class="skip-link">
    본문 바로가기
  </a>
  
  <header>
    <nav>
      <!-- 많은 네비게이션 링크들 -->
    </nav>
  </header>
  
  <main id="main-content" tabindex="-1">
    <!-- 메인 콘텐츠 -->
  </main>
</body>
```

```css
.skip-link {
  /* 기본적으로 화면 밖에 숨김 */
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  text-decoration: none;
  z-index: 10000;
  transition: top 0.2s;
}

/* 포커스 시 화면에 표시 */
.skip-link:focus {
  top: 0;
}
```

### React 컴포넌트

```tsx
const SkipLink = ({ targetId = 'main-content', children = '본문 바로가기' }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

// 사용
const Layout = ({ children }) => (
  <>
    <SkipLink />
    <Header />
    <main id="main-content" tabindex={-1}>
      {children}
    </main>
    <Footer />
  </>
);
```

---

## 키보드 네비게이션 패턴

### 기본 키보드 조작

| 키 | 동작 |
|----|------|
| `Tab` | 다음 포커스 가능 요소로 이동 |
| `Shift + Tab` | 이전 포커스 가능 요소로 이동 |
| `Enter` | 링크 활성화, 버튼 클릭 |
| `Space` | 버튼 클릭, 체크박스 토글 |
| `Escape` | 모달/드롭다운 닫기 |
| `Arrow Keys` | 메뉴, 탭, 슬라이더 등 탐색 |

### 인터랙티브 컴포넌트별 패턴

#### 드롭다운 메뉴

```tsx
const DropdownMenu = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex((prev) => 
            prev < items.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
        
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
        
      case 'Enter':
      case ' ':
        if (isOpen && activeIndex >= 0) {
          e.preventDefault();
          items[activeIndex].onClick();
          setIsOpen(false);
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  };

  // 활성 항목에 포커스
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex]);

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      
      {isOpen && (
        <ul ref={menuRef} role="menu">
          {items.map((item, index) => (
            <li key={item.id} role="none">
              <button
                ref={(el) => (itemRefs.current[index] = el)}
                role="menuitem"
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

#### 탭 패널

```tsx
const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    
    switch (e.key) {
      case 'ArrowRight':
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case 'ArrowLeft':
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    setActiveTab(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="탭 메뉴">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === index}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
```

---

## 포커스 관리 (Focus Management)

### 포커스 이동

```tsx
import { useRef, useEffect } from 'react';

// 요소로 포커스 이동
const FocusExample = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    inputRef.current?.focus();
  };
  
  return (
    <>
      <button onClick={handleButtonClick}>입력 필드로 이동</button>
      <input ref={inputRef} type="text" />
    </>
  );
};
```

### 포커스 복원 (Focus Restoration)

모달이나 드롭다운이 닫힐 때 원래 위치로 포커스 복원

```tsx
import { useRef, useEffect } from 'react';

const useRestoreFocus = (isOpen: boolean) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // 열릴 때 현재 포커스 저장
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      // 닫힐 때 포커스 복원
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);
};

// 사용
const Modal = ({ isOpen, onClose, children }) => {
  useRestoreFocus(isOpen);
  
  if (!isOpen) return null;
  
  return (
    <div role="dialog" aria-modal="true">
      {children}
      <button onClick={onClose}>닫기</button>
    </div>
  );
};
```

### 포커스 트랩 (Focus Trap)

모달 내부에서만 포커스가 순환하도록 제한

```tsx
import { useRef, useEffect, useCallback } from 'react';

const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab: 첫 번째에서 마지막으로
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: 마지막에서 첫 번째로
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // 활성화 시 첫 번째 요소에 포커스
  useEffect(() => {
    if (isActive && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isActive]);
  
  return containerRef;
};

// 사용
const Modal = ({ isOpen, onClose, children }) => {
  const containerRef = useFocusTrap(isOpen);
  useRestoreFocus(isOpen);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* 배경 오버레이 */}
      <div className="overlay" onClick={onClose} />
      
      {/* 모달 */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title">모달 제목</h2>
        {children}
        <button onClick={onClose}>닫기</button>
      </div>
    </>
  );
};
```

### inert 속성 활용

모달 외부 콘텐츠를 비활성화

```tsx
const Modal = ({ isOpen, children }) => {
  useEffect(() => {
    const app = document.getElementById('app');
    if (isOpen && app) {
      app.setAttribute('inert', '');
      app.setAttribute('aria-hidden', 'true');
    }
    
    return () => {
      if (app) {
        app.removeAttribute('inert');
        app.removeAttribute('aria-hidden');
      }
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div role="dialog" aria-modal="true">
      {children}
    </div>,
    document.body
  );
};
```

---

## 로빙 탭인덱스 (Roving Tabindex)

복합 위젯에서 하나의 요소만 탭으로 접근 가능하게 하고, 내부는 화살표 키로 탐색

### 원리

```
Tab → [첫 번째 그룹의 활성 항목] → (화살표로 내부 탐색) → Tab → [다음 그룹]
```

### 구현

```tsx
const ToolBar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const buttons = [
    { id: 'bold', label: '굵게', icon: 'B' },
    { id: 'italic', label: '기울임', icon: 'I' },
    { id: 'underline', label: '밑줄', icon: 'U' },
  ];
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newIndex = activeIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        newIndex = activeIndex < buttons.length - 1 ? activeIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        newIndex = activeIndex > 0 ? activeIndex - 1 : buttons.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    setActiveIndex(newIndex);
    buttonRefs.current[newIndex]?.focus();
  };
  
  return (
    <div role="toolbar" aria-label="텍스트 서식" onKeyDown={handleKeyDown}>
      {buttons.map((button, index) => (
        <button
          key={button.id}
          ref={(el) => (buttonRefs.current[index] = el)}
          aria-label={button.label}
          tabIndex={activeIndex === index ? 0 : -1}
          onClick={() => setActiveIndex(index)}
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};
```

### useRovingTabIndex 훅

```tsx
import { useState, useRef, useCallback, KeyboardEvent } from 'react';

interface UseRovingTabIndexOptions {
  itemCount: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
}

const useRovingTabIndex = ({
  itemCount,
  direction = 'horizontal',
  loop = true,
}: UseRovingTabIndexOptions) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  
  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  }, []);
  
  const getTabIndex = useCallback((index: number) => {
    return activeIndex === index ? 0 : -1;
  }, [activeIndex]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let newIndex = activeIndex;
    
    const prevKeys = direction === 'vertical' 
      ? ['ArrowUp'] 
      : direction === 'horizontal' 
        ? ['ArrowLeft'] 
        : ['ArrowUp', 'ArrowLeft'];
        
    const nextKeys = direction === 'vertical'
      ? ['ArrowDown']
      : direction === 'horizontal'
        ? ['ArrowRight']
        : ['ArrowDown', 'ArrowRight'];
    
    if (prevKeys.includes(e.key)) {
      newIndex = activeIndex > 0 
        ? activeIndex - 1 
        : loop ? itemCount - 1 : activeIndex;
    } else if (nextKeys.includes(e.key)) {
      newIndex = activeIndex < itemCount - 1 
        ? activeIndex + 1 
        : loop ? 0 : activeIndex;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = itemCount - 1;
    } else {
      return;
    }
    
    e.preventDefault();
    setActiveIndex(newIndex);
    itemRefs.current[newIndex]?.focus();
  }, [activeIndex, itemCount, direction, loop]);
  
  return {
    activeIndex,
    setActiveIndex,
    setRef,
    getTabIndex,
    handleKeyDown,
  };
};

// 사용
const RadioGroup = ({ options, value, onChange }) => {
  const { setRef, getTabIndex, handleKeyDown, setActiveIndex } = useRovingTabIndex({
    itemCount: options.length,
    direction: 'vertical',
  });
  
  return (
    <div role="radiogroup" onKeyDown={handleKeyDown}>
      {options.map((option, index) => (
        <label key={option.value}>
          <input
            ref={setRef(index)}
            type="radio"
            name="group"
            value={option.value}
            checked={value === option.value}
            tabIndex={getTabIndex(index)}
            onChange={() => {
              onChange(option.value);
              setActiveIndex(index);
            }}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};
```

---

## 키보드 단축키 구현

### 전역 단축키

```tsx
import { useEffect, useCallback } from 'react';

const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { ctrl = false, shift = false, alt = false } = modifiers;
    
    if (
      e.key.toLowerCase() === key.toLowerCase() &&
      e.ctrlKey === ctrl &&
      e.shiftKey === shift &&
      e.altKey === alt
    ) {
      e.preventDefault();
      callback();
    }
  }, [key, callback, modifiers]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// 사용
const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Ctrl + K로 검색 열기
  useKeyboardShortcut('k', () => setIsSearchOpen(true), { ctrl: true });
  
  // Escape로 검색 닫기
  useKeyboardShortcut('Escape', () => setIsSearchOpen(false));
  
  return (
    <div>
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
};
```

### 단축키 안내

```tsx
const KeyboardShortcutsHelp = () => (
  <div role="dialog" aria-label="키보드 단축키">
    <h2>키보드 단축키</h2>
    <dl>
      <dt><kbd>Ctrl</kbd> + <kbd>K</kbd></dt>
      <dd>검색 열기</dd>
      
      <dt><kbd>Ctrl</kbd> + <kbd>S</kbd></dt>
      <dd>저장</dd>
      
      <dt><kbd>Escape</kbd></dt>
      <dd>닫기</dd>
    </dl>
  </div>
);
```

---

## 자주 하는 실수

### 1. outline: none 남발

```css
/* ❌ 모든 포커스 스타일 제거 */
*:focus {
  outline: none;
}

/* ✅ 더 나은 스타일로 대체 */
*:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

### 2. 마우스 전용 인터랙션

```tsx
// ❌ hover만 처리
<div onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
  호버하세요
</div>

// ✅ 포커스도 처리
<button
  onMouseEnter={showTooltip}
  onMouseLeave={hideTooltip}
  onFocus={showTooltip}
  onBlur={hideTooltip}
>
  호버 또는 포커스하세요
</button>
```

### 3. 클릭 전용 이벤트

```tsx
// ❌ click만 처리하는 div
<div onClick={handleAction}>클릭</div>

// ✅ 키보드 이벤트도 처리하거나 button 사용
<div
  role="button"
  tabIndex={0}
  onClick={handleAction}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  }}
>
  클릭
</div>

// ✅✅ 더 좋은 방법: button 사용
<button onClick={handleAction}>클릭</button>
```

### 4. 양수 tabindex 사용

```html
<!-- ❌ 탭 순서 엉망 -->
<button tabindex="2">두 번째</button>
<button tabindex="1">첫 번째</button>

<!-- ✅ DOM 순서 사용 -->
<button>첫 번째</button>
<button>두 번째</button>
```

### 5. 포커스 복원 미처리

```tsx
// ❌ 모달 닫을 때 포커스 사라짐
const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <div>...</div>;
};

// ✅ 포커스 복원
const Modal = ({ isOpen, onClose }) => {
  useRestoreFocus(isOpen);
  if (!isOpen) return null;
  return <div>...</div>;
};
```

---

## 테스트 방법

### 수동 테스트

1. **마우스 없이 탐색**: 마우스를 치우고 Tab, Shift+Tab으로 탐색
2. **포커스 확인**: 현재 포커스된 요소가 시각적으로 보이는지 확인
3. **모든 기능 테스트**: 키보드만으로 모든 기능 사용 가능한지 확인
4. **포커스 트랩 확인**: 모달 등에서 포커스가 갇히는지 확인
5. **포커스 복원 확인**: 모달 닫힐 때 원래 위치로 돌아가는지 확인

### 자동화 테스트

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('Tab으로 모든 버튼에 접근 가능', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  // Tab으로 첫 번째 버튼에 포커스
  await user.tab();
  expect(screen.getByRole('button', { name: '첫 번째' })).toHaveFocus();
  
  // Tab으로 두 번째 버튼에 포커스
  await user.tab();
  expect(screen.getByRole('button', { name: '두 번째' })).toHaveFocus();
});

test('모달 포커스 트랩', async () => {
  const user = userEvent.setup();
  render(<Modal isOpen={true} />);
  
  const closeButton = screen.getByRole('button', { name: '닫기' });
  closeButton.focus();
  
  // 마지막 요소에서 Tab 시 첫 번째로 이동
  await user.tab();
  expect(screen.getByRole('button', { name: '확인' })).toHaveFocus();
});
```

---

## 체크리스트

- [ ] Tab 키로 모든 인터랙티브 요소에 접근 가능한가?
- [ ] 포커스된 요소가 시각적으로 명확히 구분되는가?
- [ ] Skip Link가 있는가?
- [ ] 양수 tabindex를 사용하지 않았는가?
- [ ] 마우스 전용 이벤트(hover 등)에 키보드 대안이 있는가?
- [ ] 모달/드롭다운에 포커스 트랩이 있는가?
- [ ] 모달/드롭다운 닫힐 때 포커스가 복원되는가?
- [ ] Escape 키로 모달/드롭다운을 닫을 수 있는가?
- [ ] 복합 위젯에서 화살표 키 탐색이 가능한가?

---

## 참고 자료

- [WAI-ARIA Authoring Practices - Keyboard Interaction](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WebAIM - Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [MDN - Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
- [focus-trap-react](https://github.com/focus-trap/focus-trap-react) - 포커스 트랩 라이브러리

