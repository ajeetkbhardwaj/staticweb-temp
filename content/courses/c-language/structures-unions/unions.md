+++
date = '2026-07-06T14:00:00+05:30'
draft = true
title = 'Unions'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 13
weight = 4
initial_code = '''#include <stdio.h>

union data {
    int i;
    float f;
    char c;
};

int main(void) {
    union data d;

    d.i = 42;
    printf("As int: %d\n", d.i);

    d.f = 3.14f;  // Overwrites the same memory
    printf("As float: %f\n", d.f);
    printf("As int after write: %d\n", d.i);  // Garbage — bytes reinterpreted

    printf("Size of union: %zu\n", sizeof(union data));

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Union behavior demonstrated'
+++

## Problem Statement

Define a union with an `int`, `float`, and `char` member. Write one member and read another to see how the same memory is reinterpreted. Print the size of the union and compare it to the size of its largest member.

## Theory and Concepts

- A union shares memory among all its members — only one member can hold a value at a time.
- The size of a union is the size of its largest member.
- Writing to one member overwrites the other members (their values become undefined).
- Unions are often combined with a tag field (enum) to create discriminated unions (tagged unions).
- Unions can be used for type-punning (reinterpreting bytes), though this can have undefined behavior in strict aliasing rules.

## Real World Application

Unions are used in network protocol parsers (interpreting raw bytes as structured data), variant types (JSON values that can be string, number, or object), register access in embedded systems (accessing a 32-bit register as 4 bytes), and implementing polymorphism in C.

===EXPLANATION===

A union is a struct where all fields share the same memory address — a shape‑shifting container that can hold one kind of data at a time. In early C (1970s), unions were created to save memory on the PDP‑11, where every byte mattered. The basic idea: instead of allocating space for every possible variant, let them overlap. The size of a union is the size of its largest member, and writing to one member overwrites all others. Think of a union like a hotel room that can be configured as a single king suite (a `double`), a twin room (two `int`s), or a dormitory (eight `char`s) — but only one configuration at a time. Professional usage is pervasive in systems programming. Network protocol parsers overlay a union onto a receive buffer: the same raw bytes can be interpreted as an Ethernet header, an IP header, or a TCP header depending on the protocol field. The X Window System uses unions for X11 events — a single `XEvent` union can be a `ButtonPress`, `KeyPress`, or `Expose` event. Embedded firmware defines unions to access 32‑bit hardware registers as four bytes: `union { uint32_t reg; uint8_t bytes[4]; }`. The standard "tagged union" pattern combines a union with an enum discriminant: `struct variant { enum type tag; union { int i; float f; char *s; } data; }`. This is how dynamically‑typed languages implement variables — Python's `PyObject` is essentially a tagged union. Visualize a union as a single block of memory in a grid — when you write to `d.f = 3.14f`, those 4 bytes get the IEEE‑754 representation of 3.14; reading `d.i` reinterprets the same bits as an `int`, which usually produces garbage but is sometimes intentional (type‑punning).

Key points:

. only one member is "active" at any time — it's the programmer's responsibility to track which one;
. reading an inactive member produces undefined behaviour (strict aliasing rule) unless you use `memcpy` or a union for type‑punning (allowed in C11);
. the address of all members is the same as the union's address;
. unions can be anonymous (C11) to access members directly without the union name.

References:
1. ISO C11 §6.7.2.1.
2. K&R C Appendix A.
3. "C Traps and Pitfalls" by Andrew Koenig covers union pitfalls in depth.

