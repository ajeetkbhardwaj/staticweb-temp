+++
date = '2026-07-06T14:13:00+05:30'
draft = true
title = 'const Pointers and Pointer to const'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 17
weight = 2
initial_code = '''#include <stdio.h>

int main(void) {
    int x = 10, y = 20;

    // Pointer to const data (data cannot be modified)
    const int *p1 = &x;
    // *p1 = 30;  // ERROR

    // const pointer (pointer cannot be reassigned)
    int * const p2 = &x;
    *p2 = 30;  // OK: data can be modified
    // p2 = &y;  // ERROR

    // const pointer to const data
    const int * const p3 = &x;
    // *p3 = 30;  // ERROR
    // p3 = &y;   // ERROR

    printf("x = %d (via p2)\n", *p2);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'const pointer combinations demonstrated'
+++

## Problem Statement

Demonstrate the four combinations of `const` with pointers:
1. Pointer to const data (`const int *`)
2. const pointer (`int * const`)
3. const pointer to const data (`const int * const`)
4. Regular pointer to non-const data (`int *`)

Explain which can modify the data and which can be reassigned.

## Theory and Concepts

- Read `const` declarations right-to-left: `const int *` → "pointer to const int" (data is const).
- `int * const` → "const pointer to int" (pointer is const, data is not).
- `const int * const` → "const pointer to const int" (both are const).
- Rule of thumb: `const` applies to whatever is to its left (except when it starts the declaration, then it applies to the type to its right).
- Function parameters are often declared `const T *` to indicate the function does not modify the pointed-to data.

## Real World Application

Choosing the right `const` combination is essential for API design — `const char *` says "I won't modify your string", `char * const` says "I won't change which buffer I'm using", and `const char * const` says both.

===EXPLANATION===

Pointer + `const` combinations are the most confusing aspect of C's type qualifier system for new learners. The rule is simple once you learn to read declarations right‑to‑left. `const int *p` reads as "p is a pointer to const int" — the data is const. `int * const p` reads as "p is a const pointer to int" — the pointer itself is const. `const int * const p` reads as "p is a const pointer to const int" — both are const. Historically, the placement of `const` caused endless debate, leading to the right‑to‑left reading convention inherited from the "declaration follows use" principle in C. The intuition is a delivery truck driver. The driver's route (the pointer `p`) can either be fixed (const pointer) or changeable (non‑const pointer). The cargo (the data `*p`) can be read‑only (const data) or modifiable (non‑const data). If you get `const int *p`, you're a driver whose cargo is fragile ("do not touch"), but you can be assigned different routes. If you get `int * const p`, you're a driver stuck on one route forever, but you can repack the cargo. Professionally, `const char *` is by far the most common — it's how strings are passed to read‑only functions: `size_t strlen(const char *s);` guarantees `strlen` won't modify the string. `char * const` appears when a function owns a fixed buffer: `void log_message(char * const buffer, size_t size)` — the buffer address never changes, but the contents will be written. `const char * const` appears in configuration tables: `const struct config * const table[]` — neither the pointers nor the structs can be modified. Visually, imagine these three scenarios: `const int *p` is a TV remote you can point at any TV, but the remote only has a "mute" button (read‑only). `int * const p` is a remote permanently paired to one TV, but you can change volume, channels, etc. `const int * const p` is a remote permanently paired to one TV and the only working button is "mute".

Key points:

. the mnemonic "read right‑to‑left" works for any declaration — start at the variable name, move right until you hit a delimiter, then left, alternating;
. `const int *` and `int const *` are identical — both mean "pointer to const int";
. `int * const` is different from `int const *` — the former fixes the pointer, the latter fixes the data;
. when assigning, you can always add `const` to the pointed‑to type (e.g., assign `int *` to `const int *`), but you cannot remove it implicitly (passing `const int *` to `int *` generates a warning);
. function parameters that are `const T *` accept both `const` and non‑const arguments.

References:
1. ISO C11 §6.7.3 (type qualifiers).
2. "C: A Reference Manual" by Harbison & Steele §4.6.
3. "The C Programming Language" by K&R §5.4 — the right‑left rule is explained there.

