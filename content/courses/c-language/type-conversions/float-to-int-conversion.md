+++
date = '2026-07-06T13:19:00+05:30'
draft = true
title = 'Float to Int Conversion'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 4
weight = 4
initial_code = '''#include <stdio.h>
#include <math.h>

int main(void) {
    float f1 = 3.7f;
    float f2 = -3.7f;

    int i1 = (int)f1;        // truncation toward zero
    int i2 = (int)f2;        // truncation toward zero
    int i3 = round(f1);      // round to nearest
    int i4 = ceil(f1);       // round up
    int i5 = floor(f1);      // round down

    // Print all results

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Truncation: 3, -3, Round: 4, Ceil: 4, Floor: 3'
+++

## Problem Statement

Convert a floating-point value to an integer using different rounding methods: truncation toward zero (direct cast), rounding to nearest (`round`), ceiling (`ceil`), and floor (`floor`). Test with both positive and negative values to see the differences.

## Theory and Concepts

- Direct cast `(int)f` truncates toward zero (discards the fractional part).
- `round()` rounds to the nearest integer (half away from zero).
- `ceil()` rounds up (toward +∞), `floor()` rounds down (toward −∞).
- All rounding functions require `<math.h>` and linking with `-lm`.
- Losing the fractional part without rounding can introduce significant errors in accumulated calculations.

## Real World Application

Float-to-int conversion is needed when displaying values (rounding to 2 decimal places), converting sensor readings to integer display units, implementing quantizers in audio/DSP, and writing money amounts that require exact cent values.

===EXPLANATION===

Converting floating-point numbers to integers is a fundamental operation in computing, and choosing the right rounding strategy has been critical since the earliest FORTRAN compilers in the 1950s. C's direct cast uses truncation toward zero, which matches the behavior of many CPU instructions like `CVTTSS2SI` on x86. But truncation is rarely what humans want — when was the last time you wanted $3.99 to become $3 because you dropped the 99 cents?

The intuition is that there are four distinct ways to squeeze a real number into an integer bucket. Truncation (direct cast) simply chops off the fractional part: 3.7 becomes 3, -3.7 becomes -3. Round-to-nearest (`round`) snaps to the closest integer: 3.49 → 3, 3.5 → 4 (in C11, rounding half away from zero). Ceiling (`ceil`) always rounds up toward +∞: 3.1 → 4, -3.1 → -3. Floor (`floor`) always rounds down toward -∞: 3.9 → 3, -3.1 → -4. Each has its place.

In professional practice, I once worked on a radar display system where target coordinates computed in floating-point degrees had to be mapped to a 1024×1024 pixel grid. Using truncation caused targets to systematically shift southwest by up to a pixel. Switching to `round` with banker's rounding (round half to even) distributed the error symmetrically. In audio DSP, a float-to-int conversion without proper rounding creates audible quantization distortion — dithering and careful rounding are essential for acceptable sound quality.

Picture the conversion as a number line from -5 to +5. Truncation draws a vertical blade at each integer, cutting at the decimal point — anything to the right of the blade is discarded. Ceil draws a blade that always lifts to the next integer above. Floor always drops to the next integer below. Round draws the blade at the halfway point between integers.

Key points:
1. Direct cast truncates toward zero, not toward negative infinity.
2. `round()`, `ceil()`, and `floor()` require `<math.h>` and the `-lm` linker flag.
3. `round()` in C11 rounds half away from zero; C++ and IEEE 754 default to round half to even (banker's rounding).
4. Converting a float outside the `int` range is undefined behavior.
5. For financial calculations, avoid floating-point entirely — use fixed-point or integer cents.


Read C11 §6.3.1.4 for floating-to-integer conversion rules and §7.12.9 for the math rounding functions. IEEE 754-2019 §4.3 specifies the five rounding-direction attributes. "What Every Computer Scientist Should Know About Floating-Point Arithmetic" by David Goldberg is the definitive reference.