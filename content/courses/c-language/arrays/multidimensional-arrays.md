+++
date = '2026-07-06T13:51:00+05:30'
draft = true
title = 'Multidimensional Arrays'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 11
weight = 2
initial_code = '''#include <stdio.h>

int main(void) {
    int matrix[3][4] = {
        { 1,  2,  3,  4},
        { 5,  6,  7,  8},
        { 9, 10, 11, 12}
    };

    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 4; j++) {
            printf("%3d ", matrix[i][j]);
        }
        printf("\n");
    }

    return 0;
}
'''

[[test_cases]]
input = ''
expected = '3×4 matrix printed'
+++

## Problem Statement

Declare and initialize a 3×4 two-dimensional array (matrix). Use nested loops to print it in row-major order (each row on a separate line). Modify elements and re-print to verify changes.

## Theory and Concepts

- A 2D array is an array of arrays: `int matrix[3][4]` has 3 rows, each with 4 ints.
- Memory layout is row-major: all of row 0, then row 1, then row 2.
- Access: `matrix[row][col]` — the compiler computes `*(*(matrix + row) + col)`.
- When passed to a function, the inner dimension must be specified: `void print(int m[][4], int rows)`.
- Higher dimensions follow the same pattern: `int cube[3][4][5]`.

## Real World Application

Multidimensional arrays are used for image pixels (2D), video frames (3D), spreadsheet grids, transformation matrices in graphics, convolution kernels in signal processing, and game boards (chess, tic-tac-toe).

===EXPLANATION===

Multidimensional arrays in C are truly arrays of arrays — not a separate syntactic construct. `int matrix[3][4]` declares an array of 3 elements, each of which is an array of 4 ints. This follows C's principle of composition: a 2D array is just a 1D array where each element happens to be another array. The memory layout is row-major: all 4 elements of row 0 are stored contiguously, followed by all 4 of row 1, then row 2. C chose row-major because of how the PDP-11's addressing modes worked — `matrix[row][col]` maps naturally to `*(base + row * COLS + col)`.

The intuition: think of a spreadsheet grid. `matrix[row][col]` means "go to row `row`, then column `col`." In memory, the computer must know the number of columns per row to compute the correct offset. That is why the inner dimension must be specified in function parameters: `void print(int m[][4], int rows)`. The compiler uses `4` to compute `address = base + row * 4 * sizeof(int) + col * sizeof(int)`.

A professional example: in image processing, a 2D image is stored as a 1D array with row-major layout but accessed via 2D indices. The stb_image.h library decodes image data into `unsigned char *data` and provides macros like `#define PIXEL(data, x, y, w, c) data[(y * w + x) * 3 + c]` for RGB access. In the x264 video codec, macroblocks (16×16 pixel blocks) reside in 2D arrays, and the performance-critical DCT transform accesses them via nested loops — the inner loop touches consecutive memory addresses for cache efficiency. The BLAS (Basic Linear Algebra Subprograms) library defines `gemm` (general matrix multiply) using multidimensional arrays, and optimized implementations like OpenBLAS and Intel MKL rearrange memory layout for cache efficiency.

Visualize a 2D array as a parking garage. `matrix[2][1]` means: take the elevator to floor 2, then walk to space 1 on that floor. The floors are stacked in memory — first all of floor 0 (spaces 0–3), then floor 1 (spaces 4–7), then floor 2 (spaces 8–11). With 4 spaces per floor, the attendant computes the absolute spot as `floor * 4 + space`.

Key points:
1. `int matrix[3][4]` is an array of 3 arrays of 4 ints — `sizeof(matrix)` is `3 × 4 × sizeof(int)`.
2. Row-major means the rightmost index varies fastest in memory.
3. When passing to a function, all dimensions except the outermost must be specified.
4. `int ` is NOT the same as `int[3][4]` — they have different memory layouts.
5. Arrays of three or more dimensions follow the same principle recursively.


Kernighan & Ritchie §5.7 explains multidimensional arrays. "The C Programming Language" §5.9 discusses pointers and multidimensional arrays. "Digital Image Processing" (Gonzalez & Woods) provides matrix-based algorithms implemented in C.
