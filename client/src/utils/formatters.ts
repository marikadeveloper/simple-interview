export const pathnameToBreadcrumbLabel = (path: string) => {
  // for example:
  // "users" -> "Users"
  // "question-bank" -> "Question Bank"

  const pathWithoutDash = path.replace(/-/g, ' ');
  return pathWithoutDash.charAt(0).toUpperCase() + pathWithoutDash.slice(1);
};
