+++
date = '2026-07-06T13:06:00+05:30'
draft = true
title = 'Character and String Constants'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 2
weight = 2
initial_code = '''#include <stdio.h>

int main(void) {
    char ch = 'A';
    char newline = '\n';
    char tab = '\\t';

    // Print character constants
    printf("Character: %c, code: %d\n", ch, ch);

    // String literal
    char *str = "Hello, C!";
    printf("String: %s\n", str);

    // Print size of string vs character

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Character and string constants demonstrated'
+++

## Problem Statement

Declare a character constant using single quotes, a string literal using double quotes, and escape sequences like `\n` and `\t`. Print the character both as a symbol and as its ASCII code. Print the string and compare `sizeof('A')` with `sizeof("A")`.

## Theory and Concepts

- Character constants are enclosed in single quotes: `'A'`, `'\n'`.
- String constants are enclosed in double quotes: `"hello"`.
- A string constant implicitly includes a null terminator `'\0'` — so `"A"` is 2 bytes, while `'A'` is 1 byte.
- Escape sequences: `\n` (newline), `\t` (tab), `\\` (backslash), `\'` (single quote), `\"` (double quote), `\0` (null).

## Real World Application

Character and string constants appear in every C program — printing messages, parsing input, formatting output, and defining command strings for peripheral modules (AT commands, JSON strings, protocol payloads).

===EXPLANATION===

The distinction between single-quoted character constants and double-quoted string literals dates back to C's predecessor, BCPL (1967), and was inherited by C. In K&R C, a character constant like `'A'` had type `int` — not `char` — a surprising legacy that survives in modern C: `sizeof('A')` is `sizeof(int)`, typically 4 bytes [1]. String literals like `"A"` are arrays of `char` with an invisible null terminator `'\0'`, making them 2 bytes. Escape sequences like `\n` (newline, ASCII 10), `\t` (tab, ASCII 9), `\\` (backslash), and `\0` (null) were present from the beginning, adapting conventions from ASCII control characters.

The intuition: `'A'` is a single integer value (65 in ASCII), stored as `int`. `"A"` is an array of two characters: `'A'` followed by `'\0'`. The null terminator is C's sentinel value for strings — it marks the end without needing an explicit length, a design choice that has been both praised for simplicity and blamed for buffer overflows. In memory, a string literal resides in a read-only segment (typically `.rodata`), and modifying it is undefined behavior. Character constants are immediate values baked into the instruction stream.

Professional code must handle this carefully. The Git source uses string literals for command names and object type identifiers, and relies on `'\0'` termination in all its string operations [2]. The SQLite source uses character constants extensively in its tokenizer (`sqlite3TokenType`) to classify input characters — `c == ';'` or `c == '('` — operations that depend on knowing the exact ASCII value [3]. The Redis source uses string literals for protocol framing (`"$"`, `"*"`, `"\r\n"`) in its RESP protocol implementation [4].

```c {title="src/tokenize.c (SQLite)", note="SQLite tokenizer uses character constants for syntax classification"}
if( c==' ' || c=='\t' || c=='\n' || c=='\f' || c=='\r' ){
    /* skip whitespace */
}
```

Visualize memory for `"hello"` as a contiguous block: `['h']['e']['l']['l']['o']['\0']` — six bytes in a row. Now visualize `'h'` — just a single 4-byte integer value (104) sitting in a register or on the stack. The difference is fundamental: one is a sequence in memory, the other is an immediate value.

Key points:
1. `'x'` is an `int` (not `char`); `"x"` is a `char[2]` array.
2. String literals include an implicit `'\0'` terminator — `"A"` is 2 bytes.
3. Escape sequences are translated to single characters at compile time.
4. Modifying a string literal is undefined behavior — use `char str[] = "hello"` for mutable strings.
5. Adjacent string literals are concatenated at compile time: `"foo" "bar"` → `"foobar"`.

References:
1. ISO/IEC 9899:2011 (C11), §6.4.4.4 — Character constants (character constants have type int)

2. Git source: `builtin.h`, `strbuf.c` — string handling with null-terminated strings.
3. SQLite source: `src/tokenize.c` — character classification with character constants.
4. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.3 — Constants; §5.5 — Character Pointers and Functions.
