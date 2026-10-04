+++
date = '2026-07-06T13:46:00+05:30'
draft = true
title = 'Pointer Arithmetic'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 10
weight = 2
initial_code = '''#include <stdio.h>

int main(void) {
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;
    int n = sizeof(arr) / sizeof(arr[0]);

    for (int i = 0; i < n; i++) {
        printf("*(p + %d) = %d, p[%d] = %d\n", i, *(p + i), i, p[i]);
    }

    // Pointer difference
    int *start = &arr[0];
    int *end = &arr[4];
    printf("Elements between: %td\n", end - start);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Pointer arithmetic demonstrated'
+++

## Problem Statement

Use pointer arithmetic to traverse an integer array. Print each element using both `*(p + i)` and `p[i]` to show they are equivalent. Also compute the difference between two pointers (number of elements between them) using pointer subtraction.

## Theory and Concepts

- `p + i` advances the pointer by `i × sizeof(*p)` bytes.
- `*(p + i)` is equivalent to `p[i]` — array subscripting is defined in terms of pointer arithmetic.
- Pointer subtraction gives the number of elements between two pointers (signed `ptrdiff_t`, `%td`).
- Pointer arithmetic is only valid within the bounds of the same array object (undefined behavior otherwise).
- Void pointers cannot participate in arithmetic (size unknown).

## Real World Application

Pointer arithmetic is used in buffer processing, string manipulation, image data traversal, and any code that iterates over memory sequentially. It is more flexible than array indexing and is essential for implementing dynamic data structures.

===EXPLANATION===

Pointer arithmetic formalizes a pattern that assembly programmers had used for decades: adding an offset to a base address to reach consecutive memory locations. When Ritchie designed C, he elevated this to a language feature, defining that `p + i` advances the pointer by `i × sizeof(*p)` bytes rather than by raw byte offsets. This type-aware arithmetic is what makes array traversal both concise and type-safe — the compiler handles scaling automatically. The equivalence `*(p + i) == p[i]` is baked into the C standard, meaning array subscripting is defined entirely in terms of pointer arithmetic.

The intuition: `p + i` does not add `i` bytes; it adds `i` elements. If `p` is an `int *` and `sizeof(int) == 4`, then `p + 1` advances by 4 bytes. If `p` is a `double *` and `sizeof(double) == 8`, then `p + 1` advances by 8 bytes. The compiler does the multiplication. This is why void pointers cannot participate in arithmetic — without a known size, there is no way to compute the next element.

A professional example: SQLite's B-tree implementation uses pointer arithmetic to search node cell arrays. The expression `pCur->apCell[mid]` compiles to `*(pCur->apCell + mid)`. When shifting cells during insertion, SQLite uses `memmove(pCur->apCell + idx + 1, pCur->apCell + idx, n * sizeof(Cell))` — pointer arithmetic expresses source and destination as offsets from the base of the array. In the Redis skip list implementation, `zsl->header->level[i].forward` is a pointer that advances by one element at each level via `p = p->level[i].forward` — an idiomatic pointer traversal that drives the skiplist search.

Visualize pointer arithmetic as a subway line: each station is one element. `p` is platform 0. `p + 1` is the next station, one stop away. `p + 5` is five stations down the line. The distance between stations (the sizeof element) is fixed — all stops are equally spaced. Pointer subtraction `end - start` tells you how many stations apart two platforms are. The `%td` format specifier prints this difference correctly as a signed integer.

Key points:
1. `p[i]` is defined as `*(p + i)` — this is the fundamental equivalence.
2. Pointer arithmetic beyond array bounds is undefined behavior (even without dereferencing).
3. Pointer subtraction yields `ptrdiff_t` (format `%td`), a signed type.
4. `void *` cannot be used in arithmetic; cast to `char *` for byte-level access.
5. `&arr[0] + i` is identical to `arr + i`.


Kernighan & Ritchie §5.3 covers pointer arithmetic. "C: A Reference Manual" (Harbison & Steele) §7.5 provides formal semantics. The C11 standard §6.5.6 describes additive operators and pointer arithmetic rules.
