+++
date = '2026-07-06T13:07:00+05:30'
draft = true
title = 'Enumeration Constants'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 2
weight = 3
initial_code = '''#include <stdio.h>

enum weekdays { MON, TUE, WED, THU, FRI, SAT, SUN };
enum colors { RED = 1, GREEN = 3, BLUE = 5 };

int main(void) {
    enum weekdays today = WED;
    enum colors c = GREEN;

    // Print the enum values

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Enum values: MON=0, TUE=1, WED=2, RED=1, GREEN=3, BLUE=5'
+++

## Problem Statement

Define an `enum` for days of the week (starting from 0) and an `enum` for colors with explicitly assigned values. Print the numeric values of each enumerator and verify that they match the expected sequence.

## Theory and Concepts

- `enum` creates an integer type with named constants.
- By default, enumerators start at 0 and increment by 1.
- Explicit values can be assigned: `RED = 1`.
- Uninitialized enumerators continue from the previous value.
- `enum` constants are `int` and can be used wherever integers are expected.

## Real World Application

Enums are used for state machines (IDLE, RUNNING, ERROR), configuration options (MODE_A, MODE_B), error codes (SUCCESS, ERR_TIMEOUT, ERR_BUSY), and command identifiers. They make code more readable than raw integer constants.

===EXPLANATION===

C's `enum` keyword was added in C89/ANSI C, but the concept of named integer constants predates C. Early C programmers used `#define` for everything. The `enum` feature was influenced by Pascal's enumerated types — a language designed by Niklaus Wirth (1970). However, C's enums are much looser than Pascal's: in C, an enum is just a set of named `int` constants with no type safety guarantees [1]. The enumerators are assigned integer values starting at 0 (by default), incrementing by 1 for each subsequent member. This simplicity has made enums one of the most portable and widely used features in C.

The intuition: `enum { MON, TUE, WED }` is syntactic sugar for `#define MON 0`, `#define TUE 1`, `#define WED 2`. The enum type itself is `int` underneath — you can assign any integer to an enum variable without a cast, and you can use enum values anywhere an integer is expected. The power comes from grouping related constants under a type name, which documents intent and helps debuggers display meaningful names instead of magic numbers. Explicit assignments (`RED = 1`) let you create bit flags or interface with hardware-defined values.

Real code demonstrates enums everywhere. The Linux kernel uses enums for everything from system call numbers to `enum dma_data_direction` for DMA transfers [2]. The SQLite source defines `enum sqlite3_index_constraint_op` for query plan constraints, and the Redis source uses enums for `redisClient` states and `OBJ_*` encoding types [3, 4]. The CPython interpreter defines `enum _ts_tracing_state` for tracing state and uses enums for opcode identifiers.

```c {title="include/linux/dma-direction.h (Linux kernel)", note="Kernel DMA direction enum documents hardware intent"}
enum dma_data_direction {
    DMA_BIDIRECTIONAL = 0,
    DMA_TO_DEVICE = 1,
    DMA_FROM_DEVICE = 2,
    DMA_NONE = 3,
};
```

A mental model: picture a deck of cards where each card has a name on one side and an integer on the other. The enum type is the deck — it tells you these cards belong together. The compiler fills in the numbers automatically (0, 1, 2...) unless you write a specific number on a card, in which case the next cards continue from that number. You can use the name or the number interchangeably.

Key points:
1. Enumerators start at 0 by default and increment by 1.
2. An enum variable can hold any `int` value, not just the named enumerators.
3. The `enum` type is `int` — `sizeof(enum foo) == sizeof(int)`.
4. You can assign explicit values to break the sequence: `enum { A = 1, B, C }` → B=2, C=3.
5. For type-safe booleans in C23, use `bool`; for user-defined finite sets, use `enum`.

References:
1. ISO/IEC 9899:2011 (C11), §6.7.2.2 — Enumeration specifiers

2. Linux kernel `include/linux/dma-direction.h` — enum for DMA operations.
3. SQLite source: `sqlite3.h` — `sqlite3_index_constraint_op` enum.
4. Redis source: `server.h` — `OBJ_STRING`, `OBJ_LIST`, etc. encoding type enums.
