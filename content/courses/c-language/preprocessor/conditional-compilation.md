+++
date = '2026-07-06T13:41:00+05:30'
draft = true
title = 'Conditional Compilation'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 9
weight = 3
initial_code = '''#include <stdio.h>

#define DEBUG 1
#define PLATFORM "STM32"

int main(void) {
#if DEBUG
    printf("Debug mode enabled\n");
#endif

#if defined(PLATFORM)
    printf("Platform: %s\n", PLATFORM);
#else
    printf("No platform defined\n");
#endif

#ifdef __STDC__
    printf("ANSI C compliant\n");
#endif

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Debug mode enabled, Platform: STM32, ANSI C compliant'
+++

## Problem Statement

Use `#if`, `#ifdef`, `#ifndef`, and `#else` directives to conditionally compile different code paths. Define macros like `DEBUG` and `PLATFORM` and show how changing their definitions changes which block is compiled.

## Theory and Concepts

- `#if expression`: includes the block if `expression` evaluates to non-zero.
- `#ifdef MACRO`: includes the block if `MACRO` is defined.
- `#ifndef MACRO`: includes the block if `MACRO` is not defined.
- `#else` and `#elif` provide alternative branches.
- `#endif` ends the conditional block.
- `defined()` operator can be used inside `#if`: `#if defined(A) || defined(B)`.
- Conditional compilation happens at preprocessing time, before compilation.

## Real World Application

Conditional compilation is used for debug vs release builds, platform-specific code (Linux vs Windows vs embedded), feature toggles, compiler-specific workarounds, and header include guards (`#ifndef HEADER_H` / `#define HEADER_H` / `#endif`).

===EXPLANATION===

Conditional compilation is the C preprocessor's decision engine — it allows the compiler to see different code depending on conditions evaluated at preprocessing time. This capability emerged in the mid-1970s as C became the language of choice for porting UNIX between different hardware platforms (PDP-11, Interdata 8/32, VAX). Different machines had different word sizes, different memory layouts, different I/O architectures. Rather than maintaining separate source trees, developers used `#ifdef` and `#if` to write multiple code paths in a single file. The preprocessor would select the right path at build time. This was one of C's killer features for systems programming — no other language at the time offered this level of platform adaptability.

Think of conditional compilation as a choose-your-own-adventure book. The book contains many paths, but you only read one sequence based on your choices. `#ifdef DEBUG` is a page that says "turn to page 42 if you have the DEBUG bookmark." `#else` says "otherwise, turn to page 43." `#endif` is "the page where the paths reconverge." The preprocessor is the reader who skims the book before you and removes all the paths you didn't choose, leaving only your chosen adventure for the compiler to read. The key difference from runtime `if` statements: the unchosen paths are completely invisible to the compiler — they don't exist in the final source.

In professional C code, conditional compilation is indispensable but controversial. The Linux kernel uses it extensively: `#ifdef CONFIG_SMP` for symmetric multiprocessing support, `#ifdef CONFIG_X86_64` for 64-bit x86 assembly. Embedded firmware uses it for hardware variant support: `#ifdef BOARD_REVISION_2`. Library authors use it for compiler workarounds: `#ifdef __GNUC__` for GCC-specific attributes. Debug logging is gated behind `#ifdef DEBUG`. However, overuse of conditional compilation leads to "`#ifdef` hell" — code that is nearly impossible to read or test because the preprocessor directives create a combinatorial explosion of code paths. Projects like the Linux kernel have moved some compile-time decisions to Kconfig files and separate compilation units to reduce `#ifdef` clutter.

Visually, imagine a tree of pipes with valves. Each valve (`#ifdef`, `#ifndef`, `#if`) either opens or closes the pipe. Tokens flow through open pipes to the compiler; closed pipes are dead ends. The preprocessor opens or closes each valve based on which macros are defined. The result is a single uninterrupted pipe from each source file to the compiler, with all the dead branches removed. This is fundamentally different from runtime branching: at runtime, all branches exist in the binary; with conditional compilation, only the taken branch exists.

Key points: `#if expr` evaluates a constant expression (macro names expand, undefined macros become 0). `#ifdef MACRO` is true if MACRO is defined. `#ifndef MACRO` is true if MACRO is not defined. `#elif` provides else-if chains. `#else` provides the fallback. `#endif` ends the block. The `defined()` operator works inside `#if`: `#if defined(A) && !defined(B)`. Macros that are not defined evaluate to 0 in `#if` expressions. Indentation of directives is optional but conventional (`#if`, `#  if`, etc.). The `-D` and `-U` compiler flags define and undefine macros from the command line.

For deeper study: "The C Preprocessor" by Richard Stallman (GCC documentation), the C standard §6.10.1 (conditional inclusion), and "The Art of UNIX Programming" by Eric S. Raymond (chapter on portability).
