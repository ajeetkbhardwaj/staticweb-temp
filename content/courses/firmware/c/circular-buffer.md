+++
date = '2026-07-05T22:00:00+05:30'
draft = true
title = 'Circular Buffer'
difficulty = 'medium'
language = 'c'
topic_weight = 2
subtopic_weight = 2
weight = 3
initial_code = '''#include <stdint.h>

#define BUFFER_SIZE 16

static uint8_t buffer[BUFFER_SIZE];
static uint8_t head = 0;
static uint8_t tail = 0;

int buffer_put(uint8_t byte) {
    // Return -1 if full, otherwise add byte
}

int buffer_get(uint8_t *byte) {
    // Return -1 if empty, otherwise read byte
}
'''

[[test_cases]]
input = 'put 1, put 2, get, get'
expected = 'Circular buffer OK'
+++

## Problem Statement

Implement a circular (ring) buffer for bytes with a fixed size of 16. Provide two functions: `buffer_put(uint8_t byte)` adds a byte to the buffer and returns `0` on success or `-1` if the buffer is full; `buffer_get(uint8_t *byte)` reads the next byte into the provided pointer and returns `0` on success or `-1` if the buffer is empty. Use the `head` and `tail` indices provided in the starter code.

## Theory and Concepts

- **Circular buffer**: A fixed-size buffer that wraps around when the end is reached, reusing memory at the start. It is implemented with two pointers (or indices): `head` for writing and `tail` for reading.
- **Empty vs full distinction**: A circular buffer is empty when `head == tail` and full when `(head + 1) % size == tail` (sacrificing one slot) or by tracking a count separately.
- **Static buffers**: The buffer and indices are declared `static` to persist across function calls while keeping them local to the translation unit.

## Real World Application

Circular buffers are used in UART/SPI/I2C receive and transmit drivers, audio processing pipelines, keyboard and touch input queues, logging systems, and any producer-consumer scenario where data arrives asynchronously and must be processed in order without dynamic memory allocation.

===EXPLANATION===

The circular buffer (also called a ring buffer) is the most fundamental data structure in embedded firmware after the array. It solves a universal problem: one piece of code produces data (an interrupt handler receiving a UART byte, an ADC sampling a sensor) and another piece consumes it (the main loop processing the byte, a control algorithm using the sample). The buffer must be fixed-size (no dynamic allocation), thread-safe (or at least interrupt-safe), and efficient—no memory copies, no garbage collection, no dynamic resizing.

The circular buffer concept has been around since the early days of computing. It appears in DSP hardware (where it is called a "modulo buffer" with dedicated address generation), in Unix pipe buffers, and in virtually every device driver for serial communication. The key insight is that by using two pointers (or indices) and wrapping them modulo the buffer size, you can avoid the expensive memory management of linked lists while supporting FIFO (first-in, first-out) behavior with O(1) enqueue and dequeue.

The intuition is a circle of buckets arranged around a clock face. A "write pointer" (head) moves clockwise, dropping data into each bucket. A "read pointer" (tail) also moves clockwise, picking up data to process. When a pointer reaches 12 o'clock, it wraps back to 1 o'clock. The buffer is empty when both pointers are at the same position. It is full when advancing the head would catch up to the tail. The scheme sacrifices one slot (or uses a count variable) to distinguish empty from full, since both states would otherwise have head == tail.

In professional firmware, circular buffers are everywhere. The STM32 USART driver uses a circular buffer for its RX interrupt: each received byte is placed at `head`, the head increments and wraps, and the main loop reads from `tail`. Audio codecs use circular buffers to decouple the DMA fill rate from the CPU drain rate. Logging subsystems buffer log messages in a circular buffer so the high-priority logging call does not block waiting for the slow UART. RTOS message queues are often implemented on top of circular buffers. The Linux kernel's `kfifo` is a sophisticated circular buffer implementation.

Picture a 16-byte buffer. The head index starts at 0, tail at 0. Bytes arrive: 'H' at head=0, 'e' at head=1, 'l' at head=2, 'l' at head=3, 'o' at head=4. The consumer reads: tail advances 0,1,2,3,4, consuming each byte. Now head=5, tail=5 — buffer empty. More data arrives at head=5,6,7... The head wraps: after filling positions 0–15, head wraps to 0. If head ever reaches tail with data still arriving, the buffer is full and the next byte is discarded (or overwrites the oldest data, depending on policy).

Key points:
1. Empty condition: `head == tail`. Full condition: `(head + 1) % size == tail` (one slot unused) or maintain a separate `count` variable.
2. The buffer and indices must be `volatile` if accessed from both main and interrupt contexts.
3. Critical sections (interrupt disable/enable) are needed around multi-word operations (like updating head and checking full).
4. For single-producer-single-consumer (one ISR, one main loop), the implementation can be lock-free if reads and writes are atomic.
5. Buffer size should be a power of two for efficient modulo with `& (size - 1)` instead of `%` division.
6. The buffer's worst-case size must accommodate the maximum interrupt burst without losing data.


References:
1. "The Art of Computer Programming" by Donald Knuth (Vol 1, Section 2.2.2 on sequential allocation), "Embedded Systems: Introduction to ARM Cortex-M Microcontrollers" by Jonathan Valvano (Chapter 5 on I/O synchronization), Linux kernel `kfifo` implementation, and FreeRTOS queue implementation source code.
