export function getApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  if (!base || base.includes('lambda-url')) {
    return 'https://m6751bukx5.execute-api.ap-southeast-1.amazonaws.com';
  }
  return base;
}
