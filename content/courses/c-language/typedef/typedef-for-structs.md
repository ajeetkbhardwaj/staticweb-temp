+++
date = '2026-07-06T14:04:00+05:30'
draft = true
title = 'typedef for Structs'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 14
weight = 2
initial_code = '''#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

typedef struct {
    Point top_left;
    Point bottom_right;
} Rectangle;

int main(void) {
    Point p1 = {10, 20};
    Rectangle rect = {{0, 0}, {100, 50}};

    printf("Point: (%d, %d)\n", p1.x, p1.y);
    printf("Rectangle: (%d,%d)-(%d,%d)\n",
           rect.top_left.x, rect.top_left.y,
           rect.bottom_right.x, rect.bottom_right.y);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Struct typedefs demonstrated'
+++

## Problem Statement

Define a `typedef` for a `struct` representing a 2D point, and another for a rectangle composed of two points. Create instances and access their fields. Show how `typedef` eliminates the need to write `struct` keyword each time.

## Theory and Concepts

- `typedef struct { fields } TypeName;` defines an anonymous struct and gives it a name.
- This is the most common use of `typedef` — it makes struct usage feel like a built-in type.
- Without `typedef`, you must write `struct Point p;` instead of `Point p;`.
- The struct tag can still be used for self-referential types (use `struct name` inside the struct).
- `typedef` structs are used extensively in the C standard library (`FILE`, `FILE *`).

## Real World Application

Typedef'd structs are standard practice in C — almost all libraries define types like `HANDLE`, `WINDOW`, `BUFFER`, etc. The `<stdint.h>` types (`uint32_t`, `int64_t`) are typedefs that abstract platform-specific integer sizes.

===EXPLANATION===

The marriage of `typedef` with `struct` is the most common pattern in C code. Without it, every variable declaration of a user‑defined type requires the `struct` keyword: `struct Point p;`. With it, `Point p;` — the type feels like a built‑in. Historically, early C programmers wrote `struct` everywhere until typedef became widespread in the 1980s. The intuition is a naming ceremony: you build a compound object (a struct) and then give it a single‑word name so you can refer to it as easily as `int` or `float`. Professionally, almost every C library follows this pattern. The Win32 API defines `typedef struct { ... } HANDLE;` — every window, file, and process handle is a pointer or integer disguised behind typedef. Standard library FILEs: `typedef struct _iobuf FILE;` — you never write `struct _iobuf`. The `<stdint.h>` types are typedefs of platform‑appropriate integers: `typedef unsigned int uint32_t;`. In embedded development, hardware register maps use typedef'd structs: `typedef struct { uint32_t CR; uint32_t SR; ... } USART_TypeDef;`. The visual metaphor is a custom stamp: you carve the struct layout into a stamp (the typedef), then every time you stamp a page you get the full pattern without redrawing it.

Key points:

. you can typedef an anonymous struct — `typedef struct { int x; int y; } Point;` — this is the most common form;
. you can also typedef a tagged struct — `typedef struct Point { int x; int y; } Point;` — this allows self‑referential members (`struct Point *next`) while still using the short name `Point` for variables;
. typedef does not create a unique type — `Point p; struct Point q;` are the same type;
. convention in C is to have the typedef name match the struct tag or use a Capitalized convention (`Point`);
. the C standard library's `FILE` is actually a typedef for a struct that you never need to see inside (opaque type).

References:
1. ISO C11 §6.7.2.1 (struct) and §6.7.7 (typedef).
2. K&R C Chapter 6.
3. "C Interfaces and Implementations" by David Hanson demonstrates opaque struct typedefs for encapsulation.

