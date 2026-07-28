export interface Member {
  key: string; // stable identifier, used as the FK value in payments/activity_logs — never changes
  displayName: string; // editable via the admin "Kelola Anggota" panel
  photoUrl: string | null;
  initials: string;
  colorClass: string; // tailwind gradient classes for avatar
  ringClass: string; // tailwind ring/border color for progress
  hex: string; // solid hex color, for chart fills
}

export function getMember(members: Member[], key: string): Member | undefined {
  return members.find((m) => m.key === key);
}

export function memberDisplayName(members: Member[], key: string): string {
  return getMember(members, key)?.displayName ?? key;
}
