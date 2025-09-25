const AUTHOR_NAME_MAP: Record<string, string> = {
  "skarlette-choi": "Skarlette Choi",
  nurse1: "Nurse Smith",
  nurse2: "Nurse Johnson",
};

type RelativeTimeVariant = "compact" | "friendly";

export const getAuthorName = (authorId: string) => {
  return AUTHOR_NAME_MAP[authorId] ?? authorId;
};

export const formatRelativeTime = (
  timestamp: string,
  variant: RelativeTimeVariant = "compact"
) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Just now";
  }

  if (diffInHours < 24) {
    if (variant === "friendly") {
      return diffInHours === 1
        ? "1 hour ago"
        : `${diffInHours} hours ago`;
    }

    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (variant === "friendly") {
    return diffInDays === 1 ? "Yesterday" : `${diffInDays} days ago`;
  }

  return `${diffInDays}d ago`;
};
