# React 컴포넌트 접근성 패턴

## 개요

React에서 자주 사용하는 UI 컴포넌트들(모달, 드롭다운, 탭 등)은 네이티브 HTML에 없는 복잡한 인터랙션을 가집니다. 이러한 커스텀 컴포넌트를 접근성 있게 만들려면 ARIA 속성, 키보드 네비게이션, 포커스 관리를 올바르게 구현해야 합니다.

이 문서에서는 WAI-ARIA Authoring Practices Guide(APG)를 기반으로 한 접근성 패턴을 다룹니다.

---

## 1. 모달 / 다이얼로그 (Modal Dialog)

### 접근성 요구사항

- `role="dialog"` 또는 `<dialog>` 요소 사용
- `aria-modal="true"` 설정
- `aria-labelledby`로 제목 연결
- 열릴 때 모달 내부로 포커스 이동
- 포커스 트랩: Tab이 모달 내부에서만 순환
- Escape 키로 닫기
- 닫힐 때 트리거 요소로 포커스 복원
- 모달 외부 콘텐츠를 `aria-hidden="true"` 또는 `inert`로 숨김

### 구현

```tsx
import { useEffect, useRef, useCallback, useState, createPortal } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // 포커스 복원
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // 모달 열릴 때 포커스 이동
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // 포커스 트랩
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, [onClose]);

  // 외부 콘텐츠 숨기기
  useEffect(() => {
    const app = document.getElementById('root');
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
    <>
      {/* 배경 오버레이 */}
      <div 
        className="modal-overlay" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 모달 */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="modal"
      >
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="modal-close"
          >
            ×
          </button>
        </header>
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};
```

### 사용 예시

```tsx
const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        모달 열기
      </button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="확인"
      >
        <p>정말 삭제하시겠습니까?</p>
        <div className="modal-actions">
          <button onClick={() => setIsOpen(false)}>취소</button>
          <button onClick={handleDelete}>삭제</button>
        </div>
      </Modal>
    </>
  );
};
```

### Alert Dialog (경고 다이얼로그)

중요한 결정을 요구하는 모달:

```tsx
const AlertDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-desc"
    >
      <h2 id="alert-title">{title}</h2>
      <p id="alert-desc">{message}</p>
      <button onClick={onClose}>취소</button>
      <button onClick={onConfirm}>확인</button>
    </div>
  );
};
```

---

## 2. 드롭다운 메뉴 (Dropdown Menu)

### 접근성 요구사항

- 트리거 버튼에 `aria-haspopup="menu"`, `aria-expanded`
- 메뉴에 `role="menu"`, 항목에 `role="menuitem"`
- Arrow 키로 항목 탐색
- Enter/Space로 선택
- Escape로 닫고 트리거로 포커스 복원
- Home/End로 첫/마지막 항목 이동

### 구현

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';

interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
}

const DropdownMenu = ({ trigger, items }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 메뉴 열릴 때 첫 번째 항목 포커스
  useEffect(() => {
    if (isOpen && itemRefs.current[0]) {
      setActiveIndex(0);
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  // 활성 항목에 포커스
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, isOpen]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(true);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(items.length - 1);
        break;
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const enabledItems = items.filter(item => !item.disabled);
    const enabledIndices = items
      .map((item, i) => (!item.disabled ? i : -1))
      .filter(i => i !== -1);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => {
          const currentPos = enabledIndices.indexOf(prev);
          const nextPos = (currentPos + 1) % enabledIndices.length;
          return enabledIndices[nextPos];
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => {
          const currentPos = enabledIndices.indexOf(prev);
          const prevPos = currentPos <= 0 
            ? enabledIndices.length - 1 
            : currentPos - 1;
          return enabledIndices[prevPos];
        });
        break;

      case 'Home':
        e.preventDefault();
        setActiveIndex(enabledIndices[0]);
        break;

      case 'End':
        e.preventDefault();
        setActiveIndex(enabledIndices[enabledIndices.length - 1]);
        break;

      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && !items[activeIndex].disabled) {
          items[activeIndex].onClick();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
    }
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="dropdown">
      <button
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <li key={item.id} role="none">
              <button
                ref={el => (itemRefs.current[index] = el)}
                role="menuitem"
                tabIndex={activeIndex === index ? 0 : -1}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }
                }}
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

### 사용 예시

```tsx
<DropdownMenu
  trigger="옵션"
  items={[
    { id: 'edit', label: '수정', onClick: handleEdit },
    { id: 'duplicate', label: '복제', onClick: handleDuplicate },
    { id: 'delete', label: '삭제', onClick: handleDelete },
  ]}
/>
```

---

## 3. 탭 (Tabs)

### 접근성 요구사항

- 탭 리스트에 `role="tablist"`
- 각 탭에 `role="tab"`, `aria-selected`, `aria-controls`
- 탭 패널에 `role="tabpanel"`, `aria-labelledby`
- Arrow 키로 탭 간 이동
- 자동 활성화 또는 Enter/Space로 활성화
- Home/End로 첫/마지막 탭 이동

### 구현

```tsx
import { useState, useRef, useId } from 'react';

interface Tab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  /** 포커스 시 자동으로 탭 활성화 */
  activateOnFocus?: boolean;
}

const Tabs = ({ tabs, defaultTab, activateOnFocus = true }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const enabledTabs = tabs.filter(tab => !tab.disabled);
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  const focusTab = (index: number) => {
    tabRefs.current[index]?.focus();
    if (activateOnFocus) {
      setActiveTab(tabs[index].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledIndices = tabs
      .map((tab, i) => (!tab.disabled ? i : -1))
      .filter(i => i !== -1);
    const currentPos = enabledIndices.indexOf(index);

    let newIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
        break;

      case 'ArrowLeft':
        e.preventDefault();
        newIndex = enabledIndices[
          currentPos <= 0 ? enabledIndices.length - 1 : currentPos - 1
        ];
        break;

      case 'Home':
        e.preventDefault();
        newIndex = enabledIndices[0];
        break;

      case 'End':
        e.preventDefault();
        newIndex = enabledIndices[enabledIndices.length - 1];
        break;

      case 'Enter':
      case ' ':
        if (!activateOnFocus) {
          e.preventDefault();
          setActiveTab(tabs[index].id);
        }
        break;
    }

    if (newIndex !== null) {
      focusTab(newIndex);
    }
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label="탭 메뉴">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => (tabRefs.current[index] = el)}
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={e => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {activeTab === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
};
```

### 사용 예시

```tsx
<Tabs
  tabs={[
    {
      id: 'overview',
      label: '개요',
      content: <OverviewPanel />,
    },
    {
      id: 'settings',
      label: '설정',
      content: <SettingsPanel />,
    },
    {
      id: 'billing',
      label: '결제',
      content: <BillingPanel />,
      disabled: true,
    },
  ]}
/>
```

### CSS 예시

```css
[role="tablist"] {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

[role="tab"] {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

[role="tab"][aria-selected="true"] {
  border-bottom-color: #3b82f6;
  color: #3b82f6;
}

[role="tab"]:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

[role="tab"]:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

[role="tabpanel"] {
  padding: 1rem;
}

[role="tabpanel"]:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## 4. 아코디언 (Accordion)

### 접근성 요구사항

- 트리거 버튼에 `aria-expanded`, `aria-controls`
- 패널에 `id`, `role="region"` (또는 생략), `aria-labelledby`
- Enter/Space로 토글
- 선택적: Arrow 키로 헤더 간 이동

### 구현

```tsx
import { useState, useId } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  /** 여러 항목 동시 열기 허용 */
  allowMultiple?: boolean;
  /** 기본 열린 항목 */
  defaultExpanded?: string[];
}

const Accordion = ({
  items,
  allowMultiple = false,
  defaultExpanded = [],
}: AccordionProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  );
  const baseId = useId();

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(itemId);
      }
      
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledIndices = items
      .map((item, i) => (!item.disabled ? i : -1))
      .filter(i => i !== -1);
    const currentPos = enabledIndices.indexOf(index);

    let targetIndex: number | null = null;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
        break;

      case 'ArrowUp':
        e.preventDefault();
        targetIndex = enabledIndices[
          currentPos <= 0 ? enabledIndices.length - 1 : currentPos - 1
        ];
        break;

      case 'Home':
        e.preventDefault();
        targetIndex = enabledIndices[0];
        break;

      case 'End':
        e.preventDefault();
        targetIndex = enabledIndices[enabledIndices.length - 1];
        break;
    }

    if (targetIndex !== null) {
      const button = document.getElementById(
        `${baseId}-header-${items[targetIndex].id}`
      );
      button?.focus();
    }
  };

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isExpanded = expandedItems.has(item.id);
        const headerId = `${baseId}-header-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div key={item.id} className="accordion-item">
            <h3>
              <button
                id={headerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggleItem(item.id)}
                onKeyDown={e => handleKeyDown(e, index)}
                className="accordion-trigger"
              >
                <span>{item.title}</span>
                <span aria-hidden="true" className="accordion-icon">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>
            </h3>
            
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isExpanded}
              className="accordion-panel"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

### 사용 예시

```tsx
<Accordion
  allowMultiple
  items={[
    {
      id: 'shipping',
      title: '배송 정보',
      content: <ShippingInfo />,
    },
    {
      id: 'payment',
      title: '결제 방법',
      content: <PaymentOptions />,
    },
    {
      id: 'faq',
      title: '자주 묻는 질문',
      content: <FAQ />,
    },
  ]}
/>
```

---

## 5. 툴팁 (Tooltip)

### 접근성 요구사항

- `aria-describedby`로 툴팁 연결
- 포커스와 호버 모두에서 표시
- Escape로 닫기
- 적절한 지연 시간 (즉시 사라지지 않도록)

### 구현

```tsx
import { useState, useRef, useId } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  /** 표시 지연 (ms) */
  delay?: number;
}

const Tooltip = ({ content, children, delay = 200 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number>();
  const tooltipId = useId();

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  };

  return (
    <div className="tooltip-container">
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
        onKeyDown: handleKeyDown,
      })}
      
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};
```

### 사용 예시

```tsx
<Tooltip content="클립보드에 복사합니다">
  <button onClick={handleCopy}>
    <CopyIcon aria-hidden="true" />
    <span className="sr-only">복사</span>
  </button>
</Tooltip>
```

### 토글팁 (Toggletip) - 클릭으로 열리는 툴팁

```tsx
const Toggletip = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  return (
    <div className="toggletip-container">
      <button
        ref={buttonRef}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </button>
      
      {isOpen && (
        <div
          id={tooltipId}
          role="status"
          aria-live="polite"
          className="toggletip"
        >
          {content}
          <button
            onClick={() => {
              setIsOpen(false);
              buttonRef.current?.focus();
            }}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 6. 토스트 / 알림 (Toast Notification)

### 접근성 요구사항

- `role="alert"` (중요) 또는 `role="status"` (일반)
- `aria-live="polite"` 또는 `"assertive"`
- 자동 사라짐 시 충분한 시간 제공
- 포커스를 빼앗지 않음
- 닫기 버튼 제공

### 구현

```tsx
import { useState, useEffect, useCallback } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ 
  toasts, 
  removeToast 
}: { 
  toasts: Toast[]; 
  removeToast: (id: string) => void 
}) => {
  return (
    <div 
      className="toast-container"
      aria-label="알림"
    >
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};

const ToastItem = ({ 
  toast, 
  onClose 
}: { 
  toast: Toast; 
  onClose: () => void 
}) => {
  const { id, type, message, duration = 5000 } = toast;

  // 자동 닫기
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`toast toast-${type}`}
    >
      <span className="toast-icon" aria-hidden="true">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>
      
      <span className="toast-message">{message}</span>
      
      <button
        onClick={onClose}
        aria-label="알림 닫기"
        className="toast-close"
      >
        ×
      </button>
    </div>
  );
};

// 사용
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('ToastProvider 필요');
  return context;
};

const MyComponent = () => {
  const { addToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      addToast({ type: 'success', message: '저장되었습니다.' });
    } catch (error) {
      addToast({ type: 'error', message: '저장에 실패했습니다.' });
    }
  };
};
```

---

## 7. 콤보박스 / 자동완성 (Combobox)

### 접근성 요구사항

- `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`
- `aria-activedescendant`로 활성 옵션 표시
- 리스트에 `role="listbox"`, 옵션에 `role="option"`
- Arrow 키로 옵션 탐색
- Enter로 선택
- Escape로 닫기

### 구현

```tsx
import { useState, useRef, useId, useEffect } from 'react';

interface Option {
  id: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
}

const Combobox = ({
  label,
  options,
  value,
  onChange,
  onInputChange,
  placeholder,
}: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;

  const filteredOptions = options.filter(
    option => option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const activeOptionId = activeIndex >= 0 
    ? `${baseId}-option-${filteredOptions[activeIndex]?.id}`
    : undefined;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setActiveIndex(-1);
    onInputChange?.(newValue);
  };

  const selectOption = (option: Option) => {
    setInputValue(option.label);
    onChange(option.id);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setActiveIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          selectOption(filteredOptions[activeIndex]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // 활성 옵션 스크롤
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeOption = listRef.current.children[activeIndex] as HTMLElement;
      activeOption?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div className="combobox-container">
      <label id={labelId} htmlFor={inputId}>
        {label}
      </label>
      
      <div className="combobox-wrapper">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-labelledby={labelId}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        
        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? '옵션 닫기' : '옵션 열기'}
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
        >
          ▼
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          className="combobox-listbox"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              id={`${baseId}-option-${option.id}`}
              role="option"
              aria-selected={activeIndex === index}
              aria-disabled={option.disabled}
              className={activeIndex === index ? 'active' : ''}
              onClick={() => !option.disabled && selectOption(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && (
        <div className="combobox-no-results" role="status">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
};
```

---

## 8. 슬라이더 (Slider/Range)

### 접근성 요구사항

- `role="slider"` (또는 `<input type="range">` 사용)
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-valuetext` (값 설명이 필요할 때)
- `aria-label` 또는 `aria-labelledby`
- Arrow 키로 값 조정 (Left/Down: 감소, Right/Up: 증가)
- Home/End로 최소/최대값

### 구현

```tsx
import { useState, useRef, useCallback } from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const Slider = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
}: SliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderId = useId();

  const percent = ((value - min) / (max - min)) * 100;
  const valueText = formatValue ? formatValue(value) : value.toString();

  const updateValue = useCallback((newValue: number) => {
    const clampedValue = Math.min(max, Math.max(min, newValue));
    const steppedValue = Math.round(clampedValue / step) * step;
    onChange(steppedValue);
  }, [min, max, step, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        updateValue(value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        updateValue(value - step);
        break;
      case 'Home':
        e.preventDefault();
        updateValue(min);
        break;
      case 'End':
        e.preventDefault();
        updateValue(max);
        break;
      case 'PageUp':
        e.preventDefault();
        updateValue(value + step * 10);
        break;
      case 'PageDown':
        e.preventDefault();
        updateValue(value - step * 10);
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;

    const updateFromMouse = (clientX: number) => {
      const rect = sliderRef.current!.getBoundingClientRect();
      const percent = (clientX - rect.left) / rect.width;
      const newValue = min + percent * (max - min);
      updateValue(newValue);
    };

    updateFromMouse(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      updateFromMouse(e.clientX);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="slider-container">
      <label id={`${sliderId}-label`}>
        {label}: <span>{valueText}</span>
      </label>
      
      <div
        ref={sliderRef}
        className="slider-track"
        onMouseDown={handleMouseDown}
      >
        <div 
          className="slider-fill"
          style={{ width: `${percent}%` }}
        />
        
        <div
          role="slider"
          tabIndex={0}
          aria-labelledby={`${sliderId}-label`}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={valueText}
          onKeyDown={handleKeyDown}
          className="slider-thumb"
          style={{ left: `${percent}%` }}
        />
      </div>
      
      <div className="slider-labels" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
```

### 사용 예시

```tsx
<Slider
  label="볼륨"
  min={0}
  max={100}
  value={volume}
  onChange={setVolume}
  formatValue={v => `${v}%`}
/>

<Slider
  label="가격 범위"
  min={0}
  max={1000000}
  step={10000}
  value={price}
  onChange={setPrice}
  formatValue={v => `${v.toLocaleString()}원`}
/>
```

---

## 공통 유틸리티 훅

### useFocusTrap

```tsx
import { useRef, useEffect, useCallback } from 'react';

const useFocusTrap = <T extends HTMLElement>(isActive: boolean) => {
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, [isActive]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isActive && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isActive]);

  return containerRef;
};
```

### useRestoreFocus

```tsx
import { useRef, useEffect } from 'react';

const useRestoreFocus = (isActive: boolean) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isActive]);
};
```

### useEscapeKey

```tsx
import { useEffect, useCallback } from 'react';

const useEscapeKey = (onEscape: () => void, isActive: boolean = true) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscape();
    }
  }, [onEscape]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, handleKeyDown]);
};
```

---

## 체크리스트

### 모달
- [ ] `role="dialog"`, `aria-modal="true"` 설정
- [ ] `aria-labelledby`로 제목 연결
- [ ] 열릴 때 포커스 이동
- [ ] 포커스 트랩 구현
- [ ] Escape로 닫기
- [ ] 닫힐 때 포커스 복원
- [ ] 외부 콘텐츠 `aria-hidden` 처리

### 드롭다운
- [ ] `aria-haspopup`, `aria-expanded` 설정
- [ ] `role="menu"`, `role="menuitem"` 설정
- [ ] Arrow 키로 탐색
- [ ] Escape로 닫기

### 탭
- [ ] `role="tablist"`, `role="tab"`, `role="tabpanel"` 설정
- [ ] `aria-selected`, `aria-controls` 설정
- [ ] Arrow 키로 탭 이동
- [ ] 로빙 탭인덱스 구현

### 아코디언
- [ ] `aria-expanded`, `aria-controls` 설정
- [ ] Enter/Space로 토글

### 툴팁
- [ ] `role="tooltip"`, `aria-describedby` 설정
- [ ] 포커스와 호버 모두 지원
- [ ] Escape로 닫기

---

## 참고 자료

- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI](https://www.radix-ui.com/) - 접근성 우선 React 컴포넌트
- [Headless UI](https://headlessui.com/) - 접근성 있는 헤드리스 컴포넌트
- [React Aria](https://react-spectrum.adobe.com/react-aria/) - Adobe의 접근성 훅 라이브러리
- [Reach UI](https://reach.tech/) - 접근성 있는 React 컴포넌트

