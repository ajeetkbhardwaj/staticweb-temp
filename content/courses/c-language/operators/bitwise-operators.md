+++
date = '2026-07-06T13:12:00+05:30'
draft = true
title = 'Bitwise Operators'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 3
weight = 3
initial_code = '''#include <stdio.h>

int main(void) {
    unsigned int a = 0b1100;  // 12
    unsigned int b = 0b1010;  // 10

    // Compute: & | ^ ~ << >>
    unsigned int and = a & b;
    unsigned int or  = a | b;
    unsigned int xor = a ^ b;
    unsigned int not = ~a;
    unsigned int shl = a << 2;
    unsigned int shr = a >> 2;

    // Print in binary format

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Bitwise operation results demonstrated'
+++

## Problem Statement

Apply each bitwise operator (`&`, `|`, `^`, `~`, `<<`, `>>`) on two unsigned integers and print the results in binary or hexadecimal. Verify that shift left multiplies by powers of two and shift right divides (for unsigned).

## Theory and Concepts

- `&` (AND): bit is 1 only if both corresponding bits are 1.
- `|` (OR): bit is 1 if either corresponding bit is 1.
- `^` (XOR): bit is 1 if corresponding bits differ.
- `~` (NOT): inverts all bits.
- `<<` (left shift): shifts bits left, fills with 0 — equivalent to multiplying by 2ⁿ.
- `>>` (right shift): shifts bits right — for unsigned, fills with 0 (logical shift).
- Bitwise operators work on integer types only.

## Real World Application

Bitwise operations are essential in embedded programming — setting/clearing hardware register bits, implementing flags and permissions, CRC computation, cryptography, compression, and graphics (color channel masking).

===EXPLANATION===

Bitwise operators in C directly reflect the machine instructions of the PDP-11, where Ritchie developed the language. The PDP-11 had `BIC` (bit clear), `BIS` (bit set), and `XOR` instructions that mapped naturally to `&`, `|`, `^`, and `~` [1]. Shift instructions `<<` and `>>` corresponded to `ASL` (arithmetic shift left) and `ASR`/`LSR` (arithmetic/logical shift right). These operators have remained unchanged because they map one-to-one to hardware on virtually every architecture. The C standard guarantees that left shifts and right shifts of unsigned types are logical (zero-filled), while right shifts of signed types are implementation-defined (usually arithmetic, preserving the sign bit).

The intuition: each bitwise operator works on every bit position independently. Think of `&` as a "both" test (both bits must be 1), `|` as an "either" test (at least one is 1), `^` as a "different" test (exactly one is 1), and `~` as a "not" test (flip every bit). Left shift `<< n` moves every bit n positions left, filling with zeros on the right — multiplying by 2^n when overflow doesn't occur. Right shift `>> n` moves bits right — for unsigned types, it's division by 2^n; for signed types, it preserves the sign bit (arithmetic shift).

Real code uses bitwise operators for performance-critical operations. The Linux kernel uses them for every hardware register access: `writel(val | BIT(5), reg)` sets bit 5 of a register [2]. Redis uses `&` for type checking: `type = obj->type & OBJ_ENCODING_MASK` [3]. SQLite uses `>>` and `&` for varint decoding: `val = (val << 7) | (bytes[i] & 0x7F)` [4]. Git uses `^` in its packfile CRC computation.

```c {title="src/bitmap.c (Redis)", note="Redis uses bitwise ops for efficient bitmap operations"}
void setBit(robj *o, off_t offset, int val) {
    unsigned char *bit = (unsigned char*)o->ptr + (offset >> 3);
    int mask = 1 << (offset & 0x7);
    if (val)
        *bit |= mask;
    else
        *bit &= ~mask;
}
```

Visualize bitwise operations on an 8-bit value: `a = 0b11001100`, `b = 0b10101010`. Then `a & b` = `0b10001000` (bits 7 and 3 are set in both), `a | b` = `0b11101110` (every position where either has a 1), `a ^ b` = `0b01100110` (positions where they differ), `~a` = `0b00110011` (all bits flipped). Shift `a << 2` = `0b00110000` (bits shifted left, zeros on right).

Key points:
1. `<< 1` multiplies by 2; `>> 1` divides by 2 (for unsigned).
2. `x & (x - 1)` clears the lowest set bit — a classic O(1) population test.
3. Use unsigned types for bitwise operations to avoid sign-extension surprises.
4. `1 << 31` overflows a 32-bit signed int — use `1U << 31`.
5. Bitwise operators have lower precedence than arithmetic — `x & 3 == 2` is `x & (3 == 2)`, not `(x & 3) == 2`.

References:
1. Ritchie, D. "The Development of the C Language." *HOPL II*, 1993

2. Linux kernel `include/linux/bitops.h` — `BIT()`, `BIT_ULL()` macros.
3. Redis source: `src/object.c` — object type encoding with bitwise masks.
4. SQLite source: `src/btree.c` — varint decoding with shift and mask.
