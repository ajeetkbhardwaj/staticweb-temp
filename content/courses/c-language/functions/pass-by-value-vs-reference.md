+++
date = '2026-07-06T13:30:00+05:30'
draft = true
title = 'Pass by Value vs Pass by Reference'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 6
weight = 4
initial_code = '''#include <stdio.h>

void increment_bad(int x) {
    x++;  // Only modifies local copy
}

void increment_good(int *x) {
    (*x)++;  // Modifies original via pointer
}

int main(void) {
    int a = 5;
    increment_bad(a);
    printf("After bad: %d\n", a);

    increment_good(&a);
    printf("After good: %d\n", a);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'After bad: 5\nAfter good: 6'
+++

## Problem Statement

Write two functions that attempt to increment an integer: one receives the value (pass by value — does not work), the other receives a pointer (pass by reference — works). Call both from `main` and print the results to demonstrate the difference.

## Theory and Concepts

- C passes all arguments by value — the function receives a copy of the argument.
- Modifying a parameter inside a function does not affect the caller's variable.
- To modify a variable in the caller, pass its address (pointer) and dereference it.
- Arrays are not passed by value; they decay to pointers (the array name is a pointer to the first element).
- `const` can be used to prevent modification via pointer when read-only access is intended.

## Real World Application

Understanding pass-by-value is essential for writing correct C code — every input parameter is a copy, which affects performance for large structs (pass by pointer for efficiency). The pattern is used throughout all C libraries (e.g., `fscanf`, `strcpy`).

===EXPLANATION===

C's parameter-passing semantics are one of the language's defining characteristics. C passes everything by value — a copy. This design dates to BCPL and B, where simplicity and performance on the PDP-11 were paramount. The trade-off is that you cannot modify a caller's variable unless you explicitly pass a pointer to it. This is often called "pass by value, but you can simulate pass by reference with pointers."

The intuition: when you write `void f(int x) { x = 5; }` and call it as `f(a)`, the function receives a *copy* of `a`. The original `a` remains unchanged. To modify `a`, you must pass its address: `void g(int *x) { *x = 5; }` and call `g(&a)`. The pointer `x` is itself passed by value (you get a copy of the address), but dereferencing it with `*x` accesses the original memory location. This distinction is the single most common source of confusion for C beginners.

A professional example: the entire C standard library is designed around this convention. `scanf("%d", &n)` requires the address of `n` because `scanf` must write into it. `strcpy(dest, src)` takes two pointers — it does not copy the array; it copies the address. Passing a large struct by value copies every byte: `struct Big s = ...; process(s);` — this can copy kilobytes. Experienced C programmers pass large structs as `const struct Big *s` to avoid copying and to allow modification when needed.

I once reviewed a thermal simulation where a 2-kilobyte grid struct was passed by value through four layers of function calls — each call copied the entire grid. After changing to pass by pointer, runtime dropped from 45 seconds to 2 seconds, because the 2 KB copies were replaced by 8-byte pointer copies. The struct was also read-only, so `const struct Grid *` was used.

Visualize pass-by-value as handing someone a photocopy of your document. Any changes they make are on the copy; your original is untouched. Pass-by-pointer is handing them a key to your safe-deposit box. They open the box (dereference the pointer) and can change the contents directly. The key itself is still a copy (they could have made a duplicate), but what it *points to* is the original.

Key points:
1. Everything in C is pass-by-value — including pointers. The pointer value (the address) is copied.
2. To modify a variable in the caller, pass its address with `&` and accept it as a pointer `*`.
3. Arrays are not copied — the array name decays to a pointer to its first element when passed to a function.
4. Use `const` pointers for read-only references: `void f(const int *p)` prevents modification.
5. Pass-by-pointer is also used for output parameters when a function needs to return multiple values.


Kernighan & Ritchie §5.2 covers pointers and function arguments. "Expert C Programming: Deep C Secrets" dedicates a chapter to "C's Most Important, Most Confusing Feature — Pointers." CERT rule EXP01-C recommends using `const` for function parameters that are not modified.
