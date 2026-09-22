import { useEffect, useState } from 'react'
import './App.css'

type Operator = '+' | '-' | '×' | '÷'

const operatorKeys: Record<string, Operator> = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return 'Error'
  return Number(value.toPrecision(12)).toString()
}

function calculate(first: number, second: number, operator: Operator) {
  switch (operator) {
    case '+':
      return first + second
    case '-':
      return first - second
    case '×':
      return first * second
    case '÷':
      return second === 0 ? null : first / second
  }
}

function App() {
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [expression, setExpression] = useState('')

  const reset = () => {
    setDisplay('0')
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(false)
    setExpression('')
  }

  const enterDigit = (digit: string) => {
    if (display === 'Error' || waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
      return
    }
    setDisplay(display === '0' ? digit : display.length < 14 ? display + digit : display)
  }

  const enterDecimal = () => {
    if (display === 'Error' || waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const chooseOperator = (nextOperator: Operator) => {
    if (display === 'Error') {
      reset()
      return
    }

    const currentValue = Number(display)
    if (storedValue === null) {
      setStoredValue(currentValue)
    } else if (operator && !waitingForOperand) {
      const result = calculate(storedValue, currentValue, operator)
      if (result === null) {
        setDisplay('Error')
        setExpression('Cannot divide by zero')
        setStoredValue(null)
        setOperator(null)
        return
      }
      setDisplay(formatNumber(result))
      setStoredValue(result)
    }

    setOperator(nextOperator)
    setWaitingForOperand(true)
    const nextValue = storedValue === null || !operator || waitingForOperand
      ? currentValue
      : calculate(storedValue, currentValue, operator)
    setExpression(`${formatNumber(nextValue ?? currentValue)} ${nextOperator}`)
  }

  const solve = () => {
    if (storedValue === null || operator === null || waitingForOperand) return

    const currentValue = Number(display)
    const result = calculate(storedValue, currentValue, operator)
    if (result === null) {
      setDisplay('Error')
      setExpression('Cannot divide by zero')
    } else {
      setDisplay(formatNumber(result))
      setExpression(`${formatNumber(storedValue)} ${operator} ${formatNumber(currentValue)} =`)
    }
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  const deleteDigit = () => {
    if (display === 'Error' || waitingForOperand) return
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0')
  }

  const toggleSign = () => {
    if (display === 'Error' || display === '0') return
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`)
  }

  const percent = () => {
    if (display === 'Error') return
    setDisplay(formatNumber(Number(display) / 100))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (/^[0-9]$/.test(event.key)) enterDigit(event.key)
      else if (event.key === '.') enterDecimal()
      else if (operatorKeys[event.key]) chooseOperator(operatorKeys[event.key])
      else if (event.key === 'Enter' || event.key === '=') solve()
      else if (event.key === 'Escape') reset()
      else if (event.key === 'Backspace') deleteDigit()
      else if (event.key === '%') percent()
      else return
      event.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const buttons = [
    { label: 'AC', action: reset, className: 'utility' },
    { label: 'DEL', action: deleteDigit, className: 'utility' },
    { label: '%', action: percent, className: 'utility' },
    { label: '÷', action: () => chooseOperator('÷'), className: 'operator' },
    { label: '7', action: () => enterDigit('7') },
    { label: '8', action: () => enterDigit('8') },
    { label: '9', action: () => enterDigit('9') },
    { label: '×', action: () => chooseOperator('×'), className: 'operator' },
    { label: '4', action: () => enterDigit('4') },
    { label: '5', action: () => enterDigit('5') },
    { label: '6', action: () => enterDigit('6') },
    { label: '-', action: () => chooseOperator('-'), className: 'operator' },
    { label: '1', action: () => enterDigit('1') },
    { label: '2', action: () => enterDigit('2') },
    { label: '3', action: () => enterDigit('3') },
    { label: '+', action: () => chooseOperator('+'), className: 'operator' },
    { label: '+/-', action: toggleSign, className: 'utility' },
    { label: '0', action: () => enterDigit('0') },
    { label: '.', action: enterDecimal },
    { label: '=', action: solve, className: 'equals' },
  ]

  return (
    <main className="app-shell">
      <section className="calculator" aria-label="Calculator">
        <header className="calculator-header">
          <div>
            <p className="eyebrow">Pocket arithmetic</p>
            <h1>Calculate<span>.</span></h1>
          </div>
          <div className="status-light" aria-hidden="true" />
        </header>

        <div className="display" aria-live="polite">
          <span className="expression">{expression || 'Ready when you are'}</span>
          <strong className={display === 'Error' ? 'error' : ''}>{display}</strong>
        </div>

        <div className="button-grid">
          {buttons.map((button) => (
            <button
              key={button.label}
              type="button"
              className={button.className ?? ''}
              onClick={button.action}
              aria-label={button.label === 'DEL' ? 'Delete last digit' : button.label}
            >
              {button.label}
            </button>
          ))}
        </div>
        <p className="hint">Keyboard ready <span>•</span> try 12 + 7</p>
      </section>
    </main>
  )
}

export default App
