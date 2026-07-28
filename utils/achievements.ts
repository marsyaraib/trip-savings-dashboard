import { MILESTONES, FIXED_AMOUNT_ACHIEVEMENT, COMPLETION_ACHIEVEMENT, TARGET_PER_PERSON } from "@/constants/savings";
import type { AchievementEarned } from "@/types";

export interface EarnedBadge {
  badge: string;
  label: string;
}

/** All badges a member has earned so far, based purely on their total saved. */
export function getEarnedBadges(totalSaved: number): EarnedBadge[] {
  const badges: EarnedBadge[] = [];

  for (const milestone of MILESTONES) {
    if (totalSaved >= milestone.fraction * TARGET_PER_PERSON) {
      badges.push({ badge: milestone.badge, label: `${milestone.label} tercapai` });
    }
  }

  if (totalSaved >= FIXED_AMOUNT_ACHIEVEMENT.amount) {
    badges.push({ badge: FIXED_AMOUNT_ACHIEVEMENT.badge, label: FIXED_AMOUNT_ACHIEVEMENT.label });
  }

  if (totalSaved >= TARGET_PER_PERSON) {
    badges.push({ badge: COMPLETION_ACHIEVEMENT.badge, label: COMPLETION_ACHIEVEMENT.label });
  }

  return badges;
}

/**
 * Detects which NEW milestones were just crossed by adding `addedAmount`
 * on top of `previousTotal`. Used right after inserting a payment to decide
 * which activity-log entries / confetti celebrations to fire.
 */
export function detectNewMilestones(
  previousTotal: number,
  newTotal: number,
  memberKey: string,
  memberDisplayName: string
): AchievementEarned[] {
  const earned: AchievementEarned[] = [];

  for (const milestone of MILESTONES) {
    const threshold = milestone.fraction * TARGET_PER_PERSON;
    if (previousTotal < threshold && newTotal >= threshold) {
      earned.push({
        id: `${memberKey}-milestone-${milestone.fraction}`,
        badge: milestone.badge,
        label: `${memberDisplayName} mencapai ${milestone.label} dari target pribadi!`,
        member_name: memberKey,
      });
    }
  }

  if (previousTotal < FIXED_AMOUNT_ACHIEVEMENT.amount && newTotal >= FIXED_AMOUNT_ACHIEVEMENT.amount) {
    earned.push({
      id: `${memberKey}-fixed-5jt`,
      badge: FIXED_AMOUNT_ACHIEVEMENT.badge,
      label: `${memberDisplayName} mencapai Rp5.000.000!`,
      member_name: memberKey,
    });
  }

  if (previousTotal < TARGET_PER_PERSON && newTotal >= TARGET_PER_PERSON) {
    earned.push({
      id: `${memberKey}-completed`,
      badge: COMPLETION_ACHIEVEMENT.badge,
      label: `${memberDisplayName} menyelesaikan target pribadi Rp10.000.000!`,
      member_name: memberKey,
    });
  }

  return earned;
}
