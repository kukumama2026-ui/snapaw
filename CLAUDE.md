# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`snapaw` is a minimal Python number utility library (간단한 숫자 유틸리티 라이브러리) exposing four arithmetic functions. There are no external dependencies, no build system, and no package configuration — it is designed to be imported directly.

## Commands

Run all tests:
```bash
pytest test_calculator.py
```

Run a single test by name:
```bash
pytest test_calculator.py::test_add
```

Run tests with verbose output:
```bash
pytest -v test_calculator.py
```

## Architecture

The entire library is two files at the root:

- **`calculator.py`** — Four functions: `add`, `subtract`, `multiply`, `divide`. The `divide` function raises `ValueError` on division by zero; all others are simple wrappers with no side effects.
- **`test_calculator.py`** — pytest tests covering each function plus the divide-by-zero edge case.

## Conventions

- Docstrings are written in Korean.
- No linter, formatter, or CI pipeline is configured. pytest is the only test dependency.
