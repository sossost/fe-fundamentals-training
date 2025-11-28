# 이미지 접근성 (Image Accessibility)

## 개요

이미지는 웹 콘텐츠의 핵심 요소이지만, 시각 장애인 사용자에게는 보이지 않습니다. 적절한 대체 텍스트(alt text)를 제공하면 스크린 리더가 이미지의 내용을 사용자에게 전달할 수 있습니다.

## 왜 중요한가?

- **시각 장애 사용자**: 스크린 리더가 이미지 대신 대체 텍스트를 읽음
- **저시력 사용자**: 이미지가 로드되지 않을 때 대체 텍스트 표시
- **인지 장애 사용자**: 복잡한 이미지의 의미 이해 도움
- **검색 엔진**: alt 텍스트로 이미지 콘텐츠 이해 (SEO)

---

## alt 속성 기본

### 기본 문법

```html
<img src="puppy.jpg" alt="갈색 푸들 강아지가 공원에서 뛰어놀고 있다" />
```

### alt 텍스트 작성 원칙

1. **간결하게**: 보통 125자 이내
2. **설명적으로**: 이미지의 내용과 목적을 설명
3. **맥락에 맞게**: 페이지에서 이미지가 하는 역할 고려
4. **"이미지" 언급 불필요**: 스크린 리더가 이미 "이미지"라고 알림

### ❌ 잘못된 alt 텍스트

```html
<!-- 너무 짧음 -->
<img src="graph.png" alt="그래프" />

<!-- 너무 김 -->
<img src="team.jpg" alt="이것은 우리 팀의 사진입니다. 왼쪽부터 김철수 대리, 이영희 과장, 박민수 부장, 최지영 사원이 서 있고, 배경에는 회사 로고가 보입니다. 모두 정장을 입고 있으며..." />

<!-- "이미지" 중복 -->
<img src="cat.jpg" alt="고양이 이미지" />
<img src="logo.png" alt="로고 사진" />

<!-- 파일명 그대로 -->
<img src="IMG_20240115_143022.jpg" alt="IMG_20240115_143022.jpg" />

<!-- 키워드 나열 (SEO 스팸) -->
<img src="shoes.jpg" alt="운동화 신발 나이키 아디다스 스포츠 러닝 조깅" />
```

### ✅ 좋은 alt 텍스트

```html
<!-- 적절한 설명 -->
<img src="graph.png" alt="2024년 분기별 매출 막대 그래프. 1분기 100억, 2분기 120억, 3분기 95억, 4분기 150억" />

<!-- 맥락에 맞는 설명 -->
<img src="team.jpg" alt="마케팅팀 4명이 회의실에서 환하게 웃고 있다" />

<!-- 제품 이미지 -->
<img src="shoes.jpg" alt="나이키 에어맥스 90, 흰색과 검정색 조합" />
```

---

## 이미지 유형별 alt 텍스트

### 1. 정보 전달 이미지 (Informative Images)

콘텐츠의 의미를 전달하는 이미지

```html
<!-- 제품 사진 -->
<img 
  src="laptop.jpg" 
  alt="MacBook Pro 16인치, 스페이스 그레이 색상, 노트북이 열려있는 정면 모습" 
/>

<!-- 인물 사진 -->
<img 
  src="ceo.jpg" 
  alt="김대표 CEO가 컨퍼런스에서 발표하고 있다" 
/>

<!-- 위치/지도 -->
<img 
  src="office-map.png" 
  alt="강남역 3번 출구에서 도보 5분, 테헤란로 521 건물 위치를 표시한 지도" 
/>
```

### 2. 기능적 이미지 (Functional Images)

링크나 버튼 역할을 하는 이미지

```html
<!-- 로고 링크 -->
<a href="/">
  <img src="logo.png" alt="홈페이지로 이동" />
</a>

<!-- 더 좋은 방법: 회사명 포함 -->
<a href="/">
  <img src="logo.png" alt="네이버 홈" />
</a>

<!-- 아이콘 버튼 -->
<button>
  <img src="search-icon.svg" alt="검색" />
</button>

<!-- 소셜 링크 -->
<a href="https://twitter.com/company">
  <img src="twitter.svg" alt="트위터에서 팔로우하기" />
</a>
```

### 3. 장식용 이미지 (Decorative Images)

순수하게 시각적 장식 목적의 이미지

```html
<!-- 빈 alt 속성 사용 -->
<img src="decorative-border.png" alt="" />

<!-- 배경 패턴 -->
<img src="pattern.svg" alt="" aria-hidden="true" />

<!-- 또는 CSS background-image 사용 권장 -->
<div class="hero" style="background-image: url(hero-bg.jpg)">
  <h1>환영합니다</h1>
</div>
```

> **주의**: `alt` 속성을 아예 생략하면 스크린 리더가 파일명을 읽음. 장식용이면 `alt=""`로 명시!

### 4. 복잡한 이미지 (Complex Images)

차트, 그래프, 다이어그램 등

```html
<!-- 간단한 설명 + 상세 설명 링크 -->
<figure>
  <img 
    src="sales-chart.png" 
    alt="2024년 월별 매출 추이 그래프"
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description">
    1월부터 12월까지 매출이 꾸준히 증가하여, 
    1월 50억에서 12월 120억으로 140% 성장했습니다.
    특히 11월 블랙프라이데이 기간에 최고 매출 150억을 기록했습니다.
  </figcaption>
</figure>

<!-- 또는 별도 페이지 링크 -->
<figure>
  <img 
    src="org-chart.png" 
    alt="회사 조직도"
  />
  <figcaption>
    <a href="/organization-details">조직도 상세 보기 (텍스트 버전)</a>
  </figcaption>
</figure>
```

### 5. 텍스트가 포함된 이미지

```html
<!-- 이미지 내 텍스트를 alt에 포함 -->
<img 
  src="sale-banner.jpg" 
  alt="여름 세일 최대 50% 할인, 7월 31일까지" 
/>

<!-- 가능하면 실제 텍스트 사용 권장 -->
<div class="banner">
  <img src="summer-bg.jpg" alt="" aria-hidden="true" />
  <div class="banner-text">
    <h2>여름 세일</h2>
    <p>최대 50% 할인, 7월 31일까지</p>
  </div>
</div>
```

### 6. 이미지 그룹

```html
<!-- 별점 -->
<div role="img" aria-label="5점 만점에 4점">
  <img src="star-filled.svg" alt="" />
  <img src="star-filled.svg" alt="" />
  <img src="star-filled.svg" alt="" />
  <img src="star-filled.svg" alt="" />
  <img src="star-empty.svg" alt="" />
</div>

<!-- 갤러리 -->
<figure>
  <div role="group" aria-label="제품 이미지 갤러리">
    <img src="product-1.jpg" alt="전면 모습" />
    <img src="product-2.jpg" alt="측면 모습" />
    <img src="product-3.jpg" alt="후면 모습" />
  </div>
  <figcaption>iPhone 15 Pro 제품 이미지</figcaption>
</figure>
```

---

## figure와 figcaption

### 기본 사용법

```html
<figure>
  <img 
    src="teamwork.jpg" 
    alt="팀원들이 화이트보드 앞에서 아이디어를 논의하고 있다" 
  />
  <figcaption>
    2024년 1분기 전략 회의 모습
  </figcaption>
</figure>
```

### alt와 figcaption의 차이

| 속성 | 용도 | 표시 |
|------|------|------|
| `alt` | 이미지를 대체하는 텍스트 | 화면에 안 보임 |
| `figcaption` | 이미지에 대한 캡션/설명 | 화면에 보임 |

```html
<figure>
  <img 
    src="einstein.jpg" 
    alt="알버트 아인슈타인의 흑백 초상 사진" 
  />
  <figcaption>
    알버트 아인슈타인 (1879-1955), 
    상대성 이론을 정립한 물리학자
  </figcaption>
</figure>
<!-- alt: 이미지 자체 설명 -->
<!-- figcaption: 맥락 정보 제공 -->
```

### figcaption만 있으면 alt 생략 가능?

```html
<!-- ❌ alt 생략하면 안 됨 -->
<figure>
  <img src="photo.jpg" />
  <figcaption>팀 사진</figcaption>
</figure>

<!-- ✅ alt와 figcaption 모두 제공 -->
<figure>
  <img src="photo.jpg" alt="10명의 팀원이 사무실에서 함께 포즈를 취하고 있다" />
  <figcaption>2024년 신년 팀 사진</figcaption>
</figure>

<!-- ✅ 또는 figcaption을 참조 -->
<figure>
  <img 
    src="photo.jpg" 
    alt=""
    aria-labelledby="photo-caption"
  />
  <figcaption id="photo-caption">
    10명의 팀원이 함께한 2024년 신년 팀 사진
  </figcaption>
</figure>
```

---

## 아이콘 처리

### 의미 있는 아이콘

```html
<!-- 아이콘만 있는 버튼 -->
<button aria-label="설정">
  <svg aria-hidden="true" focusable="false">
    <!-- 설정 아이콘 -->
  </svg>
</button>

<!-- 아이콘 + 텍스트 -->
<button>
  <svg aria-hidden="true" focusable="false">
    <!-- 저장 아이콘 -->
  </svg>
  저장
</button>
```

### 장식용 아이콘

```html
<!-- 텍스트와 함께 있는 장식 아이콘 -->
<span>
  <svg aria-hidden="true"><!-- 체크 아이콘 --></svg>
  완료됨
</span>

<!-- 상태 표시 아이콘 (텍스트로도 정보 제공) -->
<p>
  <svg aria-hidden="true"><!-- 경고 아이콘 --></svg>
  <span>경고: 저장되지 않은 변경사항이 있습니다</span>
</p>
```

### React 아이콘 컴포넌트

```tsx
interface IconProps {
  name: string;
  label?: string;  // 의미 있는 아이콘일 때만
  size?: number;
  className?: string;
}

const Icon = ({ name, label, size = 24, className }: IconProps) => {
  const isDecorative = !label;
  
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden={isDecorative}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
};

// 사용
<Icon name="settings" label="설정" />  // 의미 있는 아이콘
<Icon name="chevron-right" />           // 장식용 아이콘
```

### Font Awesome / 아이콘 폰트

```html
<!-- 의미 있는 아이콘 -->
<span class="sr-only">검색</span>
<i class="fa fa-search" aria-hidden="true"></i>

<!-- 또는 -->
<i class="fa fa-search" role="img" aria-label="검색"></i>

<!-- 장식용 -->
<i class="fa fa-star" aria-hidden="true"></i>
<span>즐겨찾기</span>
```

---

## 반응형 이미지

### srcset과 sizes

```html
<img 
  src="hero-800.jpg"
  srcset="
    hero-400.jpg 400w,
    hero-800.jpg 800w,
    hero-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="산 위에서 바라본 일출 풍경"
/>
```

> **alt는 하나만!** srcset의 모든 이미지가 같은 alt를 공유합니다.

### picture 요소

```html
<picture>
  <source 
    media="(max-width: 600px)" 
    srcset="hero-mobile.jpg"
  />
  <source 
    media="(max-width: 1200px)" 
    srcset="hero-tablet.jpg"
  />
  <img 
    src="hero-desktop.jpg" 
    alt="팀원들이 회의실에서 브레인스토밍하고 있다"
  />
</picture>
```

> **alt는 img 요소에만!** source 요소에는 alt 없음.

---

## 배경 이미지

### CSS 배경 이미지의 접근성

```html
<!-- ❌ 중요한 정보가 배경 이미지에만 있음 -->
<div 
  class="hero" 
  style="background-image: url(promotion.jpg)"
>
</div>

<!-- ✅ 중요 정보는 텍스트로 제공 -->
<div 
  class="hero" 
  style="background-image: url(promotion.jpg)"
  role="img"
  aria-label="여름 세일 50% 할인"
>
  <h1>여름 세일</h1>
  <p>최대 50% 할인</p>
</div>

<!-- ✅ 순수 장식용 배경 -->
<div class="hero" style="background-image: url(pattern.jpg)">
  <!-- 배경은 장식용이므로 별도 처리 불필요 -->
  <h1>환영합니다</h1>
</div>
```

### CSS로 이미지 숨기기

```css
/* 스크린 리더에서는 읽히지만 화면에 안 보임 */
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
```

```html
<div class="logo-background">
  <span class="sr-only">회사 로고</span>
</div>
```

---

## 이미지 로딩 상태

### lazy loading

```html
<img 
  src="photo.jpg" 
  alt="제품 사진"
  loading="lazy"
/>
```

### 로딩 플레이스홀더

```tsx
const ImageWithPlaceholder = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="image-container">
      {!isLoaded && !hasError && (
        <div className="placeholder" aria-hidden="true">
          로딩 중...
        </div>
      )}
      
      {hasError && (
        <div className="error-placeholder" role="img" aria-label={alt}>
          <span>이미지를 불러올 수 없습니다</span>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{ display: isLoaded ? 'block' : 'none' }}
        {...props}
      />
    </div>
  );
};
```

### 에러 상태

```tsx
const Image = ({ src, alt, fallbackSrc }) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
};
```

---

## SVG 접근성

### 인라인 SVG

```html
<!-- 의미 있는 SVG -->
<svg 
  role="img" 
  aria-labelledby="chart-title chart-desc"
  viewBox="0 0 100 100"
>
  <title id="chart-title">월별 방문자 수</title>
  <desc id="chart-desc">
    1월 1000명, 2월 1500명, 3월 2000명으로 증가 추세
  </desc>
  <!-- SVG 내용 -->
</svg>

<!-- 장식용 SVG -->
<svg aria-hidden="true" focusable="false">
  <!-- SVG 내용 -->
</svg>
```

### 외부 SVG 파일

```html
<!-- img 태그로 사용 -->
<img src="icon.svg" alt="설정" />

<!-- object 태그 (SVG 내부 접근 가능) -->
<object 
  type="image/svg+xml" 
  data="chart.svg"
  role="img"
  aria-label="매출 차트"
>
  <!-- 폴백 콘텐츠 -->
  <img src="chart.png" alt="매출 차트" />
</object>
```

### React SVG 컴포넌트

```tsx
interface SVGIconProps {
  title?: string;
  description?: string;
  className?: string;
}

const ChartIcon = ({ title, description, className }: SVGIconProps) => {
  const titleId = useId();
  const descId = useId();
  const isDecorative = !title;
  
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role={isDecorative ? undefined : 'img'}
      aria-hidden={isDecorative}
      aria-labelledby={!isDecorative ? `${titleId} ${descId}` : undefined}
      focusable="false"
    >
      {title && <title id={titleId}>{title}</title>}
      {description && <desc id={descId}>{description}</desc>}
      <path d="..." />
    </svg>
  );
};
```

---

## 이미지 맵 (Image Maps)

거의 사용하지 않지만, 사용 시 접근성 고려:

```html
<img 
  src="floor-plan.png" 
  alt="사무실 평면도"
  usemap="#office-map"
/>

<map name="office-map">
  <area 
    shape="rect" 
    coords="0,0,100,100" 
    href="/meeting-room-a"
    alt="회의실 A"
  />
  <area 
    shape="rect" 
    coords="100,0,200,100" 
    href="/meeting-room-b"
    alt="회의실 B"
  />
</map>
```

> **권장**: 이미지 맵 대신 개별 링크/버튼 사용

---

## Next.js Image 컴포넌트

```tsx
import Image from 'next/image';

// 기본 사용
<Image
  src="/photo.jpg"
  alt="제품 사진"
  width={800}
  height={600}
/>

// 장식용 이미지
<Image
  src="/decorative.jpg"
  alt=""
  width={800}
  height={600}
  aria-hidden="true"
/>

// fill 모드
<div style={{ position: 'relative', width: '100%', height: '300px' }}>
  <Image
    src="/hero.jpg"
    alt="영웅 배너 이미지"
    fill
    style={{ objectFit: 'cover' }}
  />
</div>
```

---

## 체크리스트

### 모든 이미지
- [ ] 모든 `<img>`에 `alt` 속성이 있는가?
- [ ] alt 텍스트가 이미지의 목적을 설명하는가?
- [ ] alt에 "이미지", "사진" 등 불필요한 단어가 없는가?

### 정보 전달 이미지
- [ ] 이미지가 전달하는 정보가 alt에 포함되어 있는가?
- [ ] 복잡한 이미지(차트, 그래프)에 상세 설명이 있는가?

### 기능적 이미지
- [ ] 링크/버튼 역할의 이미지에 동작 설명이 있는가?
- [ ] 아이콘에 적절한 레이블이 있는가?

### 장식용 이미지
- [ ] 장식용 이미지는 `alt=""`인가?
- [ ] 필요시 `aria-hidden="true"`가 있는가?

### SVG
- [ ] 의미 있는 SVG에 `role="img"`와 `title`이 있는가?
- [ ] 장식용 SVG에 `aria-hidden="true"`가 있는가?

---

## 참고 자료

- [W3C - Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [WebAIM - Alternative Text](https://webaim.org/techniques/alttext/)
- [MDN - img alt attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#alt)
- [Accessible SVG](https://css-tricks.com/accessible-svgs/)

