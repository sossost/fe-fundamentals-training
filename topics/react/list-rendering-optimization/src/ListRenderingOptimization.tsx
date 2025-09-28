import React, { useState } from "react";
import NaiveList from "./components/NaiveList";
import OptimizedList from "./components/OptimizedList";

export default function ListRenderingOptimization() {
  const [mode, setMode] = useState<"naive" | "optimized">("naive");

  return (
    <div>
      <div>
        &nbsp;&nbsp;
        <label>
          모드:&nbsp;
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "naive" | "optimized")}
          >
            <option value="naive">Naive</option>
            <option value="optimized">Optimized</option>
          </select>
        </label>
      </div>

      {mode === "naive" ? <NaiveList /> : <OptimizedList />}
    </div>
  );
}
