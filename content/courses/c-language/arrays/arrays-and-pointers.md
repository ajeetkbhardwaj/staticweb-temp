+++
date = '2026-07-06T13:52:00+05:30'
draft = true
title = 'Arrays and Pointers Relationship'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 11
weight = 3
initial_code = '''#include <stdio.h>

int main(void) {
    int arr[5] = {10, 20, 30, 40, 50};
    int *p = arr;  // arr decays to &arr[0]

    // Array indexing vs pointer arithmetic
    for (int i = 0; i < 5; i++) {
        printf("arr[%d] = %d, *(arr + %d) = %d, p[%d] = %d\n",
               i, arr[i], i, *(arr + i), i, p[i]);
    }

    // sizeof array vs sizeof pointer
    printf("sizeof(arr) = %zu\n", sizeof(arr));
    printf("sizeof(p) = %zu\n", sizeof(p));

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Arrays and pointers relationship demonstrated'
+++

## Problem Statement

Demonstrate that array indexing `arr[i]` is equivalent to pointer arithmetic `*(arr + i)`. Also show that a pointer can be indexed like an array (`p[i]`). Print `sizeof(arr)` vs `sizeof(p)` to highlight the difference between an array and a pointer.

## Theory and Concepts

- In most contexts, an array name decays to a pointer to its first element (`arr` → `&arr[0]`).
- `arr[i]` is defined as `*(arr + i)` by the C standard.
- Exception: `sizeof(arr)` returns the size of the entire array (not a pointer).
- Exception: `&arr` returns a pointer to the whole array (not just the first element).
- When an array is passed to a function, it decays to a pointer — the function receives only the address, not the size.

## Real World Application

Understanding the array-pointer equivalence is essential for correctly passing arrays to functions, using pointer arithmetic for efficient iteration, and avoiding common pitfalls (like thinking `sizeof(arr)` in a function parameter gives the array size).

===EXPLANATION===

The equivalence between arrays and pointers is perhaps the most misunderstood aspect of C. The C standard states: "An array type describes a contiguously allocated nonempty set of objects." A pointer type "describes an object whose value provides a reference to an entity of the referenced type." They are different types. But in most expressions, an array name converts ("decays") to a pointer to its first element. The C standard §6.3.2.1 says: "an lvalue that has type 'array of type' is converted to an expression with type 'pointer to type' that points to the initial element." This decay rule is what makes array subscript work: `arr[i]` becomes `(*((arr)+(i)))`.

The intuition: when you write `int *p = arr`, the array name `arr` is automatically converted to a pointer to `arr[0]`. After that, `p[i]` and `arr[i]` produce identical machine code. But `sizeof(arr)` and `sizeof(p)` are different — `sizeof(arr)` yields `5 * sizeof(int)`, while `sizeof(p)` yields `sizeof(int *)` (8 bytes on 64-bit). This is the key diagnostic: if `sizeof` behaves differently, arrays and pointers cannot be the same thing.

A professional example: Redis receives network data into an `sds` (simple dynamic string) buffer. The buffer was created as a contiguous array (`sdsnewlen(NULL, 16)` allocates a block), but passing it around requires pointer decay. The function `sdsMakeRoomFor(sds s, size_t addlen)` takes a string as a pointer but internally needs to know the allocation size — so it subtracts from the pointer to reach the header structure. This pointer-structure arithmetic is only possible because of the array-pointer equivalence. In glibc, `strlen(const char *s)` is often implemented as `for (; *s; s++);` — the pointer `s` is local and mutable, advancing through the array. The caller's original pointer is unaffected.

Visualize an array as a row of five houses. The array name `arr` is the street name referring to the whole row. But when used in an expression, it acts like a signpost pointing to House #0. You can walk to House #2 (`*(arr + 2)`) or ask what is in House #4 (`arr[4]`). You cannot repaint the street sign to point to a different street, but you can create a new signpost (`p`) that moves freely.

Key points:
1. Array decay happens in every expression except as operand to `sizeof`, `&`, and `_Alignof`.
2. When passed to a function, an array decays to a pointer — the function receives the address but not the size.
3. `&arr` gives a pointer to the entire array (`int (*)[5]`), not just the first element.
4. `arr + 1` skips one element; `&arr + 1` skips the entire array.
5. Character arrays (`char arr[] = "hello"`) follow the same decay rules.


Kernighan & Ritchie §5.3–5.5 cover the array-pointer relationship. The C11 standard §6.3.2.1 formally defines array-to-pointer decay. "C Traps and Pitfalls" (Koening) devotes a chapter to array-pointer confusion.
