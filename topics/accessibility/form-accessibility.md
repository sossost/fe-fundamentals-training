# 폼 접근성 (Form Accessibility)

## 개요

폼은 웹에서 가장 중요한 인터랙션 요소 중 하나입니다. 회원가입, 로그인, 결제, 검색 등 핵심 기능이 모두 폼을 통해 이루어집니다. 접근성 있는 폼은 모든 사용자가 정보를 입력하고 제출할 수 있도록 보장합니다.

## 왜 중요한가?

- **스크린 리더 사용자**: 각 입력 필드의 목적을 알아야 함
- **인지 장애 사용자**: 명확한 지시와 에러 메시지 필요
- **운동 장애 사용자**: 키보드로 모든 필드 접근 가능해야 함
- **모든 사용자**: 명확한 폼은 실수를 줄이고 완료율을 높임

---

## Label과 Input 연결

### 기본: for/id 연결

```html
<!-- ✅ for와 id로 연결 -->
<label for="username">사용자 이름</label>
<input type="text" id="username" name="username" />

<!-- 스크린 리더: "사용자 이름, 텍스트 입력" -->
```

### 암시적 연결 (중첩)

```html
<!-- ✅ label 안에 input 중첩 -->
<label>
  사용자 이름
  <input type="text" name="username" />
</label>

<!-- 스크린 리더: "사용자 이름, 텍스트 입력" -->
```

### ❌ 잘못된 패턴

```html
<!-- ❌ placeholder만 사용 -->
<input type="text" placeholder="사용자 이름" />
<!-- 문제: 입력 시작하면 힌트가 사라짐, 스크린 리더가 label로 인식 안 함 -->

<!-- ❌ 연결되지 않은 label -->
<label>사용자 이름</label>
<input type="text" name="username" />
<!-- 문제: label 클릭해도 input에 포커스 안 됨 -->

<!-- ❌ div를 label처럼 사용 -->
<div class="label">사용자 이름</div>
<input type="text" name="username" />
```

### React에서 label 연결

```tsx
import { useId } from 'react';

const FormField = ({ label, type = 'text', ...props }) => {
  const id = useId();
  
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} {...props} />
    </div>
  );
};

// 사용
<FormField label="이메일" type="email" name="email" />
```

---

## 필수 필드 표시

### HTML required 속성

```html
<label for="email">
  이메일 <span aria-hidden="true">*</span>
</label>
<input 
  type="email" 
  id="email" 
  required 
  aria-required="true"
/>

<!-- 폼 상단에 안내 -->
<p><span aria-hidden="true">*</span> 표시는 필수 항목입니다.</p>
```

### aria-required

네이티브 `required`와 함께 사용하거나 커스텀 유효성 검사 시 사용

```html
<input 
  type="text" 
  aria-required="true"
  aria-label="회사명 (필수)"
/>
```

### 시각적 + 접근성 동시 처리

```tsx
const RequiredField = ({ label, ...props }) => {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>
        {label}
        <span className="required-indicator" aria-hidden="true"> *</span>
        <span className="sr-only">(필수)</span>
      </label>
      <input id={id} required aria-required="true" {...props} />
    </div>
  );
};
```

```css
/* 스크린 리더 전용 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.required-indicator {
  color: #dc2626;
}
```

---

## 입력 힌트 제공

### aria-describedby로 힌트 연결

```html
<label for="password">비밀번호</label>
<input 
  type="password" 
  id="password"
  aria-describedby="password-hint"
/>
<p id="password-hint" class="hint">
  8자 이상, 영문/숫자/특수문자 포함
</p>

<!-- 스크린 리더: "비밀번호, 8자 이상 영문 숫자 특수문자 포함" -->
```

### 여러 힌트 연결

```html
<label for="username">사용자 이름</label>
<input 
  type="text" 
  id="username"
  aria-describedby="username-hint username-rules"
/>
<p id="username-hint">다른 사용자에게 표시되는 이름입니다.</p>
<ul id="username-rules">
  <li>3-20자 사이</li>
  <li>영문, 숫자, 밑줄(_)만 사용 가능</li>
</ul>
```

### React 컴포넌트

```tsx
const InputWithHint = ({ label, hint, ...props }) => {
  const inputId = useId();
  const hintId = useId();
  
  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      <input 
        id={inputId}
        aria-describedby={hint ? hintId : undefined}
        {...props}
      />
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
    </div>
  );
};
```

---

## 에러 메시지 처리

### 기본 에러 표시

```html
<label for="email">이메일</label>
<input 
  type="email" 
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" class="error" role="alert">
  올바른 이메일 형식이 아닙니다.
</p>
```

### 힌트와 에러 함께 표시

```html
<label for="password">비밀번호</label>
<input 
  type="password" 
  id="password"
  aria-invalid="true"
  aria-describedby="password-hint password-error"
/>
<p id="password-hint" class="hint">8자 이상 입력하세요.</p>
<p id="password-error" class="error" role="alert">
  비밀번호가 너무 짧습니다.
</p>
```

### aria-errormessage (더 명시적)

```html
<label for="email">이메일</label>
<input 
  type="email" 
  id="email"
  aria-invalid="true"
  aria-errormessage="email-error"
/>
<p id="email-error" class="error">
  올바른 이메일 형식이 아닙니다.
</p>
```

> 참고: `aria-errormessage`는 `aria-invalid="true"`일 때만 읽힙니다.

### React 에러 처리 컴포넌트

```tsx
interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}

const FormField = ({
  label,
  hint,
  error,
  required = false,
  type = 'text',
  value,
  onChange,
}: FormFieldProps) => {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  
  const describedBy = [
    hint && hintId,
    error && errorId,
  ].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="form-field">
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
      />
      
      {hint && !error && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

```css
.form-field .error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-field input[aria-invalid="true"] {
  border-color: #dc2626;
  outline-color: #dc2626;
}

.form-field .hint {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

---

## 폼 유효성 검사

### 제출 시 유효성 검사

```tsx
const SignupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const firstErrorRef = useRef<HTMLInputElement>(null);
  
  const validate = (data: FormData) => {
    const newErrors: Record<string, string> = {};
    
    const email = data.get('email') as string;
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!email.includes('@')) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    const password = data.get('password') as string;
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }
    
    return newErrors;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newErrors = validate(formData);
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // 첫 번째 에러 필드로 포커스 이동
      const firstErrorField = Object.keys(newErrors)[0];
      const element = formRef.current?.querySelector(
        `[name="${firstErrorField}"]`
      ) as HTMLInputElement;
      element?.focus();
      return;
    }
    
    // 제출 처리...
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* 에러 요약 */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" aria-live="polite" className="error-summary">
          <h2>입력 오류가 있습니다</h2>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <a href={`#${field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <FormField
        label="이메일"
        name="email"
        type="email"
        error={errors.email}
        required
      />
      
      <FormField
        label="비밀번호"
        name="password"
        type="password"
        error={errors.password}
        hint="8자 이상 입력하세요"
        required
      />
      
      <button type="submit">가입하기</button>
    </form>
  );
};
```

### 실시간 유효성 검사

```tsx
const EmailField = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  const validate = (value: string) => {
    if (!value) return '이메일을 입력해주세요.';
    if (!value.includes('@')) return '올바른 이메일 형식이 아닙니다.';
    return '';
  };
  
  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };
  
  const handleChange = (value: string) => {
    setEmail(value);
    // 한 번 터치된 후에만 실시간 검증
    if (touched) {
      setError(validate(value));
    }
  };
  
  return (
    <FormField
      label="이메일"
      type="email"
      value={email}
      onChange={handleChange}
      onBlur={handleBlur}
      error={touched ? error : undefined}
      required
    />
  );
};
```

### 에러 요약 (Error Summary)

폼 제출 실패 시 모든 에러를 요약해서 보여줍니다.

```tsx
const ErrorSummary = ({ errors }: { errors: Record<string, string> }) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      summaryRef.current?.focus();
    }
  }, [errors]);
  
  if (Object.keys(errors).length === 0) return null;
  
  return (
    <div
      ref={summaryRef}
      role="alert"
      tabIndex={-1}
      className="error-summary"
    >
      <h2>다음 {Object.keys(errors).length}개의 오류를 수정해주세요:</h2>
      <ul>
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} onClick={(e) => {
              e.preventDefault();
              document.getElementById(field)?.focus();
            }}>
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## Autocomplete 속성

브라우저와 비밀번호 관리자가 자동으로 값을 채울 수 있게 합니다.

### 자주 사용하는 autocomplete 값

```html
<!-- 이름 -->
<input type="text" autocomplete="name" />
<input type="text" autocomplete="given-name" />  <!-- 이름 -->
<input type="text" autocomplete="family-name" /> <!-- 성 -->

<!-- 연락처 -->
<input type="email" autocomplete="email" />
<input type="tel" autocomplete="tel" />

<!-- 주소 -->
<input type="text" autocomplete="street-address" />
<input type="text" autocomplete="address-level1" /> <!-- 시/도 -->
<input type="text" autocomplete="address-level2" /> <!-- 구/군 -->
<input type="text" autocomplete="postal-code" />

<!-- 계정 -->
<input type="text" autocomplete="username" />
<input type="password" autocomplete="current-password" />
<input type="password" autocomplete="new-password" />

<!-- 결제 -->
<input type="text" autocomplete="cc-name" />       <!-- 카드 소유자 -->
<input type="text" autocomplete="cc-number" />     <!-- 카드 번호 -->
<input type="text" autocomplete="cc-exp" />        <!-- 만료일 -->
<input type="text" autocomplete="cc-csc" />        <!-- CVC -->

<!-- 일회용 비밀번호 -->
<input type="text" autocomplete="one-time-code" />
```

### 로그인 폼 예시

```html
<form>
  <label for="email">이메일</label>
  <input 
    type="email" 
    id="email" 
    name="email"
    autocomplete="email"
    required
  />
  
  <label for="password">비밀번호</label>
  <input 
    type="password" 
    id="password" 
    name="password"
    autocomplete="current-password"
    required
  />
  
  <button type="submit">로그인</button>
</form>
```

### 회원가입 폼 예시

```html
<form>
  <input type="email" autocomplete="email" />
  <input type="password" autocomplete="new-password" />
  <input type="password" autocomplete="new-password" /> <!-- 비밀번호 확인 -->
</form>
```

---

## Fieldset과 Legend

관련 필드를 그룹화합니다.

### 기본 사용법

```html
<fieldset>
  <legend>배송 정보</legend>
  
  <label for="name">이름</label>
  <input type="text" id="name" name="name" />
  
  <label for="address">주소</label>
  <input type="text" id="address" name="address" />
  
  <label for="phone">전화번호</label>
  <input type="tel" id="phone" name="phone" />
</fieldset>
```

### 라디오 버튼 그룹

```html
<fieldset>
  <legend>결제 방법을 선택하세요</legend>
  
  <label>
    <input type="radio" name="payment" value="card" />
    신용카드
  </label>
  
  <label>
    <input type="radio" name="payment" value="bank" />
    계좌이체
  </label>
  
  <label>
    <input type="radio" name="payment" value="phone" />
    휴대폰 결제
  </label>
</fieldset>
```

### 체크박스 그룹

```html
<fieldset>
  <legend>관심 분야를 선택하세요 (복수 선택 가능)</legend>
  
  <label>
    <input type="checkbox" name="interests" value="frontend" />
    프론트엔드
  </label>
  
  <label>
    <input type="checkbox" name="interests" value="backend" />
    백엔드
  </label>
  
  <label>
    <input type="checkbox" name="interests" value="devops" />
    DevOps
  </label>
</fieldset>
```

### React 컴포넌트

```tsx
interface RadioGroupProps {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const RadioGroup = ({
  legend,
  name,
  options,
  value,
  onChange,
  required,
}: RadioGroupProps) => {
  return (
    <fieldset>
      <legend>
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
};
```

---

## Select (드롭다운)

### 기본 select

```html
<label for="country">국가</label>
<select id="country" name="country">
  <option value="">선택하세요</option>
  <option value="kr">대한민국</option>
  <option value="us">미국</option>
  <option value="jp">일본</option>
</select>
```

### optgroup으로 그룹화

```html
<label for="timezone">시간대</label>
<select id="timezone" name="timezone">
  <optgroup label="아시아">
    <option value="Asia/Seoul">서울</option>
    <option value="Asia/Tokyo">도쿄</option>
  </optgroup>
  <optgroup label="유럽">
    <option value="Europe/London">런던</option>
    <option value="Europe/Paris">파리</option>
  </optgroup>
</select>
```

### 커스텀 Select 접근성

네이티브 select를 대체할 때 필요한 접근성:

```tsx
const CustomSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const buttonId = useId();
  const listboxId = useId();
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex((prev) => 
            Math.min(prev + 1, options.length - 1)
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          onChange(options[activeIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <div className="custom-select">
      <label id={`${buttonId}-label`}>{label}</label>
      
      <button
        id={buttonId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${buttonId}-label ${buttonId}`}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && activeIndex >= 0 
            ? `option-${activeIndex}` 
            : undefined
        }
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        {options.find(o => o.value === value)?.label || '선택하세요'}
      </button>
      
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={`${buttonId}-label`}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`option-${index}`}
              role="option"
              aria-selected={value === option.value}
              className={activeIndex === index ? 'active' : ''}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## 비밀번호 표시/숨기기

### 접근성 있는 구현

```tsx
const PasswordInput = ({ label, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();
  
  return (
    <div className="password-field">
      <label htmlFor={inputId}>{label}</label>
      
      <div className="password-input-wrapper">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        
        <button
          type="button"
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
          aria-pressed={showPassword}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
};
```

---

## 폼 제출 상태

### 로딩 상태 표시

```tsx
const SubmitButton = ({ isLoading, children }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true" className="spinner" />
          <span>처리 중...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
```

### 제출 결과 알림

```tsx
const Form = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await submitForm();
      setStatus('success');
      setMessage('성공적으로 저장되었습니다.');
    } catch (error) {
      setStatus('error');
      setMessage('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드들 */}
      
      {/* 상태 메시지 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === 'success' && (
          <p className="success">{message}</p>
        )}
        {status === 'error' && (
          <p className="error" role="alert">{message}</p>
        )}
      </div>
      
      <SubmitButton isLoading={status === 'loading'}>
        저장
      </SubmitButton>
    </form>
  );
};
```

---

## 멀티스텝 폼

### 진행 상태 표시

```tsx
const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const steps = ['개인정보', '배송정보', '결제'];
  
  return (
    <div>
      {/* 진행 표시 */}
      <nav aria-label="진행 단계">
        <ol>
          {steps.map((step, index) => (
            <li
              key={step}
              aria-current={currentStep === index + 1 ? 'step' : undefined}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-label">{step}</span>
              {currentStep > index + 1 && (
                <span className="sr-only">(완료)</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      
      {/* 현재 단계 안내 */}
      <div aria-live="polite" className="sr-only">
        {currentStep}단계: {steps[currentStep - 1]} ({currentStep}/{totalSteps})
      </div>
      
      {/* 폼 내용 */}
      <form>
        {currentStep === 1 && <PersonalInfoStep />}
        {currentStep === 2 && <ShippingStep />}
        {currentStep === 3 && <PaymentStep />}
        
        <div className="form-actions">
          {currentStep > 1 && (
            <button type="button" onClick={() => setCurrentStep(s => s - 1)}>
              이전
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button type="button" onClick={() => setCurrentStep(s => s + 1)}>
              다음
            </button>
          ) : (
            <button type="submit">완료</button>
          )}
        </div>
      </form>
    </div>
  );
};
```

---

## 파일 업로드

### 접근성 있는 파일 입력

```tsx
const FileUpload = ({ label, accept, onChange }) => {
  const inputId = useId();
  const [fileName, setFileName] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };
  
  return (
    <div className="file-upload">
      <label htmlFor={inputId}>{label}</label>
      
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
      />
      
      <button
        type="button"
        onClick={() => document.getElementById(inputId)?.click()}
        aria-describedby={fileName ? `${inputId}-filename` : undefined}
      >
        파일 선택
      </button>
      
      {fileName && (
        <span id={`${inputId}-filename`} aria-live="polite">
          선택된 파일: {fileName}
        </span>
      )}
    </div>
  );
};
```

---

## 체크리스트

- [ ] 모든 input에 label이 연결되어 있는가?
- [ ] 필수 필드가 명확히 표시되어 있는가? (required, aria-required)
- [ ] 입력 힌트가 aria-describedby로 연결되어 있는가?
- [ ] 에러 메시지가 aria-invalid, aria-describedby와 함께 표시되는가?
- [ ] 에러 발생 시 해당 필드로 포커스가 이동하는가?
- [ ] autocomplete 속성이 적절히 설정되어 있는가?
- [ ] 라디오/체크박스 그룹이 fieldset/legend로 묶여있는가?
- [ ] 폼 제출 상태(로딩/성공/실패)가 적절히 전달되는가?
- [ ] 커스텀 폼 컨트롤에 적절한 ARIA 속성이 있는가?

---

## 참고 자료

- [W3C - Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WebAIM - Creating Accessible Forms](https://webaim.org/techniques/forms/)
- [MDN - HTML autocomplete attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)
- [Deque - Form Accessibility](https://www.deque.com/blog/anatomy-of-accessible-forms-best-practices/)

