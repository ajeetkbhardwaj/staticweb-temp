+++
date = '2026-07-06T14:01:00+05:30'
draft = true
title = 'Bit-fields'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 13
weight = 5
initial_code = '''#include <stdio.h>

struct flags {
    unsigned int visible : 1;
    unsigned int enabled : 1;
    unsigned int readonly : 1;
    unsigned int reserved : 5;
};

struct packed {
    unsigned int day   : 5;  // 0-31
    unsigned int month : 4;  // 1-12
    unsigned int year  : 11; // 0-2047
};

int main(void) {
    struct flags f = {1, 0, 1, 0};
    printf("Visible: %d, Enabled: %d, Readonly: %d\n",
           f.visible, f.enabled, f.readonly);

    struct packed date = {15, 7, 2026};
    printf("Date: %d/%d/%d\n", date.day, date.month, date.year);

    printf("Size of flags: %zu bytes\n", sizeof(struct flags));
    printf("Size of packed: %zu bytes\n", sizeof(struct packed));

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Bit-fields demonstrated'
+++

## Problem Statement

Define structures with bit-fields to pack data into fewer bits than a full integer. Create a flags structure with 1-bit fields and a date structure with fields sized to their ranges. Print the values and the total size of each struct.

## Theory and Concepts

- Bit-fields allow specifying the exact number of bits for a member: `type name : width`.
- Adjacent bit-fields are packed into the same storage unit (typically an `unsigned int`).
- Bit-fields are non-portable — the ordering and packing depend on the ABI.
- Unnamed bit-fields can be used for padding.
- A zero-width bit-field forces alignment to the next storage unit.
- Taking the address of a bit-field is not allowed (no pointer to a bit-field).

## Real World Application

Bit-fields are used in hardware register definitions (each bit controls a different function), network protocol headers (TCP flags, IPv4 fields), file system inodes, and any scenario where memory or storage is scarce and individual bits carry meaning.

===EXPLANATION===

Bit‑fields were born from the need to speak the language of hardware. In the 1970s, memory cost roughly $5,000 per kilobyte and registers were narrow (8 or 16 bits). Every bit mattered. C's bit‑field feature lets you declare struct members with an exact bit width — `unsigned int visible : 1` uses precisely one bit. The compiler handles the masking and shifting; you just assign to a field as if it were a normal int. The intuition is a drawer divider: without bit‑fields, you'd put one item in each drawer (1 byte per flag). With bit‑fields, you add partitions so one drawer holds 8 tiny compartments — each compartment is a 1‑bit flag, but the drawer itself is still one byte. Professionally, bit‑fields map directly to hardware register layouts. An ARM Cortex‑M system control register might be: `struct { unsigned int sleepdeep : 1; unsigned int reserved : 4; unsigned int sevonpend : 1; } SCR;` — every named field corresponds to a bit position in the hardware manual. Network stacks define TCP header flags as bit‑fields: `struct tcphdr { unsigned int fin:1; unsigned int syn:1; unsigned int rst:1; ... }`. The Ext4 file system on‑disk inode uses bit‑fields for permission flags and file type. Visualize a 4‑byte word as 32 individual light switches. A struct with 1‑bit fields named `visible`, `enabled`, `readonly` controls three switches; the remaining 29 are either unused or used by reserved fields.

Key points:

. bit‑fields are non‑portable — the ABI determines order (left‑to‑right vs right‑to‑left) and whether they span storage unit boundaries;
. you cannot take the address of a bit‑field (it has no unique byte address);
. arrays of bit‑fields are not allowed;
. an unnamed bit‑field of width 0 forces alignment to the next storage unit boundary;
. the underlying type must be `_Bool`, `int`, `signed int`, or `unsigned int` (C11 also allows other integer types);
. use bit‑fields for hardware registers and protocol headers — for general boolean flags, a single `int` or `bool` field is simpler and faster.

References:
1. ISO C11 §6.7.2.1 (structure and union specifiers).
2. "ARM Architecture Reference Manual" for register layout conventions.
3. "TCP/IP Illustrated" by Stevens for protocol header diagrams.

