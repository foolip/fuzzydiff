// -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*-

'use strict';

// fuzzydiff finds the best fuzzy diff between two strings based on a
// comparator.
//
// When the comparator only returns 0 or 1 it is similar to the
// longest common subsequence problem, see
// <http://en.wikipedia.org/wiki/Longest_common_subsequence_problem>.
//
// When the comparator returns values between 0 and 1 it is similar to
// finding a shortest path through the decision tree (DAG) where one
// starts with the two strings and each edge represents a fuzzy match
// (cost 1 - q) or an insertion/deletion (cost 1).
//
// Returns an array of objects { q: 0..1, a: "...", b: "..." }, where
// q is the similarity and a/b are the substrings matched. As a
// convenience, the array object itself also has an accumulated
// similarity q in the range 0..min(a.length, b.length).
function fuzzydiff(a, b, cmp) {
  function append(l, e) {
    var last = l[l.length - 1];
    if (last && last.q == e.q) {
      last.a += e.a;
      last.b += e.b;
    } else {
      l.push(e);
    }
    l.q += e.q;
    return l;
  }

  function diff(a, b) {
    if (a.length == 0 || b.length == 0) {
      var first = (a.length > 0 || b.length > 0) ? [{ q: 0, a: a, b: b }] : [];
      first.q = 0;
      return first;
    }

    var aSub = a.substr(0, a.length - 1);
    var aLast = a.substr(-1);
    var bSub = b.substr(0, b.length - 1);
    var bLast = b.substr(-1);

    // there are 3 options, try them all and pick the best!
    var qLast = cmp(aLast, bLast);
    var x = diff(aSub, bSub);
    var y = diff(a, bSub);
    var z = diff(aSub, b);
    var bestYZ = (y.q > z.q) ? y : z;

    if (x.q + qLast > bestYZ.q)
      return append(x, { q: qLast, a: aLast, b: bLast });

    if (bestYZ == y)
      return append(y, { q: 0, a: '', b: bLast });
    else
      return append(z, { q: 0, a: aLast, b: '' });
  }

  return diff(a, b);
}
