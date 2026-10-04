+++
date = '2026-07-06T14:09:00+05:30'
draft = true
title = 'Scalar and Aggregate Initialization'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 16
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    // Scalar initialization
    int a = 5;
    float f = 3.14f;
    char ch = 'Z';

    // Aggregate initialization
    int arr[5] = {1, 2, 3, 4, 5};
    int partial[10] = {1, 2, 3};  // Rest are zero

    struct point {
        int x;
        int y;
    };

    struct point p = {10, 20};

    // Print everything
    printf("a=%d, f=%.2f, ch=%c\n", a, f, ch);
    printf("array[4]=%d, partial[9]=%d\n", arr[4], partial[9]);
    printf("point: (%d, %d)\n", p.x, p.y);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Initialization demonstrated'
+++

## Problem Statement

Demonstrate scalar initialization (simple variables) and aggregate initialization (arrays and structs). Show that partially initialized arrays have the remaining elements set to zero. Print all values to verify.

## Theory and Concepts

- **Scalar initialization**: `int x = 5;` — a single value assigned to a variable.
- **Aggregate initialization**: `int arr[5] = {1,2,3,4,5};` — brace-enclosed list for arrays/structs.
- Partial initialization: `int arr[10] = {1,2,3}` sets first 3 elements, the rest are zero-initialized.
- Nested aggregates: `struct point p = {10, 20};` — fields initialized in declaration order.
- Uninitialized automatic variables contain indeterminate (garbage) values.

## Real World Application

Understanding initialization prevents bugs from uninitialized variables. Aggregate initialization is used for lookup tables, preset configuration structures, and zero-initializing buffers. The zero-initialization guarantee for partial initializers is relied upon in many codebases.

===EXPLANATION===

Initialization in C is divided into two broad categories: scalar and aggregate. A scalar is a single value — an `int`, `float`, `char`, or pointer. Aggregate refers to arrays, structs, and unions — composite types that contain multiple values. The distinction matters because the initialization rules differ: scalars use a simple expression (`int x = 5;`), while aggregates use brace‑enclosed lists (`int arr[3] = {1, 2, 3};`). Historically, C has always allowed scalar initialization, but aggregate initialization was refined across K&R C, C89, and C99, which introduced designated initializers. The core insight is that aggregates are initialized member‑by‑member in declaration order, and any member not explicitly initialized gets zero. This "partial initialization zeroing" is one of C's most useful guarantees — `int arr[100] = {1, 2, 3};` sets arr[0]..arr[2] to the given values and arr[3]..arr[99] to zero. Without this guarantee, you'd need to loop and zero the remaining elements manually. Professionally, initialization discipline prevents an entire class of bugs: reading uninitialized variables is undefined behaviour that causes intermittent crashes and security vulnerabilities. Embedded firmware initializes every variable explicitly because hardware starts with unpredictable register values. Configuration structs use aggregate initializers to set defaults: `struct config cfg = {.timeout = 1000, .retries = 3};` — unspecified fields like `.log_level` automatically zero. Lookup tables are initialized as `const int sine_table[360] = { /* precomputed values */ };` — the `const` ensures the table is read‑only and can be placed in ROM. The visual metaphor is a bookshelf with labelled slots. Scalar initialization sets one book: `int a = 5;` writes a single book on the shelf. Aggregate initialization fills multiple slots at once: `int arr[5] = {1, 2, 3, 4, 5};` puts a book in each of the first five slots. Partial initialization fills only the first few slots and leaves the rest empty (zeroed).

Key points:

. uninitialized automatic variables have indeterminate values — reading them is undefined behaviour;
. static and global variables are zero‑initialized automatically without an explicit initializer;
. `char str[10] = "hello";` initializes str[0..4] with the 5 characters and str[5] with '\0' (the null terminator), the rest to `\0` — the total size includes the terminator;
. nested aggregates initialize in row‑major order: `int mat[2][3] = {{1,2,3},{4,5,6}};`;
. you cannot initialize an automatic array with a variable length (VLA must be assigned element‑by‑element or via memset).

References:
1. ISO C11 §6.7.9 (initialization).
2. K&R C Chapter 4.
3. "C: A Reference Manual" by Harbison & Steele §4.6.

