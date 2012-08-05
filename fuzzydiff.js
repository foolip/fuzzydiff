// -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*-

'use strict';

// fuzzydiff finds the best fuzzy diff between two strings based on a
// comparator.
//
// When the comparator only returns 0 or 1 it is similar to the
// longest common subsequence problem. However, when the comparator
// returns values between 0 and 1 it is similar to finding a shortest
// path through the decision tree (DAG) where one starts with the two
// strings and each edge represents a fuzzy match (cost 1 - q) or an
// insertion/deletion (cost 1).
//
// Returns an array of objects { q: 0..1, a: "...", b: "..." }, where
// q is the similarity and a/b are the substrings matched. As a
// convenience, the array object itself also has an accumulated
// similarity q in the range 0..min(a.length, b.length).
function fuzzydiff(a, b, cmp) {
  var m = a.length;
  var n = b.length;

  // c represents an m*n DAG of all possible matches between a and b,
  // in which we find the longest path. Visit each vertex once in
  // topological order (sweeping diagonal i + j = k), compare the
  // allowed options (match, insert, remove) and remember the maximum
  // accumulated q for each vertex. When done, we have an accumulated
  // q and can easily backtrack to generate the fuzzy diff.
  var c = new Float64Array(m * n);
  c.get = function(i, j) { return (i < m && j < n) ? c[i + j * m] : 0; };
  c.put = function(i, j, x) { c[i + j * m] = x; };
  var i, j, k; // i + j = k
  var q, aq; // local and accumulated q
  for (k = m + n - 2; k >= 0; k--) {
    if (k < n) {
      j = k;
      i = 0;
    } else {
      j = n - 1;
      i = k - j;
    }
    while (i < m && j >= 0) {
      q = cmp(a[i], b[j]); // 0..1
      aq = q > 0 ? q + c.get(i + 1, j + 1) : 0;
      aq = Math.max(aq, c.get(i + 1, j), c.get(i, j + 1));
      c.put(i++, j--, aq);
    }
  }

  // Generate a fuzzy diff by backtracking.
  var diff = [];
  diff.q = c.get(0, 0);

  // Append section x to diff.
  function append(x) {
    var last = diff[diff.length - 1];
    if (last && last.q == x.q) {
      last.a += x.a;
      last.b += x.b;
    } else {
      diff.push(x);
    }
  }

  // There may be many possible paths, prefer match over deletion over
  // insertion, since that gives pretty diffs.
  i = 0;
  j = 0;
  while (i < m && j < n) {
    q = cmp(a[i], b[j]);
    aq = c.get(i, j);
    if (q > 0 && aq == q + c.get(i + 1, j + 1)) {
      append({ q: q, a: a[i++], b: b[j++] });
    } else if (aq == c.get(i + 1, j)) {
      append({ q: 0, a: a[i++], b: '' });
    } else {
      append({ q: 0, a: '', b: b[j++] });
    }
  }
  if (i < m || j < n) {
    append({ q: 0, a: a.substr(i), b: b.substr(j) });
  }

  return diff;
}
