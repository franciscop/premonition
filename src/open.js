// Load either a URL or a <a> element referenced HTML into the body
export default async function (ref) {
  // Accept an <a>, since those will have a property called .href
  const href = ref.href || ref;

  // TODO: make sure that the url is not the current one with a fragment

  try {
    // .load() already does all the cache and loading checking
    const data = await this.load(href);

    // Merge the data from the new site with the current one
    await this.replace(data.href, data.html);

    return this.init();
  } catch (error) {
    // Manually load the new page
    this.report(error);
    location.href = href;
  }
};
