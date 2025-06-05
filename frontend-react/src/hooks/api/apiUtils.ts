export const toQueryString = (params: Record<string, any>) => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '' && !isNaN(value))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `?${query}`;
};
