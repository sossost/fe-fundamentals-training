import React, { useState } from "react";
import { Combobox, ComboOption } from "./Combobox";
import { useDebouncedValue } from "./useDebouncedValue";
import { useSearch, SearchItem } from "./useSearch";

type Props = {
  fetcher: (q: string, signal?: AbortSignal) => Promise<SearchItem[]>;
  onSelect: (opt: ComboOption) => void;
};

export function Autocomplete({ fetcher, onSelect }: Props) {
  const [raw, setRaw] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const debounced = useDebouncedValue(raw, 220);

  const { data, loading, error } = useSearch(debounced, fetcher, {
    enabled: !isComposing,
  });

  const options: ComboOption[] = data.map((d) => ({
    id: d.id,
    label: d.label,
    value: d.value,
  }));

  return (
    <div
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
    >
      <Combobox
        value={raw}
        onValueChange={setRaw}
        options={options}
        loading={loading}
        error={error}
        onSelect={onSelect}
      />
    </div>
  );
}
