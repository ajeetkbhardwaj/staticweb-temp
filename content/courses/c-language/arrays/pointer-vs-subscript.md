+++
date = '2026-07-06T13:54:00+05:30'
draft = true
title = 'Pointer vs Array Subscripting'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 11
weight = 5
initial_code = '''#include <stdio.h>

int main(void) {
    int arr[5] = {1, 2, 3, 4, 5};

    // Both are equivalent
    printf("arr[2] = %d\n", arr[2]);
    printf("2[arr] = %d\n", 2[arr]);  // Equivalent!
    printf("*(arr + 2) = %d\n", *(arr + 2));

    // Pointer version (mutable)
    int *p = arr;
    printf("p[2] = %d\n", p[2]);

    // But p can be reassigned
    p = &arr[2];
    printf("Now p[0] = %d (arr[2])\n", p[0]);

    // arr cannot be reassigned
    // arr = &arr[2];  // ERROR: array type not assignable

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Pointer vs array subscripting demonstrated'
+++

## Problem Statement

Demonstrate that `a[i]`, `i[a]`, and `*(a + i)` are all equivalent in C. Show that a pointer can be reassigned to point to a different element, while an array name cannot be reassigned. This highlights the difference between array objects and pointer variables.

## Theory and Concepts

- By definition, `E1[E2]` is identical to `(*((E1)+(E2)))` — so `2[arr]` == `*(2 + arr)` == `arr[2]`.
- Arrays are not pointers — the array name is an lvalue representing the array object itself.
- In expressions, the array name decays to a pointer (to the first element).
- An array cannot be assigned or reassigned (it's not a modifiable lvalue).
- A pointer is a variable that holds an address and can be assigned.

## Real World Application

Understanding the subtle differences between arrays and pointers prevents common bugs — like thinking `sizeof(arr)` gives the array size in a function parameter, or trying to assign to an array after declaration. The equivalence `a[i] == i[a]` is mostly a curiosity but illustrates C's symmetry.

===EXPLANATION===

The expression `2[arr]` looks like a typo but is perfectly valid C — it demonstrates the fundamental symmetry of array subscripting. The C standard §6.5.2.1 defines that `E1[E2]` is identical to `(*((E1)+(E2)))`. Since addition is commutative, `E1[E2]` equals `E2[E1]`. So `arr[2]`, `2[arr]`, and `*(arr + 2)` all produce the same result. This commutativity is a direct consequence of defining subscript in terms of pointer addition rather than as a special array operation — a design choice dating back to BCPL, which had no array type at all, only pointers.

The intuition: `arr[i]` means "take the address `arr`, advance by `i` elements, and dereference." Since adding `i` to `arr` is the same as adding `arr` to `i`, the expression is symmetric. The real insight is that `arr` in this context is a pointer (decayed from the array), not the array object itself. An array object cannot be reassigned — `arr = &arr[2]` is a compilation error — but a pointer variable can: `p = &arr[2]`. This distinction between a fixed contiguous memory object and a mutable variable holding an address is the most frequently tested concept in C interviews.

A professional example: CPython's bytecode evaluation loop uses pointer-based access throughout. The current instruction pointer is a `unsigned char *next_instr` incremented by pointer addition: `next_instr += oparg`. The bytecode array itself is immutable (never reassigned), but the instruction pointer is a variable that walks through it. When implementing closures, the interpreter adjusts the pointer to jump to the start of the closure's code. This is exactly the `arr` vs. `p` distinction: the bytecode array is the fixed base, and the instruction pointer is the mutable traversal variable.

Visualize pointer vs. subscript as the difference between a building and a guide. The building (array) cannot be moved; its rooms are fixed at Room 0, Room 1, etc. A tour guide (pointer) starts at Room 0 and can walk to Room 3 (`p = p + 3`). Another guide can start at Room 0 and jump directly to Room 2 (`p = &arr[2]`). The building stays put — only the guides move.

Key points:
1. `a[i] == i[a]` — proven by C's definition of subscripting.
2. An array name is not a modifiable lvalue — it cannot appear on the left side of assignment.
3. A pointer can be indexed like an array (`p[i]`) after being assigned the array's address.
4. `&arr[0]` and `arr` produce the same address but have different types: `int *` vs. `int (*)[5]`.
5. `sizeof(p)` for a pointer is always `sizeof(void *)` (4 or 8 bytes), regardless of array size.


Kernighan & Ritchie §5.3 covers the equivalence. The C11 standard §6.5.2.1 formally defines array subscripting. "C Traps and Pitfalls" (Koening) devotes extensive coverage to array-pointer confusion and subscript commutativity.
