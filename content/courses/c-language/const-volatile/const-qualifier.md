+++
date = '2026-07-06T14:12:00+05:30'
draft = true
title = 'const Type Qualifier'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 17
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    const int MAX_USERS = 100;
    // MAX_USERS = 200;  // ERROR: read-only

    const float PI = 3.14159f;
    float radius = 5.0f;
    float area = PI * radius * radius;

    printf("Area: %.2f\n", area);

    // Pointer to const data
    const int data[] = {1, 2, 3};
    const int *p = data;
    // *p = 10;  // ERROR: data is const
    p++;  // OK: pointer itself is not const

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'const qualifier demonstrated'
+++

## Problem Statement

Declare `const` variables and try to modify them (demonstrate the compilation error). Use a pointer to `const` data and show that the data cannot be modified through the pointer, but the pointer itself can be reassigned.

## Theory and Concepts

- `const` declares a variable whose value cannot be modified after initialization.
- `const` applies to the variable name, not the storage — the variable might still be changed through another pointer (if it wasn't originally const).
- `const int *p` means the pointed-to data is read-only; `int * const p` means the pointer itself cannot be reassigned.
- `const` is a type qualifier (along with `volatile` and `restrict`).
- `const`-correctness means using `const` wherever data should not be modified — it enables compiler optimizations and catches bugs.

## Real World Application

`const` is used for configuration constants, lookup tables, string literals, function parameters that are read-only (e.g., `const char *str`), and hardware register definitions that should not be modified accidentally.

===EXPLANATION===

The `const` qualifier, added to C in the ANSI C89 standard, was borrowed from C++ (where it was called "const" and used for true constant expressions). Before `const`, C programmers used `#define` for constants or just relied on convention not to modify variables. The `const` keyword changed this by letting the programmer — and the compiler — know that a variable's value should not change after initialization. The intuition is a museum exhibit behind glass: you can look at it (`const int x = 42; printf("%d", x);`), but you can't touch it (`x = 43;` — compilation error). The glass is enforced by the compiler. Professionally, `const` appears in virtually every C codebase. The standard library uses it pervasively: `const char *str` for strings that should not be modified, `const void *ptr` for read‑only buffer arguments. Embedded systems declare lookup tables as `const uint8_t sine_table[256] = { ... };` — the `const` allows the compiler to place the table in ROM (flash) instead of RAM, saving precious memory. Hardware register definitions often use `volatile const uint32_t *reg` — `const` ensures the program doesn't accidentally write to a read‑only register. The `const` qualifier enables compiler optimizations: knowing a variable won't change lets the compiler cache it in a register or fold constant expressions at compile time. Visually, think of `const` as a padlock 🔒 on a variable. Once initialized, the padlock clicks shut. Any attempt to modify the variable is like trying to open the locked box — the compiler stops you with an error. `const int *p` locks the data (you can't modify through `p`). `int * const p` locks the pointer (you can't change where `p` points). `const int * const p` locks both.

Key points:

. `const` applies to the thing to its left, or if it starts the declaration, to the type on its right — `char const *s` means the same as `const char *s`;
. a `const` variable must be initialized at declaration — you can't assign to it later;
. casting away `const` (via a cast) is allowed syntactically but modifying a truly const object (one originally declared `const`) is undefined behaviour;
. `const` variables at file scope have internal linkage by default (like `static`) — use `extern` if you need to share a const across files;
. string literals such as `"hello"` are of type `const char[]` in C++, but in C they are `char[]` — modifying them is undefined behaviour (the compiler may place them in read‑only memory).

References:
1. ISO C11 §6.7.3 (type qualifiers).
2. K&R C Appendix A §8.5.
3. "Expert C Programming: Deep C Secrets" by van der Linden has a memorable chapter on `const` and pointers.

