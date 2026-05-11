export const parseTags = (tags: string | null) =>
  tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : null;

export const serializeTags = (tags?: string[]) =>
  tags && tags.length > 0 ? tags.map((tag) => tag.trim()).filter(Boolean).join(',') : null;

export const toAlertResponse = <
  T extends {
    tags: string | null;
  }
>(
  alert: T
) => ({
  ...alert,
  tags: parseTags(alert.tags)
});
