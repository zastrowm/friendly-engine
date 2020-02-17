module.exports = function(source) {
  const { version, webpack } = this;

  if (source.includes("window.customElements.define")) {
    console.log("FOUND IT");
    console.log(this.myExportFn(source));
  }

  const newSource = `
  (() => console.log('hiiii'))();
  ${source}`;

  return `${source}`;
};
