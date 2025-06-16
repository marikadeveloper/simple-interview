export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export const generateUniqueSlug = async (
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  let slug = slugify(baseSlug);
  let counter = 1;
  let exists = await checkExists(slug);

  while (exists) {
    slug = `${slugify(baseSlug)}-${counter}`;
    exists = await checkExists(slug);
    counter++;
  }

  return slug;
};
