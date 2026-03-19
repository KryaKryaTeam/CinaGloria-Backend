export const RelationSlots = {
  user: {
    avatar: 'user:avatar',
  },
} as const;

export type TMimeType = `${string}/${string}`;

export interface ISlotConfig {
  maxSize: number;
  allowedMimeTypes: TMimeType[];
}

export const RelationSlotsConfig = new Map<string, ISlotConfig>([
  [
    'user:avatar',
    {
      maxSize: 10 * 1024 * 1024,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    },
  ],
]);

type DeepValues<T> = T extends string
  ? T
  : T extends object
    ? DeepValues<T[keyof T]>
    : never;

export type AppSlotCode = DeepValues<typeof RelationSlots>;

export type RelationSlots = typeof RelationSlots;
