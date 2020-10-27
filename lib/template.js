module.exports = {

  render(template, data) {
    if (template instanceof Buffer) template = template.toString();
    const fn = new Function(...Object.keys(data), "return `" + template.split('`').join('\\`') + "`;");
    return fn(...Object.values(data));
  },

};

