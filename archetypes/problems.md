+++
date = '{{ .Date }}'
draft = false
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
difficulty = 'easy'
language = 'c'
topic_weight = 1
subtopic_weight = 1
weight = 1
initial_code = '''// Starter code for {{ .File.ContentBaseName }}

'''

[[test_cases]]
input = ''
expected = 'Expected output description'
+++

## Problem Statement

Describe the problem clearly here. What should the code do?

## Theory and Concepts

Explain the background concepts the learner should understand before attempting this problem.

## Real World Application

Describe where this concept is used in real-world software or embedded systems.

===EXPLANATION===

Optional explanation / article content goes here. This section appears in a separate "Article" tab.
All markdown syntax is supported.
