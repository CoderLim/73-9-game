/** Loading screen — matches `#loadScreen` from the standalone build. */
export function LoadScreen() {
  return (
    <div id="loadScreen">
      <img
        className="logo-mark"
        src="/logo.png"
        alt=""
        width={88}
        height={88}
        decoding="async"
      />
      <h1 className="logo-main">73-9</h1>
      <div className="subtitle">Challenge the 73–9 Warriors</div>
      <div id="progressLabel">Loading game data...</div>
      <div className="bar">
        <div id="progressFill" />
      </div>
    </div>
  );
}
