+++
date = '2026-07-06T14:03:00+05:30'
draft = true
title = 'Basic typedef'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 14
weight = 1
initial_code = '''#include <stdio.h>

typedef unsigned int uint;
typedef float real;

int main(void) {
    uint count = 100;
    real temperature = 36.5f;

    printf("Count: %u\n", count);
    printf("Temperature: %.1f\n", temperature);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Count: 100, Temperature: 36.5'
+++

## Problem Statement

Use `typedef` to create aliases for `unsigned int` (as `uint`) and `float` (as `real`). Declare variables using these aliases and print their values. Explain that `typedef` creates a new name for an existing type, not a new type.

## Theory and Concepts

- `typedef existing_type new_name;` creates a type alias.
- `typedef` is a storage class specifier (like `static`, `extern`) but does not affect storage.
- Typedef names follow the same scoping rules as variables.
- Common uses: shortening verbose types, abstracting platform-specific types, improving readability.
- `typedef` does not create a new type — it's just an alias (unlike `struct` which creates a unique type).

## Real World Application

`typedef` is used for fixed-width integer types (`uint32_t`, `int16_t` from `<stdint.h>`), size type (`size_t`), pointer types (`FILE *`), and abstracting hardware-specific types for portability across platforms.

===EXPLANATION===

Typedef was introduced to C in the late 1970s to give programmers a way to abstract away platform‑specific details behind a single name. The core insight is simple: `typedef existing_type new_name;` creates a synonym, not a new type. Think of it like programming a nickname into your phone — when you say "Mom", the phone dials the real number. Everywhere you use the nickname, the compiler substitutes the original type. Before typedef, C programmers had to write `unsigned long int` everywhere, or use macros (`#define ulong unsigned long`), but macros lack scoping and debugger support. Professionally, typedef is the backbone of portable C. The `<stdint.h>` header defines `uint32_t` as a typedef — on one platform it might be `unsigned int`, on another `unsigned long`. Your code just writes `uint32_t` and works everywhere. The POSIX standard defines `size_t`, `ssize_t`, `pid_t`, `FILE` — all typedefs that hide the underlying primitive types. In embedded firmware, typedefs like `volatile uint32_t *reg` abstract hardware register maps across microcontroller families. The visual metaphor is a label maker: you have a box labelled `unsigned int`; you print a new label `uint32_t` and stick it on the same box. The box's contents don't change, but now everyone refers to it by the new label.

Key points:

. typedef follows normal scoping rules — a typedef inside a function is local to that function;
. typedef is a storage‑class specifier in the grammar (like `static`, `extern`), but it doesn't affect storage or linkage;
. typedef does NOT create a new type — unlike `struct student` which creates a unique type, `typedef int myint` makes `myint` interchangeable with `int`;
. typedef can simplify complex declarations: compare `int (*fp)(double)` vs `typedef int (*MathFunc)(double); MathFunc fp;`;
. standard convention uses `_t` suffix for typedef'd types (e.g., `uint32_t`, `size_t`).

References:
1. ISO C11 §6.7.7 (Type definitions).
2. K&R C Appendix A §8.9.
3. "C: A Reference Manual" by Harbison & Steele has an excellent chapter on declarations and typedef.

