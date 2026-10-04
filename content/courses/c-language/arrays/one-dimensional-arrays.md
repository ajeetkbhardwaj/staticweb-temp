+++
date = '2026-07-06T13:50:00+05:30'
draft = true
title = 'One-dimensional Arrays'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 11
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    int scores[5] = {85, 92, 78, 95, 88};
    int sum = 0;

    for (int i = 0; i < 5; i++) {
        sum += scores[i];
    }

    double average = (double)sum / 5;
    printf("Average: %.1f\n", average);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Average: 87.6'
+++

## Problem Statement

Declare and initialize a one-dimensional integer array with 5 elements. Compute the sum using a loop, then calculate and print the average. Use array indexing to access each element.

## Theory and Concepts

- Array declaration: `type name[size]` where size must be a constant expression (C89) or a variable (C99 VLA).
- Array indices start at 0 and go up to `size - 1`.
- Arrays are stored contiguously in memory.
- The array name decays to a pointer to the first element when passed to a function.
- `sizeof(array) / sizeof(array[0])` gives the number of elements (only works in the array's definition scope).

## Real World Application

One-dimensional arrays are the most fundamental data structure in C — used for buffers, sensor data logs, lookup tables, audio samples, pixel rows, and any collection of elements that needs sequential access.

===EXPLANATION===

Arrays are the oldest compound data type in programming, predating C by decades. The concept of a contiguous block of homogeneous elements accessed by index goes back to FORTRAN (1957) and ALGOL 58. C inherited the array model from B, which inherited it from BCPL — but with a critical difference. In B, arrays were implemented as a pointer to a separately allocated block. Ritchie changed this: an array in C IS the block of memory itself, not a pointer to it. This distinction — the array object versus the pointer that decays from it — is the source of both C's efficiency and its most famous confusion.

The intuition: `int arr[5]` carves out space for exactly five integers in memory, one right after the other. `arr[0]` is the first, `arr[1]` the second, and so on. The compiler computes `arr[i]` as `*(arr + i)` — base address plus `i × sizeof(int)` bytes. This contiguous layout makes array access O(1): any element is equally quick to reach.

A professional example: the SQLite database engine stores its database pages in a cache array. The `pCache->apPage[pgno]` access must be fast for every query — the page cache is a one-dimensional array of `Page *` pointers. When SQLite needs a page, it computes an index via a hash function and accesses the array directly. In the audio processing library libsox, audio samples are stored as a `double *samples` array. The inner loop of a convolution operation is `for (i = 0; i < N; i++) sum += a[i] * b[i]` — a pattern that compilers aggressively optimize with SIMD vectorization because the array layout is predictable and contiguous.

Visualize an array as a row of mail slots, numbered 0 to 4, mounted on a wall. Each slot holds one piece of mail (one integer). The slots are physically adjacent — slot 3 is right next to slot 4. Accessing `arr[3]` means walking to the fourth slot and reading its contents. The base address is where slot 0 starts; every other slot's location is computed as an offset from there.

Key points:
1. Array indices are zero-based: `arr[0]` is the first element, `arr[n-1]` is the last.
2. `sizeof(arr)` gives total bytes — use `sizeof(arr) / sizeof(arr[0])` for the element count (works only at definition scope).
3. Array names decay to pointers in most expressions (exceptions: `sizeof`, `&`, `_Alignof`).
4. Array bounds are not checked — accessing beyond the last element is undefined behavior.
5. Variable-length arrays (VLAs) were added in C99 and made optional in C11.


Kernighan & Ritchie §1.6 and §5.3 cover arrays and their relationship to pointers. "The C Programming Language" §5.5 formally defines array subscripting. Ritchie's "The Development of the C Language" discusses the evolution from B to C arrays.
