+++
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
difficulty = 'easy'
language = 'c'
initial_code = '''// Starter code for {{ .File.ContentBaseName }}

'''

[[test_cases]]
input = ''
expected = 'Expected output description'
+++

Describe the problem here. Markdown is supported.
