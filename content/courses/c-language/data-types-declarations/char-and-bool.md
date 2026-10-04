+++
date = '2026-07-06T13:02:00+05:30'
draft = true
title = 'Character Type and _Bool'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 1
weight = 3
initial_code = '''#include <stdio.h>
#include <stdbool.h>

int main(void) {
    char ch = 'A';
    bool flag = true;

    // Print ch as character and as integer
    // Toggle flag and print it

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Char and bool values printed'
+++

## Problem Statement

Work with `char` and `_Bool` types. Initialize a `char` variable with a letter, print it both as a character (`%c`) and as an integer (`%d`). Initialize a `_Bool` (or `bool` from `<stdbool.h>`) variable, toggle it, and print its value.

## Theory and Concepts

- `char` is the smallest addressable unit (typically 1 byte). It can hold ASCII values 0–127 (or extended).
- `char` can be `signed` or `unsigned` depending on the platform.
- `_Bool` stores 0 (false) or 1 (true). `<stdbool.h>` provides `bool`, `true`, and `false` macros.
- Characters are stored as their ASCII integer codes — `'A' == 65`.

## Real World Application

`char` is the building block for all text processing — strings, file I/O, communication protocols. `_Bool` is used for flags and state machines in embedded firmware and game logic.

===EXPLANATION===

{{< vimeo id="1207826110" title="Test Video" >}}

The `char` type traces back to the earliest days of C. Dennis Ritchie designed `char` as the smallest addressable unit of memory — typically one byte — to match the PDP-11's byte-addressable architecture (1972). The name "char" reflects its primary use: storing characters encoded in ASCII, the American Standard Code for Information Interchange standardized in 1963. The `_Bool` type came much later; C99 (1999) introduced `_Bool` as a proper boolean type, along with `<stdbool.h>` that provides the `bool` macro, `true`, and `false`. Before C99, C programmers used `int` for booleans, with zero meaning false and non-zero meaning true — a convention that still holds because `_Bool` is essentially an integer that stores only 0 or 1.

The intuition: `char` is just a small integer. When you write `char ch = 'A';`, the compiler stores the value 65 (ASCII code for 'A'). The difference between `char` and `int` is solely the range and the standard's guarantee that `sizeof(char) == 1`. Whether `char` is signed or unsigned is implementation-defined — on ARM it is unsigned by default, on x86 it is signed. This subtlety has caused real portability bugs. For `_Bool`, any non-zero value assigned to a `_Bool` variable is converted to 1 — a `_Bool` can only store 0 or 1.

Professional C code relies on this everywhere. The Git source code uses `char` arrays for all object hashes and path buffers, and relies on signedness being explicit via `signed char` or `unsigned char` when it matters [1]. The SQLite engine uses `unsigned char` for its B-tree page buffers and text encoding conversion [2]. The Redis source uses `char` for command strings but explicitly casts to `unsigned char` before character classification to avoid sign-extension issues on platforms where `char` is signed [3].

```c {title="src/hash.c (Git)", note="Git stores SHA-1 hashes in unsigned char arrays"}
#define GIT_SHA1_RAWSZ 20
unsigned char sha1[GIT_SHA1_RAWSZ];
```

A mental model: picture `char` as a container that holds exactly 8 bits (on virtually all platforms). Those 8 bits can represent a letter if interpreted as ASCII, or a small number from 0 to 255 (unsigned) or −128 to 127 (signed). The type system does not track which interpretation you intend — that's the programmer's job. `_Bool` is the same 8-bit container but with a contract: it will only ever hold 0 or 1.

Key points:
1. `sizeof(char)` is always 1 by definition — it's the unit of measurement for all other types.
2. `char` may be signed or unsigned depending on the platform — use `signed char` or `unsigned char` when signedness matters.
3. Characters are stored as their integer ASCII codes — `'A' == 65`, `'0' == 48`.
4. `_Bool` converts any non-zero value to 1 — `bool x = 4;` sets `x` to 1.
5. Use `EOF` with `int`, not `char` — `getchar()` returns `int` because `char` may not be able to represent EOF.

References:
1. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.2 — Data Types and Sizes

2. ISO/IEC 9899:2011 (C11), §6.2.5 — Types (char, _Bool).
3. Git source: `hash.h` — unsigned char for SHA hashes to avoid sign-extension issues.
