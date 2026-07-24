/**
 * In-game HUD + reel + landed picker — matches `#game` from the standalone build.
 * Dynamic content (#strip, #reelTrack, #landed) is filled by the game runtime.
 */
export function GameBoard() {
  return (
    <div id="game" className="hidden">
      <div className="hud">
        <div className="hud-left">
          <div className="hud-title-row">
            <div className="hud-title">73-9</div>
            <button
              className="restart-btn"
              type="button"
              // Runtime also binds confirmRestart on window for parity with
              // the standalone onclick="confirmRestart()" attribute.
              onClick={() => {
                const fn = (
                  window as unknown as { confirmRestart?: () => void }
                ).confirmRestart;
                fn?.();
              }}
              title="Reset draft"
              aria-label="Reset draft"
            >
              Reset draft
            </button>
          </div>
          <div className="slot-dots" id="slotDots" />
        </div>
        <div className="cap-pill" id="capPill">
          <span className="lab">Left</span>$100.0M
        </div>
      </div>

      <div className="strip" id="strip" />

      <div className="reel-stage">
        <div className="reel-hint" id="reelHint">
          Spin for a team-season
        </div>
        <div className="reel-window">
          <div className="reel-marker" />
          <div className="reel-track" id="reelTrack" />
        </div>
        <div className="spin-row">
          <button className="btn" id="spinBtn" type="button">
            Spin
          </button>
          <button
            className="btn"
            id="respinBtn"
            type="button"
            style={{ display: 'none' }}
          >
            Re-roll — $10M
          </button>
        </div>
      </div>

      <div id="landed" className="landed hidden" />
    </div>
  );
}
