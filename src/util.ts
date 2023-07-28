export function getApplicationId(token: string) {
  const [base64Id] = token.split('.');
  return atob(base64Id);
}
