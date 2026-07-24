/** Intro screen — brand, budget, start CTA. Rules live in About/SEO. */
import { m } from '@/paraglide/messages.js';

export function IntroScreen() {
  return (
    <div id="intro" className="hidden">
      <img
        className="logo-mark"
        src="/logo.png"
        alt="73-9"
        width={72}
        height={72}
        decoding="async"
      />
      <p className="logo-main">73-9</p>
      <div className="subtitle">{m['game.ui.intro.subtitle']()}</div>
      <div className="budget-hero">
        {m['game.ui.intro.budget_label']()}
        <span className="big" id="introBudget">
          $100.0M
        </span>
      </div>

      <div className="fine" id="introFine" />
      <div className="intro-cta">
        <button className="btn" id="startBtn" type="button">
          {m['game.ui.intro.start']()}
        </button>
      </div>
    </div>
  );
}
