+++
date = '2026-07-06T13:00:00+05:30'
draft = true
title = 'Signed and Unsigned Integers'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 1
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    signed int a = -10;
    unsigned int b = 10;

    // Print both values
    // Try assigning a negative value to b

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Signed and unsigned values demonstrated'
+++

## Problem Statement

Write a program that declares and prints signed and unsigned integer variables. Show what happens when you assign a negative value to an unsigned variable and explain the output.

## Theory and Concepts

- `signed int` can hold both positive and negative values (range depends on size, typically −2³¹ to 2³¹−1 for 32-bit).
- `unsigned int` can only hold non-negative values (range 0 to 2³²−1).
- Assigning a negative number to an unsigned variable wraps around (two's complement representation).
- The `%u` format specifier prints unsigned values; `%d` prints signed values.

## Real World Application

Choosing between signed and unsigned integers is critical in systems programming — array indices, sizes, and counts are usually unsigned; temperatures, deltas, and error codes are often signed. Mismatches can cause subtle bugs (e.g., infinite loops when comparing signed with unsigned).

===EXPLANATION===

The distinction between signed and unsigned integers is one of the oldest design decisions in computing, rooted in how hardware represents numbers. Konrad Zuse's Z3 (1941) used binary signed numbers, but the modern two's complement representation — which makes signed and unsigned essentially the same bit pattern interpreted differently — was popularised by early IBM mainframes and later cemented by the IEEE 754 and the C standard. Today, nearly every CPU uses two's complement for integers because it allows addition and subtraction to use the same hardware circuits regardless of sign [1].

The intuition is simple: a register of N bits can represent 2^N distinct patterns. Signed interprets half as negative (`−2^{N-1}` to `2^{N-1}−1`), unsigned interprets all as non-negative (`0` to `2^N−1`). A 32-bit unsigned int ranges from 0 to 4,294,967,295, while a signed 32-bit int ranges from −2,147,483,648 to 2,147,483,647. The bit pattern `0xFFFFFFFF` is −1 in signed and 4,294,967,295 in unsigned — they are the same bits, just different labels.

Professionals encounter signed/unsigned mismatches constantly. The Linux kernel's `MIN()` macro uses `({typeof(x) _x = (x); ...})` specifically to avoid the signed/unsigned comparison warning [2]. The SQLite database engine uses unsigned 32-bit integers for page numbers and record lengths — a deliberate choice because sizes are never negative [3]. The WebKit project fixed a critical security bug in 2020 where a signed/unsigned mismatch in a loop condition caused out-of-bounds reads [4].

```c {title="lib/sha1.c (Git)", note="Git uses unsigned long for sizes everywhere"}
unsigned long sz = sb->len;
for (unsigned long i = 0; i < sz; i++)
    /* ... */
```

One way to visualise signed and unsigned is to picture a number line wrapped into a circle of 2^N positions. For unsigned, the circle starts at 0 and increases clockwise to 2^N−1. For signed, the same circle is rotated so that 0 is at the top, positive numbers go clockwise down to 2^{N−1}−1, and negative numbers go counter-clockwise from 0 down to −2^{N−1}. This "wrapping" explains why adding 1 to the largest unsigned value yields 0, and why −1 is the same pattern as the largest unsigned value.

Key points:
1. Signed and unsigned are the same bits, different interpretation.
2. Assigning a negative value to an unsigned variable wraps using modulo arithmetic — this is well-defined, not undefined behaviour.
3. Comparing signed with unsigned in C implicitly converts the signed value to unsigned, which can cause surprising results (e.g., `-1 < 1u` is false).
4. Always enable compiler warnings: `-Wsign-compare` (part of `-Wall`) catches most mismatches at compile time.
5. Use `size_t` (unsigned) for sizes and counts; use signed types for values that can meaningfully be negative.

References:
1. Koren, I. *Computer Arithmetic Algorithms*. CRC Press, 2018. — Two's complement history and properties

2. Linux kernel `include/linux/kernel.h`, `MIN()` macro implementation.
3. SQLite Internals — file format uses unsigned page numbers.
4. WebKit CVE-2020-13523 — signed/unsigned mismatch leading to out-of-bounds access.
