// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import 'mobx-react-lite/batchingOptOut'
import '@testing-library/jest-dom/extend-expect';
import diff from 'jest-diff'

// https://stackoverflow.com/a/52612372/548304
const crypto = require('crypto');

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: []) => crypto.randomBytes(arr.length)
  }
});

// from https://stackoverflow.com/a/45514619/548304
expect.extend({
  toBeWithMessage (received, expected, msg) {
    const pass = expected === received
    const message = pass
      ? () => `${this.utils.matcherHint('.not.toBe')}\n\n` +
        `Expected value to not be (using ===):\n` +
        `  ${this.utils.printExpected(expected)}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
      : () => {
        const diffString = diff(expected, received, {
          expand: this.expand
        })
        return `${this.utils.matcherHint('.toBe')}\n\n` +
          `Expected value to be (using ===):\n` +
          `  ${this.utils.printExpected(expected)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}` +
          `${(diffString ? `\n\nDifference:\n\n${diffString}` : '')}\n` +
          `${(msg ? `Custom:\n  ${msg}` : '')}`
      }

    return { actual: received, message, pass }
  },

  toEqualWithMessage (received, expected, msg) {
    const pass = this.equals(expected, received);
    const message = pass
      ? () => `${this.utils.matcherHint('.not.toBe')}\n\n` +
        `Expected value to not be (using ===):\n` +
        `  ${this.utils.printExpected(expected)}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
      : () => {
        const diffString = diff(expected, received, {
          expand: this.expand
        })
        return `${this.utils.matcherHint('.toBe')}\n\n` +
          `Expected value to be (using ===):\n` +
          `  ${this.utils.printExpected(expected)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}` +
          `${(diffString ? `\n\nDifference:\n\n${diffString}` : '')}\n` +
          `${(msg ? `Custom:\n  ${msg}` : '')}`
      }

    return { actual: received, message, pass }
  }
})
