import { m } from '@/paraglide/messages.js';

import type { MountGame73Copy } from './mount-game';

/** Paraglide template with literal `{param}` placeholders for runtime substitution. */
function tpl(key: keyof typeof m, params: Record<string, string>): string {
  return m[key](params as never);
}

export function buildGameCopy(): MountGame73Copy {
  return {
    load: {
      initial: m['game.ui.load.initial'](),
      cached: m['game.ui.load.cached'](),
      decompressing: m['game.ui.load.decompressing'](),
      parsing: m['game.ui.load.parsing'](),
      bio: m['game.ui.load.bio'](),
      salary: m['game.ui.load.salary'](),
      records: m['game.ui.load.records'](),
      accolades: m['game.ui.load.accolades'](),
      positions: m['game.ui.load.positions'](),
      sealing_wall: m['game.ui.load.sealing_wall'](),
      building_groups: m['game.ui.load.building_groups'](),
      failed: tpl('game.ui.load.failed', { error: '{error}' }),
      subtitle: m['game.ui.load.subtitle'](),
    },
    intro: {
      subtitle: m['game.ui.intro.subtitle'](),
      budget_label: m['game.ui.intro.budget_label'](),
      start: m['game.ui.intro.start'](),
    },
    board: {
      reset: m['game.ui.board.reset'](),
      reset_confirm: m['game.ui.board.reset_confirm'](),
      cap_left: m['game.ui.board.cap_left'](),
      spin: m['game.ui.board.spin'](),
      spin_hint: m['game.ui.board.spin_hint'](),
    },
    pick: {
      pulling: m['game.ui.pick.pulling'](),
      no_affordable: m['game.ui.pick.no_affordable'](),
      none_fits: tpl('game.ui.pick.none_fits', { remaining: '{remaining}' }),
      warrior_locked: m['game.ui.pick.warrior_locked'](),
      slot_header: tpl('game.ui.pick.slot_header', {
        n: '{n}',
        total: '{total}',
      }),
      spin_once_more: m['game.ui.pick.spin_once_more'](),
      landed: tpl('game.ui.pick.landed', {
        name: '{name}',
        season: '{season}',
      }),
      reroll: tpl('game.ui.pick.reroll', { cost: '{cost}' }),
      natural_misfit: tpl('game.ui.pick.natural_misfit', { pos: '{pos}' }),
      budget_guard: tpl('game.ui.pick.budget_guard', { count: '{count}' }),
      roster_complete: m['game.ui.pick.roster_complete'](),
      sim_season: m['game.ui.pick.sim_season'](),
      next_incoming: m['game.ui.pick.next_incoming'](),
      your_squad_label: m['game.ui.pick.your_squad_label'](),
      opponent_label: m['game.ui.pick.opponent_label'](),
    },
    results: {
      min_players: m['game.ui.results.min_players'](),
      simulating: m['game.ui.results.simulating'](),
      your_season: m['game.ui.results.your_season'](),
      grade_title_contender: m['game.ui.results.grade_title_contender'](),
      grade_playoff_lock: m['game.ui.results.grade_playoff_lock'](),
      grade_play_in: m['game.ui.results.grade_play_in'](),
      grade_lottery: m['game.ui.results.grade_lottery'](),
      grade_tank: m['game.ui.results.grade_tank'](),
      season_sub: tpl('game.ui.results.season_sub', {
        ppg: '{ppg}',
        oppg: '{oppg}',
        spent: '{spent}',
        budget: '{budget}',
      }),
      warriors_header: m['game.ui.results.warriors_header'](),
      of_games_won: m['game.ui.results.of_games_won'](),
      avg_margin: tpl('game.ui.results.avg_margin', { margin: '{margin}' }),
      best_would_win: tpl('game.ui.results.best_would_win', { pct: '{pct}' }),
      wall_cracked: m['game.ui.results.wall_cracked'](),
      wall_short: tpl('game.ui.results.wall_short', { margin: '{margin}' }),
      their_five: tpl('game.ui.results.their_five', { names: '{names}' }),
      war_sub_cracked: tpl('game.ui.results.war_sub_cracked', {
        margin: '{margin}',
      }),
      war_sub_short: tpl('game.ui.results.war_sub_short', {
        margin: '{margin}',
      }),
      perfect_headline: m['game.ui.results.perfect_headline'](),
      perfect_tail_multi: tpl('game.ui.results.perfect_tail_multi', {
        count: '{count}',
      }),
      perfect_tail_first: m['game.ui.results.perfect_tail_first'](),
      share_run: m['game.ui.results.share_run'](),
      challenge_friend: m['game.ui.results.challenge_friend'](),
      draft_again: m['game.ui.results.draft_again'](),
      your_squad: m['game.ui.results.your_squad'](),
      squad_totals: tpl('game.ui.results.squad_totals', {
        spent: '{spent}',
        rtg: '{rtg}',
      }),
      optimal_header: m['game.ui.results.optimal_header'](),
      optimal_totals: tpl('game.ui.results.optimal_totals', {
        record: '{record}',
        spent: '{spent}',
        rtg: '{rtg}',
      }),
      optimal_perfect: m['game.ui.results.optimal_perfect'](),
      optimal_fallback: tpl('game.ui.results.optimal_fallback', {
        budget: '{budget}',
      }),
      lb_header: m['game.ui.results.lb_header'](),
      lb_loading: m['game.ui.results.lb_loading'](),
      lb_unavailable: m['game.ui.results.lb_unavailable'](),
      lb_today: m['game.ui.results.lb_today'](),
      lb_week: m['game.ui.results.lb_week'](),
      lb_alltime: m['game.ui.results.lb_alltime'](),
    },
    share: {
      text: tpl('game.ui.share.text', { pct: '{pct}' }),
      build_failed: m['game.ui.share.build_failed'](),
      close: m['game.ui.share.close'](),
      img_alt: m['game.ui.share.img_alt'](),
      copy: m['game.ui.share.copy'](),
      download: m['game.ui.share.download'](),
      draft_again: m['game.ui.share.draft_again'](),
      msg_saved: m['game.ui.share.msg_saved'](),
      msg_image_copied: m['game.ui.share.msg_image_copied'](),
      msg_copy_blocked_dl: m['game.ui.share.msg_copy_blocked_dl'](),
      msg_text_copied: m['game.ui.share.msg_text_copied'](),
      msg_copy_blocked: m['game.ui.share.msg_copy_blocked'](),
      msg_unavailable: m['game.ui.share.msg_unavailable'](),
      card_title: m['game.ui.share.card_title'](),
      card_vs: m['game.ui.share.card_vs'](),
      card_of_games: tpl('game.ui.share.card_of_games', { warSub: '{warSub}' }),
      card_my_season: tpl('game.ui.share.card_my_season', {
        w: '{w}',
        l: '{l}',
        grade: '{grade}',
      }),
      card_ppg: tpl('game.ui.share.card_ppg', {
        ppg: '{ppg}',
        oppg: '{oppg}',
        spent: '{spent}',
      }),
      card_footer: m['game.ui.share.card_footer'](),
      view_tag: m['game.ui.share.view_tag'](),
      view_prompt: m['game.ui.share.view_prompt'](),
      view_squad: m['game.ui.share.view_squad'](),
      view_cta: m['game.ui.share.view_cta'](),
    },
  };
}
