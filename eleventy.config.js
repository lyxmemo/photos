module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addWatchTarget("src/css/");

  // Add photos collection
  eleventyConfig.addCollection("photos", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/photos/*.md");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
