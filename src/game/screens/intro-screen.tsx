/** Intro screen — brand, bankroll, start CTA. Rules live in About/SEO. */
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
      <div className="subtitle">
        Build a five that beats the 2015-16 Warriors
      </div>
      <div className="budget-hero">
        Your bankroll
        <span className="big" id="introBudget">
          $100.0M
        </span>
      </div>

      <div className="fine" id="introFine" />
      <div className="intro-cta">
        <button className="btn" id="startBtn" type="button">
          Start the wheel
        </button>
      </div>
    </div>
  );
}
