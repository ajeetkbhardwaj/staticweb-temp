+++
date = '2026-07-06T14:10:00+05:30'
draft = true
title = 'Static vs Automatic Initialization'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 16
weight = 2
initial_code = '''#include <stdio.h>

int global;           // Zero-initialized (static storage)
static int sglobal;   // Zero-initialized (static storage)

void demo(void) {
    static int s_local = 0;  // Initialized once at program start
    int auto_local = 0;      // Re-initialized each call

    s_local++;
    auto_local++;

    printf("auto=%d, static=%d\n", auto_local, s_local);
}

int main(void) {
    printf("global=%d, sglobal=%d\n", global, sglobal);

    demo();
    demo();
    demo();

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'auto initialised each call, static initialised once'
+++

## Problem Statement

Write a function with both a `static` local variable and an automatic local variable initialized to 0. Call it three times and observe that the automatic variable resets each time while the `static` variable retains its value.

## Theory and Concepts

- **Static storage duration** (file-scope and `static` locals): initialized once at program startup. If no explicit initializer, they are zero-initialized.
- **Automatic storage duration** (regular locals): initialized each time the block is entered. Without an explicit initializer, they contain garbage.
- Static locals are initialized only once, when the program starts (or when the function is first called, depending on the implementation).
- Static initialization can use constant expressions; automatic initialization can use any expression.

## Real World Application

Understanding initialization rules prevents bugs in multi-call functions. Static locals are used for caches, counters, and one-time initialization. Automatic variables must always be initialized before reading, especially in embedded systems where startup values are unpredictable.

===EXPLANATION===

C distinguishes two storage durations that directly affect initialization behaviour: static and automatic. Static storage duration applies to global variables, file‑static variables, and local variables declared `static`. These are initialized once, at program startup, before `main()` begins. If you don't provide an explicit initializer, they are zero‑initialized automatically. Automatic storage duration applies to local variables declared without `static`. These are NOT initialized unless you do it explicitly — they contain whatever bits happen to be in memory (undefined behaviour to read). This is one of C's most common bug sources. The intuition is a hotel room vs your home. Automatic variables are like a hotel room — each time you enter (each function call), you get a fresh room that may have leftover trash from the previous guest (garbage values). You must clean it (initialize) before using it. Static locals are like a permanent locker in your home — it's there when you move in (program start), and its contents persist between trips (function calls). The zero initializer is the janitor who clears it out before you first arrive. Professionally, the difference is exploited for caching and state retention. A function that generates unique IDs uses a static counter: `static int next_id = 1000; return next_id++;` — the counter persists across calls and starts at 1000 exactly once. A random access memory (RAM) test in embedded firmware might use a static array as a scratch buffer to avoid stack overflow: `static uint8_t test_buffer[4096];` — zero‑initialized at boot, reused every test call without re‑initialization overhead. In contrast, automatic local arrays must be explicitly initialized on each call, which costs time and stack space: `char tmp[256]; sprintf(tmp, "value=%d", x);` — `tmp` is uninitialized but immediately written by `sprintf`, so no read‑before‑init bug occurs. The key visual: imagine two whiteboards in a classroom. The static whiteboard is wiped clean every morning (program start), and notes written during first period are still there for second period (persist across calls). The automatic whiteboard is a personal slate — every student gets a new one at the start of class, but it might have random scribbles from the previous class if they don't erase it first.

Key points:

. static locals are initialized only once — the initializer must be a constant expression (C99 also allows `const` expressions);
. automatic locals can be initialized with any expression, including function calls: `int r = rand();`;
. `static` local variables are stored in the data segment (or BSS if zero‑initialized), not on the stack;
. multi‑threaded programs must protect static locals with synchronization if multiple threads write to them;
. `_Thread_local` (C11) gives each thread its own copy of a static‑duration variable.

References:
1. ISO C11 §6.2.4 (storage durations) and §6.7.9 (initialization).
2. "Expert C Programming: Deep C Secrets" by Peter van der Linden covers static vs auto in depth.

