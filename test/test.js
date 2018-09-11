var expect = require('chai').expect;
var hoquet = require('../index.js');

describe('module hoquet', function () {
  it('is an object', function () {
    expect(hoquet).to.be.an('object');
  });
});

describe('hoquet.render', function() {
  it('is a function', function() {
    expect(hoquet.render).to.be.a('function');
  });

  it('should return a string', function() {
    expect(hoquet.render()).to.be.a('string');
  });

  it('should take a single structured array like this: ["p","foo"] and create an HTML snippet like this "<p>foo</p>', function() {
    expect(hoquet.render(['p','foo'])).to.equal('<p>foo</p>');
  });

  it('should create a string of HTML snippets by joining each of its arguments', function() {
    expect(hoquet.render(['p','foo'],['p','bar'],['p','baz'])).to.equal(
      '<p>foo</p><p>bar</p><p>baz</p>'
    );
  });

  it('should create a string of HTML snippets by joining elements of an Array', function() {
    expect(hoquet.render([['p','foo'],['p','bar']])).to.equal(
      '<p>foo</p><p>bar</p>'
    );
  });

  it('should create a string of embedded HTML by embedding Arrays like this ["p","foo", ["span","bar"]]', function() {
    expect(hoquet.render(['p','foo', ['span','bar']])).to.equal(
      '<p>foo<span>bar</span></p>'
    );
  });

  it('should add attributes to the HTML elements by putting an object in second position only, like this: ["p", {class: "foo"}, "bar"]', function() {
    expect(hoquet.render(['p', {class:'foo'}, 'bar'])).to.equal('<p class="foo">bar</p>');
    expect(hoquet.render(['p', 'foo', {class: 'bar'}])).to.equal('<p>foo</p>');
  });

  it('should not print attributes set explicitly to false', function() {
    expect(
        hoquet.render(['p',{foo: false}, 'bar'])
    ).to.equal(
        '<p>bar</p>'
    );
  });

  it('should only print attribute name when set explicitly to true', function() {
    expect(
        hoquet.render(['p',{foo: true}, 'bar'])
    ).to.equal(
        '<p foo>bar</p>'
    );
  });

  it('should print attribute names as space delimited string when value is an Array', function() {
    expect(
        hoquet.render(['p',{foo: ["foo", "bar", "baz"]}, 'bar'])
    ).to.equal(
        '<p foo="foo bar baz">bar</p>'
    );
  });

  it('should ignore falsy values in every position other than the first', function() {
    expect(hoquet.render(['p', null, 'foo', false, 'bar', undefined, 'baz'])).to.equal(
      '<p>foobarbaz</p>'
    );
    const invalids = [
        [[2, 2], "number"],
        [[false, 'foo'], "boolean"],
        [[null, 'bar'], "object"],
        [[undefined,'baz'], "undefined"],
        [[{}, 'far'], "object", "[object Object]"]
    ];
    invalids.forEach(x => {
        expect(hoquet.render([x[0]])).to.equal(
            `InvalidTagName: ${
                JSON.stringify(x[0][0])
            } (having type ${
                JSON.stringify(x[1])
            }) is not a valid tag name. Context: ${JSON.stringify(x[0])}`
        );
    });
    expect(hoquet.render([
      'p', {}, [], null, undefined, null + undefined, false, {}, 'foo', []
    ])).to.equal(
      '<p>foo</p>'
    );
  });

  it('should be an error if the tagname is invalid', function() {
    expect(hoquet.render([2, "foo"])).to.be.an("Error");
  });

  it('should handle self-closing elements by assuming elements without content are self-closing, e.g. ["meta"] or ["meta", {foo: "bar"}],  not ["meta", undefined/false/null/[]/{}]', function() {
    expect(hoquet.render(['meta'])).to.equal('<meta />');
    expect(hoquet.render(['meta', {foo: 'bar'}])).to.equal('<meta foo="bar" />');
    expect(hoquet.render(['br'])).to.equal('<br />');
    expect(hoquet.render(['p'],['p',''])).to.equal('<p /><p></p>');
  });
});

