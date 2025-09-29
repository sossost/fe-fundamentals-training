브라우저 캐시

캐시 전략의 두 축

브라우저 캐시는 크게 두 가지 방식으로 나눔
	•	강력 캐시 (Strong Caching): 브라우저가 서버에 요청하지 않고 캐시만 사용
	•	검증 캐시 (Validation Caching): 브라우저가 서버에 조건부 요청을 보내고 확인 후 캐시 사용

⸻

강력 캐시 (Strong Caching)

특징
	•	유효 기간 안에서는 네트워크 요청 자체가 발생하지 않음
	•	캐시에서 바로 응답

대표 헤더
	•	Cache-Control: max-age=60 → 60초 동안 캐시 유지
	•	Cache-Control: no-store → 캐시에 저장하지 않음
	•	Cache-Control: no-cache → 캐시는 하지만 서버 확인 필요 (실제로는 검증 캐시처럼 동작)
	•	Expires: <date> → 특정 시각까지 캐시 유지 (옛날 방식, max-age가 우선)

⸻

검증 캐시 (Validation Caching)

특징
	•	브라우저가 서버에 조건부 요청을 보냄
	•	리소스가 변하지 않았다면 304 Not Modified
	•	변했다면 200 OK + 새 데이터

대표 헤더
	•	ETag + If-None-Match
	•	서버가 응답에 ETag: "v1" 제공
	•	브라우저가 다음 요청 시 If-None-Match: "v1" 전달
	•	같으면 304, 다르면 200
	•	Last-Modified + If-Modified-Since
	•	리소스 최종 수정 시각 기반 비교

⸻

기타 방식
	•	Service Worker Cache API: 개발자가 캐시를 직접 제어 가능 (예: stale-while-revalidate)
	•	CDN 캐시: 같은 헤더 기반으로 동작

⸻

비교 표

구분	강력 캐시	검증 캐시
요청 발생 여부	유효 기간 내 요청 없음	서버에 조건부 요청 발생
대표 헤더	Cache-Control: max-age, Expires	ETag, Last-Modified
서버 부담	없음 (요청 자체 없음)	요청은 감 (응답 크기만 줄어듦)
적합한 경우	JS, CSS, 이미지 등 정적 파일	API 응답, 자주 바뀌는 리소스


⸻

요약
	•	강력 캐시: 시간 기반, 요청 자체를 막음 → 정적 자원에 적합
	•	검증 캐시: 변경 여부 확인, 304 응답으로 효율적 → 동적인 API에 적합
	•	실제 서비스는 두 가지를 혼합해 사용함

⸻