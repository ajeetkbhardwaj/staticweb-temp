+++
date = '2026-07-06T13:33:00+05:30'
draft = true
title = 'Static Local Variables'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 7
weight = 1
initial_code = '''#include <stdio.h>

int counter(void) {
    static int count = 0;  // Initialized once
    count++;
    return count;
}

int main(void) {
    for (int i = 0; i < 5; i++) {
        printf("Call %d: %d\n", i + 1, counter());
    }
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Call 1: 1 ... Call 5: 5'
+++

## Problem Statement

Write a function `counter` with a `static` local variable that increments each time the function is called. Call it in a loop from `main` and print the returned values to confirm the variable persists across calls.

## Theory and Concepts

- `static` on a local variable gives it **static storage duration** (lives for the program's lifetime) while keeping **block scope** (only accessible within the function).
- The initialization `static int count = 0;` happens only once, when the program starts.
- Without `static`, an automatic variable would be created and destroyed each call.
- Static locals are useful for preserving state across function calls without using globals.

## Real World Application

Static locals are used for function-local caches, generating unique IDs, random number generator seeds (initialized once with `time(NULL)`), and call-count limited operations (e.g., "first run" initialization).

===EXPLANATION===

The story of static local variables begins with a fundamental tension in programming: functions need memory that persists across calls, but global variables are visible everywhere and invite chaos. Early languages like Fortran solved this with COMMON blocks — shared storage that any function could touch. But as programs grew, so did the bugs from accidental modification. Ken Thompson and Dennis Ritchie, designing C in the early 1970s, wanted something better: a variable that lives as long as the program but is visible only inside the function that owns it. The static local variable was born.

Think of a static local as a locked diary inside a room. The diary sits on a shelf (static storage) and never gets thrown away when you leave the room. But only the person inside that room can open it — no one in the hallway (other functions) can peek at it. Each time you enter the room, you flip to the next page and write. The diary remembers where you left off. The `static` keyword is the lock: it changes the variable's lifetime from "born when the block enters, dead when it leaves" to "born when the program starts, alive until it ends."

In professional C code, static locals appear wherever a function needs to remember something without exposing it to the world. Random-number generators use them to hold the current seed between calls. String tokenizers like `strtok()` use them to track position in the input string. Caches for expensive computations — think of a function that looks up a hardware register address once and stores it — rely on them. Logging systems use static locals as call counters ("operation failed 3 times, now escalate"). In embedded firmware, a static local might hold the last ADC reading so the next call can compare for delta detection.

Visually, imagine the stack as a stack of sticky notes that get created and thrown away as functions are called and return. Automatic variables live on these sticky notes — ephemeral. A static local, by contrast, lives in a separate region called the data segment (or BSS, if zero-initialized). Picture a whiteboard mounted on the wall next to the stack. The whiteboard is always there, from program start to exit, but only one function is allowed to write on it. The compiler enforces the access rules; if another function tries to read that whiteboard, the compiler stops you cold.

Key points: `static` on a local variable changes storage duration but not scope — it's block-scoped but program-lifetime. The initialization happens exactly once, at program startup, before `main()` runs. If you don't initialize it, static locals are zero-initialized (automatic locals are uninitialized garbage). Function reentrancy suffers — a static local makes a function not reentrant; if multiple threads call the same function, they share the same static variable, which is a race condition waiting to happen.

For deeper study: see "The C Programming Language" (Kernighan & Ritchie, §4.6), the C standard section 6.2.4 (storage durations), and CERT C recommendation DCL30-C (avoid static locals in reentrant functions).
