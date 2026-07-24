/** Loading screen — matches `#loadScreen` from the standalone build. */
import { m } from '@/paraglide/messages.js';

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
      <div className="subtitle">{m['game.ui.load.subtitle']()}</div>
      <div id="progressLabel">{m['game.ui.load.initial']()}</div>
      <div className="bar">
        <div id="progressFill" />
      </div>
    </div>
  );
}
