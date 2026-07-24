/** Intro screen — brand, budget, start CTA. Rules live in About/SEO. */
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
      <div className="subtitle">Draft five players. Outdo 73–9.</div>
      <div className="budget-hero">
        Your budget
        <span className="big" id="introBudget">
          $100.0M
        </span>
      </div>

      <div className="fine" id="introFine" />
      <div className="intro-cta">
        <button className="btn" id="startBtn" type="button">
          Start drafting
        </button>
      </div>
    </div>
  );
}
