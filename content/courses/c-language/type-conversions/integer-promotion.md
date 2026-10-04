+++
date = '2026-07-06T13:20:00+05:30'
draft = true
title = 'Integer Promotion in Expressions'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 4
weight = 5
initial_code = '''#include <stdio.h>

int main(void) {
    char c = 0x80;  // 128 in hex, but char may be -128 if signed
    unsigned char uc = 0x80;

    // Compare results
    int result1 = c << 1;
    int result2 = uc << 1;

    // char + char promoted to int
    char a = 100, b = 100;
    int sum = a + b;

    // Print results

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Promotion effects demonstrated'
+++

## Problem Statement

Demonstrate integer promotion by performing arithmetic on `char` and `unsigned char` values. Show that `char` operands are promoted to `int` before the operation, which affects shift results when the high bit is set. Compare the results of shifting a `char` vs `unsigned char`.

## Theory and Concepts

- Integer promotion: types smaller than `int` (`char`, `short`, `_Bool`) are promoted to `int` in expressions.
- If `int` cannot represent all values of the original type, the value is promoted to `unsigned int`.
- This promotion happens before any arithmetic or bitwise operation.
- `c << 1` is actually `(int)c << 1`, so sign-extension can affect the result.
- Promotion is why `a + b` for two `char`s yields an `int`, not a `char`.

## Real World Application

Integer promotion affects bit manipulation of I/O register values (where registers are often `unsigned char`), checksum and CRC calculations, and any code that shifts or operates on small integer types. It can cause unexpected sign extension when the high bit is set.

===EXPLANATION===

Integer promotion is one of C's oldest and most subtle type-conversion rules, inherited directly from the PDP-11 architecture that C was born on. In the 1970s, the PDP-11 could perform arithmetic efficiently only on full 16-bit words, not on individual bytes. Rather than generate sub-word instructions, the C compiler simply promoted every `char` or `short` operand to `int` before operating. That decision survives today in every C compiler, and it still catches programmers off guard.

The intuition is simple: whenever you use a type smaller than `int` in an expression, the compiler zero-extends or sign-extends it to `int` before doing any work. For `unsigned char`, the extra bits are filled with zeros. For `signed char`, the high bit (bit 7) is propagated — this is sign extension. If the high bit is set, the promoted value becomes negative. This is why shifting a `char` with value `0x80` left by 1 gives different results depending on whether the `char` is signed or unsigned, even though both hold the same bit pattern `10000000`.

A real-world example: in networking code, checksum algorithms like Internet checksum (RFC 1071) operate on 16-bit values. If you store packet bytes in `unsigned char` arrays and sum them, integer promotion promotes each byte to `int` before addition — this is actually correct behavior, but it means the intermediate sum must be masked back to 16 bits. A colleague once spent two days debugging a proprietary CRC implementation where a `uint8_t` polynomial was sign-extended to a negative `int` during the shift-and-xor loop, corrupting every checksum.

Imagine integer promotion as a loading dock. You have a small crate (8-bit `char`). To move it on the conveyor belt (the CPU's ALU), it must be placed onto a standard pallet (`int`). If the crate is labeled signed, the loading dock fills empty space with copies of the "sign bit" — a dark stain that spreads. If unsigned, the dock fills with clean zeros. The pallet is always full-width; the crate just rides on top.

Key points:
1. `char` and `short` are promoted to `int` in expressions — always.
2. If `int` cannot represent all values of the source type (rare), promotion goes to `unsigned int`.
3. Sign extension from signed types can produce negative intermediate values that break bitwise logic.
4. The result of `sizeof('a')` is `sizeof(int)`, not `sizeof(char)`, because character constants are `int` in C.
5. To prevent unwanted promotion, mask after promotion: `(c & 0xFF) << 1`.


C11 §6.3.1.1 defines integer promotion. "The C Standard" by Derek M. Jones is an exhaustive reference. The CERT rule INT02-C discusses integer promotions in secure coding contexts.