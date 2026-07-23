/**
 * Full-viewport host for the standalone 73-9 game
 * served from /public/73-9-game.
 */
export function Game73Host() {
  return (
    <div className="game-73-host fixed inset-0 z-10 m-0 bg-[#0a0a1a] p-0">
      <iframe
        src="/73-9-game/index.html"
        title="73-9 Game: Can you beat the 2015-16 Warriors?"
        className="block h-full w-full border-0"
        allow="clipboard-write"
      />
    </div>
  );
}
