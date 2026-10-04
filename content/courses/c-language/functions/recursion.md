+++
date = '2026-07-06T13:29:00+05:30'
draft = true
title = 'Recursion'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 6
weight = 3
initial_code = '''#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main(void) {
    printf("Factorial 5: %d\n", factorial(5));
    printf("Fibonacci 10: %d\n", fibonacci(10));
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Factorial 5: 120\nFibonacci 10: 55'
+++

## Problem Statement

Implement two recursive functions: `factorial` (n! = n × (n−1)!) and `fibonacci` (F(n) = F(n−1) + F(n−2)). Ensure each has a proper base case to terminate the recursion. Print results for small inputs.

## Theory and Concepts

- Recursion: a function calls itself to solve a smaller subproblem.
- Every recursive function must have a base case that stops the recursion.
- Each recursive call adds a new stack frame — deep recursion can cause stack overflow.
- Recursion can be less efficient than iteration (function call overhead, repeated computation for Fibonacci).
- Tail recursion (recursive call at the very end) can be optimized by compilers into iteration.

## Real World Application

Recursion is used for tree traversal (file systems, expression trees), divide-and-conquer algorithms (quicksort, mergesort), fractal generation, backtracking puzzles (Sudoku, N-Queens), and recursive descent parsers.

===EXPLANATION===

Recursion in programming mirrors a fundamental mathematical concept: defining something in terms of itself. Mathematicians used recursion long before computers — Euclid's algorithm for GCD (circa 300 BCE) is recursive, and the factorial function is the classic textbook example. In C, recursion means a function calls itself, either directly or indirectly. The idea was present in ALGOL 60 and carried into C, though C's stack-based model imposes practical limits.

The intuition: every recursive problem has two parts — the base case (the trivial instance that stops the recursion) and the recursive case (a step that reduces the problem toward the base case). For factorial: `factorial(1) = 1` (base), and `factorial(n) = n * factorial(n - 1)` (recursive). Each call pushes a new frame onto the call stack with its own copy of `n`. When the base case is reached, the stack unwinds, returning values to the previous frame.

A professional example: recursive descent parsing is the standard technique for implementing compilers. A function `parse_expression()` calls `parse_term()`, which calls `parse_factor()`, which may call back to `parse_expression()` for parenthesized sub-expressions. This mutual recursion elegantly models the grammar's hierarchy. In the Clang compiler, the expression parser is a set of mutually recursive functions that handle operator precedence without any explicit precedence table.

I once benchmarked factorial implementations: a recursive version hit stack overflow at `n = 50,000` on a typical system (each frame ≈ 16 bytes), while an iterative version handled `n = 1,000,000` instantly. For Fibonacci, naive recursion is exponential (O(2ⁿ) — calling `fib(40)` makes 331 million calls), while memoized recursion or iteration is O(n). These numbers drove home when to use recursion and when to avoid it.

Visualize recursion as a set of Russian nesting dolls (matryoshka). To get the innermost doll (base case), you must open each outer doll (recursive call). The process of opening dolls goes deeper and deeper. Once you reach the core, you close each doll as you return, combining their contents. Each open doll is a stack frame — the stack depth equals the number of nested dolls.

Key points:
1. Every recursive function must have at least one base case that does not recurse — otherwise, infinite recursion causes a stack overflow.
2. The call stack is finite: typical default limits are 1–8 MB (≈ 8,000–64,000 calls depending on frame size).
3. Tail recursion (where the recursive call is the last operation) can be optimized into iteration by some compilers, eliminating stack growth.
4. Mutual recursion (A calls B calls A) works the same as direct recursion.
5. Recursion is not always slower — tree traversal using recursion can be faster than managing an explicit stack.


Kernighan & Ritchie §4.10 covers recursion. "Structure and Interpretation of Computer Programs" (SICP) by Abelson & Sussman is the classic text on recursive thinking. "The Art of Computer Programming" by Knuth covers recursion analysis with mathematical rigor. CERT rule MSC19-C discusses recursion depth limits in secure coding.
