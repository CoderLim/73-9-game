/** Intro screen — brand, budget, start CTA. Rules live in About/SEO. */
export function IntroScreen() {
  return (
    <div id="intro" className="hidden">
      <img
        className="logo-mark"
        src="/logo.png"
        alt=""
        width={72}
        height={72}
        decoding="async"
      />
      <h1 className="logo-main">73-9</h1>
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
