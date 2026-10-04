+++
date = '2026-07-05T22:00:00+05:30'
draft = true
title = 'Blink an LED'
difficulty = 'easy'
language = 'c'
topic_weight = 2
subtopic_weight = 2
weight = 1
initial_code = '''#include <stdint.h>

void gpio_set(int pin, int value);
void delay_ms(int ms);

int main(void) {
    // Configure GPIO pin 13 as output

    while (1) {
        // Turn LED on, wait, turn off, wait
    }

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'LED toggling detected'
+++

## Problem Statement

Write a program to blink an LED connected to GPIO pin 13 once every second. Use the provided helper functions `gpio_set(int pin, int value)` (where `value` is `0` for LOW or `1` for HIGH) and `delay_ms(int ms)`. The LED should be turned on for 500 ms, then off for 500 ms, repeating indefinitely.

## Theory and Concepts

- **GPIO control**: General Purpose Input/Output pins can be set HIGH or LOW to control external devices like LEDs.
- **Infinite loops**: Embedded firmware often runs in a continuous loop with no exit condition.
- **Blocking delays**: `delay_ms` pauses execution for a given number of milliseconds. While simple, blocking delays tie up the CPU — real systems use timers or RTOS scheduling.

## Real World Application

LED blinking is the embedded equivalent of "Hello, World". It is used for status indicators on virtually every electronic device — power lights, network activity LEDs, error codes, and user notifications. The pattern of toggling a GPIO pin in a timed loop extends to controlling relays, buzzers, and other digital actuators.

===EXPLANATION===

Blinking an LED is the first milestone for anyone learning embedded programming—it is the "Hello, World" of firmware. Despite its simplicity, the exercise teaches four foundational concepts: GPIO output control, timing, infinite main loops, and the relationship between hardware registers and software behavior. Every embedded engineer has written a blink program, and its lessons scale directly to controlling motors, solenoids, relays, and communication buses.

The history of LED blinking in embedded education goes back to the earliest single-board microcontrollers like the 8051 and PIC. The pattern is always the same: set a pin high, wait, set it low, wait, repeat. The educational value lies not in the output (a blinking light) but in understanding what exactly happens between the `gpio_set()` call and the physical pin changing voltage. On a Cortex-M microcontroller, this involves enabling the GPIO peripheral clock, configuring the pin mode register for output (push-pull), setting the output data register (ODR) high or low, and managing the timing.

The intuition is that a GPIO pin is a simple digital output: software writes a 1 to a bit in a memory-mapped register, and the pin's voltage goes to VDD (typically 3.3 V). Writing a 0 brings it to GND (0 V). An LED connected between the pin and ground (with a current-limiting resistor) lights up when the pin is high and turns off when low. The toggling pattern creates the blink. More sophisticated GPIO controllers (like STM32's) have dedicated set/reset registers (BSRR) that allow atomic bit operations without read-modify-write.

In professional firmware, LED blinking is not just educational—it is a critical debugging tool. Production devices use LED patterns to communicate status: a slow blink for normal operation, fast blink for an error condition, solid on for boot-up, and off for sleep. The firmware engineer debugs by watching the LED pattern, often adding a "heartbeat" blink to the main loop to prove the CPU is alive. Automotive and industrial devices use bi-color LEDs (red/green) to indicate alert levels. The pattern of toggling extends to PWM (pulse-width modulation) for dimming LEDs and controlling servo motors.

Visualize the electrical path: the microcontroller's GPIO pin connects through a 330-ohm resistor to the LED's anode; the LED's cathode connects to ground. When the firmware writes 1 to the GPIO output register, the pin driver connects the pin to VDD (3.3 V). Current flows through the resistor (limiting to about 10 mA) through the LED, and the LED emits light. A delay of 500 ms keeps it on, then the firmware writes 0, the pin connects to ground, no current flows, and the LED turns off. The `gpio_set()` function abstracts all the register writes (clock enable, mode select, output type, pull-up config, ODR write).

Key points:
1. Always use a current-limiting resistor (220–470 ohms for a typical LED at 3.3 V).
2. Active-low vs active-high: some boards wire the LED between VDD and the pin—writing 0 turns it on. Check the schematic.
3. Blocking delays (`delay_ms`) stop the entire CPU—real systems use hardware timers or RTOS delays.
4. GPIO initialization (clock enable, mode, speed, pull-up) must happen before the first toggling.
5. The main loop should never exit in embedded code—there is no OS to return to.


References:
1. "Embedded Systems: Introduction to ARM Cortex-M Microcontrollers" by Jonathan Valvano (Chapter 4 on GPIO), STM32 Reference Manual (GPIO chapter), "Making Embedded Systems" by Elecia White (Chapter 1), and any vendor's "Getting Started" guide (STM32CubeIDE, MCUXpresso, Arduino).
