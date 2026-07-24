/** Intro / rules screen — matches `#intro` from the standalone build. */
export function IntroScreen() {
  return (
    <div id="intro" className="hidden">
      <img
        className="logo-mark"
        src="/logo.png"
        alt=""
        width={88}
        height={88}
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

      <section className="rules" aria-label="How to play">
        <header className="rules-head">
          <p className="rules-kicker">How it works</p>
          <h2 className="rules-title">Five spins. One shot at history.</h2>
        </header>

        <ol className="rules-list">
          <li>
            <span className="num" aria-hidden>
              1
            </span>
            <div className="rules-body">
              <strong className="rules-step">Land a franchise season</strong>
              <p>
                The wheel stops on a random <b>team-year</b> anywhere from 1990
                to now — that roster is your market.
              </p>
            </div>
          </li>
          <li>
            <span className="num" aria-hidden>
              2
            </span>
            <div className="rules-body">
              <strong className="rules-step">Ink one contract</strong>
              <p>
                Take <b>exactly one</b> player. Pay what their deal would cost
                under the <b>2026 salary cap</b>.
              </p>
            </div>
          </li>
          <li>
            <span className="num" aria-hidden>
              3
            </span>
            <div className="rules-body">
              <strong className="rules-step">Stay under the ceiling</strong>
              <p>
                Repeat until you have five. Overspend early and the last seats
                are <b>minimum-salary</b> scraps.
              </p>
            </div>
          </li>
          <li>
            <span className="num" aria-hidden>
              4
            </span>
            <div className="rules-body">
              <strong className="rules-step">Face the 73–9 wall</strong>
              <p>
                We run an <b>82-game season</b> and show how often your five
                topples the <b>2015–16 Warriors</b> — plus the best lineup you
                left on the table.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <div className="fine" id="introFine" />
      <div className="intro-cta">
        <button className="btn" id="startBtn" type="button">
          Start the wheel
        </button>
      </div>
    </div>
  );
}
