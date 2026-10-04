+++
date = '2026-07-06T14:21:00+05:30'
draft = true
title = 'String Comparison'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 12
weight = 3
initial_code = '''#include <stdio.h>

int my_strcmp(const char *s1, const char *s2) {
    while (*s1 && (*s1 == *s2)) {
        s1++;
        s2++;
    }
    return *(unsigned char *)s1 - *(unsigned char *)s2;
}

int main(void) {
    const char *a = "apple";
    const char *b = "apple";
    const char *c = "apples";
    const char *d = "banana";

    printf("cmp(apple, apple): %d\n", my_strcmp(a, b));
    printf("cmp(apple, apples): %d\n", my_strcmp(a, c));
    printf("cmp(apple, banana): %d\n", my_strcmp(a, d));

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'cmp results: 0, negative, positive'
+++

## Problem Statement

Implement `my_strcmp` that compares two strings lexicographically. Return 0 if equal, negative if first < second, positive if first > second. Compare the standard library behavior by testing with equal strings, a prefix, and completely different strings.

## Theory and Concepts

- String comparison proceeds character by character using their ASCII values.
- `strcmp` returns 0 for equality, negative if s1 < s2, positive if s1 > s2.
- The comparison stops at the first differing character or the null terminator.
- For case-insensitive comparison, use `strcasecmp` (POSIX) or convert each char before comparing.
- Always use `strcmp` instead of `==` for string equality (== compares pointer addresses, not contents).

## Real World Application

String comparison is used in command parsing (checking user input against known commands), sorting algorithms, dictionary lookups, searching in databases, and implementing search functionality in any text-based application.

===EXPLANATION===

String comparison in C proceeds character-by-character using the platform's native byte ordering — typically ASCII. The `strcmp` function dates back to the earliest Unix string library (V6 Unix, 1975) and has remained unchanged because it solves the problem correctly and efficiently. The key design insight: `strcmp` does not return a boolean; it returns an ordering (negative, zero, positive), making it suitable as a comparator for sorting. This tri-state return is why `strcmp` can be passed directly to `qsort` for sorting strings alphabetically.

The intuition: comparison walks through both strings simultaneously, one character at a time. If both characters are equal and neither is `'\0'`, advance. If they differ, return the character code difference (positive if s1's character is larger). If one string ends before the other, the shorter string is considered smaller because `'\0'` (value 0) is less than any printable character. The expression `*(unsigned char *)s1 - *(unsigned char *)s2` casts to unsigned to avoid sign-extension issues on platforms where `char` is signed.

A professional example: SQLite's `sqlite3_stricmp()` performs case-insensitive comparison for SQL keyword recognition, converting each character to lowercase before comparing. The `sqlite3_sort_order()` function uses `strcmp` directly on index entries during `ORDER BY` processing. In Redis sorted sets, `zslInsert()` compares members with `strcmp(member, x->ele) < 0` when scores tie, ensuring deterministic ordering in the skiplist. Without a tri-state comparator, Redis would need separate equality and ordering functions. glibc's `qsort` accepts a comparison function of the same signature as `strcmp`, enabling direct usage: `qsort(arr, n, sizeof(char *), (int (*)(const void *, const void *))strcmp)`.

Visualize two people reading competing recipes out loud, one word at a time. At each step, they compare their current words. If one says "apple" and the other says "banana", the comparison stops because 'a' < 'b'. If both say "apple", then "sauce", they continue. If one recipe ends (hits \0) while the other continues with "pie", the shorter recipe is alphabetically first — an ending chapter is considered smaller than any continuation.

Key points:
1. Never use `==` to compare strings — that compares pointer addresses, not contents.
2. `strcmp` returns 0 for equality, negative for s1 < s2, positive for s1 > s2.
3. Comparison is case-sensitive using ASCII ordering.
4. For case-insensitive comparison, use `strcasecmp` (POSIX) or convert both to lowercase.
5. `strncmp` limits comparison to `n` characters — ideal for prefix checks.


Kernighan & Ritchie §5.5 implements `strcmp` as a pointer-iteration example. "The C Programming Language" §5.5 covers string comparison. CERT C STR37-C recommends bounded operations where possible.
