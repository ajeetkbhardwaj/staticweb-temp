+++
date = '2026-10-04'
title = 'Pointers and Memory'
difficulty = 'medium'
language = 'c'
topic_weight = 1
subtopic_weight = 1
weight = 1
+++

## Problem Statement

Learn how a C pointer addresses memory, and use `&` and `*` safely to read and
write variables through pointers.

## Article

A **pointer** is a variable that stores the *address* of another variable in
memory instead of the value itself.

- `&x` — address of `x`
- `*p` — value stored at the address `p` points to
- `p = &x` — make `p` point to `x`

```c
int a = 42;
int *p = &a;   /* p holds the address of a */
*p = 100;      /* a is now 100 */
```

Pointers are how C accesses memory-mapped hardware: a peripheral register is
just a fixed address, and we read/write it through a pointer.

### Key rules

1. Never dereference a `NULL` or uninitialized pointer.
2. Size matters: use `uint32_t`, `uint8_t`, etc. for register addresses.
3. Treat peripheral registers as `volatile`.

===READING===

## Lab

Do `lab.md` in this chapter, then check your understanding with `quiz.md`.

## Quiz

Answer the questions in `quiz.md`.

===QUIZ===

- What does `&` do?
  - Gets the address of a variable
  - Dereferences
  - Multiplies
- Is `int *p; *p = 5;` safe?
  - No, uninitialized pointer
  - Yes
