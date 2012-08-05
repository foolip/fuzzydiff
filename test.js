// -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*-

'use strict';

function cmp(fuzziness) {
  return function(a, b) {
    if (a == b) {
      return 1;
    } else if (a.toUpperCase() == b.toUpperCase()) {
      return fuzziness;
    } else {
      return 0;
    }
  };
}

function assert_diff_equals(actual, expected) {
  assert_equals(actual.length, expected.length);
  var q = 0;
  for (var i = 0; i < actual.length; i++) {
    assert_equals(actual[i].q, expected[i].q);
    assert_equals(actual[i].a, expected[i].a);
    assert_equals(actual[i].b, expected[i].b);
    q += actual[i].q * actual[i].a.length;
  }
  assert_equals(actual.q, q);
}

test(function() {
  var diff = fuzzydiff('', '', cmp(0));
  assert_diff_equals(diff, []);
}, 'empty strings');

test(function() {
  var diff = fuzzydiff('z', 'Z', cmp(0));
  assert_diff_equals(diff, [{ q: 0, a: 'z', b: 'Z' }]);
}, 'binary comparator');

test(function() {
  var diff = fuzzydiff('zZ', 'Zz', cmp(0.25));
  assert_diff_equals(diff, [{ q: 0, a: '', b: 'Z' },
                            { q: 1, a: 'z', b: 'z' },
                            { q: 0, a: 'Z', b: '' }]);
}, 'fuzzy comparator (0.25)');

test(function() {
  var diff = fuzzydiff('zZ', 'Zz', cmp(0.5));
  assert_diff_equals(diff, [{ q: 0, a: '', b: 'Z' },
                            { q: 1, a: 'z', b: 'z' },
                            { q: 0, a: 'Z', b: '' }]);
}, 'fuzzy comparator (0.5)');

test(function() {
  var diff = fuzzydiff('zZ', 'Zz', cmp(0.75));
  assert_diff_equals(diff, [{ q: 0.75, a: 'zZ', b: 'Zz' }]);
}, 'fuzzy comparator (0.75)');

test(function() {
  var diff = fuzzydiff('Hello, hello, world!', 'HELLO WORLD', cmp(0.75));
  assert_diff_equals(diff, [{ q: 1, a: 'H', b: 'H' },
                            { q: 0.75, a: 'ello', b: 'ELLO' },
                            { q: 0, a: ', hello, ', b: '' },
                            { q: 0.75, a: 'world', b: 'WORLD' },
                            { q: 0, a: '!', b: '' }]);
}, 'Hello World');
