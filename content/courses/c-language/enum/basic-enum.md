+++
date = '2026-07-06T14:07:00+05:30'
draft = true
title = 'Basic Enum Usage'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 15
weight = 1
initial_code = '''#include <stdio.h>

enum color { RED, GREEN, BLUE, YELLOW, CYAN, MAGENTA };

int main(void) {
    enum color c = GREEN;

    printf("GREEN = %d\n", c);

    // Using enum in a switch
    switch (c) {
        case RED:    printf("Red\n"); break;
        case GREEN:  printf("Green\n"); break;
        case BLUE:   printf("Blue\n"); break;
        default:     printf("Other\n"); break;
    }

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'GREEN = 1, Green'
+++

## Problem Statement

Define an enumeration for colors and use a variable of the enum type. Print the integer value of an enumerator and use the enum in a `switch` statement to print the color name.

## Theory and Concepts

- `enum name { CONSTANT1, CONSTANT2, ... }` defines an enumerated type.
- Enumerators are integer constants starting from 0 by default (incrementing by 1).
- Enum variables are integers — they can hold any value of the underlying type, not just the named constants.
- Enums improve code readability compared to raw integer constants.
- The underlying type of an enum is `int` (or a compatible integer type).

## Real World Application

Enums are used for state machines (`STATE_IDLE`, `STATE_RUNNING`, `STATE_ERROR`), error codes (`ERR_SUCCESS`, `ERR_TIMEOUT`, `ERR_INVALID`), configuration modes (`MODE_FAST`, `MODE_NORMAL`, `MODE_LOW_POWER`), and any set of named integer constants.

===EXPLANATION===

Before C introduced enum in the C89/ANSI standard, programmers used `#define` for every named integer constant: `#define RED 0`, `#define GREEN 1`, `#define BLUE 2`. This worked but had no type safety, no scoping, and no debugger symbols. Enums solved this by creating a named integer type with its own set of named values. The basic intuition is a numbered list: you create a list of related items (`RED`, `GREEN`, `BLUE`), and C assigns each a number starting from 0. Wherever you write `GREEN`, the compiler substitutes `1`. The enums are just integers — you can assign an enum variable any integer value, even one not in the enum's list (though compilers warn with `-Wenum-conversion`). Professionally, enums appear in almost every C codebase. The X Window System defines `typedef enum { Success = 0, Failure } Status;` — every X11 lib call returns this type. POSIX error codes like `EINTR`, `EAGAIN` are enums in `<errno.h>` on some systems. The Linux kernel uses enums for every magnitude of constant: `enum { O_RDONLY = 0, O_WRONLY = 1, O_RDWR = 2 }` for file open flags. Game engines define `typedef enum { PLAYER_IDLE, PLAYER_RUNNING, PLAYER_JUMPING, PLAYER_DEAD } PlayerState;` for character animation state. Visually, imagine a restaurant menu numbered 1–10. The waiter doesn't write "Grilled Salmon" — they write "7". The enum `MENU_SALMON = 7` is a constant that maps the name to the number. Anyone can read `MENU_SALMON` and understand it, while bare `7` is cryptic.

Key points:

. enumerators are `int` constants — they can be used wherever an integer constant expression is expected (case labels, array sizes, bit‑field widths);
. the underlying type is `int` (or a compatible integer type chosen by the implementation);
. enum types are compatible with `int` for assignment and comparison;
. an uninitialized enum variable contains garbage (just like `int`);
. anonymous enums (`enum { MAX_FILES = 256 }`) are useful for compile‑time constants without needing a type name.

References:
1. ISO C11 §6.7.2.2 (enum specifier).
2. K&R C Appendix A §8.4.
3. "C Programming: A Modern Approach" by K. N. King.

