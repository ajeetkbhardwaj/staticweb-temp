+++
date = '2026-07-06T14:22:00+05:30'
draft = true
title = 'String Tokenization'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 12
weight = 4
initial_code = '''#include <stdio.h>

int count_words(const char *str) {
    int count = 0;
    int in_word = 0;

    while (*str) {
        if (*str == ' ' || *str == '\\t' || *str == '\n') {
            in_word = 0;
        } else if (!in_word) {
            in_word = 1;
            count++;
        }
        str++;
    }
    return count;
}

int main(void) {
    const char *sentence = "The quick brown fox jumps";
    printf("Words: %d\n", count_words(sentence));
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Words: 5'
+++

## Problem Statement

Write a function `count_words` that counts the number of words in a string (separated by spaces, tabs, or newlines). Implement simple tokenization by tracking whether the current position is inside a word or between words.

## Theory and Concepts

- Tokenization splits a string into tokens based on delimiters.
- Whitespace characters (space, tab, newline, carriage return, form feed, vertical tab) separate words.
- State machine approach: track whether we're currently inside a word (flag).
- The standard library provides `strtok` for tokenization, but it modifies the input string (not thread-safe).
- A custom tokenizer gives you control over delimiter handling and avoids modifying the original string.

## Real World Application

Tokenization is used in command-line parsers, configuration file readers (INI, CSV), log file analysis, compiler lexers, and any application that needs to split text into meaningful components (words, tokens, fields).

===EXPLANATION===

Tokenization splits a string into meaningful subunits (tokens) based on delimiter characters. It is one of the oldest parsing techniques in computing, used in early Unix shell command parsing and formalized in tools like `lex` (1975) and `yacc`. C's standard library provides `strtok` for tokenization, but its design — modifying the input string and maintaining internal state — makes it non-reentrant and unsuitable for multithreaded parsing. POSIX later introduced `strtok_r` (reentrant), but C11 still only mandates `strtok`.

The intuition: scanning a string for words is like inspecting items on a conveyor belt. Each character is either a word character (fruit) or a delimiter (stem). When you encounter a delimiter, you have reached the end of the current token. When you transition from delimiter to word character, a new token begins. The simplest approach uses a boolean flag (`in_word`) tracking whether the current position is inside a token. This two-state machine handles arbitrary whitespace patterns correctly.

A professional example: the Bash shell parser tokenizes command lines into words, then interprets the first token as a command and subsequent tokens as arguments. It handles quoting (`"hello world"` becomes one token after quote removal), variable expansion (`$HOME`), and redirection (`>`). This is far beyond whitespace tokenization, but the core principle — iterate, track state, delimit — is the same. In simpler domains, CSV parsers use `while (fgets(line, sizeof line, file)) { char *tok = strtok(line, ","); while (tok) { process_field(tok); tok = strtok(NULL, ","); } }` — though this breaks for quoted fields with embedded commas. The INI parser in Python's configparser module and the CSV parsers in many C libraries use custom state machines rather than `strtok` for robustness.

Visualize tokenization as a fruit sorter. The conveyor belt brings characters one at a time. A space (stem) is ignored. A letter (fruit) starts filling a box. Another stem closes the box and starts a new one. The `in_word` flag indicates whether you are currently filling a box. Multiple consecutive stems produce empty boxes, which the state machine naturally ignores.

Key points:
1. `strtok` modifies the input string (inserts `'\0'`) and is not thread-safe.
2. Use `strtok_r` for reentrant tokenization or implement a custom state machine.
3. A manual tokenizer (like `count_words`) does not modify the input.
4. Multiple consecutive delimiters are handled by the state machine: a new word starts only after seeing a non-delimiter following a delimiter.
5. Production tokenizers handle quoting, escape sequences, and multiple delimiter sets.


Kernighan & Ritchie §7.8 mentions `strtok`. "The Practice of Programming" (Kernighan & Pike) §5.3 covers CSV tokenization. For compiler tokenizers, "Compilers: Principles, Techniques, and Tools" (Aho, Lam, Sethi, Ullman) provides the definitive treatment.
