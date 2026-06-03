def add(a, b):
    """두 수를 더합니다."""
    return a + b

def subtract(a, b):
    """두 수를 뺍니다."""
    return a - b

def multiply(a, b):
    """두 수를 곱합니다."""
    return a * b

def divide(a, b):
    """두 수를 나눕니다. b가 0이면 에러를 발생시킵니다."""
    if b == 0:
        raise ValuerError("0으로 나눌 수 없습니다.")
    return a / b
