+++
date = '2026-07-06T13:56:00+05:30'
draft = true
title = 'String Copy and Concatenation'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 12
weight = 2
initial_code = '''#include <stdio.h>
#include <string.h>

int main(void) {
    char dest[50] = "Hello";
    const char *src = " World";

    // Manual copy
    char copy[50];
    int i;
    for (i = 0; dest[i] != '\\0'; i++) {
        copy[i] = dest[i];
    }
    copy[i] = '\\0';

    printf("Copy: %s\n", copy);

    // String concatenation (manual)
    char result[50] = "Hello";
    int len = strlen(result);
    for (int j = 0; src[j] != '\\0'; j++) {
        result[len + j] = src[j];
        result[len + j + 1] = '\\0';
    }

    printf("Concatenated: %s\n", result);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Copy: Hello, Concatenated: Hello World'
+++

## Problem Statement

Implement manual versions of string copy and string concatenation without using the standard library functions (`strcpy`, `strcat`). Copy the string character by character, then concatenate two strings by appending to the first. Use the existing `strlen` function.

## Theory and Concepts

- String copy: iterate from source to destination until `'\0'` is reached, copying each character. Don't forget to null-terminate the destination.
- String concatenation: find the end of the destination string, then append characters from the source.
- Both operations require the destination buffer to be large enough to hold the result.
- Buffer overflow is a common security vulnerability — always know your buffer sizes.

## Real World Application

Manual string operations are needed in freestanding environments (bootloaders, kernels) where the standard library is unavailable. Understanding the low-level mechanics also helps prevent buffer overflow bugs when using library functions.

===EXPLANATION===

String copy and concatenation are the most basic string manipulation operations, dating back to early Unix when Thompson and Ritchie implemented the first string library for the PDP-7. The manual implementation reveals the fundamental mechanics: copying is a character-by-character loop from source to destination, and concatenation is finding the end of the destination then copying the source there. The dangers — buffer overflow, missing null terminators — are the same as in 1972. The difference is that modern attackers actively exploit these bugs, whereas early on they just caused crashes.

The intuition: copying a string is like photocopying a document. You take every character from the source and write it onto the destination, including the signature (null terminator). If the destination sheet is too small, you run off the page and write on the desk (buffer overflow). Concatenation is like adding a postscript to a letter: find where the letter ends, then start writing the postscript there. The combined letter must fit on the paper.

A professional example: the Heartbleed vulnerability (CVE-2014-0160) was caused by a missing bounds check in a memory copy — not `strcpy`, but the same class of bug. Every production C codebase contains dozens of copy and concatenation operations. Git uses `strbuf_add()` and `strbuf_addstr()` — safe wrappers that automatically grow the buffer. When Git reads a commit object, it appends lines to a `strbuf` using `strbuf_addf()` (formatted append). These safe abstractions prevent the classic `strcat(buffer, long_string)` overflow. The CERT C rule STR31-C specifies that `strcpy` should only be used when the destination is guaranteed sufficient; otherwise `strncpy` or `strlcpy` are safer alternatives.

Visualize a string as people holding hands in a line. Each person is a character; the handshake is the link between consecutive characters. The null terminator is a person holding a stop sign. Copying is assembling a parallel line of people holding the same signs — you stop when you see the stop sign. Concatenation is bringing the second line to stand behind the last person in the first line. If the parade ground is too small, people spill onto the sidewalk.

Key points:
1. Always null-terminate the destination after manual copy — forgetting is a common bug.
2. The destination must be at least `strlen(src) + 1` bytes for copy, and `strlen(dest) + strlen(src) + 1` for concatenation.
3. `strncpy` does not guarantee null-termination if the source is longer than the limit.
4. `strlcpy`/`strlcat` (BSD) provide safer bounded operations but are not standard C.
5. Buffer overflows from `strcpy`/`strcat` are the most common root cause of C security vulnerabilities.


Kernighan & Ritchie §1.9 shows the manual string copy loop. "The C Programming Language" §5.5 discusses character pointer versions. CERT C STR31-C and STR32-C provide guidelines for string copy safety. Seacord's "Secure Coding in C and C++" covers string vulnerability patterns in depth.
