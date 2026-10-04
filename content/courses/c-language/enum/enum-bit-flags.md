+++
date = '2026-07-06T14:28:00+05:30'
draft = true
title = 'Enum with Bit Flags'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 15
weight = 4
initial_code = '''#include <stdio.h>

enum permission {
    PERM_NONE    = 0,
    PERM_READ    = 1 << 0,
    PERM_WRITE   = 1 << 1,
    PERM_EXECUTE = 1 << 2,
    PERM_ALL     = PERM_READ | PERM_WRITE | PERM_EXECUTE
};

int main(void) {
    int user_perm = PERM_READ | PERM_WRITE;

    if (user_perm & PERM_READ)   printf("Can read\n");
    if (user_perm & PERM_WRITE)  printf("Can write\n");
    if (user_perm & PERM_EXECUTE) printf("Can execute\n");

    // Check specific permission
    if ((user_perm & PERM_WRITE) == PERM_WRITE) {
        printf("Write access confirmed\n");
    }

    printf("Permission value: %d\n", user_perm);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Can read, Can write, Permission value: 3'
+++

## Problem Statement

Define an enumeration where each constant is a power of 2 (using `<<`), representing individual bits. Combine them with bitwise OR to create composite permissions. Check for specific permissions using bitwise AND. This pattern is called "bit flags" or "bitmask enum".

## Theory and Concepts

- Enum constants with power-of-2 values (1, 2, 4, 8, ...) represent individual bits.
- Combine: `PERM_READ | PERM_WRITE` sets bits 0 and 1.
- Check: `(flags & PERM_READ)` is non-zero if the read bit is set.
- Remove: `flags & ~PERM_WRITE` clears the write bit.
- The advantage over separate boolean flags is compact storage and the ability to pass a set of flags as a single integer.
- Ensure the underlying type can hold the combined value (use `unsigned int` for safety).

## Real World Application

Bit flags are used in file permissions (Unix rwx), hardware register configurations (each bit enables a feature), system calls (`open()` flags), network socket options, and any API where multiple options can be combined.

===EXPLANATION===

When you need to pass a set of on/off options to a function, you have two choices: pass each option as a separate boolean parameter (bulky and hard to extend), or pack all options into a single integer where each bit represents one option. Bit‑flag enums take the second approach: define each constant as a power of two (a distinct bit), then combine them with bitwise OR. The technique dates back to the earliest days of C, where efficiency demanded packing multiple flags into a single machine word. The insight is that a 32‑bit integer can hold 32 independent boolean flags, each accessible with bitwise operators (`&`, `|`, `^`, `~`). The intuition is a bank of light switches on a wall panel. Each switch (bit) controls one light (option). Flicking switch 1 (setting bit 0) turns on the reading light. Multiple switches can be on simultaneously. You read the panel (a single integer) and check which lights are on using `panel & SWITCH_1`. Professionally, bit flags are everywhere in systems programming. The Unix `open()` system call accepts flags like `O_RDONLY`, `O_WRONLY`, `O_CREAT`, `O_TRUNC` — these are bit flags defined as an enum or macros, combined with `|`: `open("file", O_RDWR | O_CREAT | O_TRUNC)`. File permissions in `stat()` use bits: `S_IRUSR`, `S_IWUSR`, `S_IXUSR`. Socket options use `MSG_OOB | MSG_NOSIGNAL`. Hardware register configuration in embedded firmware: `enum gpio_config { GPIO_MODE_INPUT = 0, GPIO_MODE_OUTPUT = 1, GPIO_PULLUP = 2, GPIO_PULLDOWN = 4 }` — the register value `GPIO_MODE_OUTPUT | GPIO_PULLUP` configures the pin as output with pullup. The `SDL_Init()` function takes flags like `SDL_INIT_VIDEO | SDL_INIT_AUDIO`. Visually, imagine a row of 32 toggle switches. `PERM_READ = 1 << 0` toggles switch 0. `PERM_WRITE = 1 << 1` toggles switch 1. `user_perm = PERM_READ | PERM_WRITE` has switches 0 and 1 up (binary `...00011`). Checking `user_perm & PERM_WRITE` returns non‑zero if switch 1 is up.

Key points:

. use `unsigned int` or a fixed‑width type (not `int`) for bit flags — signed right‑shift and sign‑extension can cause subtle bugs;
. each flag must be a distinct power of two — `1 << 0`
. , `1 << 1`
. , `1 << 2`
. , up to `1 << 31` for `uint32_t`;
. you can define composite flags like `PERM_ALL = PERM_READ | PERM_WRITE | PERM_EXECUTE`;
. use `(flags & FLAG) == FLAG` to check that all bits in a composite flag are set;
. clear a bit: `flags &= ~FLAG`; toggle: `flags ^= FLAG`.

References:
1. POSIX `<fcntl.h>` and `<sys/stat.h>` for real‑world bit flag APIs.
2. "Advanced Programming in the UNIX Environment" by Stevens for `open()` flags.
3. "C Pocket Reference" by Prinz and Crawford for bitwise operator reference.

