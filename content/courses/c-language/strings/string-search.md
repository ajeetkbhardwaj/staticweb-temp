+++
date = '2026-07-06T14:23:00+05:30'
draft = true
title = 'String Search'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 12
weight = 5
initial_code = '''#include <stdio.h>

int find_char(const char *str, char ch) {
    for (int i = 0; str[i] != '\\0'; i++) {
        if (str[i] == ch) return i;
    }
    return -1;
}

int main(void) {
    const char *text = "Hello, World!";
    char target = 'o';

    int pos = find_char(text, target);
    if (pos >= 0) {
        printf("Found '%c' at position %d\n", target, pos);
    } else {
        printf("'%c' not found\n", target);
    }

    // Find second occurrence
    int count = 0;
    for (int i = 0; text[i]; i++) {
        if (text[i] == target) count++;
    }
    printf("'%c' appears %d times\n", target, count);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Found at position 4, appears 2 times'
+++

## Problem Statement

Write a function `find_char` that searches for a character in a string and returns its index (or -1 if not found). Also count how many times the character appears. Test with different search targets.

## Theory and Concepts

- String search iterates through the array until the character is found or the null terminator is reached.
- The function returns the index (0-based) or a sentinel value like -1 for "not found".
- The standard library provides `strchr` for finding a character's first occurrence.
- For finding substrings, use `strstr` (standard) or implement the naive string-matching algorithm.
- String search is case-sensitive by default; for case-insensitive search, compare lowercased characters.

## Real World Application

String search is used in text editors (find/replace), search engines, pattern matching in log files, command parsing (finding flags starting with `-`), and DNA sequence matching in bioinformatics.

===EXPLANATION===

String search is the algorithmic problem of finding a character or substring within a larger string. The naive character search — iterate and compare each character — was the first approach used in early Unix text processing tools like `ed` (1971) and `grep` (1974). The C standard library provides `strchr` for character search and `strstr` for substring search. Modern libc implementations (like glibc) use optimized algorithms under the hood — `strstr` uses the Two-Way algorithm (O(n) time, O(1) space) while `strchr` and `memchr` use vectorized byte scanning with SIMD on capable hardware.

The intuition: finding a character is like looking for a specific book on a shelf. You start at the leftmost book and examine each one left to right. When you find it, return the position. If you reach the end without finding it, the book is not there. For substring search, it is like looking for a specific sequence — "Emma" followed by "Pride and Prejudice" followed by "Persuasion". You start at the first book and check if the next three match. If not, slide one position right and check again.

A professional example: the Git `name-rev` command finds the best symbolic name for a given commit by searching through reference names. The `match_name_with_pattern` function uses `strstr` to find patterns like `"origin/*"`. In the Linux kernel, `lib/string.c` implements `strnstr`, `strchr`, and `strrchr` (reverse search) as generic C functions — each architecture can override these with optimized assembly. The `memchr` implementation on x86-64 uses `repne scasb` in assembly for single-character search. In glibc, `strstr` uses the Two-Way algorithm (Crochemore & Perrin, 1991) for worst-case linear performance, avoiding the naive O(n×m) for adversarial inputs like searching for "aaa...ab" in "aaa...aaa".

Visualize character search as a line of patrons at airport security. Each patron has a label (character). The agent walks down the line checking each label. Patron "o" vs. target "o" — found at position 4. If the target is "z", the agent reaches the end and reports "not found." For substring search, a detective looking for a three-person team checks persons 0, 1, 2. If no match, slide to persons 1, 2, 3, and repeat.

Key points:
1. `strchr(s, c)` returns a pointer to the first occurrence of `c` in `s`, or `NULL`.
2. `strstr(s, substr)` returns a pointer to the first occurrence of `substr`, or `NULL`.
3. Use `ptr - s` to convert the returned pointer to an index.
4. For case-insensitive search, use `strcasestr` (POSIX) or compare `tolower` values manually.
5. Searching for `'\0'` with `strchr` returns a pointer to the null terminator (not `NULL`).


Kernighan & Ritchie §7.7 covers `strchr` and `strstr`. "The C Programming Language" §5.5 implements string search with pointers. For advanced algorithms, "Introduction to Algorithms" (CLRS) §32 covers Boyer-Moore and KMP. The glibc source (`string/strstr.c`) shows the Two-Way algorithm used in production.
