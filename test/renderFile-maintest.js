function main(context) {
  return (new Hoquet).doc('html5', [
    "html",
    [
      "head",
      ["title", context.title]
    ],
    [
      "body",
      ["h1", "Hello World"]
    ]
  ]);
};
