+++
date = '2026-07-06T13:42:00+05:30'
draft = true
title = 'Stringification and Token Pasting'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 9
weight = 4
initial_code = '''#include <stdio.h>

#define STRINGIFY(x) #x
#define TOKEN_PASTE(a, b) a ## b
#define MAKE_VAR(name) int var_ ## name = (name)

int main(void) {
    printf("%s\n", STRINGIFY(hello world));
    printf("%s\n", STRINGIFY(42));

    int xy = 100;
    printf("xy = %d\n", TOKEN_PASTE(x, y));

    MAKE_VAR(42);
    printf("var_42 = %d\n", var_42);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'hello world, 42, xy = 100, var_42 = 42'
+++

## Problem Statement

Use the `#` (stringification) operator to convert macro arguments to string literals, and the `##` (token pasting) operator to concatenate tokens into new identifiers. Create a macro that generates variable names dynamically.

## Theory and Concepts

- `#x` in a macro body converts the argument to a string literal: `STRINGIFY(hello)` → `"hello"`.
- `a ## b` concatenates two tokens: `TOKEN_PASTE(x, y)` → `xy`.
- Token pasting is useful for generating identifiers (variable names, function names) based on macro parameters.
- Stringification is useful for printing the source form of an expression or creating assertion macros.
- Both operators only work inside `#define` macros.

## Real World Application

Token pasting is used in the Linux kernel and embedded code for generating register access functions (`READ_REG(name)` expands to `read_register_name()`). Stringification is used in debug macros, assertion frameworks (`assert(x)` prints `"x"` on failure), and code generation utilities.

===EXPLANATION===

Stringification (`#`) and token pasting (`##`) are the most advanced and most arcane features of the C preprocessor. They were added to the language in the ANSI C89 standard, formalizing preprocessor tricks that had been used informally in UNIX systems programming for years. Before these operators existed, programmers had to rely on external tools (like `m4` or `sed`) to generate repetitive C code. The `#` and `##` operators brought code generation directly into the language, enabling compile-time metaprogramming decades before C++ templates or Rust macros. They are the closest C comes to writing code that writes code.

Think of stringification as a transcript of a conversation. You say "hello world" and the transcriber writes down `"hello world"` — the exact words, quoted. The `#` operator is that transcriber: `#x` converts the macro argument `x` into a string literal, preserving whitespace and token structure. Token pasting, by contrast, is like welding two metal pieces together. You have a bolt labeled "reg" and a nut labeled "addr" — `reg ## addr` fuses them into one piece: `regaddr`. The weld is invisible to the naked eye — you see a single token where there were two.

In professional C code, these operators shine in code generation and debugging. The Linux kernel uses token pasting heavily in its driver model: `#define DRIVER_OPS(name) .probe = name ## _probe, .remove = name ## _remove` — calling `DRIVER_OPS(usb_storage)` expands to `.probe = usb_storage_probe, .remove = usb_storage_remove`, generating the struct initializer. Embedded register maps use `#define REG_ADDR(periph, reg) periph ## _ ## reg` so `REG_ADDR(USART1, SR)` becomes `USART1_SR`. Stringification powers `assert()` in the standard library: `#x` in the assert macro converts the expression to a string for the error message. Logging macros use `#x` to print both the expression and its value: `#define LOG_INT(x) printf(#x " = %d", x)`.

Visually, imagine a factory with two machines. Stringification is a box that takes any object placed on its conveyor belt and labels it with a quoted description — a wooden block labeled "wooden block," a gear labeled "gear." The machine doesn't analyze the object; it just writes down what it sees. Token pasting is a forge that takes two metal ingots and presses them into a single new shape. The individual ingots disappear; only the combined piece remains. Both machines work only in macro definitions — they're preprocessor-only tools, invisible to the compiler.

Key points: `#x` converts the macro parameter `x` to a quoted string literal (`"x"`). Works only in function-like macro definitions. `a ## b` concatenates tokens `a` and `b` into a single new token (`ab`). Works in both object-like and function-like macros. The result of `##` must be a valid preprocessor token. Token pasting is often used with arguments that expand to identifiers. Stringification does not macro-expand its argument — it stringifies the literal text. Double macro expansion (a helper macro) can force expansion before stringification. These operators are essential for X-macros, a technique for generating parallel data and code from a single macro list.

For deeper study: "The C Preprocessor" (GCC docs, section on stringification and concatenation), the C standard §6.10.3.2 and §6.10.3.3, and "The X Macro Pattern in C" by Randy Meyers.
