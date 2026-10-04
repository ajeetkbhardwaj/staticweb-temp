+++
date = '2026-07-06T14:27:00+05:30'
draft = true
title = 'Enum for State Machines'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 15
weight = 3
initial_code = '''#include <stdio.h>

enum state {
    STATE_IDLE,
    STATE_RUNNING,
    STATE_PAUSED,
    STATE_ERROR,
    STATE_COUNT
};

const char *state_name(enum state s) {
    switch (s) {
        case STATE_IDLE:    return "Idle";
        case STATE_RUNNING: return "Running";
        case STATE_PAUSED:  return "Paused";
        case STATE_ERROR:   return "Error";
        default:            return "Unknown";
    }
}

int main(void) {
    enum state current = STATE_RUNNING;
    printf("Current state: %s (%d)\n", state_name(current), current);
    printf("Number of states: %d\n", STATE_COUNT);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Current state: Running (1), Number of states: 4'
+++

## Problem Statement

Define an enumeration for a finite state machine with states IDLE, RUNNING, PAUSED, and ERROR. Add a `STATE_COUNT` sentinel at the end to track the number of states. Write a function that converts an `enum state` to its string representation using `switch`.

## Theory and Concepts

- Enums are ideal for state machines — named constants make states self-documenting.
- A `STATE_COUNT` sentinel (always last) can be used for array sizes and bounds checking.
- `switch` on enum values is exhaustive — good compilers warn if a case is missing.
- Enum values are `int`, making them suitable for array indices.
- Prefer `enum` over `#define` for related integer constants — enums have debugger support and type checking.

## Real World Application

State machines using enums are everywhere — protocol handlers (TCP states), UI navigation, device driver states, game character AI, and transaction processing pipelines. The pattern is simple, reliable, and easy to debug.

===EXPLANATION===

Finite state machines (FSMs) are one of the oldest and most reliable design patterns in software engineering. C enums are the natural way to model them: each state is a named constant, and transitions between states are encoded in `switch` statements or transition tables. The combination is so idiomatic that many developers use "enum state machine" interchangeably with "C state machine". Historically, state machines date back to the 1940s with Mealy and Moore machines in digital circuit design. C's enum provides a direct software analog: each state is a symbolic label, just as each circuit state is a set of flip‑flop values. The intuition is a board game like Snakes and Ladders: each square is a state (`SQUARE_1`, `SQUARE_2`, ...), and dice rolls trigger transitions. You're always on exactly one square (the current state), and each roll moves you to a new square based on rules. The `STATE_COUNT` sentinel is a clever trick — by placing `STATE_COUNT` at the end of the enum, it automatically equals the number of states (since enumerators default to 0,1,2,...). This is used for array sizes and bounds checking without hardcoding magic numbers. Professionally, enum state machines appear everywhere. The TCP protocol specification (RFC 793) defines states as an enum: `enum tcp_state { CLOSED, LISTEN, SYN_SENT, SYN_RECEIVED, ESTABLISHED, ... }` — every TCP implementation has a variable like `enum tcp_state state` and a switch that handles packet arrival for each state. USB device enumeration has `enum usb_state { ATTACHED, POWERED, DEFAULT, ADDRESS, CONFIGURED, SUSPENDED }`. Embedded firmware for a coffee machine uses `enum coffee_state { HEATING, BREWING, KEEPING_WARM, OFF }`. A game character's AI might be `enum ai_state { PATROL, ALERT, CHASE, ATTACK, FLEE }`. Visually, a state machine is a directed graph: circles labelled with state names, arrows labelled with events. The enum names the circles; the `switch` statements trace the arrows. Good IDEs even show the enum names in the debugger, making state debugging as simple as watching one variable change.

Key points:

. a `STATE_COUNT` sentinel is idiomatic but fragile — if you add a state before it, the count updates automatically;
. always handle a `default` case in the switch even if you think all states are covered — defend against future enum additions and invalid values;
. for complex machines, use a transition table (array of structs with `from`, `to`, `event`) instead of a giant switch;
. some compilers warn about missing enum values in switch statements (`-Wswitch`) — this catches bugs at compile time.

References:
1. "Practical Statecharts in C/C++" by Miro Samek.
2. ISO C11 §6.7.2.2.
3. TCP/IP RFC 793 for the canonical enum‑based state machine.

