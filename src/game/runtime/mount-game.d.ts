export type GameLeaderboardBoard = {
  day: Array<{ name: string; pct: number; record: string }>;
  week: Array<{ name: string; pct: number; record: string }>;
  alltime: Array<{ name: string; pct: number; record: string }>;
};

export type MountGame73Auth = {
  isAuthenticated: boolean;
  signInHref: string;
  guestTip: string;
  signInToSaveLabel: string;
  saveFailedText: string;
};

export type MountGame73Copy = {
  load: {
    initial: string;
    cached: string;
    decompressing: string;
    parsing: string;
    bio: string;
    salary: string;
    records: string;
    accolades: string;
    positions: string;
    sealing_wall: string;
    building_groups: string;
    failed: string;
    subtitle: string;
  };
  intro: {
    subtitle: string;
    budget_label: string;
    start: string;
  };
  board: {
    reset: string;
    reset_confirm: string;
    cap_left: string;
    spin: string;
    spin_hint: string;
  };
  pick: {
    pulling: string;
    no_affordable: string;
    none_fits: string;
    warrior_locked: string;
    slot_header: string;
    spin_once_more: string;
    landed: string;
    reroll: string;
    natural_misfit: string;
    budget_guard: string;
    roster_complete: string;
    sim_season: string;
    next_incoming: string;
    your_squad_label: string;
    opponent_label: string;
  };
  results: {
    min_players: string;
    simulating: string;
    your_season: string;
    grade_title_contender: string;
    grade_playoff_lock: string;
    grade_play_in: string;
    grade_lottery: string;
    grade_tank: string;
    season_sub: string;
    warriors_header: string;
    of_games_won: string;
    avg_margin: string;
    best_would_win: string;
    wall_cracked: string;
    wall_short: string;
    their_five: string;
    war_sub_cracked: string;
    war_sub_short: string;
    perfect_headline: string;
    perfect_tail_multi: string;
    perfect_tail_first: string;
    share_run: string;
    challenge_friend: string;
    draft_again: string;
    your_squad: string;
    squad_totals: string;
    optimal_header: string;
    optimal_totals: string;
    optimal_perfect: string;
    optimal_fallback: string;
    lb_header: string;
    lb_loading: string;
    lb_unavailable: string;
    lb_today: string;
    lb_week: string;
    lb_alltime: string;
  };
  share: {
    text: string;
    build_failed: string;
    close: string;
    img_alt: string;
    copy: string;
    download: string;
    draft_again: string;
    msg_saved: string;
    msg_image_copied: string;
    msg_copy_blocked_dl: string;
    msg_text_copied: string;
    msg_copy_blocked: string;
    msg_unavailable: string;
    card_title: string;
    card_vs: string;
    card_of_games: string;
    card_my_season: string;
    card_ppg: string;
    card_footer: string;
    view_tag: string;
    view_prompt: string;
    view_squad: string;
    view_cta: string;
  };
};

export type MountGame73Options = {
  search?: string;
  auth?: MountGame73Auth;
  copy?: Partial<MountGame73Copy>;
  fetchLeaderboard?: () => Promise<GameLeaderboardBoard | null>;
  submitResult?: (payload: {
    winPct: number;
    record: string;
    isPerfect: boolean;
    lineup: unknown;
    sharePayload: unknown;
  }) => Promise<{ board: GameLeaderboardBoard } | null>;
};

export function mountGame73(
  root: HTMLElement,
  opts?: MountGame73Options
): () => void;
