/** Loading screen — matches `#loadScreen` from the standalone build. */
export function LoadScreen() {
  return (
    <div id="loadScreen">
      <img
        className="logo-mark"
        src="/logo.png"
        alt="73-9"
        width={88}
        height={88}
        decoding="async"
      />
      <p className="logo-main">73-9</p>
      <div className="subtitle">Challenge the 73–9 Warriors</div>
      <div id="progressLabel">Loading game data...</div>
      <div className="bar">
        <div id="progressFill" />
      </div>
    </div>
  );
}
