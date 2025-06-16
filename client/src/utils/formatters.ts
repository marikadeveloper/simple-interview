export const pathnameToBreadcrumbLabel = (path: string) => {
  // for example:
  // "users" -> "Users"
  // "question-bank" -> "Question Bank"

  const pathWithoutDash = path.replace(/-/g, ' ');
  return pathWithoutDash
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
