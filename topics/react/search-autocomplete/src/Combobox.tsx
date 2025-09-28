import React, { useEffect, useId, useRef, useState } from "react";

export type ComboOption = { id: string; label: string; value: string };

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  options: ComboOption[];
  loading?: boolean;
  error?: string | null;
  onSelect: (opt: ComboOption) => void;
};

export function Combobox({
  value,
  onValueChange,
  options,
  loading,
  error,
  onSelect,
}: Props) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleSelect = (opt: ComboOption) => {
    onValueChange(opt.label);
    setOpen(false);
    onSelect(opt);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        role="combobox"
        // 이 입력은 listbox(옵션 목록)를 제어하는 combobox 위젯임을 알림

        aria-autocomplete="list"
        // 입력값에 따라 '목록(listbox)' 형태의 자동완성 제안을 제공함을 명시

        aria-expanded={open}
        // 연결된 listbox가 현재 열려 있는지(true) 닫혀 있는지(false) 상태 전달

        aria-controls={listboxId}
        // 이 combobox가 제어하는 listbox의 id를 지정하여 관계를 연결

        aria-activedescendant={
          activeIndex >= 0
            ? `opt-${listboxId}-${options[activeIndex].id}`
            : undefined
        }
        // 현재 키보드로 '활성(하이라이트)'된 option의 id를 지정
        // 실제 포커스는 input에 유지되지만 스크린리더는 이 속성으로 활성 항목을 읽음

        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onValueChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "ArrowDown") {
            setActiveIndex((i) => (i + 1) % options.length);
          } else if (e.key === "ArrowUp") {
            setActiveIndex((i) => (i - 1 + options.length) % options.length);
          } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(options[activeIndex]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {open && (
        <div id={listboxId} role="listbox">
          {/* listbox: combobox가 제어하는 '옵션 목록' 컨테이너 */}

          {loading && <div>검색 중…</div>}

          {error && <div role="alert">{error}</div>}
          {/* role="alert": 오류 등 중요 메시지를 즉시 보이스오버로 알림 */}

          {!loading && !error && options.length === 0 && <div>결과 없음</div>}
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              id={`opt-${listboxId}-${opt.id}`}
              role="option"
              // listbox 내의 개별 '선택 가능 항목'

              aria-selected={idx === activeIndex}
              // 현재 활성(하이라이트) 또는 선택된 항목 여부를 전달
              // 스크린리더는 "선택됨"으로 읽어 사용자에게 현재 상태를 알림

              onMouseDown={() => handleSelect(opt)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {/* aria-live="polite": 중요 메시지를 보이스오버로 알림 */}
        {/* aria-atomic="true": 전체 내용을 한 번에 읽음 */}
        {/* className="sr-only": 화면에는 표시하지 않지만 스크린리더에는 읽힘 */}

        {loading
          ? "검색 중입니다"
          : error
          ? "오류가 발생했습니다"
          : options.length > 0
          ? `${options.length}개의 결과`
          : "검색 결과가 없습니다"}
      </div>
    </div>
  );
}
