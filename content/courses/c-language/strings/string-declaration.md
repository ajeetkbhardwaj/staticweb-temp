+++
date = '2026-07-06T13:55:00+05:30'
draft = true
title = 'String Declaration and Initialization'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 12
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    // Different ways to create strings
    char s1[] = "Hello";
    char s2[10] = "Hello";
    const char *s3 = "Hello";

    // Print each
    printf("s1: %s (sizeof: %zu)\n", s1, sizeof(s1));
    printf("s2: %s (sizeof: %zu)\n", s2, sizeof(s2));
    printf("s3: %s\n", s3);

    // Character by character
    for (int i = 0; s1[i] != '\\0'; i++) {
        printf("%c ", s1[i]);
    }
    printf("\n");

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'String declaration demonstrated'
+++

## Problem Statement

Declare strings using three different methods: a modifiable array (`char s1[]`), a fixed-size array (`char s2[10]`), and a pointer to a string literal (`const char *s3`). Print each and note the differences in `sizeof` and mutability.

## Theory and Concepts

- Strings in C are null-terminated arrays of `char`. The null terminator `'\0'` marks the end.
- `char s1[] = "Hello"` creates an array of 6 bytes (5 chars + `'\0'`).
- `char s2[10] = "Hello"` creates an array of 10 bytes, with remaining elements zero-initialized.
- `const char *s3 = "Hello"` points to a string literal in read-only memory — modifying it is undefined behavior.
- String literals are stored in read-only memory on most systems.

## Real World Application

String handling is fundamental to C programming — parsing configuration files, processing user input, constructing output messages, network protocol parsing, and file I/O. The distinction between modifiable arrays and read-only string literals is critical for avoiding crashes.

===EXPLANATION===

C strings are not a type — they are a convention: a contiguous sequence of characters terminated by a null character (`'\0'`). This convention comes from PDP-11 assembly, where ASCII strings were stored with a zero byte terminator. Thompson and Ritchie adopted it for Unix and C. The name "string" is borrowed from SNOBOL, but C's implementation could not be more different — SNOBOL had rich string operations as primitives; C provides only null-terminated arrays and a handful of library functions. This minimalist design keeps the language small and memory layout predictable.

The intuition: `char s[] = "Hello"` creates an array of exactly 6 bytes (H, e, l, l, o, \0). The size is determined by the initializer. `char s[10] = "Hello"` creates a 10-byte array, with \0 filling the remaining 4 bytes. `const char *s = "Hello"` does not create an array; it creates a pointer variable holding the address of a string literal in read-only memory. The differences in mutability, memory location, and sizeof behavior are a common source of interview questions and real-world bugs.

A professional example: the nginx web server uses length-prefixed strings (`ngx_str_t`) for configuration. When nginx reads a config file, it compares directives as: `if (value->len == sizeof("text/plain") - 1 && memcmp(value->data, "text/plain", value->len) == 0)`. The string literal `"text/plain"` lives in read-only memory. Using a length-prefixed design avoids repeated `strlen` calls and handles strings with embedded nulls. In the Git source code, `struct strbuf` wraps a `char *` with a length and allocator, transitioning from the raw C string convention to a safer bounded interface.

Visualize three ways to create "Hi": (1) `char s1[] = "Hi"` — writing in wet cement; you can later scrape the H into a B to make "Bi". (2) `char s2[10] = "Hi"` — reserving 10 parking spots but only using 2; you have room for a longer car. (3) `const char *s3 = "Hi"` — a sticky note on a refrigerator door; you can move the note to point at different food, but you cannot change the food itself.

Key points:
1. String literals reside in read-only memory on most platforms — modifying via `char *` is undefined behavior.
2. `char arr[] = "str"` includes the null terminator in its size (`sizeof` returns 4).
3. The expression `"string"` has type `char[7]` in C.
4. Two identical string literals may or may not share the same address (implementation-defined).
5. `char s[5] = "Hello"` would omit \0 because there is no room — causing undefined behavior when treated as a string.


Kernighan & Ritchie §1.9 introduces character arrays. "The C Programming Language" §1.9 covers the three forms of string initialization. "Secure Coding in C and C++" (Seacord) discusses null-terminated string pitfalls and buffer overflow prevention.
